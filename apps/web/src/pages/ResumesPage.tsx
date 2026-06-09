import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Alert, ButtonLink, Card, EmptyState, PageHeader, Skeleton } from '../components/ui'

type ResumeListItem = {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
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
      <PageHeader title="My CVs" action={<ButtonLink to="/app/chat">New CV</ButtonLink>} />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {!items ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : items.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="No CVs yet." action={<ButtonLink to="/app/chat">Start Chat</ButtonLink>} />
          </div>
        ) : (
          items.map((r) => (
            <Link key={r.id} to={`/app/builder/${r.id}`}>
              <Card className="p-5 transition hover:border-[#2563eb]/30">
                <div className="font-medium text-[#111827]">{r.title}</div>
                <div className="mt-1 text-xs text-[#6b7280]">{r._count.versions} versions</div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
