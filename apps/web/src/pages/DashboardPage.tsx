import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

type ConversationMessage = { id: string; role: string; content: string; createdAt: string }
type ConversationSession = { id: string; title?: string | null; messages: ConversationMessage[] }

export function DashboardPage() {
  const [session, setSession] = useState<ConversationSession | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const [extractedJson, setExtractedJson] = useState<any | null>(null)
  const [templates, setTemplates] = useState<Array<{ id: string; key: string; name: string; description?: string | null }> | null>(null)
  const [resumeCount, setResumeCount] = useState<number | null>(null)
  const [jobTargetCount, setJobTargetCount] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    api<Array<{ id: string; key: string; name: string; description?: string | null }>>('/templates')
      .then(setTemplates)
      .catch(() => setTemplates([]))
  }, [])

  useEffect(() => {
    api<any[]>('/resume')
      .then((r) => {
        setResumeCount(r.length)
        setLastUpdated(r[0]?.updatedAt ?? null)
      })
      .catch(() => setResumeCount(0))
    api<any[]>('/job-targets')
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
    setUploadMsg(null)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'resume')

      const uploaded = await api<{ id: string; filename: string }>('/uploads', {
        method: 'POST',
        body: fd,
      })
      setUploadMsg(`Uploaded ${uploaded.filename}. Extracting…`)

      const extracted = await api<{ documentId: string; resumeJson: any }>('/resume/extract', {
        method: 'POST',
        body: JSON.stringify({ documentId: uploaded.id }),
      })
      setExtractedJson(extracted.resumeJson)
      setUploadMsg('Extraction complete. You can now save as a Resume + Version.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadBusy(false)
    }
  }

  async function createResumeFromExtract() {
    if (!extractedJson) return
    setBusy(true)
    setError(null)
    try {
      const created = await api<{ id: string }>('/resume', { method: 'POST', body: JSON.stringify({ title: 'Imported Resume' }) })
      await api('/resume/versions', {
        method: 'POST',
        body: JSON.stringify({ resumeId: created.id, structuredJson: extractedJson }),
      })
      setUploadMsg('Saved as Resume + Version 1. Next: add a job target and tailor.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resume')
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

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-100">Dashboard</div>
            <p className="mt-1 text-xs text-zinc-400">Upload, extract, version, tailor, score, export.</p>
          </div>
          <Link
            to="/app/resumes"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            Open resumes
          </Link>
        </div>

        <div className="mt-4 grid gap-3">
          {resumeCount === 0 || jobTargetCount === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
              <div className="font-semibold text-zinc-100">Getting started</div>
              <div className="mt-1 text-zinc-300">Follow the onboarding checklist to create your first resume + job target.</div>
              <Link
                to="/app/onboarding"
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white"
              >
                Open onboarding
              </Link>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="text-[11px] text-zinc-400">Resumes</div>
              <div className="mt-1 text-xl font-semibold text-zinc-100">{resumeCount ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="text-[11px] text-zinc-400">Job targets</div>
              <div className="mt-1 text-xl font-semibold text-zinc-100">{jobTargetCount ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="text-[11px] text-zinc-400">Last activity</div>
              <div className="mt-1 text-sm font-semibold text-zinc-100">{lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}</div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
            <div className="text-xs font-medium text-zinc-100">Templates</div>
            <div className="mt-2 grid gap-2">
              {(templates ?? []).slice(0, 3).map((t) => (
                <div key={t.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                  <div className="text-xs font-semibold text-zinc-100">{t.name}</div>
                  <div className="text-[11px] text-zinc-400">{t.description ?? t.key}</div>
                </div>
              ))}
              {!templates ? <div className="text-[11px] text-zinc-400">Loading templates…</div> : null}
            </div>
          </div>

          <label className="grid gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-xs font-medium text-zinc-100">Upload existing resume (PDF/DOCX)</div>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={uploadBusy}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onUpload(f)
              }}
              className="block w-full text-xs text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-100 hover:file:bg-zinc-700 disabled:opacity-60"
            />
            {uploadMsg ? <div className="text-xs text-zinc-300">{uploadMsg}</div> : null}
            {extractedJson ? (
              <button
                disabled={busy}
                onClick={createResumeFromExtract}
                className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-xs font-semibold text-white disabled:opacity-60"
              >
                Save as Resume Version
              </button>
            ) : null}
          </label>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
            <div className="font-semibold text-zinc-100">Next steps</div>
            <div className="mt-2 grid gap-2">
              <Link to="/app/job-targets" className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 hover:bg-zinc-900">
                Create a job target (paste a job description)
              </Link>
              <Link to="/app/resumes" className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 hover:bg-zinc-900">
                View resume versions and export
              </Link>
              <Link to="/app/templates" className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 hover:bg-zinc-900">
                Preview and select templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[520px] flex-col rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-5 py-4">
          <div className="text-sm font-semibold text-zinc-100">{session?.title ?? 'Conversational Builder'}</div>
          <div className="text-xs text-zinc-400">Guided Q&A with AI follow-ups.</div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto px-5 py-4">
          {!session ? (
            <div className="grid place-items-center py-16 text-center">
              <div className="max-w-sm">
                <div className="text-base font-semibold text-zinc-100">Start from scratch or upload an existing CV</div>
                <p className="mt-2 text-sm text-zinc-400">We’ll build structured resume data and generate versions for each job.</p>
                <button
                  disabled={busy}
                  onClick={startConversation}
                  className="mt-4 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busy ? 'Starting…' : 'Start conversation'}
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ' +
                    (m.role === 'user' ? 'bg-violet-600 text-white' : 'border border-zinc-800 bg-zinc-900/40 text-zinc-100')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t border-zinc-800 p-4">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!session || busy}
              className="h-11 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 outline-none focus:border-violet-500 disabled:opacity-60"
              placeholder={session ? 'Type your answer…' : 'Start a conversation first'}
            />
            <button
              disabled={!session || busy || !draft.trim()}
              className="h-11 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              Send
            </button>
          </div>
          {error ? <div className="mt-2 text-xs text-rose-300">{error}</div> : null}
        </form>
      </section>
    </div>
  )
}

