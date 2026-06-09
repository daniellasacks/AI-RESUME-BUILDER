import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { api } from '../lib/api'
import {
  activeFlow,
  applyChatAnswer,
  chatToLiveResume,
  createWelcomeSession,
  flowTotal,
  getStepHints,
  sectionsFromChanges,
  startFreshInterview,
  startUpdateInterview,
  type ChatState,
  type HighlightSection,
} from '../lib/chatEngine'
import { resumeJsonToWizard } from '../lib/resumeJsonToWizard'
import type { ResumeJson } from '../lib/resumeSchema'
import { ResumePreview } from '../components/ResumePreview'
import { Alert, Button, StatusLine } from '../components/ui'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson }

function Message({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end" role="listitem">
        <div className="max-w-[85%] rounded-xl rounded-br-sm bg-blue-700 px-4 py-3 text-base leading-relaxed text-white">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start" role="listitem">
      <div className="max-w-[90%] rounded-xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-base leading-relaxed text-slate-800">
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-live="polite">
      <div className="rounded-xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
        Assistant is typing…
      </div>
    </div>
  )
}

const EMPTY_PREVIEW: ResumeJson = {
  basics: { fullName: 'Your name', summary: 'Your CV will build here as you answer questions.' },
  skills: [],
  experience: [],
  education: [],
}

export function ChatCvPage() {
  const toasts = useToasts()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const [chat, setChat] = useState<ChatState>(() => createWelcomeSession())
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [resumeId, setResumeId] = useState<string | null>(null)
  const [versionId, setVersionId] = useState<string | null>(null)
  const [generatedResume, setGeneratedResume] = useState<ResumeJson | null>(null)
  const [highlights, setHighlights] = useState<HighlightSection[]>([])
  const [justGenerated, setJustGenerated] = useState(false)

  const flow = activeFlow(chat)
  const total = flowTotal(chat)
  const liveResume = useMemo(() => {
    if (generatedResume) return generatedResume
    if (chat.phase === 'welcome') return EMPTY_PREVIEW
    return chatToLiveResume(chat)
  }, [chat, generatedResume])

  const hints = chat.phase === 'interview' ? getStepHints(flow, chat.stepIndex) : []
  const currentStep = chat.phase === 'interview' ? flow[chat.stepIndex] : null
  const multiline = currentStep?.multiline
  const progressStep = chat.phase === 'ready' || chat.phase === 'generated' ? total : chat.stepIndex
  const progressPct = total ? Math.round((progressStep / total) * 100) : 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages.length, thinking])

  useEffect(() => {
    if (chat.phase === 'interview') inputRef.current?.focus()
  }, [chat.stepIndex, chat.phase])

  async function handleUpload(file: File) {
    setUploadBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'resume')
      const uploaded = await api<{ id: string }>('/uploads', { method: 'POST', body: fd })
      const extracted = await api<{ resumeJson: ResumeJson }>('/resume/extract', {
        method: 'POST',
        body: JSON.stringify({ documentId: uploaded.id }),
      })
      const wizard = resumeJsonToWizard(extracted.resumeJson)
      setChat(startUpdateInterview(wizard, file.name))
      toasts.success('CV imported')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadBusy(false)
    }
  }

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
      setResumeId(res.resumeId)
      setVersionId(res.versionId)
      setGeneratedResume(res.structuredJson)
      setHighlights(sectionsFromChanges(res.changes))
      setJustGenerated(true)
      setChat((prev) => ({
        ...prev,
        phase: 'generated',
        messages: [
          ...prev.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Your CV is ready. Download the PDF or open it in the editor to keep refining.',
          },
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
  const showInterview = chat.phase !== 'welcome'

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      {/* Assistant panel */}
      <section
        className="flex min-h-0 flex-1 flex-col border-slate-200 bg-white lg:w-[52%] lg:border-r"
        aria-label="AI assistant"
      >
        {chat.phase === 'interview' ? (
          <div className="h-1 bg-slate-100" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-blue-700 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        ) : null}

        {showInterview ? (
          <div className="border-b border-slate-200 px-5 py-4 md:px-6">
            <p className="text-sm font-semibold text-slate-900">
              {chat.mode === 'update' ? 'Update your CV' : 'Build your CV'}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              {chat.phase === 'interview'
                ? `Question ${progressStep + 1} of ${total}`
                : chat.phase === 'ready'
                  ? 'Ready to generate'
                  : 'Complete'}
            </p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          {chat.phase === 'welcome' ? (
            <WelcomeScreen
              onStartFresh={() => setChat(startFreshInterview())}
              onUpload={(f) => void handleUpload(f)}
              uploadBusy={uploadBusy}
            />
          ) : (
            <div className="px-5 py-6 md:px-6" role="list" aria-label="Conversation">
              <div className="mx-auto max-w-xl space-y-4">
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
                    <Button variant="secondary" className="!text-sm" loading={busy} onClick={() => void improve('improve')}>
                      Improve wording
                    </Button>
                    <Button variant="secondary" className="!text-sm" loading={busy} onClick={() => void improve('shorter')}>
                      Make shorter
                    </Button>
                    <Button variant="secondary" className="!text-sm" loading={busy} onClick={() => void improve('regenerate-summary')}>
                      New summary
                    </Button>
                    <Button className="!text-sm" onClick={() => void downloadPdf()}>
                      Download PDF
                    </Button>
                    {resumeId ? (
                      <Link
                        to={`/app/builder/${resumeId}`}
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
                      >
                        Open in editor
                      </Link>
                    ) : null}
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="px-5 pb-2 md:px-6">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
        {status ? (
          <div className="px-5 pb-2 md:px-6">
            <StatusLine>{status}</StatusLine>
          </div>
        ) : null}

        {chat.phase === 'interview' ? (
          <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-4 md:px-6">
            <div className="mx-auto max-w-xl space-y-3">
              {hints.length ? (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested answers">
                  {hints.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => (h === 'Skip' ? void submitAnswer('skip') : setDraft((p) => (p ? `${p}, ${h}` : h)))}
                      className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-blue-400 hover:text-blue-800"
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
                    aria-label="Your answer"
                    className="field-textarea flex-1"
                  />
                ) : (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={inputDisabled}
                    placeholder="Type your answer…"
                    aria-label="Your answer"
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

      {/* Preview panel */}
      <section className="flex min-h-[45vh] flex-col bg-slate-100 lg:w-[48%]" aria-label="CV preview">
        <div className="border-b border-slate-200 bg-white px-5 py-4 md:px-6">
          <p className="text-sm font-semibold text-slate-900">Live preview</p>
          <p className="mt-0.5 text-sm text-slate-600">
            {chat.phase === 'welcome' ? 'Starts once you begin' : 'Updates as you answer'}
          </p>
        </div>
        <div className="flex flex-1 items-start justify-center overflow-y-auto p-5 md:p-8">
          <div
            className={
              'w-full max-w-[210mm] bg-white shadow-md ring-1 ring-slate-200 transition-all duration-500 ' +
              (justGenerated ? 'ring-2 ring-blue-500/40' : '')
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
