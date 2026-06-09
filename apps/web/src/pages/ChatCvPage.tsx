import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
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
import { Alert, Button, StatusLine, Textarea } from '../components/ui'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson }

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.min(100, Math.round((step / total) * 100))
  return (
    <div className="h-1 w-full bg-slate-100">
      <div
        className="h-full bg-indigo-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          AI is thinking
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-slate-400"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

function ChatBubble({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  const isUser = role === 'user'
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          'max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ' +
          (isUser
            ? 'rounded-tr-md bg-indigo-600 text-white'
            : 'rounded-tl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80')
        }
      >
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  )
}

function HintChips({ hints, onPick }: { hints: string[]; onPick: (h: string) => void }) {
  if (!hints.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {hints.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onPick(h)}
          className={
            'rounded-lg border px-3 py-1.5 text-xs transition ' +
            (h === 'Skip'
              ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              : 'border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100')
          }
        >
          {h}
        </button>
      ))}
    </div>
  )
}

export function ChatCvPage() {
  const toasts = useToasts()
  const bottomRef = useRef<HTMLDivElement | null>(null)
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
  const useTextarea = currentStep && 'multiline' in currentStep && currentStep.multiline
  const progressStep = chat.phase === 'ready' || chat.phase === 'generated' ? TOTAL_STEPS : chat.stepIndex

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages.length, thinking])

  async function submitAnswer(content: string) {
    if (!content.trim() || thinking || chat.phase === 'generated' || chat.phase === 'ready') return
    setDraft('')
    setThinking(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 300))
    setChat((prev) => applyChatAnswer(prev, content.trim()))
    setThinking(false)
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault()
    await submitAnswer(draft)
  }

  function pickHint(h: string) {
    if (h === 'Skip') {
      void submitAnswer('skip')
      return
    }
    setDraft((prev) => (prev ? `${prev}${prev.endsWith('\n') ? '' : ', '}${h}` : h))
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
          { id: crypto.randomUUID(), role: 'assistant', content: 'Your CV is ready. Refine it below or download the PDF.' },
        ],
      }))
      setTimeout(() => setJustGenerated(false), 2000)
      toasts.success('CV ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
      setStatus(null)
    }
  }

  async function improve(action: string) {
    if (!versionId) return
    setBusy(true)
    setStatus('Updating…')
    setError(null)
    try {
      const v = await api<Version & { changes?: string[] }>('/resume/improve', {
        method: 'POST',
        body: JSON.stringify({ versionId, action }),
      })
      setVersionId(v.id)
      setGeneratedResume(v.structuredJson)
      if (v.changes?.length) setHighlights(sectionsFromChanges(v.changes))
      setJustGenerated(true)
      setTimeout(() => setJustGenerated(false), 1500)
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
    <div className="-mx-6 -mt-0 flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* Chat workspace */}
      <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 bg-slate-50 lg:w-[58%]">
        {chat.phase === 'interview' ? <ProgressBar step={progressStep} total={TOTAL_STEPS} /> : null}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">CV Interview</p>
            {chat.phase === 'interview' ? (
              <p className="text-xs text-slate-500">
                Question {Math.min(progressStep + 1, TOTAL_STEPS)} of {TOTAL_STEPS}
              </p>
            ) : chat.phase === 'ready' ? (
              <p className="text-xs text-indigo-600">Ready to generate</p>
            ) : (
              <p className="text-xs text-emerald-600">CV complete</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto max-w-xl space-y-4">
            {chat.messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {thinking ? <TypingIndicator /> : null}
            {chat.phase === 'ready' ? (
              <Button loading={generating} onClick={() => void generateCv()}>
                Generate CV
              </Button>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {error ? (
          <div className="px-5 pb-2">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
        {status ? (
          <div className="px-5 pb-2">
            <StatusLine>{status}</StatusLine>
          </div>
        ) : null}

        {chat.phase === 'generated' ? (
          <div className="border-t border-slate-200 bg-white px-5 py-3">
            <div className="mx-auto flex max-w-xl flex-wrap gap-2">
              <Button variant="secondary" className="!py-2 !text-xs" loading={busy} disabled={!versionId} onClick={() => void improve('improve')}>
                Improve
              </Button>
              <Button variant="secondary" className="!py-2 !text-xs" loading={busy} disabled={!versionId} onClick={() => void improve('shorter')}>
                Shorter
              </Button>
              <Button variant="secondary" className="!py-2 !text-xs" loading={busy} disabled={!versionId} onClick={() => void improve('regenerate-summary')}>
                New summary
              </Button>
              <Button variant="secondary" className="!py-2 !text-xs" disabled={!versionId} onClick={() => void downloadPdf()}>
                Download PDF
              </Button>
            </div>
          </div>
        ) : null}

        <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-4">
          <div className="mx-auto max-w-xl space-y-3">
            {chat.phase === 'interview' && hints.length ? (
              <HintChips hints={hints} onPick={pickHint} />
            ) : null}
            {useTextarea ? (
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={inputDisabled}
                rows={3}
                placeholder="Type your answer…"
              />
            ) : (
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={inputDisabled}
                placeholder={
                  chat.phase === 'ready' ? 'Tap Generate above' : chat.phase === 'generated' ? 'Done' : 'Type your answer…'
                }
                className="field-input"
              />
            )}
            {chat.phase === 'interview' ? (
              <Button type="submit" disabled={inputDisabled || !draft.trim()} className="w-full">
                Send
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      {/* CV preview — always visible */}
      <div className="flex min-h-[300px] flex-col bg-white lg:w-[42%]">
        <div className="border-b border-slate-200 px-5 py-3">
          <p className="text-sm font-semibold text-slate-900">Your CV</p>
          <p className="text-xs text-slate-500">Updates as you chat</p>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-100/50 p-5">
          <div
            className={
              'mx-auto w-full max-w-[210mm] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all ' +
              (justGenerated ? 'ring-2 ring-indigo-300' : '')
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
