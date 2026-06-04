import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useToasts } from '../components/toast'
import { Alert, Button, Card, Field, Input, PageHeader, Skeleton, Textarea } from '../components/ui'

type JobTarget = {
  id: string
  title: string
  company?: string | null
  industry?: string | null
  location?: string | null
  jobDescriptionText?: string | null
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
  const jdLen = useMemo(() => jobDescriptionText.trim().length, [jobDescriptionText])

  async function refresh() {
    setError(null)
    try {
      setItems(await api<JobTarget[]>('/job-targets'))
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
      toasts.error('Title required')
      return
    }
    setBusy(true)
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
      toasts.success('Saved')
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed'
      setError(msg)
      toasts.error('Failed', msg)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this job target?')) return
    setBusy(true)
    try {
      await api(`/job-targets/${id}`, { method: 'DELETE' })
      toasts.success('Deleted')
      await refresh()
    } catch (e) {
      toasts.error('Failed', e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Job targets" subtitle="Paste descriptions for tailoring and ATS." />
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Role title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Engineer" />
          </Field>
          <Field label="Company">
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Industry">
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Job description">
          <Textarea
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            rows={6}
            placeholder="Paste the posting…"
          />
        </Field>
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
          <span>{jdLen} chars</span>
          <Button disabled={busy} onClick={() => void create()}>
            Add target
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {!items ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : items.length === 0 ? (
          <Card className="col-span-full p-8 text-center text-sm text-zinc-500">No targets yet.</Card>
        ) : (
          items.map((jt) => (
            <Card key={jt.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{jt.title}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {[jt.company, jt.location].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <Button variant="ghost" disabled={busy} onClick={() => void remove(jt.id)} className="shrink-0 text-xs">
                  Delete
                </Button>
              </div>
              {jt.jobDescriptionText ? (
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-400">{jt.jobDescriptionText}</p>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
