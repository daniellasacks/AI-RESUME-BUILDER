import type { ResumeJson } from './resumeSchema'
import { emptyWizard, type WizardInput } from './wizardTypes'

/** Map extracted resume JSON into the wizard shape used by the interview. */
export function resumeJsonToWizard(json: ResumeJson): WizardInput {
  const wizard = emptyWizard()
  const b = json.basics ?? {}

  wizard.personal = {
    fullName: b.fullName ?? '',
    email: b.email ?? '',
    phone: b.phone ?? '',
    location: b.location ?? '',
    headline: b.headline ?? '',
  }
  wizard.careerSummary = b.summary ?? ''

  if (json.experience?.length) {
    wizard.experience = json.experience.map((e) => ({
      company: e.company ?? '',
      title: e.title ?? '',
      startDate: e.startDate ?? '',
      endDate: e.endDate ?? '',
      highlights: (e.highlights ?? []).join('\n'),
    }))
  }

  if (json.skills?.length) {
    wizard.skills = json.skills.map((s) => `${s.category}: ${s.items.join(', ')}`).join('\n')
  }

  if (json.education?.length) {
    wizard.education = json.education
      .map((e) => [e.school, e.degree, e.field].filter(Boolean).join(' — '))
      .join('\n')
  }

  return wizard
}
