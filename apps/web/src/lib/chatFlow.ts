/** Structured interview questions for the chat-first CV builder */
export const CHAT_FLOW = [
  {
    id: 'fullName',
    question: "Hi! I'll help you build a professional CV. What's your full name?",
  },
  {
    id: 'role',
    question: 'Great. What is your current or most recent role?',
  },
  {
    id: 'responsibilities',
    question: 'Can you describe your main responsibilities?',
  },
  {
    id: 'yearsExperience',
    question: 'How many years of experience do you have?',
  },
  {
    id: 'targetJob',
    question: 'What kind of job are you targeting?',
  },
  {
    id: 'tone',
    question: 'Do you want your CV to sound more formal or more modern?',
  },
  {
    id: 'jobOptimize',
    question: 'Would you like me to optimize it for a specific job? Paste a job description or link — or type "skip".',
    optional: true,
  },
] as const

export type ChatStepId = (typeof CHAT_FLOW)[number]['id']

export const READY_MESSAGE =
  'I have enough information to generate your CV. Ready?'

export function acknowledgment(stepId: ChatStepId, value: string): string {
  const first = value.trim().split(/\s+/)[0] ?? ''
  switch (stepId) {
    case 'fullName':
      return first ? `Nice to meet you, ${first}!` : 'Thanks!'
    case 'role':
      return 'Got it — that helps frame your experience.'
    case 'responsibilities':
      return 'Perfect. I\'ve added that to your experience section.'
    case 'yearsExperience':
      return 'Noted — I\'ll reflect that in your summary.'
    case 'targetJob':
      return 'Great target. I\'ll tailor your summary toward that role.'
    case 'tone':
      return value.toLowerCase().includes('formal')
        ? 'Understood — I\'ll keep the tone professional and formal.'
        : 'Sounds good — I\'ll use a clear, modern tone.'
    case 'jobOptimize':
      return isSkip(value) ? 'No problem — we can tailor later.' : 'Thanks — I\'ll use this when optimizing your CV.'
    default:
      return 'Thanks!'
  }
}

export function isSkip(value: string): boolean {
  const v = value.trim().toLowerCase()
  return !v || v === 'skip' || v === 'no' || v === 'n/a' || v === 'none'
}
