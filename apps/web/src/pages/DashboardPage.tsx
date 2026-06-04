import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Button, ButtonLink, Card, PageHeader, Stat } from '../components/ui'

type ConversationMessage = { id: string; role: string; content: string; createdAt: string }
type ConversationSession = { id: string; title?: string | null; messages: ConversationMessage[] }

export function DashboardPage() {
  const [session, setSession] = useState<ConversationSession | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [extractedJson, setExtractedJson] = useState<unknown | null>(null)
  const [resumeCount, setResumeCount] = useState<number | null>(null)
  const [jobTargetCount, setJobTargetCount] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    api<unknown[]>('/resume')
      .then((r) => setResumeCount(r.length))
      .catch(() => setResumeCount(0))
    api<unknown[]>('/job-targets')
      .then((j) => setJobTargetCount(j.length))
      .catch(() => setJobTargetCount(0))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages?.length])

  const messages = useMemo(() => (session?.messages ?? []).filter((m) => m.role !== 'system'), [session])

  async function startConversation() {
    setBusy(true)
    setError(null)
    try {
      const res = await api<ConversationSession>('/conversations/start', { method: 'POST', body: JSON.stringify({}) })
      setSession(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start')
    } finally {
      setBusy(false)
    }
  }

  async function onUpload(file: File) {
    setUploadBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'resume')
      const uploaded = await api<{ id: string }>('/uploads', { method: 'POST', body: fd })
      const extracted = await api<{ resumeJson: unknown }>('/resume/extract', {
        method: 'POST',
        body: JSON.stringify({ documentId: uploaded.id }),
      })
      setExtractedJson(extracted.resumeJson)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadBusy(false)
    }
  }

  async function createResumeFromExtract() {
    if (!extractedJson) return
    setBusy(true)
    try {
      const created = await api<{ id: string }>('/resume', { method: 'POST', body: JSON.stringify({ title: 'Imported Resume' }) })
      await api('/resume/versions', {
        method: 'POST',
        body: JSON.stringify({ resumeId: created.id, structuredJson: extractedJson }),
      })
      setExtractedJson(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault()
    if (!session || !draft.trim()) return
    setBusy(true)
    setError(null)
    const content = draft.trim()
    setDraft('')
    try {
      const res = await api<ConversationSession>(`/conversations/${session.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
      setSession(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setBusy(false)
    }
  }

  const showOnboarding = resumeCount === 0 || jobTargetCount === 0

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-4">
        <PageHeader title="Home" action={<ButtonLink to="/app/resumes" variant="secondary">All resumes</ButtonLink>} />

        {showOnboarding ? (
          <Card className="p-4">
            <p className="text-sm text-zinc-400">Get set up in under a minute.</p>
            <ButtonLink to="/app/onboarding" className="mt-3 w-full">
              Quick start
            </ButtonLink>
          </Card>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Resumes" value={resumeCount ?? '—'} />
          <Stat label="Jobs" value={jobTargetCount ?? '—'} />
        </div>

        <Card className="p-4">
          <p className="text-sm font-medium text-white">Import resume</p>
          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 transition hover:border-indigo-500/30 hover:bg-indigo-500/5">
            <span className="text-xs text-zinc-500">PDF or DOCX</span>
            <input
              type="file"
              accept=".pdf,.docx"
              disabled={uploadBusy}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onUpload(f)
              }}
            />
          </label>
          {extractedJson ? (
            <Button disabled={busy} onClick={createResumeFromExtract} className="mt-3 w-full">
              Save import
            </Button>
          ) : null}
        </Card>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/job-targets"
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
          >
            Job targets
          </Link>
          <Link
            to="/app/templates"
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
          >
            Templates
          </Link>
        </div>
      </div>

      <Card className="flex min-h-[480px] flex-col overflow-hidden">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <p className="text-sm font-medium text-white">AI assistant</p>
        </div>

        <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
          {!session ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
              <p className="text-sm text-zinc-500">Build your resume step by step.</p>
              <Button disabled={busy} onClick={startConversation} className="mt-4">
                {busy ? '…' : 'Start chat'}
              </Button>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ' +
                    (m.role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'border border-white/[0.06] bg-white/[0.03] text-zinc-200')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t border-white/[0.06] p-4">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!session || busy}
              className="h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500/50 disabled:opacity-50"
              placeholder={session ? 'Message…' : 'Start chat first'}
            />
            <Button type="submit" disabled={!session || busy || !draft.trim()}>
              Send
            </Button>
          </div>
          {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
        </form>
      </Card>
    </div>
  )
}
