import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { ResumeJson } from '../lib/resumeSchema'
import { ResumePreview } from '../components/ResumePreview'
import { Alert, Button, Card, StatusLine, Textarea } from '../components/ui'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson; createdAt: string }

export function CvBuilderPage() {
  const { resumeId } = useParams()
  const [sp] = useSearchParams()
  const toasts = useToasts()
  const [title, setTitle] = useState('')
  const [versions, setVersions] = useState<Version[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(sp.get('version'))
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')

  async function load() {
    if (!resumeId) return
    const r = await api<{ title: string; versions: Version[] }>(`/resume/${resumeId}`)
    setTitle(r.title)
    setVersions(r.versions ?? [])
    setSelectedId((prev) => prev ?? r.versions?.[0]?.id ?? null)
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId])

  const selected = useMemo(() => versions?.find((v) => v.id === selectedId) ?? null, [versions, selectedId])

  async function improve(action: string, job?: { description?: string }) {
    if (!selectedId) return
    setBusy(true)
    setError(null)
    setStatus(action === 'optimize-job' ? 'Optimizing for ATS…' : 'Updating CV…')
    try {
      const v = await api<Version>('/resume/improve', {
        method: 'POST',
        body: JSON.stringify({
          versionId: selectedId,
          action,
          job: job ? { title: 'Target role', description: job.description } : undefined,
        }),
      })
      await load()
      setSelectedId(v.id)
      toasts.success('Saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
      setStatus(null)
    }
  }

  async function downloadPdf() {
    if (!selected) return
    const blob = await api<Blob>(`/export/resume/${selected.id}.pdf`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'cv'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const actions = [
    { label: 'Improve writing', action: 'improve' },
    { label: 'Shorter version', action: 'shorter' },
    { label: 'Regenerate summary', action: 'regenerate-summary' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/app/resumes" className="text-xs text-[#6b7280] hover:text-[#2563eb]">
            ← My CVs
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-[#111827]">{title || 'CV Builder'}</h1>
        </div>
        {versions && versions.length > 1 ? (
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="field-input max-w-[160px] py-2 text-xs"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-medium text-[#111827]">Tailor for job</p>
            <Textarea
              className="mt-3"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description…"
            />
            <Button
              className="mt-3 w-full"
              loading={busy}
              disabled={!selected}
              onClick={() => void improve('optimize-job', { description: jobDescription })}
            >
              Tailor for job
            </Button>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm font-medium text-[#111827]">AI actions</p>
            <div className="space-y-2">
              {actions.map((a) => (
                <Button
                  key={a.action}
                  variant="secondary"
                  className="w-full justify-start"
                  loading={busy}
                  disabled={!selected}
                  onClick={() => void improve(a.action)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
            {status ? <div className="mt-3"><StatusLine>{status}</StatusLine></div> : null}
          </Card>

          <Button variant="secondary" className="w-full" disabled={!selected} onClick={() => void downloadPdf()}>
            Download PDF
          </Button>
        </div>

        <Card className="p-6">
          <p className="mb-4 text-xs text-[#6b7280]">Preview</p>
          <div className="flex justify-center rounded-[12px] bg-[#f7f8fa] p-6">
            {!versions ? (
              <div className="h-[480px] w-full max-w-[210mm] animate-pulse rounded-[12px] bg-[#e5e7eb]/50" />
            ) : selected ? (
              <div className="w-full max-w-[210mm] border border-[#e5e7eb] bg-white">
                <ResumePreview resume={selected.structuredJson} a4 />
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
