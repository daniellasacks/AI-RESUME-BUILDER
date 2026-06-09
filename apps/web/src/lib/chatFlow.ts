export type ChatStep = {
  id: string
  question: string
  hints: string[]
  multiline?: boolean
  optional?: boolean
}

/** Full interview for people starting without a CV */
export const FRESH_FLOW: ChatStep[] = [
  {
    id: 'fullName',
    question: 'Welcome. Let\'s build your CV together. What is your full name?',
    hints: [],
  },
  {
    id: 'headline',
    question: 'What is your professional title or the field you work in?',
    hints: ['Software Engineer', 'HR Manager', 'Product Designer', 'Career changer'],
  },
  {
    id: 'contact',
    question: 'How should employers contact you? Share your email and phone.',
    hints: ['name@email.com', '+1 555 123 4567'],
  },
  {
    id: 'currentRole',
    question: 'Describe your current or most recent role — company, job title, and main responsibilities.',
    hints: ['Acme Corp · Analyst · 2022–present', 'Led a team of 4, owned reporting…'],
    multiline: true,
  },
  {
    id: 'previousRoles',
    question: 'List any earlier roles worth including. You can skip this if you prefer.',
    hints: ['Skip'],
    multiline: true,
    optional: true,
  },
  {
    id: 'skills',
    question: 'What skills, tools, or technologies should appear on your CV?',
    hints: ['Excel, SQL, project management', 'React, TypeScript, Node.js'],
    multiline: true,
  },
  {
    id: 'education',
    question: 'Share your education, training, or relevant certifications.',
    hints: ['B.A. Psychology — Tel Aviv University', 'Google UX Certificate'],
    multiline: true,
  },
  {
    id: 'targetJob',
    question: 'What role or type of job are you targeting next?',
    hints: ['Junior Developer', 'HR Business Partner', 'Team Lead'],
  },
]

/** Shorter path when the user uploads an existing CV */
export const UPDATE_FLOW: ChatStep[] = [
  {
    id: 'updateGoals',
    question: 'I have your CV on file. What would you like to update or improve?',
    hints: ['Refresh the summary', 'Add my latest role', 'Make it shorter', 'Tailor for a new field'],
    multiline: true,
  },
  {
    id: 'addDetails',
    question: 'Is there anything new to add — a recent project, skill, or achievement?',
    hints: ['Skip', 'Built a portfolio project in React', 'Completed a bootcamp in 2024'],
    multiline: true,
    optional: true,
  },
  {
    id: 'targetJob',
    question: 'What role are you applying for? This helps tailor the final CV.',
    hints: ['Full Stack Developer', 'People Operations Manager'],
  },
]

export type ChatStepId = string

export function getFlow(mode: 'fresh' | 'update'): ChatStep[] {
  return mode === 'update' ? UPDATE_FLOW : FRESH_FLOW
}

export function totalSteps(mode: 'fresh' | 'update'): number {
  return getFlow(mode).length
}

export function acknowledgment(stepId: string, value: string, mode: 'fresh' | 'update'): string {
  const first = value.trim().split(/\s+/)[0] ?? ''
  if (mode === 'update') {
    switch (stepId) {
      case 'updateGoals':
        return 'Understood. I will focus on those changes.'
      case 'addDetails':
        return isSkip(value) ? 'No problem.' : 'Added — I will weave that in.'
      case 'targetJob':
        return 'Great. I have what I need to refine your CV.'
      default:
        return 'Thank you.'
    }
  }
  switch (stepId) {
    case 'fullName':
      return first ? `Good to meet you, ${first}.` : 'Thank you.'
    case 'headline':
      return 'Noted.'
    case 'contact':
      return 'Contact details saved.'
    case 'currentRole':
      return 'I have added that experience.'
    case 'previousRoles':
      return isSkip(value) ? 'Skipped.' : 'Previous roles added.'
    case 'skills':
      return 'Skills recorded.'
    case 'education':
      return 'Education added.'
    case 'targetJob':
      return 'Almost done.'
    default:
      return 'Thank you.'
  }
}

export function isSkip(value: string): boolean {
  const v = value.trim().toLowerCase()
  return !v || v === 'skip' || v === 'no' || v === 'n/a' || v === 'none' || v === 'pass'
}

export function getStepHints(flow: ChatStep[], stepIndex: number): string[] {
  if (stepIndex < 0 || stepIndex >= flow.length) return []
  return [...flow[stepIndex].hints]
}
