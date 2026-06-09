import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
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

function Message({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end py-1">
        <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-indigo-500 px-4 py-2.5 text-[15px] leading-relaxed text-white">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start py-1">
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-zinc-200/80 bg-zinc-50 px-4 py-2.5 text-[15px] leading-relaxed text-zinc-800">
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start py-1">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-zinc-200/80 bg-zinc-50 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-zinc-400"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
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
    setStatus('Generating CV…')
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
          { id: crypto.randomUUID(), role: 'assistant', content: 'Your CV is ready. Refine it below or download the PDF.' },
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
    <div className="workspace flex h-full min-h-0 flex-col overflow-hidden">
      {chat.phase === 'interview' ? (
        <div className="h-0.5 bg-zinc-100">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Interview */}
        <div className="flex min-h-0 flex-1 flex-col lg:w-[58%] lg:border-r lg:border-zinc-200">
          <div className="border-b border-zinc-200 px-5 py-3">
            <p className="text-sm font-medium text-zinc-900">Career interview</p>
            <p className="text-xs text-zinc-500">
              {chat.phase === 'interview'
                ? `Step ${progressStep + 1} of ${TOTAL_STEPS}`
                : chat.phase === 'ready'
                  ? 'All set — generate when you are ready'
                  : 'Interview complete'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="mx-auto max-w-lg space-y-1">
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
                <div className="flex flex-wrap gap-2 py-3">
                  <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('improve')}>Improve</Button>
                  <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('shorter')}>Shorter</Button>
                  <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('regenerate-summary')}>New summary</Button>
                  <Button className="!text-xs" onClick={() => void downloadPdf()}>Download PDF</Button>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          {error ? <div className="px-5 pb-2"><Alert tone="error">{error}</Alert></div> : null}
          {status ? <div className="px-5 pb-2"><StatusLine>{status}</StatusLine></div> : null}

          {chat.phase === 'interview' ? (
            <div className="shrink-0 px-5 pb-5">
              <div className="composer mx-auto max-w-lg rounded-2xl bg-white p-3">
                {hints.length ? (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {hints.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => (h === 'Skip' ? void submitAnswer('skip') : setDraft((p) => (p ? `${p}, ${h}` : h)))}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-end gap-2">
                  {multiline ? (
                    <textarea
                      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      disabled={inputDisabled}
                      rows={2}
                      placeholder="Type your answer…"
                      className="field-textarea min-h-[40px] flex-1"
                    />
                  ) : (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onKeyDown}
                      disabled={inputDisabled}
                      placeholder="Type your answer…"
                      className="field-input flex-1"
                    />
                  )}
                  <Button type="button" disabled={inputDisabled || !draft.trim()} onClick={() => void submitAnswer(draft)}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Preview */}
        <div className="flex min-h-[40vh] flex-col bg-[#f8f7f4] lg:w-[42%]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
            <p className="text-sm font-medium text-zinc-900">Live preview</p>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Updating
            </span>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-5 md:p-6">
            <div
              className={
                'doc-paper w-full max-w-[210mm] overflow-hidden bg-white transition-all duration-500 ' +
                (justGenerated ? 'ring-2 ring-indigo-400/40' : '')
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
    </div>
  )
}
