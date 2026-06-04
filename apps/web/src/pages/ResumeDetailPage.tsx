import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useToasts } from '../components/toast'
import { ResumePreview } from '../components/ResumePreview'
import type { ResumeJson } from '../lib/resumeSchema'
import { Alert, Button, ButtonLink, Card } from '../components/ui'

const selectCls =
  'h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-indigo-500/50'

type ResumeVersion = {
  id: string
  version: number
  createdAt: string
  jobTargetId?: string | null
  templateId?: string | null
  derivedFromVersionId?: string | null
  structuredJson: any
  plainText?: string | null
}

type ResumeDetail = {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  versions: ResumeVersion[]
}

export function ResumeDetailPage() {
  const { resumeId } = useParams()
  const toasts = useToasts()
  const [data, setData] = useState<ResumeDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [compareTo, setCompareTo] = useState<string | null>(null)
  const [jobTargets, setJobTargets] = useState<Array<{ id: string; title: string; company?: string | null }> | null>(null)
  const [jobTargetId, setJobTargetId] = useState<string>('')
  const [atsBusy, setAtsBusy] = useState(false)
  const [tailorBusy, setTailorBusy] = useState(false)
  const [ats, setAts] = useState<any | null>(null)

  async function loadResume() {
    if (!resumeId) return
    const r = await api<ResumeDetail>(`/resume/${resumeId}`)
    setData(r)
    const first = r.versions?.[0]?.id ?? null
    setSelected((prev) => prev ?? first)
    setCompareTo((prev) => prev ?? r.versions?.[1]?.id ?? first)
  }

  useEffect(() => {
    if (!resumeId) return
    loadResume().catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId])

  useEffect(() => {
    api<Array<{ id: string; title: string; company?: string | null }>>('/job-targets')
      .then((j) => {
        setJobTargets(j)
        if (!jobTargetId && j[0]?.id) setJobTargetId(j[0].id)
      })
      .catch(() => setJobTargets([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedVersion = useMemo(() => data?.versions?.find((v) => v.id === selected) ?? null, [data, selected])
  const compareVersion = useMemo(() => data?.versions?.find((v) => v.id === compareTo) ?? null, [data, compareTo])

  const diff = useMemo(() => {
    if (!selectedVersion || !compareVersion) return null
    if (selectedVersion.id === compareVersion.id) return { paths: [] as string[] }
    return { paths: diffPaths(compareVersion.structuredJson, selectedVersion.structuredJson).slice(0, 120) }
  }, [selectedVersion, compareVersion])

  async function download(kind: 'pdf' | 'docx') {
    if (!selectedVersion) return
    const blob = await api<Blob>(`/export/resume/${selectedVersion.id}.${kind}`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data?.title ?? 'resume'}-v${selectedVersion.version}.${kind}`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function tailorToJob() {
    if (!selectedVersion) return
    if (!jobTargetId) {
      toasts.error('Missing job target', 'Create a job target first.')
      return
    }
    setTailorBusy(true)
    setError(null)
    try {
      const created = await api<{ id: string; version: number }>('/resume/tailor', {
        method: 'POST',
        body: JSON.stringify({ baseVersionId: selectedVersion.id, jobTargetId }),
      })
      toasts.success('Tailored', `Created version v${created.version} for this job.`)
      await loadResume()
      setSelected(created.id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Tailoring failed'
      setError(msg)
      toasts.error('Tailor failed', msg)
    } finally {
      setTailorBusy(false)
    }
  }

  async function evaluateAts() {
    if (!selectedVersion) return
    if (!jobTargetId) {
      toasts.error('Missing job target', 'Create a job target and select it first.')
      return
    }
    setAtsBusy(true)
    setError(null)
    try {
      const res = await api('/ats/evaluate', {
        method: 'POST',
        body: JSON.stringify({ resumeVersionId: selectedVersion.id, jobTargetId }),
      })
      setAts(res)
      toasts.success('ATS evaluation saved', 'Score + suggestions generated.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ATS evaluation failed'
      setError(msg)
      toasts.error('ATS failed', msg)
    } finally {
      setAtsBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link to="/app/resumes" className="text-xs text-zinc-500 hover:text-white">
            ← Resumes
          </Link>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white">{data?.title ?? 'Resume'}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!selectedVersion} onClick={() => void download('pdf')}>
            PDF
          </Button>
          <Button variant="secondary" disabled={!selectedVersion} onClick={() => void download('docx')}>
            DOCX
          </Button>
        </div>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="p-4">
          <p className="text-sm font-medium text-white">Versions</p>
          <div className="mt-3 grid gap-2">
            {!data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
              ))
            ) : data.versions.length === 0 ? (
              <div className="text-sm text-zinc-300">No versions yet.</div>
            ) : (
              data.versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  className={
                    'w-full rounded-xl border px-3 py-2.5 text-left transition ' +
                    (v.id === selected
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : 'border-white/[0.06] bg-transparent hover:bg-white/[0.03]')
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-white">v{v.version}</div>
                    <div className="text-xs text-zinc-600">{new Date(v.createdAt).toLocaleDateString()}</div>
                  </div>
                  {v.jobTargetId ? (
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-indigo-400/80">Tailored</div>
                  ) : null}
                </button>
              ))
            )}
          </div>
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-xs font-medium text-zinc-500">Compare to</p>
            <select value={compareTo ?? ''} onChange={(e) => setCompareTo(e.target.value || null)} className={'mt-2 ' + selectCls}>
              {(data?.versions ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <div className="space-y-4">
          {selectedVersion ? (
            <>
              {selectedVersion.structuredJson ? (
                <Card className="p-4">
                  <div className="max-h-[480px] overflow-auto">
                    <ResumePreview resume={selectedVersion.structuredJson as ResumeJson} />
                  </div>
                </Card>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <ButtonLink to={`/app/resumes/${data?.id ?? ''}/edit`} variant="secondary">
                  Edit
                </ButtonLink>
                <ButtonLink
                  to={
                    selectedVersion
                      ? `/app/templates?resumeId=${encodeURIComponent(data?.id ?? '')}&versionId=${encodeURIComponent(selectedVersion.id)}`
                      : '/app/templates'
                  }
                  variant="secondary"
                >
                  Template
                </ButtonLink>
              </div>

              <Card className="p-4">
                <p className="text-sm font-medium text-white">Tailor</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select value={jobTargetId} onChange={(e) => setJobTargetId(e.target.value)} className={'min-w-[180px] flex-1 ' + selectCls}>
                    {(jobTargets ?? []).length === 0 ? (
                      <option value="">No targets</option>
                    ) : (
                      (jobTargets ?? []).map((jt) => (
                        <option key={jt.id} value={jt.id}>
                          {jt.title}
                          {jt.company ? ` · ${jt.company}` : ''}
                        </option>
                      ))
                    )}
                  </select>
                  <Button disabled={tailorBusy || !jobTargetId} onClick={() => void tailorToJob()}>
                    {tailorBusy ? '…' : 'Tailor'}
                  </Button>
                  <ButtonLink to="/app/job-targets" variant="ghost">
                    Targets
                  </ButtonLink>
                </div>
              </Card>

              {diff && diff.paths.length > 0 ? (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Changes</p>
                    <span className="text-xs text-zinc-600">
                      v{compareVersion?.version} → v{selectedVersion.version}
                    </span>
                  </div>
                  <ul className="mt-3 max-h-48 space-y-1 overflow-auto font-mono text-[11px] text-zinc-400">
                    {diff.paths.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Card>
              ) : null}

              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">ATS</p>
                  <Button disabled={atsBusy || !jobTargetId} onClick={() => void evaluateAts()}>
                    {atsBusy ? '…' : 'Score'}
                  </Button>
                </div>
                {typeof ats?.score === 'number' ? (
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tabular-nums text-white">{ats.score}</span>
                      <span className="text-xs capitalize text-zinc-500">{ats?.verdict ? String(ats.verdict) : ''}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={
                          'h-full rounded-full ' +
                          (ats.score >= 80 ? 'bg-emerald-500' : ats.score >= 55 ? 'bg-amber-500' : 'bg-rose-500')
                        }
                        style={{ width: `${Math.max(0, Math.min(100, ats.score))}%` }}
                      />
                    </div>
                  </div>
                ) : null}
                {ats?.suggestionsJson ? (
                  <div className="mt-4 space-y-3 text-xs text-zinc-400">
                    {ats.suggestionsJson.summary ? (
                      <p className="leading-relaxed text-zinc-300">{ats.suggestionsJson.summary}</p>
                    ) : null}
                    {(ats.suggestionsJson.missingKeywords ?? []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(ats.suggestionsJson.missingKeywords ?? []).slice(0, 16).map((k: string) => (
                          <span key={k} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-300">
                            {k}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {(ats.suggestionsJson.suggestions ?? []).length > 0 ? (
                      <ul className="list-inside list-disc space-y-1 text-zinc-400">
                        {(ats.suggestionsJson.suggestions ?? []).slice(0, 8).map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Select a version.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function diffPaths(a: any, b: any): string[] {
  const out: string[] = []
  walk(a, b, '$', out)
  return out
}

function walk(a: any, b: any, path: string, out: string[]) {
  if (Object.is(a, b)) return

  const aIsArr = Array.isArray(a)
  const bIsArr = Array.isArray(b)
  if (aIsArr || bIsArr) {
    if (!aIsArr || !bIsArr) {
      out.push(path)
      return
    }
    const max = Math.max(a.length, b.length)
    for (let i = 0; i < max; i++) {
      if (i >= a.length || i >= b.length) out.push(`${path}[${i}]`)
      else walk(a[i], b[i], `${path}[${i}]`, out)
    }
    return
  }

  const aIsObj = a && typeof a === 'object'
  const bIsObj = b && typeof b === 'object'
  if (!aIsObj || !bIsObj) {
    out.push(path)
    return
  }

  const keys = new Set<string>([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) {
    if (!(k in a)) out.push(`${path}.${k}`)
    else if (!(k in b)) out.push(`${path}.${k}`)
    else walk(a[k], b[k], `${path}.${k}`, out)
  }
}

