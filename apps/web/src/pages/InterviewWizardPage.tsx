import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProgressBar } from '../components/ProgressBar'
import { Alert, Button, Card, Input, StatusLine, Textarea } from '../components/ui'
import { api } from '../lib/api'
import { WIZARD_FLOW } from '../lib/wizardFlow'
import { emptyWizard, type WizardInput } from '../lib/wizardTypes'
import { useToasts } from '../components/toast'

function screenToDraft(draft: WizardInput, screenId: string, value: string): WizardInput {
  switch (screenId) {
    case 'fullName':
      return { ...draft, personal: { ...draft.personal, fullName: value } }
    case 'headline':
      return { ...draft, personal: { ...draft.personal, headline: value } }
    case 'email':
      return { ...draft, personal: { ...draft.personal, email: value } }
    case 'location':
      return { ...draft, personal: { ...draft.personal, location: value } }
    case 'jobTitle':
      return {
        ...draft,
        experience: [{ ...draft.experience[0], title: value }, ...draft.experience.slice(1)],
      }
    case 'company':
      return {
        ...draft,
        experience: [{ ...draft.experience[0], company: value }, ...draft.experience.slice(1)],
      }
    case 'achievements':
      return {
        ...draft,
        experience: [{ ...draft.experience[0], highlights: value }, ...draft.experience.slice(1)],
      }
    case 'skills':
      return { ...draft, skills: value }
    case 'education':
      return { ...draft, education: value }
    case 'targetRole':
      return { ...draft, target: { ...draft.target, title: value } }
    case 'jobDescription':
      return { ...draft, target: { ...draft.target, description: value } }
    default:
      return draft
  }
}

function getScreenValue(draft: WizardInput, screenId: string): string {
  switch (screenId) {
    case 'fullName':
      return draft.personal.fullName
    case 'headline':
      return draft.personal.headline
    case 'email':
      return draft.personal.email
    case 'location':
      return draft.personal.location
    case 'jobTitle':
      return draft.experience[0]?.title ?? ''
    case 'company':
      return draft.experience[0]?.company ?? ''
    case 'achievements':
      return draft.experience[0]?.highlights ?? ''
    case 'skills':
      return draft.skills
    case 'education':
      return draft.education
    case 'targetRole':
      return draft.target.title
    case 'jobDescription':
      return draft.target.description
    default:
      return ''
  }
}

export function InterviewWizardPage() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const toasts = useToasts()
  const uploadStart = sp.get('upload') === '1'
  const [step, setStep] = useState(uploadStart ? WIZARD_FLOW.length - 1 : 0)
  const [draft, setDraft] = useState<WizardInput>(emptyWizard)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)

  const screen = WIZARD_FLOW[step]
  const value = useMemo(() => (screen ? getScreenValue(draft, screen.id) : ''), [draft, screen])

  useEffect(() => {
    if (uploadStart) setStep(WIZARD_FLOW.length - 1)
  }, [uploadStart])

  async function onUpload(file: File) {
    setUploadBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'resume')
      const uploaded = await api<{ id: string }>('/uploads', { method: 'POST', body: fd })
      const extracted = await api<{ resumeJson: { basics?: { fullName?: string; email?: string } } }>('/resume/extract', {
        method: 'POST',
        body: JSON.stringify({ documentId: uploaded.id }),
      })
      const b = extracted.resumeJson?.basics
      if (b?.fullName) setDraft((d) => ({ ...d, personal: { ...d.personal, fullName: b.fullName ?? d.personal.fullName, email: b.email ?? d.personal.email } }))
      toasts.success('Imported')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploadBusy(false)
    }
  }

  async function generate() {
    if (!draft.personal.fullName.trim()) {
      setError('Please enter your name.')
      setStep(0)
      return
    }
    setBusy(true)
    setStatus('Generating CV…')
    setError(null)
    try {
      const res = await api<{ resumeId: string; versionId: string }>('/resume/generate', {
        method: 'POST',
        body: JSON.stringify({ wizard: draft }),
      })
      nav(`/app/builder/${res.resumeId}?version=${res.versionId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setBusy(false)
      setStatus(null)
    }
  }

  function next() {
    if (step < WIZARD_FLOW.length - 1) setStep((s) => s + 1)
    else void generate()
  }

  if (!screen) return null

  const isLast = step === WIZARD_FLOW.length - 1
  const isUpload = screen.id === 'upload'

  return (
    <div className="mx-auto max-w-lg py-4">
      <ProgressBar current={step} total={WIZARD_FLOW.length} />

      {error ? (
        <div className="mt-6">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      <Card className="mt-8 p-8">
        <h2 className="text-lg font-semibold text-[#111827]">{screen.question}</h2>

        <div className="mt-6">
          {isUpload ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#e5e7eb] py-12 hover:border-[#2563eb]/40">
              <span className="text-sm text-[#6b7280]">{uploadBusy ? 'Processing…' : 'PDF or DOCX'}</span>
              <input
                type="file"
                accept=".pdf,.docx"
                className="sr-only"
                disabled={uploadBusy}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void onUpload(f)
                }}
              />
            </label>
          ) : 'multiline' in screen && screen.multiline ? (
            <Textarea
              rows={5}
              value={value}
              placeholder={screen.placeholder}
              onChange={(e) => setDraft((d) => screenToDraft(d, screen.id, e.target.value))}
              autoFocus
            />
          ) : (
            <Input
              value={value}
              placeholder={screen.placeholder}
              type={screen.id === 'email' ? 'email' : 'text'}
              onChange={(e) => setDraft((d) => screenToDraft(d, screen.id, e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && !isLast && next()}
              autoFocus
            />
          )}
        </div>

        {status ? <StatusLine>{status}</StatusLine> : null}

        <div className="mt-8 flex justify-between gap-3">
          <Button variant="ghost" type="button" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {isLast ? (
            <div className="flex gap-2">
              <Button variant="secondary" type="button" disabled={busy} onClick={() => void generate()}>
                Skip
              </Button>
              <Button type="button" loading={busy} onClick={() => void generate()}>
                Generate CV
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={next}>
              Continue
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
