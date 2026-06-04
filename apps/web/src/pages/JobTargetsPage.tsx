import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useToasts } from '../components/toast'

type JobTarget = {
  id: string
  title: string
  company?: string | null
  industry?: string | null
  location?: string | null
  jobDescriptionText?: string | null
  createdAt: string
  updatedAt: string
}

export function JobTargetsPage() {
  const toasts = useToasts()
  const [items, setItems] = useState<JobTarget[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [jobDescriptionText, setJobDescriptionText] = useState('')
  const [busy, setBusy] = useState(false)

  const jdCharCount = useMemo(() => jobDescriptionText.trim().length, [jobDescriptionText])

  async function refresh() {
    setError(null)
    try {
      const res = await api<JobTarget[]>('/job-targets')
      setItems(res)
    } catch (e) {
      setItems([])
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function create() {
    if (!title.trim()) {
      toasts.error('Missing title', 'Add a job target title (e.g. “Senior Backend Engineer”).')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api('/job-targets', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim() || undefined,
          industry: industry.trim() || undefined,
          location: location.trim() || undefined,
          jobDescriptionText: jobDescriptionText.trim() || undefined,
        }),
      })
      setTitle('')
      setCompany('')
      setIndustry('')
      setLocation('')
      setJobDescriptionText('')
      toasts.success('Job target created', 'You can now tailor a resume version to this job.')
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create'
      setError(msg)
      toasts.error('Create failed', msg)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this job target?')) return
    setBusy(true)
    setError(null)
    try {
      await api(`/job-targets/${id}`, { method: 'DELETE' })
      toasts.success('Deleted', 'Job target removed.')
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete'
      setError(msg)
      toasts.error('Delete failed', msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-lg font-semibold text-zinc-100">Job Targets</div>
        <div className="text-sm text-zinc-400">Store job descriptions and metadata for tailoring and ATS scoring.</div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div> : null}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="text-sm font-semibold text-zinc-100">Create job target</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-400">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500"
              placeholder="Senior Full Stack Engineer"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-400">Company (optional)</span>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500"
              placeholder="Acme Corp"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-400">Industry (optional)</span>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500"
              placeholder="Fintech"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-400">Location (optional)</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500"
              placeholder="Tel Aviv, IL (Remote)"
            />
          </label>
        </div>
        <label className="mt-3 grid gap-1">
          <span className="text-xs text-zinc-400">Job description (paste)</span>
          <textarea
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            rows={8}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
            placeholder="Paste the full job description here…"
          />
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div>{jdCharCount} characters</div>
            <div>Tip: ATS scoring + tailoring uses this text.</div>
          </div>
        </label>
        <div className="mt-3 flex justify-end">
          <button
            disabled={busy}
            onClick={() => void create()}
            className="h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            Create
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-100">Saved job targets</div>
          <button
            disabled={busy}
            onClick={() => void refresh()}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {!items ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950" />
            ))
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-300">No job targets yet.</div>
          ) : (
            items.map((jt) => (
              <div key={jt.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">{jt.title}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {[jt.company, jt.location, jt.industry].filter(Boolean).join(' • ') || 'No metadata'}
                    </div>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => void remove(jt.id)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3 line-clamp-4 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
                  {jt.jobDescriptionText ? jt.jobDescriptionText : 'No job description text saved.'}
                </div>
                <div className="mt-2 text-xs text-zinc-500">Updated {new Date(jt.updatedAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

