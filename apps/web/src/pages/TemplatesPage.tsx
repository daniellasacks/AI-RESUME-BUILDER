import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useToasts } from '../components/toast'
import { ResumePreview } from '../components/ResumePreview'
import type { ResumeJson } from '../lib/resumeSchema'
import { Alert, Button, ButtonLink, Card, PageHeader, Skeleton } from '../components/ui'

type Template = {
  id: string
  key: string
  name: string
  description?: string | null
  templateJson?: { type?: string; sections?: string[] }
}

const sampleResume: ResumeJson = {
  basics: {
    fullName: 'Alex Morgan',
    headline: 'Senior Engineer',
    email: 'alex@email.com',
    location: 'Remote',
    summary: 'Full-stack engineer building SaaS products and APIs.',
  },
  experience: [
    {
      company: 'Acme Corp',
      title: 'Senior Engineer',
      startDate: '2022',
      endDate: 'Present',
      highlights: ['Led API migration', 'Shipped export pipeline'],
    },
  ],
  skills: [{ category: 'Backend', items: ['Node.js', 'PostgreSQL'] }],
  education: [{ school: 'State University', degree: 'B.S. CS' }],
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

  const previewResume: ResumeJson = (selectedVersion?.structuredJson as ResumeJson) ?? sampleResume

  useEffect(() => {
    api<Template[]>('/templates')
      .then((t) => {
        setTemplates(t)
        setPreviewKey(t[0]?.key ?? null)
      })
      .catch((e) => {
        setTemplates([])
        setError(e instanceof Error ? e.message : 'Failed to load')
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
      toasts.info('Open from a resume to apply')
      return
    }
    setBusy(true)
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
      toasts.success('New version created')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed'
      setError(msg)
      toasts.error('Failed', msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        subtitle="Pick a layout for your resume."
        action={
          resumeId ? (
            <ButtonLink to={`/app/resumes/${resumeId}`} variant="secondary">
              Back
            </ButtonLink>
          ) : undefined
        }
      />

      {resumeId && versionId ? (
        <Card className="px-4 py-3 text-sm text-zinc-400">
          Applying to <span className="text-white">{resume?.title ?? 'resume'}</span>
          {selectedVersion ? ` · v${selectedVersion.version}` : ''}
        </Card>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {!templates ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setPreviewKey(t.key)}
                onClick={() => setPreviewKey(t.key)}
                className={
                  'cursor-pointer rounded-2xl border p-4 transition ' +
                  (previewKey === t.key
                    ? 'border-indigo-500/30 bg-indigo-500/5'
                    : 'border-white/[0.06] bg-white/[0.03] hover:border-white/10')
                }
              >
                <div className="font-medium text-white">{t.name}</div>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{t.description ?? t.key}</p>
                <div className="mt-3 origin-top-left scale-[0.75]">
                  <ResumePreview resume={previewResume} template={t.templateJson ?? undefined} compact />
                </div>
                {resumeId && versionId ? (
                  <Button
                    disabled={busy}
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      void applyTemplate(t)
                    }}
                  >
                    Use template
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>

        <Card className="sticky top-24 hidden p-4 lg:block">
          <p className="text-sm font-medium text-white">{previewTemplate?.name ?? 'Preview'}</p>
          <div className="mt-3 max-h-[70vh] overflow-auto">
            {previewTemplate ? (
              <ResumePreview resume={previewResume} template={previewTemplate.templateJson ?? undefined} />
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
