import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

type ResumeListItem = {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  _count: { versions: number }
}

export function ResumesPage() {
  const [items, setItems] = useState<ResumeListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<ResumeListItem[]>('/resume')
      .then(setItems)
      .catch((e) => {
        setItems([])
        setError(e instanceof Error ? e.message : 'Failed to load')
      })
  }, [])

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-zinc-100">Resumes</div>
          <div className="text-sm text-zinc-400">Your resume containers and version counts.</div>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {!items ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950" />
          ))
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">
            No resumes yet. Go to <Link className="text-violet-300 hover:text-violet-200" to="/app/dashboard">Dashboard</Link> to upload and create your first version.
          </div>
        ) : (
          items.map((r) => (
            <Link
              key={r.id}
              to={`/app/resumes/${r.id}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:bg-zinc-900/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-100">{r.title}</div>
                  <div className="mt-1 text-xs text-zinc-400">Status: {r.status}</div>
                </div>
                <div className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200">
                  {r._count.versions} versions
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-500">Updated {new Date(r.updatedAt).toLocaleString()}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

