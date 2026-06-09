import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AiLoadingOverlay } from '../components/AiLoadingOverlay'
import { Stepper } from '../components/Stepper'
import { AiHint, Alert, Button, Card, Field, Input, PageHeader, Textarea } from '../components/ui'
import { PRODUCT_NAME } from '../lib/brand'
import { api } from '../lib/api'
import { WIZARD_STEPS, emptyWizard, type WizardInput } from '../lib/wizardTypes'
import { useToasts } from '../components/toast'

export function InterviewWizardPage() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const toasts = useToasts()
  const [step, setStep] = useState(sp.get('upload') === '1' ? 4 : 0)
  const [draft, setDraft] = useState<WizardInput>(emptyWizard)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [showAi, setShowAi] = useState(false)

  useEffect(() => {
    if (sp.get('upload') === '1') setStep(4)
  }, [sp])

  function updateExp(i: number, patch: Partial<WizardInput['experience'][0]>) {
    setDraft((d) => ({
      ...d,
      experience: d.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }))
  }

  async function onUpload(file: File) {
    setUploadBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'resume')
      const uploaded = await api<{ id: string }>('/uploads', { method: 'POST', body: fd })
      const extracted = await api<{ resumeJson: { basics?: { fullName?: string; email?: string; summary?: string } } }>(
        '/resume/extract',
        { method: 'POST', body: JSON.stringify({ documentId: uploaded.id }) },
      )
      const b = extracted.resumeJson?.basics
      if (b?.fullName) setDraft((d) => ({ ...d, personal: { ...d.personal, fullName: b.fullName ?? d.personal.fullName, email: b.email ?? d.personal.email } }))
      toasts.success('CV imported', 'Review your answers in the previous steps.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploadBusy(false)
    }
  }

  async function generate() {
    if (!draft.personal.fullName.trim()) {
      setError('Please enter your full name.')
      setStep(0)
      return
    }
    setBusy(true)
    setShowAi(true)
    setError(null)
    const started = Date.now()
    try {
      const res = await api<{ resumeId: string; versionId: string; changes?: string[] }>('/resume/generate', {
        method: 'POST',
        body: JSON.stringify({ wizard: draft }),
      })
      const wait = Math.max(0, 5000 - (Date.now() - started))
      await new Promise((r) => setTimeout(r, wait))
      if (res.changes?.length) sessionStorage.setItem(`cv-reveal-${res.resumeId}`, JSON.stringify(res.changes))
      nav(`/app/builder/${res.resumeId}?version=${res.versionId}&reveal=1`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setBusy(false)
      setShowAi(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <AiLoadingOverlay open={showAi} />
      <PageHeader title={PRODUCT_NAME} subtitle="Answer a few questions — AI handles the writing." />

      <Card className="mb-8 p-6">
        <Stepper steps={WIZARD_STEPS} current={step} />
      </Card>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card className="p-6 md:p-8">
        {step === 0 ? (
          <div className="grid gap-5">
            <Field label="Full name">
              <Input value={draft.personal.fullName} onChange={(e) => setDraft((d) => ({ ...d, personal: { ...d.personal, fullName: e.target.value } }))} placeholder="Daniella Azar" />
            </Field>
            <Field label="Professional headline" hint="e.g. Full Stack Developer">
              <Input value={draft.personal.headline} onChange={(e) => setDraft((d) => ({ ...d, personal: { ...d.personal, headline: e.target.value } }))} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email">
                <Input type="email" value={draft.personal.email} onChange={(e) => setDraft((d) => ({ ...d, personal: { ...d.personal, email: e.target.value } }))} />
              </Field>
              <Field label="Phone">
                <Input value={draft.personal.phone} onChange={(e) => setDraft((d) => ({ ...d, personal: { ...d.personal, phone: e.target.value } }))} />
              </Field>
            </div>
            <Field label="Location">
              <Input value={draft.personal.location} onChange={(e) => setDraft((d) => ({ ...d, personal: { ...d.personal, location: e.target.value } }))} placeholder="Tel Aviv, Israel" />
            </Field>
            <AiHint>Use your LinkedIn headline as a starting point — we will polish it for ATS systems.</AiHint>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            {draft.experience.map((exp, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Job title">
                    <Input value={exp.title} onChange={(e) => updateExp(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Company">
                    <Input value={exp.company} onChange={(e) => updateExp(i, { company: e.target.value })} />
                  </Field>
                  <Field label="Start">
                    <Input value={exp.startDate} onChange={(e) => updateExp(i, { startDate: e.target.value })} placeholder="2022" />
                  </Field>
                  <Field label="End">
                    <Input value={exp.endDate} onChange={(e) => updateExp(i, { endDate: e.target.value })} placeholder="Present" />
                  </Field>
                </div>
                <Field label="Key achievements" hint="One per line — we will rewrite as impact bullets">
                  <Textarea rows={4} value={exp.highlights} onChange={(e) => updateExp(i, { highlights: e.target.value })} placeholder="Led migration to React&#10;Reduced page load by 40%" />
                </Field>
              </div>
            ))}
            <Button
              variant="secondary"
              type="button"
              onClick={() => setDraft((d) => ({ ...d, experience: [...d.experience, { company: '', title: '', startDate: '', endDate: '', highlights: '' }] }))}
            >
              + Add role
            </Button>
            <AiHint>Include numbers where possible: %, revenue, users, time saved.</AiHint>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5">
            <Field label="Skills" hint="Comma-separated or one per line">
              <Textarea rows={5} value={draft.skills} onChange={(e) => setDraft((d) => ({ ...d, skills: e.target.value }))} placeholder="React, TypeScript, Node.js, PostgreSQL, REST APIs" />
            </Field>
            <Field label="Education" hint="One school per line — School — Degree">
              <Textarea rows={3} value={draft.education} onChange={(e) => setDraft((d) => ({ ...d, education: e.target.value }))} placeholder="State University — B.S. Computer Science" />
            </Field>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5">
            <Field label="Target job title">
              <Input value={draft.target.title} onChange={(e) => setDraft((d) => ({ ...d, target: { ...d.target, title: e.target.value } }))} placeholder="Junior Full Stack Developer" />
            </Field>
            <Field label="Target company (optional)">
              <Input value={draft.target.company} onChange={(e) => setDraft((d) => ({ ...d, target: { ...d.target, company: e.target.value } }))} />
            </Field>
            <Field label="Job description" hint="Paste the posting — AI will tailor keywords">
              <Textarea rows={6} value={draft.target.description} onChange={(e) => setDraft((d) => ({ ...d, target: { ...d.target, description: e.target.value } }))} />
            </Field>
            <AiHint>Even a few lines from the job ad helps ATS optimization.</AiHint>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="text-center">
            <p className="text-sm text-slate-500">Optional — upload PDF or DOCX to pre-fill your answers.</p>
            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 transition hover:border-blue-300 hover:bg-blue-50/30">
              <span className="text-sm font-medium text-slate-600">{uploadBusy ? 'Processing…' : 'Drop file or click to upload'}</span>
              <input type="file" accept=".pdf,.docx" className="sr-only" disabled={uploadBusy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f) }} />
            </label>
            <p className="mt-4 text-xs text-slate-400">You can skip this step and continue with your answers.</p>
          </div>
        ) : null}

        <div className="mt-8 flex justify-between gap-3 border-t border-slate-100 pt-6">
          <Button variant="secondary" type="button" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < WIZARD_STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <Button type="button" loading={busy} onClick={() => void generate()}>
              Generate my CV
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
