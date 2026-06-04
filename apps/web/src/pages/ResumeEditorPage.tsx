import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { ResumeSchema, type ResumeJson, emptyResume } from '../lib/resumeSchema'
import { useToasts } from '../components/toast'
import { ResumeEditorForm } from '../components/ResumeEditorForm'
import { ResumePreview } from '../components/ResumePreview'
import { Alert, Button, ButtonLink, Card, PageHeader, Skeleton } from '../components/ui'

type ResumeVersion = {
  id: string
  version: number
  structuredJson: ResumeJson
  jobTargetId?: string | null
  templateId?: string | null
}

type ResumeDetail = {
  id: string
  title: string
  versions: ResumeVersion[]
}

export function ResumeEditorPage() {
  const { resumeId } = useParams()
  const nav = useNavigate()
  const toasts = useToasts()

  const [data, setData] = useState<ResumeDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<ResumeJson | null>(null)

  useEffect(() => {
    if (!resumeId) return
    api<ResumeDetail>(`/resume/${resumeId}`)
      .then((r) => {
        setData(r)
        const base = r.versions?.[0]?.structuredJson ?? emptyResume('')
        setDraft({
          ...emptyResume(base.basics?.fullName ?? ''),
          ...base,
          skills: base.skills ?? [],
          experience: base.experience ?? [],
          projects: base.projects ?? [],
          education: base.education ?? [],
          certifications: base.certifications ?? [],
        })
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [resumeId])

  const validation = useMemo(() => {
    if (!draft) return { ok: false, message: 'Loading…' }
    const res = ResumeSchema.safeParse(draft)
    if (res.success) return { ok: true, message: '' }
    const first = res.error.issues[0]
    return { ok: false, message: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid resume data' }
  }, [draft])

  async function saveNewVersion() {
    if (!resumeId || !draft) return
    const parsed = ResumeSchema.safeParse(draft)
    if (!parsed.success) {
      toasts.error('Fix validation errors', parsed.error.issues[0]?.message)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const latest = data?.versions?.[0]
      await api('/resume/versions', {
        method: 'POST',
        body: JSON.stringify({
          resumeId,
          structuredJson: parsed.data,
          derivedFromVersionId: latest?.id,
          jobTargetId: latest?.jobTargetId ?? undefined,
          templateId: latest?.templateId ?? undefined,
        }),
      })
      toasts.success('Saved', 'Created a new resume version.')
      nav(`/app/resumes/${resumeId}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save'
      setError(msg)
      toasts.error('Save failed', msg)
    } finally {
      setBusy(false)
    }
  }

  if (!draft) {
    return <Skeleton className="h-40" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data?.title ?? 'Edit'}
        subtitle="Saves create a new version."
        action={
          <div className="flex gap-2">
            <Button disabled={busy || !validation.ok} onClick={() => void saveNewVersion()}>
              Save version
            </Button>
            <ButtonLink to={`/app/resumes/${resumeId}`} variant="secondary">
              Cancel
            </ButtonLink>
          </div>
        }
      />

      {!validation.ok ? <Alert tone="info">{validation.message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <ResumeEditorForm draft={draft} setDraft={setDraft} />
        <Card className="sticky top-24 hidden p-4 xl:block">
          <p className="text-xs font-medium text-zinc-500">Preview</p>
          <div className="mt-3 max-h-[75vh] overflow-auto">
            <ResumePreview resume={draft} />
          </div>
        </Card>
      </div>
    </div>
  )
}
