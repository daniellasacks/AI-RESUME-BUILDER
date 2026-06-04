import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { emptyResume } from '../lib/resumeSchema'
import { useToasts } from '../components/toast'

export function OnboardingPage() {
  const nav = useNavigate()
  const toasts = useToasts()
  const [resumes, setResumes] = useState<any[] | null>(null)
  const [jobTargets, setJobTargets] = useState<any[] | null>(null)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const [r, j] = await Promise.all([
      api<any[]>('/resume').catch(() => []),
      api<any[]>('/job-targets').catch(() => []),
    ])
    setResumes(r)
    setJobTargets(j)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const state = useMemo(() => {
    const resumeDone = (resumes?.length ?? 0) > 0
    const jobDone = (jobTargets?.length ?? 0) > 0
    return {
      resumeDone,
      jobDone,
      done: resumeDone && jobDone,
    }
  }, [resumes, jobTargets])

  async function createBlankResume() {
    setBusy(true)
    try {
      const created = await api<{ id: string }>('/resume', { method: 'POST', body: JSON.stringify({ title: 'My Resume' }) })
      await api('/resume/versions', {
        method: 'POST',
        body: JSON.stringify({ resumeId: created.id, structuredJson: emptyResume('Your Name') }),
      })
      toasts.success('Created', 'Blank resume + Version 1 created.')
      await refresh()
      nav(`/app/resumes/${created.id}/edit`)
    } catch (e) {
      toasts.error('Create failed', e instanceof Error ? e.message : 'Failed to create resume')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-lg font-semibold text-zinc-100">Onboarding</div>
        <div className="text-sm text-zinc-400">A quick checklist to get to a polished exportable resume.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-sm font-semibold text-zinc-100">Checklist</div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">1) Create a base resume</div>
                  <div className="mt-1 text-xs text-zinc-400">This becomes the “source of truth” for all versions.</div>
                </div>
                <div className="text-xs font-semibold text-zinc-100">{state.resumeDone ? 'Done' : 'Todo'}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={busy}
                  onClick={() => void createBlankResume()}
                  className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white disabled:opacity-60"
                >
                  Create blank resume
                </button>
                <Link
                  to="/app/dashboard"
                  className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-900 inline-flex items-center"
                >
                  Upload & extract
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">2) Add a job target</div>
                  <div className="mt-1 text-xs text-zinc-400">Paste a job description to tailor versions and run ATS scoring.</div>
                </div>
                <div className="text-xs font-semibold text-zinc-100">{state.jobDone ? 'Done' : 'Todo'}</div>
              </div>
              <div className="mt-3">
                <Link
                  to="/app/job-targets"
                  className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-900 inline-flex items-center"
                >
                  Create job target
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-sm font-semibold text-zinc-100">3) Tailor + score + export</div>
              <div className="mt-1 text-xs text-zinc-400">
                Open a resume → pick a version → run ATS evaluation → export to PDF/DOCX.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/app/resumes"
                  className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-900 inline-flex items-center"
                >
                  Open resumes
                </Link>
                <Link
                  to="/app/templates"
                  className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-semibold text-zinc-100 hover:bg-zinc-900 inline-flex items-center"
                >
                  Browse templates
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-sm font-semibold text-zinc-100">Progress</div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-[11px] text-zinc-400">Resumes</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">{resumes ? resumes.length : '—'}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-[11px] text-zinc-400">Job targets</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">{jobTargets ? jobTargets.length : '—'}</div>
            </div>
            <button
              disabled={busy}
              onClick={() => void refresh()}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
            >
              Refresh
            </button>
            {state.done ? (
              <div className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-100">
                You’re set. Head to <Link className="text-emerald-200 underline" to="/app/dashboard">Dashboard</Link> or <Link className="text-emerald-200 underline" to="/app/resumes">Resumes</Link>.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

