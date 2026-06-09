export type WizardPersonal = {
  fullName: string
  email: string
  phone: string
  location: string
  headline: string
}

export type WizardExperience = {
  company: string
  title: string
  startDate: string
  endDate: string
  highlights: string
}

export type WizardTarget = {
  title: string
  company: string
  description: string
}

export type WizardInput = {
  personal: WizardPersonal
  experience: WizardExperience[]
  skills: string
  education: string
  target: WizardTarget
}

export const WIZARD_STEPS = [
  { id: 'personal', label: 'Personal info' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'target', label: 'Target role' },
  { id: 'upload', label: 'Upload CV' },
] as const

export function emptyWizard(): WizardInput {
  return {
    personal: { fullName: '', email: '', phone: '', location: '', headline: '' },
    experience: [{ company: '', title: '', startDate: '', endDate: '', highlights: '' }],
    skills: '',
    education: '',
    target: { title: '', company: '', description: '' },
  }
}
