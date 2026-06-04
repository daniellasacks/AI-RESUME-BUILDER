import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { emptyResume } from '../lib/resumeSchema'
import { useToasts } from '../components/toast'
import { Button, ButtonLink, Card, PageHeader, Stat } from '../components/ui'

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
    return { resumeDone, jobDone, done: resumeDone && jobDone }
  }, [resumes, jobTargets])

  async function createBlankResume() {
    setBusy(true)
    try {
      const created = await api<{ id: string }>('/resume', { method: 'POST', body: JSON.stringify({ title: 'My Resume' }) })
      await api('/resume/versions', {
        method: 'POST',
        body: JSON.stringify({ resumeId: created.id, structuredJson: emptyResume('Your Name') }),
      })
      toasts.success('Resume created')
      await refresh()
      nav(`/app/resumes/${created.id}/edit`)
    } catch (e) {
      toasts.error('Failed', e instanceof Error ? e.message : 'Error')
    } finally {
      setBusy(false)
    }
  }

  const steps = [
    {
      n: 1,
      title: 'Create a resume',
      done: state.resumeDone,
      action: (
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => void createBlankResume()}>
            Blank resume
          </Button>
          <ButtonLink to="/app/dashboard" variant="secondary">
            Import file
          </ButtonLink>
        </div>
      ),
    },
    {
      n: 2,
      title: 'Add a job target',
      done: state.jobDone,
      action: (
        <ButtonLink to="/app/job-targets" variant="secondary">
          Add target
        </ButtonLink>
      ),
    },
    {
      n: 3,
      title: 'Tailor & export',
      done: state.done,
      action: (
        <ButtonLink to="/app/resumes" variant="secondary">
          Open resumes
        </ButtonLink>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Quick start" subtitle="Three steps to your first export." />

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Resumes" value={resumes?.length ?? '—'} />
        <Stat label="Targets" value={jobTargets?.length ?? '—'} />
      </div>

      <div className="space-y-3">
        {steps.map((s) => (
          <Card key={s.n} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={
                    'grid size-8 place-items-center rounded-full text-xs font-semibold ' +
                    (s.done ? 'bg-sky-500/20 text-sky-300' : 'bg-white/[0.06] text-zinc-400')
                  }
                >
                  {s.done ? '✓' : s.n}
                </span>
                <span className="font-medium text-white">{s.title}</span>
              </div>
              <span className="text-xs text-zinc-600">{s.done ? 'Done' : ''}</span>
            </div>
            {!s.done ? <div className="mt-3 pl-11">{s.action}</div> : null}
          </Card>
        ))}
      </div>

      {state.done ? (
        <Card elevated className="border-sky-500/20 p-4 text-center text-sm text-sky-200">
          You&apos;re ready.{' '}
          <Link to="/app/resumes" className="underline hover:text-white">
            View resumes
          </Link>
        </Card>
      ) : null}
    </div>
  )
}
