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
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-neutral-900 px-4 py-2.5 text-[15px] leading-relaxed text-white">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-neutral-100 px-4 py-2.5 text-[15px] leading-relaxed text-neutral-800">
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-neutral-100 px-4 py-3 text-sm text-neutral-500">
        Thinking…
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
          { id: crypto.randomUUID(), role: 'assistant', content: 'Your CV is ready. Refine it or download the PDF.' },
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
      {/* Chat */}
      <section className="flex min-h-0 flex-1 flex-col border-neutral-200 lg:w-1/2 lg:border-r">
        {chat.phase === 'interview' ? (
          <div className="h-px bg-neutral-200">
            <div className="h-px bg-neutral-900 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        ) : null}

        <div className="border-b border-neutral-200 px-6 py-4">
          <p className="text-sm font-medium text-neutral-900">Interview</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {chat.phase === 'interview'
              ? `Question ${progressStep + 1} of ${TOTAL_STEPS}`
              : chat.phase === 'ready'
                ? 'Ready to generate'
                : 'Complete'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-lg space-y-4">
            {chat.messages.map((m) => (
              <Message key={m.id} role={m.role} content={m.content} />
            ))}
            {thinking ? <TypingIndicator /> : null}
            {chat.phase === 'ready' ? (
              <Button loading={generating} onClick={() => void generateCv()}>
                Generate CV
              </Button>
            ) : null}
            {chat.phase === 'generated' ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('improve')}>Improve</Button>
                <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('shorter')}>Shorter</Button>
                <Button variant="secondary" className="!text-xs" loading={busy} onClick={() => void improve('regenerate-summary')}>New summary</Button>
                <Button className="!text-xs" onClick={() => void downloadPdf()}>Download PDF</Button>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {error ? <div className="px-6 pb-2"><Alert tone="error">{error}</Alert></div> : null}
        {status ? <div className="px-6 pb-2"><StatusLine>{status}</StatusLine></div> : null}

        {chat.phase === 'interview' ? (
          <div className="shrink-0 border-t border-neutral-200 px-6 py-4">
            <div className="mx-auto max-w-lg space-y-3">
              {hints.length ? (
                <div className="flex flex-wrap gap-2">
                  {hints.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => (h === 'Skip' ? void submitAnswer('skip') : setDraft((p) => (p ? `${p}, ${h}` : h)))}
                      className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex gap-2">
                {multiline ? (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={inputDisabled}
                    rows={3}
                    placeholder="Type your answer…"
                    className="field-textarea min-h-[44px] flex-1"
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
      </section>

      {/* Preview */}
      <section className="flex min-h-[45vh] flex-col bg-neutral-50 lg:w-1/2">
        <div className="border-b border-neutral-200 px-6 py-4">
          <p className="text-sm font-medium text-neutral-900">CV preview</p>
          <p className="mt-0.5 text-xs text-neutral-500">Updates as you answer</p>
        </div>
        <div className="flex flex-1 items-start justify-center overflow-y-auto p-6 md:p-10">
          <div
            className={
              'w-full max-w-[210mm] bg-white shadow-sm ring-1 ring-neutral-200/80 transition-all duration-500 ' +
              (justGenerated ? 'ring-2 ring-neutral-900/20' : '')
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
      </section>
    </div>
  )
}
