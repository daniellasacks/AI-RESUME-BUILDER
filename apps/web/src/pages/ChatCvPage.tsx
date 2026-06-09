import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../lib/api'
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
    <div className="flex justify-start">
      <div className="rounded-[16px] rounded-bl-[4px] border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#6b7280]">
        <span className="inline-flex items-center gap-1">
          AI is thinking
          <span className="inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1 animate-bounce rounded-full bg-[#6b7280]"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
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
          'max-w-[85%] rounded-[16px] px-4 py-3 text-sm leading-relaxed ' +
          (isUser
            ? 'rounded-br-[4px] bg-[#2563eb] text-white'
            : 'rounded-bl-[4px] border border-[#e5e7eb] bg-white text-[#111827]')
        }
      >
        {content}
      </div>
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages.length, thinking])

  async function sendMessage(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim() || thinking || chat.phase === 'generated') return
    if (chat.phase === 'ready') return

    const content = draft.trim()
    setDraft('')
    setThinking(true)
    setError(null)

    await new Promise((r) => setTimeout(r, 450))

    setChat((prev) => applyChatAnswer(prev, content))
    setThinking(false)
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
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Your CV is ready! I polished your summary, experience, and skills.${res.changes.length ? ` Highlights: ${res.changes.slice(0, 2).join(' · ')}` : ''}`,
          },
        ],
      }))
      setTimeout(() => setJustGenerated(false), 2000)
      toasts.success('CV generated')
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
    setStatus(action === 'optimize-job' ? 'Optimizing for ATS…' : 'Updating CV…')
    setError(null)
    try {
      const v = await api<Version & { changes?: string[] }>('/resume/improve', {
        method: 'POST',
        body: JSON.stringify({
          versionId,
          action,
          job:
            action === 'optimize-job' && chat.wizard.target.description
              ? { title: chat.wizard.target.title, description: chat.wizard.target.description }
              : undefined,
        }),
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
    { label: 'Improve writing', action: 'improve' },
    { label: 'Make shorter', action: 'shorter' },
    { label: 'Tailor for job', action: 'optimize-job' },
    { label: 'Regenerate summary', action: 'regenerate-summary' },
  ]

  const inputDisabled = thinking || generating || chat.phase === 'ready' || chat.phase === 'generated'

  return (
    <div className="-mx-6 flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* Chat — 70% */}
      <div className="flex min-h-0 flex-1 flex-col lg:w-[70%]">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {chat.messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {thinking ? <TypingIndicator /> : null}
            {chat.phase === 'ready' ? (
              <div className="flex justify-start">
                <Button loading={generating} onClick={() => void generateCv()}>
                  Generate CV ✨
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
          <div className="border-t border-[#e5e7eb] bg-white px-6 py-4">
            <p className="mb-3 text-xs font-medium text-[#6b7280]">Quick actions</p>
            <div className="flex flex-wrap gap-2">
              {postActions.map((a) => (
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
              ))}
              <Button variant="secondary" className="!py-2 !text-xs" disabled={!versionId} onClick={() => void downloadPdf()}>
                Download PDF
              </Button>
            </div>
          </div>
        ) : null}

        <form onSubmit={sendMessage} className="border-t border-[#e5e7eb] bg-white px-6 py-4">
          <div className="mx-auto flex max-w-2xl gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={inputDisabled}
              placeholder={
                chat.phase === 'ready'
                  ? 'Click Generate CV above…'
                  : chat.phase === 'generated'
                    ? 'CV ready — use actions below'
                    : 'Type your answer…'
              }
              className="field-input h-11 flex-1"
            />
            <Button type="submit" disabled={inputDisabled || !draft.trim()}>
              Send
            </Button>
          </div>
        </form>
      </div>

      {/* Preview — 30% */}
      <div className="flex min-h-[320px] flex-col border-t border-[#e5e7eb] bg-[#f7f8fa] lg:w-[30%] lg:border-l lg:border-t-0">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <p className="text-xs font-medium text-[#6b7280]">Live preview</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className={
              'mx-auto w-full max-w-[210mm] border border-[#e5e7eb] bg-white transition-all duration-500 ' +
              (justGenerated ? 'scale-[1.01] shadow-lg' : 'shadow-sm')
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
