import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Alert, ButtonLink, Card, EmptyState, PageHeader, Skeleton } from '../components/ui'

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
    <div>
      <PageHeader
        title="My CVs"
        subtitle="Saved versions and exports."
        action={<ButtonLink to="/app/create">New CV</ButtonLink>}
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {!items ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : items.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="No CVs yet." action={<ButtonLink to="/app/create">Create my CV</ButtonLink>} />
          </div>
        ) : (
          items.map((r) => (
            <Link key={r.id} to={`/app/builder/${r.id}`} className="block">
              <Card className="p-5 transition hover:shadow-md">
                <div className="font-semibold text-slate-900">{r.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {r._count.versions} version{r._count.versions !== 1 ? 's' : ''} · <span className="capitalize">{r.status}</span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
