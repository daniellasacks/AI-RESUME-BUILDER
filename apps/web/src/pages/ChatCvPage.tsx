import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { KeyboardEvent } from 'react'
import { api } from '../lib/api'
import { CHAT_FLOW, getStepHints, TOTAL_STEPS } from '../lib/chatFlow'
import {
  applyChatAnswer,
  chatToLiveResume,
  createChatSession,
  sectionsFromChanges,
  type ChatState,
  type HighlightSection,
} from '../lib/chatEngine'
import type { ResumeJson } from '../lib/resumeSchema'
import { ResumePreview } from '../components/ResumePreview'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson }

function AiOrb() {
  return (
    <div className="relative mt-1 size-8 shrink-0">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 blur-md opacity-70" />
      <div className="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-violet-500 to-pink-500 text-[10px] font-bold text-white">
        ✦
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 py-3">
      <AiOrb />
      <div className="glass flex items-center gap-1.5 rounded-2xl rounded-tl-md px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-gradient-to-r from-violet-400 to-pink-400"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function Message({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end py-2">
        <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-4 py-3 text-[15px] leading-relaxed text-white shadow-lg shadow-violet-500/25">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3 py-2">
      <AiOrb />
      <div className="glass max-w-[88%] rounded-2xl rounded-tl-md border-l-2 border-l-violet-400/60 px-4 py-3 text-[15px] leading-relaxed text-zinc-100">
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  )
}

function ActionChip({ children, onClick, primary }: { children: ReactNode; onClick?: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full px-4 py-2 text-xs font-semibold transition ' +
        (primary
          ? 'btn-glow text-white'
          : 'glass text-zinc-300 hover:text-white')
      }
    >
      {children}
    </button>
  )
}

export function ChatCvPage() {
  const toasts = useToasts()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const [chat, setChat] = useState<ChatState>(() => createChatSession())
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [versionId, setVersionId] = useState<string | null>(null)
  const [generatedResume, setGeneratedResume] = useState<ResumeJson | null>(null)
  const [highlights, setHighlights] = useState<HighlightSection[]>([])
  const [justGenerated, setJustGenerated] = useState(false)

  const liveResume = useMemo(() => {
    if (generatedResume) return generatedResume
    return chatToLiveResume(chat)
  }, [chat, generatedResume])

  const hints = chat.phase === 'interview' ? getStepHints(chat.stepIndex) : []
  const currentStep = chat.phase === 'interview' ? CHAT_FLOW[chat.stepIndex] : null
  const multiline = currentStep && 'multiline' in currentStep && currentStep.multiline
  const progressStep = chat.phase === 'ready' || chat.phase === 'generated' ? TOTAL_STEPS : chat.stepIndex
  const progressPct = Math.round((progressStep / TOTAL_STEPS) * 100)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages.length, thinking])

  useEffect(() => {
    inputRef.current?.focus()
  }, [chat.stepIndex, chat.phase])

  async function submitAnswer(content: string) {
    if (!content.trim() || thinking || chat.phase === 'generated' || chat.phase === 'ready') return
    setDraft('')
    setThinking(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 300))
    setChat((prev) => applyChatAnswer(prev, content.trim()))
    setThinking(false)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault()
      void submitAnswer(draft)
    }
  }

  async function generateCv() {
    setGenerating(true)
    setStatus('Generating your CV…')
    setError(null)
    try {
      const res = await api<{
        resumeId: string
        versionId: string
        structuredJson: ResumeJson
        changes: string[]
      }>('/resume/generate', {
        method: 'POST',
        body: JSON.stringify({ wizard: chat.wizard }),
      })
      setVersionId(res.versionId)
      setGeneratedResume(res.structuredJson)
      setHighlights(sectionsFromChanges(res.changes))
      setJustGenerated(true)
      setChat((prev) => ({
        ...prev,
        phase: 'generated',
        messages: [
          ...prev.messages,
          { id: crypto.randomUUID(), role: 'assistant', content: '✨ Your CV is ready! Check the preview — polish or download below.' },
        ],
      }))
      setTimeout(() => setJustGenerated(false), 2500)
      toasts.success('CV ready!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setGenerating(false)
      setStatus(null)
    }
  }

  async function improve(action: string) {
    if (!versionId) return
    setBusy(true)
    setStatus('Updating…')
    try {
      const v = await api<Version & { changes?: string[] }>('/resume/improve', {
        method: 'POST',
        body: JSON.stringify({ versionId, action }),
      })
      setVersionId(v.id)
      setGeneratedResume(v.structuredJson)
      if (v.changes?.length) setHighlights(sectionsFromChanges(v.changes))
      toasts.success('Updated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
      setStatus(null)
    }
  }

  async function downloadPdf() {
    if (!versionId) return
    const blob = await api<Blob>(`/export/resume/${versionId}.pdf`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chat.wizard.personal.fullName || 'cv'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputDisabled = thinking || generating || chat.phase === 'ready' || chat.phase === 'generated'

  return (
    <div className="glow-border flex h-full min-h-0 overflow-hidden rounded-2xl glass-strong">
      {/* ── Chat panel ── */}
      <div className="flex min-h-0 flex-1 flex-col lg:w-[52%]">
        {/* Progress */}
        {chat.phase === 'interview' ? (
          <div className="px-5 pt-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span>Building your CV</span>
              <span className="text-violet-300">{progressPct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5">
          <div className="mx-auto max-w-xl">
            {chat.messages.map((m) => (
              <Message key={m.id} role={m.role} content={m.content} />
            ))}
            {thinking ? <TypingIndicator /> : null}

            {chat.phase === 'ready' ? (
              <div className="py-6 text-center">
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => void generateCv()}
                  className="btn-glow rounded-2xl px-10 py-4 text-base font-bold text-white disabled:opacity-50"
                >
                  {generating ? 'Generating…' : '✨ Generate CV'}
                </button>
              </div>
            ) : null}

            {chat.phase === 'generated' ? (
              <div className="flex flex-wrap justify-center gap-2 py-4">
                <ActionChip onClick={() => void improve('improve')}>Polish</ActionChip>
                <ActionChip onClick={() => void improve('shorter')}>Shorter</ActionChip>
                <ActionChip onClick={() => void improve('regenerate-summary')}>New summary</ActionChip>
                <ActionChip primary onClick={() => void downloadPdf()}>Download PDF</ActionChip>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </div>

        {error ? <p className="px-5 pb-2 text-center text-xs text-red-400">{error}</p> : null}
        {status ? <p className="px-5 pb-2 text-center text-xs text-cyan-300">{status}</p> : null}

        {/* Input */}
        {chat.phase === 'interview' ? (
          <div className="shrink-0 border-t border-white/5 p-4">
            <div className="mx-auto max-w-xl">
              {hints.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {hints.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => (h === 'Skip' ? void submitAnswer('skip') : setDraft((p) => (p ? `${p}, ${h}` : h)))}
                      className="glass rounded-full px-3 py-1 text-xs text-zinc-400 transition hover:text-white"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-violet-400/40 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                {multiline ? (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={inputDisabled}
                    rows={2}
                    placeholder="Your answer…"
                    className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                ) : (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={inputDisabled}
                    placeholder="Your answer…"
                    className="flex-1 bg-transparent px-2 py-2.5 text-[15px] text-white outline-none placeholder:text-zinc-600"
                  />
                )}
                <button
                  type="button"
                  disabled={inputDisabled || !draft.trim()}
                  onClick={() => void submitAnswer(draft)}
                  className="btn-glow flex size-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white disabled:opacity-30"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── CV preview panel ── */}
      <div className="flex min-h-[45vh] flex-col border-t border-white/5 lg:w-[48%] lg:border-l lg:border-t-0">
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
          <span className="live-dot size-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Live document</span>
        </div>
        <div className="flex flex-1 items-start justify-center overflow-y-auto p-5 md:p-8">
          <div
            className={
              'doc-float w-full max-w-[210mm] overflow-hidden rounded-lg bg-white ' +
              (justGenerated ? 'doc-float-pop ring-2 ring-violet-400/50' : '')
            }
          >
            <ResumePreview
              resume={liveResume}
              a4
              generated={chat.phase === 'generated'}
              highlightSections={chat.phase === 'generated' ? highlights : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
