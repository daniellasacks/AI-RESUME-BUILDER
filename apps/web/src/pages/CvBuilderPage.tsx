import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import type { ResumeJson } from '../lib/resumeSchema'
import { linkedInSummary } from '../lib/wizardToResume'
import { ResumePreview } from '../components/ResumePreview'
import { Alert, Button, Card, ChangeBanner, Field, Input, Skeleton, Textarea } from '../components/ui'
import { useToasts } from '../components/toast'

type Version = { id: string; version: number; structuredJson: ResumeJson; createdAt: string }

export function CvBuilderPage() {
  const { resumeId } = useParams()
  const [sp, setSp] = useSearchParams()
  const toasts = useToasts()
  const [title, setTitle] = useState('')
  const [versions, setVersions] = useState<Version[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(sp.get('version'))
  const [busy, setBusy] = useState(false)
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [changes, setChanges] = useState<string[] | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobCompany, setJobCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  useEffect(() => {
    if (sp.get('reveal') === '1' && resumeId) {
      try {
        const raw = sessionStorage.getItem(`cv-reveal-${resumeId}`)
        if (raw) setChanges(JSON.parse(raw) as string[])
      } catch { /* ignore */ }
    }
  }, [resumeId, sp])

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

  async function improve(action: string, job?: { title?: string; company?: string; description?: string; url?: string }) {
    if (!selectedId) return
    setBusy(true)
    setError(null)
    try {
      const v = await api<Version & { changes?: string[] }>('/resume/improve', {
        method: 'POST',
        body: JSON.stringify({ versionId: selectedId, action, job }),
      })
      if (v.changes?.length) setChanges(v.changes)
      await load()
      setSelectedId(v.id)
      toasts.success('CV updated', 'New version saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  async function optimizeForJob() {
    if (!jobTitle.trim() && !jobDescription.trim() && !jobUrl.trim()) {
      toasts.info('Add job details', 'Paste a job title, link, or description.')
      return
    }
    await improve('optimize-job', {
      title: jobTitle.trim() || 'Target role',
      company: jobCompany.trim() || undefined,
      description: jobDescription.trim() || undefined,
      url: jobUrl.trim() || undefined,
    })
    void runAts()
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
      if (!jtId) return
      const res = await api<{ score: number }>('/ats/evaluate', {
        method: 'POST',
        body: JSON.stringify({ resumeVersionId: selectedId, jobTargetId: jtId }),
      })
      setAtsScore(res.score)
    } catch { /* optional */ } finally {
      setBusy(false)
    }
  }

  function dismissChanges() {
    setChanges(null)
    if (resumeId) sessionStorage.removeItem(`cv-reveal-${resumeId}`)
    sp.delete('reveal')
    setSp(sp, { replace: true })
  }

  const secondaryActions = [
    { label: 'Improve writing', action: 'improve' },
    { label: 'Make it shorter', action: 'shorter' },
    { label: 'Regenerate summary', action: 'regenerate-summary' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/app/resumes" className="text-xs font-medium text-slate-500 hover:text-blue-600">
            ← My CVs
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{title || PRODUCT_NAME}</h1>
        </div>
        {versions && versions.length > 1 ? (
          <select value={selectedId ?? ''} onChange={(e) => setSelectedId(e.target.value)} className="saas-input max-w-[180px]">
            {versions.map((v) => (
              <option key={v.id} value={v.id}>Version {v.version}</option>
            ))}
          </select>
        ) : null}
      </div>

      {changes?.length ? <ChangeBanner changes={changes} onDismiss={dismissChanges} /> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_1fr]">
        <div className="space-y-4">
          {/* Job tailoring — primary */}
          <Card className="border-blue-200 bg-gradient-to-b from-blue-50/80 to-white p-5 ring-1 ring-blue-100">
            <p className="text-sm font-bold text-slate-900">🎯 Tailor to a job</p>
            <p className="mt-1 text-xs text-slate-500">Paste a posting — AI optimizes keywords and phrasing.</p>
            <div className="mt-4 grid gap-3">
              <Field label="Job link (optional)">
                <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://company.com/jobs/…" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role title">
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Frontend Developer" />
                </Field>
                <Field label="Company">
                  <Input value={jobCompany} onChange={(e) => setJobCompany(e.target.value)} placeholder="Acme" />
                </Field>
              </div>
              <Field label="Job description">
                <Textarea rows={4} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job posting…" />
              </Field>
              <Button className="w-full" loading={busy} disabled={!selected} onClick={() => void optimizeForJob()}>
                Optimize CV for this job
              </Button>
            </div>
            {atsScore !== null ? (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <span className="text-sm font-medium text-slate-600">ATS match</span>
                <span className="text-2xl font-bold text-emerald-600">{atsScore}</span>
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">More AI actions</p>
            <div className="mt-3 grid gap-2">
              {secondaryActions.map((a) => (
                <Button key={a.action} variant="secondary" className="w-full justify-start" loading={busy} disabled={!selected} onClick={() => void improve(a.action)}>
                  {a.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Export</p>
            <div className="mt-3 grid gap-2">
              <Button className="w-full" disabled={!selected} onClick={() => void downloadPdf()}>Download PDF</Button>
              <Button variant="secondary" className="w-full" disabled={!selected} onClick={() => { if (selected) { void navigator.clipboard.writeText(linkedInSummary(selected.structuredJson)); toasts.success('Copied') } }}>
                Copy LinkedIn summary
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => { void navigator.clipboard.writeText(window.location.href); toasts.success('Link copied') }}>
                Copy share link
              </Button>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden p-4 lg:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Live preview</p>
          <div className="flex justify-center rounded-xl bg-slate-100/80 p-4 md:p-8">
            {!versions ? (
              <Skeleton className="h-[400px] w-full max-w-[210mm]" />
            ) : selected ? (
              <div className="w-full max-w-[210mm] shadow-xl shadow-slate-300/50 ring-1 ring-slate-200 transition-opacity duration-500">
                <ResumePreview resume={selected.structuredJson} a4 />
              </div>
            ) : (
              <p className="py-20 text-sm text-slate-400">Select a version</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
