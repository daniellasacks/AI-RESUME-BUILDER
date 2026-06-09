import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { ResumeJson } from '../lib/resumeSchema'
import { linkedInSummary } from '../lib/wizardToResume'
import { ResumePreview } from '../components/ResumePreview'
import { Alert, Button, Card } from '../components/ui'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson; createdAt: string }

export function CvBuilderPage() {
  const { resumeId } = useParams()
  const [sp] = useSearchParams()
  const toasts = useToasts()
  const [title, setTitle] = useState('')
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(sp.get('version'))
  const [busy, setBusy] = useState(false)
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const selected = useMemo(() => versions.find((v) => v.id === selectedId) ?? null, [versions, selectedId])

  async function improve(action: string) {
    if (!selectedId) return
    setBusy(true)
    setError(null)
    try {
      const v = await api<Version>('/resume/improve', {
        method: 'POST',
        body: JSON.stringify({ versionId: selectedId, action }),
      })
      await load()
      setSelectedId(v.id)
      toasts.success('Updated', 'New version saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  async function downloadPdf() {
    if (!selected) return
    const blob = await api<Blob>(`/export/resume/${selected.id}.pdf`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'cv'}-v${selected.version}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function runAts() {
    if (!selectedId) return
    setBusy(true)
    try {
      const targets = await api<Array<{ id: string }>>('/job-targets')
      const jtId = targets[0]?.id
      if (!jtId) {
        toasts.info('Add a job target', 'Complete the wizard with a target role first.')
        return
      }
      const res = await api<{ score: number }>('/ats/evaluate', {
        method: 'POST',
        body: JSON.stringify({ resumeVersionId: selectedId, jobTargetId: jtId }),
      })
      setAtsScore(res.score)
    } catch (e) {
      toasts.error('ATS failed', e instanceof Error ? e.message : 'Error')
    } finally {
      setBusy(false)
    }
  }

  function copyLinkedIn() {
    if (!selected) return
    void navigator.clipboard.writeText(linkedInSummary(selected.structuredJson))
    toasts.success('Copied', 'LinkedIn summary on clipboard.')
  }

  function copyShareLink() {
    void navigator.clipboard.writeText(window.location.href)
    toasts.success('Copied', 'Share link copied.')
  }

  const aiActions = [
    { label: 'Improve writing', action: 'improve' },
    { label: 'Make it shorter', action: 'shorter' },
    { label: 'Tailor for job', action: 'tailor' },
    { label: 'Regenerate summary', action: 'regenerate-summary' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/app/resumes" className="text-xs font-medium text-slate-500 hover:text-blue-600">
            ← My CVs
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{title || 'CV Builder'}</h1>
        </div>
        {versions.length > 1 ? (
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="saas-input max-w-[200px]"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Version {v.version}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">AI actions</p>
            <div className="mt-3 grid gap-2">
              {aiActions.map((a) => (
                <Button key={a.action} variant="secondary" className="w-full justify-start" disabled={busy || !selected} onClick={() => void improve(a.action)}>
                  {a.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">ATS score</p>
              <Button variant="ghost" className="!px-2 text-xs" disabled={busy} onClick={() => void runAts()}>
                Run
              </Button>
            </div>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{atsScore ?? '—'}</p>
            {atsScore !== null ? (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, atsScore)}%` }} />
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Evaluate against your target job</p>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Export</p>
            <div className="mt-3 grid gap-2">
              <Button className="w-full" disabled={!selected} onClick={() => void downloadPdf()}>
                Download PDF
              </Button>
              <Button variant="secondary" className="w-full" disabled={!selected} onClick={copyLinkedIn}>
                Copy LinkedIn summary
              </Button>
              <Button variant="secondary" className="w-full" onClick={copyShareLink}>
                Copy share link
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-2 text-sm font-semibold text-slate-900">Save variant</p>
            <div className="flex flex-wrap gap-2">
              {['General', 'Frontend', 'HR / Admin'].map((label) => (
                <Button key={label} variant="ghost" className="!text-xs" disabled={busy} onClick={() => void improve(`variant:${label.toLowerCase()}`)}>
                  {label}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden p-4 lg:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Live preview · A4</p>
          <div className="flex justify-center bg-slate-100/80 p-4 md:p-8">
            <div className="w-full max-w-[210mm] shadow-lg shadow-slate-300/40 ring-1 ring-slate-200">
              {selected ? <ResumePreview resume={selected.structuredJson} a4 /> : <p className="p-8 text-slate-400">Loading…</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
