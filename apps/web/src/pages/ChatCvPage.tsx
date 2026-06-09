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
import { sampleExtractedResume } from '../lib/demoStore'
import type { ResumeJson } from '../lib/resumeSchema'
import { ResumePreview } from '../components/ResumePreview'
import { Alert, Button, StatusLine } from '../components/ui'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson }

function AssistantAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-[10px] font-bold text-white shadow-sm">
      AI
    </div>
  )
}

function Message({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end gap-2" role="listitem">
        <div className="max-w-[82%] rounded-2xl rounded-br-md bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-3 text-[15px] leading-relaxed text-white shadow-md shadow-teal-900/15">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3" role="listitem">
      <AssistantAvatar />
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-stone-100 bg-white px-4 py-3 text-[15px] leading-relaxed text-stone-800 shadow-sm">
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3" role="status" aria-live="polite">
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-stone-100 bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-teal-400"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

const SAMPLE_PREVIEW: ResumeJson = sampleExtractedResume()

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
    if (chat.phase === 'welcome') return SAMPLE_PREVIEW
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
      setChat(startUpdateInterview(resumeJsonToWizard(extracted.resumeJson), file.name))
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
    setStatus('Crafting your CV…')
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
          { id: crypto.randomUUID(), role: 'assistant', content: 'Done — your CV is ready. Download it or keep refining in the editor.' },
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
    <div className="workspace-card flex h-full min-h-0 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        {/* Chat */}
        <section className="flex min-h-0 flex-1 flex-col bg-[#fcfcfa] lg:w-[52%]" aria-label="AI assistant">
          {chat.phase === 'interview' ? (
            <div className="h-1 bg-stone-100" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-amber-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          ) : null}

          {chat.phase !== 'welcome' ? (
            <div className="border-b border-stone-100 px-6 py-4">
              <p className="font-semibold text-stone-900">{chat.mode === 'update' ? 'Refine your CV' : 'Your interview'}</p>
              <p className="mt-0.5 text-sm text-stone-500">
                {chat.phase === 'interview'
                  ? `Step ${progressStep + 1} of ${total}`
                  : chat.phase === 'ready'
                    ? 'Ready when you are'
                    : 'All set'}
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
              <div className="px-6 py-6" role="list" aria-label="Conversation">
                <div className="mx-auto max-w-xl space-y-5">
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
                      <Button variant="secondary" className="!text-sm" loading={busy} onClick={() => void improve('improve')}>Improve</Button>
                      <Button variant="secondary" className="!text-sm" loading={busy} onClick={() => void improve('shorter')}>Shorter</Button>
                      <Button variant="secondary" className="!text-sm" loading={busy} onClick={() => void improve('regenerate-summary')}>New summary</Button>
                      <Button className="!text-sm" onClick={() => void downloadPdf()}>Download PDF</Button>
                      {resumeId ? (
                        <Link
                          to={`/app/builder/${resumeId}`}
                          className="inline-flex min-h-[44px] items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-900 hover:bg-stone-50"
                        >
                          Open editor
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                  <div ref={bottomRef} />
                </div>
              </div>
            )}
          </div>

          {error ? <div className="px-6 pb-2"><Alert tone="error">{error}</Alert></div> : null}
          {status ? <div className="px-6 pb-2"><StatusLine>{status}</StatusLine></div> : null}

          {chat.phase === 'interview' ? (
            <div className="shrink-0 px-6 pb-6">
              <div className="composer-float mx-auto max-w-xl rounded-2xl bg-white p-3">
                {hints.length ? (
                  <div className="mb-2 flex flex-wrap gap-2" role="group" aria-label="Suggestions">
                    {hints.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => (h === 'Skip' ? void submitAnswer('skip') : setDraft((p) => (p ? `${p}, ${h}` : h)))}
                        className="rounded-full bg-stone-50 px-3 py-1.5 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-200"
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
                      placeholder="Your answer…"
                      aria-label="Your answer"
                      className="field-textarea min-h-[44px] flex-1 border-0 bg-transparent focus:ring-0"
                    />
                  ) : (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onKeyDown}
                      disabled={inputDisabled}
                      placeholder="Your answer…"
                      aria-label="Your answer"
                      className="field-input flex-1 border-0 bg-transparent focus:ring-0"
                    />
                  )}
                  <button
                    type="button"
                    disabled={inputDisabled || !draft.trim()}
                    onClick={() => void submitAnswer(draft)}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-40"
                    aria-label="Send"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Preview */}
        <section className="preview-stage flex min-h-[46vh] flex-col border-t border-stone-100 lg:w-[48%] lg:border-l lg:border-t-0" aria-label="CV preview">
          <div className="flex items-center justify-between border-b border-stone-200/60 px-6 py-4">
            <div>
              <p className="font-semibold text-stone-900">Live preview</p>
              <p className="text-sm text-stone-500">
                {chat.phase === 'welcome' ? 'A finished example — yours builds here' : 'Updates as you go'}
              </p>
            </div>
            {chat.phase === 'welcome' ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-500 shadow-sm ring-1 ring-stone-200">
                Example
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm ring-1 ring-stone-200">
                <span className="size-1.5 animate-pulse rounded-full bg-teal-500" />
                Live
              </span>
            )}
          </div>
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-6 md:p-10">
            <div
              className={
                'doc-float w-full max-w-[210mm] bg-white transition-all duration-500 ' +
                (justGenerated ? 'ring-2 ring-teal-400/50' : '')
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
    </div>
  )
}
