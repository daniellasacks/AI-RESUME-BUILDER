import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { ResumeSchema, type ResumeJson, emptyResume } from '../lib/resumeSchema'
import { useToasts } from '../components/toast'
import { ResumeEditorForm } from '../components/ResumeEditorForm'
import { ResumePreview } from '../components/ResumePreview'

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
    return <div className="h-40 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950" />
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-zinc-500">
            <Link to={`/app/resumes/${resumeId}`} className="text-zinc-300 hover:text-zinc-100">
              Resume
            </Link>{' '}
            <span className="text-zinc-700">/</span> <span>Edit</span>
          </div>
          <div className="mt-1 truncate text-lg font-semibold text-zinc-100">Structured resume editor</div>
          <div className="mt-1 text-sm text-zinc-400">Every save creates a new immutable version.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy || !validation.ok}
            onClick={() => void saveNewVersion()}
            className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white disabled:opacity-60"
          >
            Save new version
          </button>
          <Link
            to={`/app/resumes/${resumeId}`}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 inline-flex items-center"
          >
            Cancel
          </Link>
        </div>
      </div>

      {!validation.ok ? (
        <div className="rounded-2xl border border-amber-900 bg-amber-950/20 p-4 text-sm text-amber-100">
          <div className="font-semibold">Validation</div>
          <div className="mt-1 text-xs opacity-90">{validation.message}</div>
        </div>
      ) : null}
      {error ? <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <ResumeEditorForm draft={draft} setDraft={setDraft} />
        <aside className="sticky top-24 self-start">
          <div className="text-xs font-semibold text-zinc-400">Live preview</div>
          <div className="mt-2">
            <ResumePreview resume={draft} />
          </div>
        </aside>
      </div>
    </div>
  )
}
