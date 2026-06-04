import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useToasts } from '../components/toast'
import { ResumePreview } from '../components/ResumePreview'
import type { ResumeJson } from '../lib/resumeSchema'

type Template = {
  id: string
  key: string
  name: string
  description?: string | null
  templateJson?: { type?: string; sections?: string[] }
}

export function TemplatesPage() {
  const toasts = useToasts()
  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [previewKey, setPreviewKey] = useState<string | null>(null)

  const [sp] = useSearchParams()
  const resumeId = sp.get('resumeId')
  const versionId = sp.get('versionId')

  const [resume, setResume] = useState<any | null>(null)

  const selectedVersion = useMemo(() => {
    if (!resume || !versionId) return null
    return (resume.versions ?? []).find((v: any) => v.id === versionId) ?? null
  }, [resume, versionId])

  const previewResume: ResumeJson | null = useMemo(() => {
    if (selectedVersion?.structuredJson) return selectedVersion.structuredJson as ResumeJson
    return {
      basics: {
        fullName: 'Alex Morgan',
        headline: 'Senior Full Stack Engineer',
        email: 'alex@email.com',
        location: 'Remote',
        summary: 'Full-stack engineer with experience building SaaS products, APIs, and AI-assisted workflows.',
      },
      experience: [
        {
          company: 'Acme Corp',
          title: 'Senior Engineer',
          startDate: '2022',
          endDate: 'Present',
          highlights: ['Led migration to NestJS + Prisma', 'Shipped ATS-friendly resume export pipeline'],
        },
      ],
      skills: [{ category: 'Backend', items: ['Node.js', 'PostgreSQL', 'Prisma'] }],
      education: [{ school: 'State University', degree: 'B.S. Computer Science' }],
    }
  }, [selectedVersion])

  useEffect(() => {
    api<Template[]>('/templates')
      .then((t) => {
        setTemplates(t)
        setPreviewKey(t[0]?.key ?? null)
      })
      .catch((e) => {
        setTemplates([])
        setError(e instanceof Error ? e.message : 'Failed to load templates')
      })
  }, [])

  useEffect(() => {
    if (!resumeId) return
    api(`/resume/${resumeId}`)
      .then(setResume)
      .catch(() => setResume(null))
  }, [resumeId])

  const previewTemplate = useMemo(
    () => templates?.find((t) => t.key === previewKey) ?? templates?.[0] ?? null,
    [templates, previewKey],
  )

  async function applyTemplate(t: Template) {
    if (!resumeId || !selectedVersion) {
      toasts.info('Select a resume version', 'Open Templates from a resume detail page to apply a template.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api('/resume/versions', {
        method: 'POST',
        body: JSON.stringify({
          resumeId,
          structuredJson: selectedVersion.structuredJson,
          templateId: t.id,
          derivedFromVersionId: selectedVersion.id,
          jobTargetId: selectedVersion.jobTargetId ?? undefined,
        }),
      })
      toasts.success('Template applied', `Created a new version using “${t.name}”.`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to apply template'
      setError(msg)
      toasts.error('Apply failed', msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-lg font-semibold text-zinc-100">Templates</div>
        <div className="text-sm text-zinc-400">Preview layouts and apply one to a resume version.</div>
      </div>
      {error ? <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div> : null}

      {resumeId && versionId ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Applying to resume</div>
              <div className="mt-1 text-xs text-zinc-400">
                Resume: <span className="text-zinc-200">{resume?.title ?? resumeId}</span> • Version:{' '}
                <span className="text-zinc-200">{selectedVersion ? `v${selectedVersion.version}` : versionId}</span>
              </div>
            </div>
            <Link to={`/app/resumes/${resumeId}`} className="text-xs font-semibold text-violet-300 hover:text-violet-200">
              Back to resume
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-3 md:grid-cols-2">
          {!templates ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950" />
            ))
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                className={
                  'rounded-2xl border p-5 transition ' +
                  (previewKey === t.key
                    ? 'border-violet-500 bg-violet-500/5'
                    : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/40')
                }
              >
                <button type="button" onClick={() => setPreviewKey(t.key)} className="w-full text-left">
                  <div className="text-sm font-semibold text-zinc-100">{t.name}</div>
                  <div className="mt-1 text-xs text-zinc-400">{t.description ?? t.key}</div>
                </button>
                <div className="mt-3 scale-[0.85] origin-top-left">
                  {previewResume ? (
                    <ResumePreview resume={previewResume} template={t.templateJson ?? undefined} compact />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    disabled={busy}
                    onClick={() => void applyTemplate(t)}
                    className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Use template
                  </button>
                  <div className="text-[11px] text-zinc-500">New version</div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="sticky top-24 self-start rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-semibold text-zinc-100">Large preview</div>
          <div className="mt-1 text-xs text-zinc-400">{previewTemplate?.name ?? 'Select a template'}</div>
          <div className="mt-3">
            {previewResume && previewTemplate ? (
              <ResumePreview resume={previewResume} template={previewTemplate.templateJson ?? undefined} />
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
