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

const STEP_LABELS = ['Name', 'Title', 'Contact', 'Role', 'History', 'Skills', 'Education', 'Target']

function StepRail({ current, active }: { current: number; active: boolean }) {
  if (!active) return null
  return (
    <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-2 border-r border-violet-100 bg-violet-50/60 py-5 lg:flex">
      {STEP_LABELS.map((label, i) => {
        const done = i < current
        const here = i === current
        return (
          <div key={label} className="flex flex-col items-center gap-1" title={label}>
            <div
              className={
                'flex size-8 items-center justify-center rounded-full text-xs font-bold transition ' +
                (here
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : done
                    ? 'bg-violet-200 text-violet-800'
                    : 'bg-white text-violet-300 ring-1 ring-violet-200')
              }
            >
              {i + 1}
            </div>
          </div>
        )
      })}
    </aside>
  )
}

function Message({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end py-1.5">
        <div className="max-w-[85%] border-l-4 border-violet-400 bg-violet-600 px-4 py-3 text-[15px] leading-relaxed text-white shadow-sm">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start py-1.5">
      <div className="max-w-[90%] border-l-4 border-violet-300 bg-white px-4 py-3 text-[15px] leading-relaxed text-violet-950 shadow-sm ring-1 ring-violet-100">
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start py-1.5">
      <div className="flex items-center gap-1.5 border-l-4 border-violet-200 bg-white px-4 py-3 shadow-sm ring-1 ring-violet-100">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-violet-400"
            style={{ animationDelay: `${i * 150}ms` }}
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
    <div className="studio-frame flex h-full min-h-0 flex-col overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-600" />

      <div className="flex min-h-0 flex-1">
        <StepRail current={progressStep} active={chat.phase === 'interview'} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
          {/* Interview */}
          <div className="flex min-h-0 flex-1 flex-col lg:w-[55%]">
            <div className="border-b border-violet-100 bg-violet-50/40 px-5 py-4">
              <h2 className="text-lg font-extrabold tracking-tight text-violet-950">AI Interview</h2>
              <p className="mt-0.5 text-sm text-violet-600/80">
                {chat.phase === 'interview'
                  ? `Step ${progressStep + 1} · ${STEP_LABELS[progressStep] ?? 'Question'}`
                  : chat.phase === 'ready'
                    ? 'Ready to build your CV'
                    : 'CV generated'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto bg-white px-5 py-5">
              <div className="mx-auto max-w-xl space-y-1">
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

            {error ? <div className="bg-white px-5 pb-2"><Alert tone="error">{error}</Alert></div> : null}
            {status ? <div className="bg-white px-5 pb-2"><StatusLine>{status}</StatusLine></div> : null}

            {chat.phase === 'interview' ? (
              <div className="shrink-0 border-t border-violet-100 bg-violet-50/30 px-5 py-4">
                <div className="mx-auto max-w-xl">
                  {hints.length ? (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {hints.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => (h === 'Skip' ? void submitAnswer('skip') : setDraft((p) => (p ? `${p}, ${h}` : h)))}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex items-end gap-3">
                    {multiline ? (
                      <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        disabled={inputDisabled}
                        rows={2}
                        placeholder="Your answer…"
                        className="field-textarea min-h-[44px] flex-1"
                      />
                    ) : (
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={inputDisabled}
                        placeholder="Your answer…"
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
          <div className="preview-canvas flex min-h-[42vh] flex-col border-t border-violet-100 lg:w-[45%] lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between border-b border-violet-100/80 bg-violet-50/50 px-5 py-3">
              <p className="text-sm font-bold text-violet-950">Document preview</p>
              <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Live
              </span>
            </div>
            <div className="flex flex-1 items-start justify-center overflow-y-auto p-5 md:p-8">
              <div
                className={
                  'doc-paper w-full max-w-[210mm] overflow-hidden bg-[#fffef8] transition-all duration-500 ' +
                  (justGenerated ? 'ring-4 ring-violet-400/50' : '')
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
    </div>
  )
}
