import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useToasts } from '../components/toast'
import { ResumePreview } from '../components/ResumePreview'
import type { ResumeJson } from '../lib/resumeSchema'

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
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-zinc-500">
            <Link to="/app/resumes" className="text-zinc-300 hover:text-zinc-100">
              Resumes
            </Link>{' '}
            <span className="text-zinc-700">/</span>
          </div>
          <div className="mt-1 truncate text-lg font-semibold text-zinc-100">{data?.title ?? 'Resume'}</div>
          <div className="mt-1 text-sm text-zinc-400">Browse versions, export, and compare.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={!selectedVersion}
            onClick={() => void download('pdf')}
            className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white disabled:opacity-60"
          >
            Download PDF
          </button>
          <button
            disabled={!selectedVersion}
            onClick={() => void download('docx')}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
          >
            Download DOCX
          </button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-semibold text-zinc-100">Versions</div>
          <div className="mt-3 grid gap-2">
            {!data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950" />
              ))
            ) : data.versions.length === 0 ? (
              <div className="text-sm text-zinc-300">No versions yet.</div>
            ) : (
              data.versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  className={
                    'w-full rounded-xl border px-3 py-2 text-left transition ' +
                    (v.id === selected ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/40')
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-zinc-100">v{v.version}</div>
                    <div className="text-xs text-zinc-500">{new Date(v.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {v.derivedFromVersionId ? 'Derived' : 'Base'} • {v.jobTargetId ? 'Job-targeted' : 'General'} •{' '}
                    {v.templateId ? 'Templated' : 'Default template'}
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
            <div className="font-semibold text-zinc-100">Compare</div>
            <div className="mt-2 grid gap-2">
              <label className="grid gap-1">
                <span className="text-[11px] text-zinc-400">Against</span>
                <select
                  value={compareTo ?? ''}
                  onChange={(e) => setCompareTo(e.target.value || null)}
                  className="h-9 rounded-xl border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none focus:border-violet-500"
                >
                  {(data?.versions ?? []).map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version} • {new Date(v.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </label>
              <div className="text-[11px] text-zinc-400">We diff the structured JSON and list changed paths.</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-sm font-semibold text-zinc-100">Selected version</div>
          {selectedVersion ? (
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-zinc-100">v{selectedVersion.version}</div>
                  <div className="text-xs text-zinc-500">{new Date(selectedVersion.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Template: {selectedVersion.templateId ?? '(none)'} • Job target: {selectedVersion.jobTargetId ?? '(none)'}
                </div>
              </div>

              {selectedVersion.structuredJson ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-sm font-semibold text-zinc-100">Preview</div>
                  <div className="mt-3 max-h-[420px] overflow-auto">
                    <ResumePreview resume={selectedVersion.structuredJson as ResumeJson} />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  to={`/app/resumes/${data?.id ?? ''}/edit`}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-900/40"
                >
                  Edit structured data
                </Link>
                <Link
                  to={selectedVersion ? `/app/templates?resumeId=${encodeURIComponent(data?.id ?? '')}&versionId=${encodeURIComponent(selectedVersion.id)}` : '/app/templates'}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-900/40"
                >
                  Choose template
                </Link>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-sm font-semibold text-zinc-100">Tailor to job target</div>
                <div className="mt-1 text-xs text-zinc-400">
                  AI rewrites this version for the selected job (creates a new derived version).
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="grid flex-1 gap-1 min-w-[200px]">
                    <span className="text-[11px] text-zinc-400">Job target</span>
                    <select
                      value={jobTargetId}
                      onChange={(e) => setJobTargetId(e.target.value)}
                      className="h-9 rounded-xl border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none focus:border-violet-500"
                    >
                      {(jobTargets ?? []).length === 0 ? (
                        <option value="">No job targets yet</option>
                      ) : (
                        (jobTargets ?? []).map((jt) => (
                          <option key={jt.id} value={jt.id}>
                            {jt.title}
                            {jt.company ? ` — ${jt.company}` : ''}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                  <button
                    disabled={tailorBusy || !jobTargetId || !selectedVersion}
                    onClick={() => void tailorToJob()}
                    className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {tailorBusy ? 'Tailoring…' : 'Tailor with AI'}
                  </button>
                  <Link
                    to="/app/job-targets"
                    className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 inline-flex items-center"
                  >
                    Manage targets
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-zinc-100">Version comparison</div>
                  <div className="text-xs text-zinc-500">
                    {compareVersion ? `v${compareVersion.version} → v${selectedVersion.version}` : ''}
                  </div>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Showing changed JSON paths (max 120). This is intentionally interview-friendly: you can explain “what changed” without a wall of text.
                </div>
                <div className="mt-3 grid gap-2">
                  {!diff ? (
                    <div className="text-sm text-zinc-300">Select versions to compare.</div>
                  ) : diff.paths.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">No detected changes.</div>
                  ) : (
                    <div className="max-h-72 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                      <ul className="space-y-1 text-xs text-zinc-200">
                        {diff.paths.map((p) => (
                          <li key={p} className="font-mono text-[11px] text-zinc-200">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">ATS score</div>
                    <div className="mt-1 text-xs text-zinc-400">Run an evaluation against a saved job target.</div>
                  </div>
                  <button
                    disabled={atsBusy || !jobTargetId}
                    onClick={() => void evaluateAts()}
                    className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {atsBusy ? 'Evaluating…' : 'Evaluate'}
                  </button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_220px]">
                  <label className="grid gap-1">
                    <span className="text-[11px] text-zinc-400">Job target</span>
                    <select
                      value={jobTargetId}
                      onChange={(e) => setJobTargetId(e.target.value)}
                      className="h-9 rounded-xl border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none focus:border-violet-500"
                    >
                      {(jobTargets ?? []).map((jt) => (
                        <option key={jt.id} value={jt.id}>
                          {jt.title}
                          {jt.company ? ` — ${jt.company}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                    <div className="text-[11px] text-zinc-400">Latest score</div>
                    <div className="mt-1 text-2xl font-semibold text-zinc-100">{typeof ats?.score === 'number' ? ats.score : '—'}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Verdict:{' '}
                      <span className="font-semibold text-zinc-200">{ats?.verdict ? String(ats.verdict) : '—'}</span>
                    </div>
                    {typeof ats?.score === 'number' ? (
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
                        <div
                          className={
                            'h-full rounded-full ' +
                            (ats.score >= 80 ? 'bg-emerald-500' : ats.score >= 55 ? 'bg-amber-500' : 'bg-rose-500')
                          }
                          style={{ width: `${Math.max(0, Math.min(100, ats.score))}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {ats?.suggestionsJson ? (
                  <div className="mt-3 grid gap-3">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-200">
                      <div className="font-semibold text-zinc-100">Summary</div>
                      <div className="mt-1 whitespace-pre-wrap text-zinc-200">{ats.suggestionsJson.summary ?? ''}</div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-200">
                        <div className="font-semibold text-zinc-100">Missing keywords</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(ats.suggestionsJson.missingKeywords ?? []).slice(0, 24).map((k: string) => (
                            <span key={k} className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-200">
                              {k}
                            </span>
                          ))}
                          {(ats.suggestionsJson.missingKeywords ?? []).length === 0 ? (
                            <div className="text-[11px] text-zinc-400">None detected.</div>
                          ) : null}
                        </div>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-200">
                        <div className="font-semibold text-zinc-100">Recommendations</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-zinc-200">
                          {(ats.suggestionsJson.suggestions ?? []).slice(0, 12).map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                          {(ats.suggestionsJson.suggestions ?? []).length === 0 ? (
                            <li className="text-zinc-400">No suggestions returned.</li>
                          ) : null}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-zinc-300">Select a version.</div>
          )}
        </section>
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

