import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { IconArrowRight, IconFiles } from '../components/icons'
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
    <div className="space-y-8">
      <PageHeader
        title="Resumes"
        action={
          <ButtonLink to="/app/dashboard" variant="secondary">
            Import
          </ButtonLink>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {!items ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : items.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="No resumes yet."
              action={<ButtonLink to="/app/dashboard">Import or create</ButtonLink>}
            />
          </div>
        ) : (
          items.map((r) => (
            <Link key={r.id} to={`/app/resumes/${r.id}`} className="group block">
              <Card elevated className="p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-500/30">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <IconFiles size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate font-bold text-white">{r.title}</div>
                      <IconArrowRight size={16} className="shrink-0 text-zinc-600 transition group-hover:text-sky-400" />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span className="capitalize">{r.status}</span>
                      <span>·</span>
                      <span>{r._count.versions} versions</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
