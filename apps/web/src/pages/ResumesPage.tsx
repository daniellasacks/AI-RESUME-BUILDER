import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Alert, Card, PageHeader, Skeleton } from '../components/ui'

type ResumeListItem = {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
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
    <div className="space-y-6">
      <PageHeader title="Resumes" subtitle="All versions in one place." />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {!items ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : items.length === 0 ? (
          <Card className="col-span-full p-8 text-center text-sm text-zinc-500">
            No resumes yet.{' '}
            <Link to="/app/dashboard" className="text-indigo-400 hover:text-indigo-300">
              Import one
            </Link>
          </Card>
        ) : (
          items.map((r) => (
            <Link key={r.id} to={`/app/resumes/${r.id}`} className="group">
              <Card className="p-5 transition group-hover:border-indigo-500/20 group-hover:bg-white/[0.05]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{r.title}</div>
                    <div className="mt-1 text-xs capitalize text-zinc-600">{r.status}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                    {r._count.versions}v
                  </span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
