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
    <div className="px-6 pt-4">
      <div className="mx-auto flex max-w-2xl items-center justify-between text-xs text-[#64748b]">
        <span>Step {Math.min(step + 1, total)} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="mx-auto mt-2 max-w-2xl overflow-hidden rounded-full bg-indigo-100/80">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function AiAvatar() {
  return (
    <div className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white shadow-sm">
      AI
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <AiAvatar />
      <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-[#64748b] shadow-sm ring-1 ring-[#e2e8f0]">
        <span className="inline-flex items-center gap-1.5">
          Thinking
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-violet-400"
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
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-indigo-500/20">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start">
      <AiAvatar />
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-[#0f172a] shadow-sm ring-1 ring-[#e2e8f0]">
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
            'rounded-full border px-3 py-1.5 text-xs font-medium transition ' +
            (h === 'Skip'
              ? 'border-[#e2e8f0] bg-white text-[#64748b] hover:bg-slate-50'
              : 'border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100')
          }
        >
          {h}
        </button>
      ))}
    </div>
  )
}

function ChatWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-center text-white shadow-2xl shadow-violet-500/30">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
          ✦
        </div>
        <h2 className="mt-5 text-2xl font-bold">Let's build your CV</h2>
        <p className="mt-3 text-sm text-white/80 leading-relaxed">
          I'll ask 8 quick questions about your career. Your resume updates live on the right — no forms needed.
        </p>
        <ul className="mt-5 space-y-2 text-left text-sm text-white/90">
          <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Multiple jobs & achievements</li>
          <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Skills, tools & education</li>
          <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Download PDF when done</li>
        </ul>
        <Button onClick={onStart} className="mt-8 w-full !bg-white !py-3.5 !text-base !font-bold !text-violet-700 hover:!bg-violet-50">
          Let's go →
        </Button>
      </div>
    </div>
  )
}

export function ChatCvPage() {
  const toasts = useToasts()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [started, setStarted] = useState(false)
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages.length, thinking])

  async function submitAnswer(content: string) {
    if (!content.trim() || thinking || chat.phase === 'generated' || chat.phase === 'ready') return
    setDraft('')
    setThinking(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 350))
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
      setVersionId(res.versionId)
      setGeneratedResume(res.structuredJson)
      setHighlights(sectionsFromChanges(res.changes))
      setJustGenerated(true)
      setChat((prev) => ({
        ...prev,
        phase: 'generated',
        messages: [
          ...prev.messages,
          { id: crypto.randomUUID(), role: 'assistant', content: '🎉 Your CV is ready! Use the actions below to refine or download.' },
        ],
      }))
      setTimeout(() => setJustGenerated(false), 2000)
      toasts.success('CV ready!')
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

  const postActions = [
    { label: '✨ Polish', action: 'improve' },
    { label: 'Shorter', action: 'shorter' },
    { label: 'New summary', action: 'regenerate-summary' },
    { label: '📄 Download PDF', action: 'download' },
  ]

  const inputDisabled = thinking || generating || chat.phase === 'ready' || chat.phase === 'generated'
  const progressStep = chat.phase === 'ready' || chat.phase === 'generated' ? TOTAL_STEPS : chat.stepIndex

  if (!started) {
    return (
      <div className="-mx-6 flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col lg:w-[62%]">
          <ChatWelcome onStart={() => setStarted(true)} />
        </div>
        <div className="flex min-h-[200px] items-center justify-center border-t border-violet-200 bg-gradient-to-br from-violet-100 to-fuchsia-100 p-8 lg:w-[38%] lg:border-l lg:border-t-0">
          <p className="text-center text-sm font-medium text-violet-600">Your CV preview will appear here →</p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-6 flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col bg-white/50 lg:w-[62%]">
        {chat.phase === 'interview' ? <ProgressBar step={progressStep} total={TOTAL_STEPS} /> : null}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-2xl space-y-4">
            {chat.messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {thinking ? <TypingIndicator /> : null}
            {chat.phase === 'ready' ? (
              <div className="flex justify-center py-4">
                <Button loading={generating} onClick={() => void generateCv()} className="!px-8 !py-3.5 !text-base">
                  Generate my CV ✨
                </Button>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {error ? (
          <div className="px-6 pb-2">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
        {status ? (
          <div className="px-6 pb-2">
            <StatusLine>{status}</StatusLine>
          </div>
        ) : null}

        {chat.phase === 'generated' ? (
          <div className="border-t border-[#e2e8f0] bg-white/80 px-6 py-4 backdrop-blur-sm">
            <div className="mx-auto flex max-w-2xl flex-wrap gap-2">
              {postActions.map((a) =>
                a.action === 'download' ? (
                  <Button key={a.action} variant="secondary" className="!py-2 !text-xs" disabled={!versionId} onClick={() => void downloadPdf()}>
                    {a.label}
                  </Button>
                ) : (
                  <Button
                    key={a.action}
                    variant="secondary"
                    className="!py-2 !text-xs"
                    loading={busy}
                    disabled={!versionId}
                    onClick={() => void improve(a.action)}
                  >
                    {a.label}
                  </Button>
                ),
              )}
            </div>
          </div>
        ) : null}

        <form onSubmit={sendMessage} className="border-t border-[#e2e8f0] bg-white/90 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl space-y-3">
            {chat.phase === 'interview' && hints.length ? (
              <HintChips hints={hints} onPick={pickHint} />
            ) : null}
            {useTextarea ? (
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={inputDisabled}
                rows={4}
                placeholder="Type naturally — no special format needed…"
              />
            ) : (
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={inputDisabled}
                placeholder={
                  chat.phase === 'ready'
                    ? 'Tap Generate above ↑'
                    : chat.phase === 'generated'
                      ? 'All done — refine or download below'
                      : 'Your answer…'
                }
                className="field-input flex-1"
              />
            )}
            {chat.phase === 'interview' ? (
              <Button type="submit" disabled={inputDisabled || !draft.trim()} className="w-full">
                Continue →
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="flex min-h-[280px] flex-col border-t border-[#e2e8f0] bg-gradient-to-br from-indigo-50/80 to-violet-50/50 lg:w-[38%] lg:border-l lg:border-t-0">
        <div className="flex items-center gap-2 border-b border-[#e2e8f0]/60 px-5 py-3">
          <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
          <p className="text-xs font-semibold text-indigo-600">Live CV preview</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className={
              'mx-auto w-full max-w-[210mm] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white transition-all duration-500 ' +
              (justGenerated ? 'scale-[1.01] shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-200' : 'shadow-md')
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
