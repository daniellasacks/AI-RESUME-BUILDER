/** Simple, friendly interview — 8 easy steps */
export const CHAT_FLOW = [
  {
    id: 'fullName',
    question: "Hey! 👋 I'm your CV coach. What's your name?",
    hints: [] as string[],
  },
  {
    id: 'headline',
    question: 'Great! What do you do professionally?',
    hints: ['HR Manager', 'Software Engineer', 'Product Designer', 'Marketing Lead'],
  },
  {
    id: 'contact',
    question: 'How can employers reach you?',
    hints: ['you@email.com', '054-123-4567'],
  },
  {
    id: 'currentRole',
    question: 'Tell me about your current (or most recent) job — company, title, and what you do there.',
    hints: ['CallMarker · HR Manager · since 2019', 'Led team of 5, managed budget…'],
    multiline: true,
  },
  {
    id: 'previousRoles',
    question: 'Any previous jobs worth adding? Share them briefly — or skip.',
    hints: ['Skip'],
    multiline: true,
    optional: true,
  },
  {
    id: 'skills',
    question: 'What tools and skills do you work with?',
    hints: ['Excel, Workday', 'React, TypeScript', 'Monday, Notion'],
    multiline: true,
  },
  {
    id: 'education',
    question: 'Your education or certifications?',
    hints: ['University — B.A. Psychology', 'John Bryce — Digital Marketing'],
    multiline: true,
  },
  {
    id: 'targetJob',
    question: 'Last one — what role are you aiming for next?',
    hints: ['Senior HR Manager', 'Full Stack Developer', 'Team Lead'],
  },
] as const

export type ChatStepId = (typeof CHAT_FLOW)[number]['id']

export const TOTAL_STEPS = CHAT_FLOW.length

export function acknowledgment(stepId: ChatStepId, value: string): string {
  const first = value.trim().split(/\s+/)[0] ?? ''
  switch (stepId) {
    case 'fullName':
      return first ? `Lovely to meet you, ${first}! ✨` : 'Thanks!'
    case 'headline':
      return 'Perfect.'
    case 'contact':
      return 'Got it.'
    case 'currentRole':
      return 'Nice — adding that to your CV.'
    case 'previousRoles':
      return isSkip(value) ? 'No worries.' : 'Great — your full career history is coming together.'
    case 'skills':
      return 'Skills noted.'
    case 'education':
      return 'Education added.'
    case 'targetJob':
      return "Almost done — let's polish your CV."
    default:
      return 'Thanks!'
  }
}

export function isSkip(value: string): boolean {
  const v = value.trim().toLowerCase()
  return !v || v === 'skip' || v === 'no' || v === 'n/a' || v === 'none' || v === 'pass'
}

export function getStepHints(stepIndex: number): string[] {
  if (stepIndex < 0 || stepIndex >= CHAT_FLOW.length) return []
  return [...CHAT_FLOW[stepIndex].hints]
}
