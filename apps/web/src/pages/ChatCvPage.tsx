import { useEffect, useMemo, useRef, useState } from 'react'
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
import { Alert, Button, StatusLine } from '../components/ui'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson }

function TypingIndicator() {
  return (
    <div className="py-2">
      <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">
        <span className="size-1.5 animate-pulse rounded-full bg-slate-400" />
        <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
      </div>
    </div>
  )
}

function Message({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end py-1">
        <div className="max-w-[80%] rounded-2xl bg-slate-800 px-4 py-2.5 text-[15px] leading-relaxed text-white">
          {content}
        </div>
      </div>
    )
  }
  return (
    <div className="py-1">
      <div className="max-w-[90%] text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">{content}</div>
    </div>
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
  const [busy, setBusy] = useState(false)
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
    await new Promise((r) => setTimeout(r, 280))
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
    setStatus('Generating…')
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
          { id: crypto.randomUUID(), role: 'assistant', content: 'Done — your CV is on the right. Download or refine below.' },
        ],
      }))
      setTimeout(() => setJustGenerated(false), 2000)
      toasts.success('CV ready')
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
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      {/* Chat column */}
      <div className="flex min-h-0 flex-1 flex-col lg:w-[55%]">
        {chat.phase === 'interview' ? (
          <div className="h-0.5 bg-slate-100">
            <div className="h-full bg-slate-800 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-6">
            {chat.messages.map((m) => (
              <Message key={m.id} role={m.role} content={m.content} />
            ))}
            {thinking ? <TypingIndicator /> : null}
            {chat.phase === 'ready' ? (
              <div className="py-4">
                <Button loading={generating} onClick={() => void generateCv()}>
                  Generate CV
                </Button>
              </div>
            ) : null}
            {chat.phase === 'generated' ? (
              <div className="flex flex-wrap gap-2 py-4">
                <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('improve')}>Improve</Button>
                <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('shorter')}>Shorter</Button>
                <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('regenerate-summary')}>New summary</Button>
                <Button variant="secondary" className="!text-xs" onClick={() => void downloadPdf()}>Download PDF</Button>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {error ? <div className="px-4 pb-2"><Alert tone="error">{error}</Alert></div> : null}
        {status ? <div className="px-4 pb-2"><StatusLine>{status}</StatusLine></div> : null}

        {/* Chat input — fixed bottom like ChatGPT */}
        {chat.phase === 'interview' ? (
          <div className="shrink-0 border-t border-slate-200 bg-white p-4">
            <div className="mx-auto max-w-2xl">
              {hints.length ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {hints.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => h === 'Skip' ? void submitAnswer('skip') : setDraft((p) => (p ? `${p}, ${h}` : h))}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-slate-400">
                {multiline ? (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={inputDisabled}
                    rows={2}
                    placeholder="Message…"
                    className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-slate-400"
                  />
                ) : (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={inputDisabled}
                    placeholder="Message…"
                    className="flex-1 bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-slate-400"
                  />
                )}
                <button
                  type="button"
                  disabled={inputDisabled || !draft.trim()}
                  onClick={() => void submitAnswer(draft)}
                  className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-30"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* CV document */}
      <div className="flex min-h-[40vh] flex-col border-t border-slate-200 bg-slate-50 lg:w-[45%] lg:border-l lg:border-t-0">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div
            className={
              'mx-auto w-full max-w-[210mm] bg-white shadow-sm transition ring-slate-200 ' +
              (justGenerated ? 'ring-2 ring-slate-400' : 'ring-1')
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
