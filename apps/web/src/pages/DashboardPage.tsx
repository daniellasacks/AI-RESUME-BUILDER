import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { IconSparkles, IconUpload } from '../components/icons'
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
    <div className="space-y-8">
      <PageHeader title="Home" action={<ButtonLink to="/app/resumes" variant="secondary">All resumes</ButtonLink>} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,300px)_1fr]">
        <div className="space-y-4">
          {showOnboarding ? (
            <Card elevated className="p-5">
              <p className="text-sm font-medium text-zinc-300">Finish setup in one minute.</p>
              <ButtonLink to="/app/onboarding" className="mt-4 w-full">
                Quick start
              </ButtonLink>
            </Card>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Resumes" value={resumeCount ?? '—'} />
            <Stat label="Jobs" value={jobTargetCount ?? '—'} />
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                <IconUpload size={20} />
              </span>
              <div>
                <p className="font-semibold text-white">Import</p>
                <p className="text-xs text-zinc-500">PDF or DOCX</p>
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-zinc-900/50 py-8 transition hover:border-sky-500/40 hover:bg-sky-500/5">
              <span className="text-xs font-medium text-zinc-500">Drop file or click</span>
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

          <div className="flex gap-2">
            <Link to="/app/job-targets" className="surface flex-1 rounded-xl py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-white">
              Jobs
            </Link>
            <Link to="/app/templates" className="surface flex-1 rounded-xl py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-white">
              Templates
            </Link>
          </div>
        </div>

        <Card elevated className="flex min-h-[520px] flex-col overflow-hidden !p-0">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
              <IconSparkles size={18} />
            </span>
            <p className="font-semibold text-white">AI assistant</p>
          </div>

          <div className="flex-1 space-y-4 overflow-auto bg-zinc-950/40 px-5 py-5">
            {!session ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <p className="max-w-xs text-sm text-zinc-500">Walk through your resume section by section.</p>
                <Button disabled={busy} onClick={startConversation} className="mt-5">
                  {busy ? '…' : 'Start chat'}
                </Button>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ' +
                      (m.role === 'user'
                        ? 'bg-white font-medium text-zinc-950'
                        : 'surface text-zinc-200')
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-white/[0.06] bg-zinc-900/50 p-4">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!session || busy}
                className="h-12 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15 disabled:opacity-50"
                placeholder={session ? 'Ask anything…' : 'Start chat first'}
              />
              <Button type="submit" disabled={!session || busy || !draft.trim()}>
                Send
              </Button>
            </div>
            {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
          </form>
        </Card>
      </div>
    </div>
  )
}
