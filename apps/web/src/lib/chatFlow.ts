/** Structured interview — collects a full, multi-role career profile */
export const CHAT_FLOW = [
  {
    id: 'fullName',
    question: "Hi! I'll help you build a professional, detailed CV. What's your full name?",
  },
  {
    id: 'headline',
    question: 'What is your professional headline? (e.g. HR, Welfare & Administration Manager)',
  },
  {
    id: 'contact',
    question: 'Your contact details — email and phone (e.g. you@email.com, 054-123-4567)',
  },
  {
    id: 'currentJob',
    question:
      'Your current (or most recent) role — use this format:\nCompany | Job Title | Years\n(e.g. CallMarker | HR & Welfare Manager | 2019–Today)',
  },
  {
    id: 'currentHighlights',
    question:
      'Key achievements in this role — one per line. Be specific (budgets, teams, programs, events, retention, etc.)',
    multiline: true,
  },
  {
    id: 'previousJobs',
    question:
      'Previous roles — same format as before. Add as many jobs as you like, separated by a blank line:\n\nCompany | Title | Years\nAchievement 1\nAchievement 2',
    multiline: true,
  },
  {
    id: 'skills',
    question:
      'Tools & skills — list software, systems, and competencies. Group by category if you like:\nHR: Workday, BambooHR\nProject: Monday, Asana, Notion',
    multiline: true,
  },
  {
    id: 'education',
    question:
      'Education & training — one per line (e.g. Ariel University | B.A. Psychology | 2013–2017)',
    multiline: true,
  },
  {
    id: 'languages',
    question: 'Languages you speak? (e.g. Hebrew & English — Native) — or type "skip"',
    optional: true,
  },
  {
    id: 'careerSummary',
    question:
      'In 2–3 sentences, how would you describe your career strengths and what you bring to an organization? (Or type "skip" and I\'ll write one)',
    multiline: true,
    optional: true,
  },
  {
    id: 'targetJob',
    question: 'What kind of role are you targeting next?',
  },
  {
    id: 'tone',
    question: 'Should your CV sound more formal or more modern?',
  },
  {
    id: 'jobOptimize',
    question: 'Paste a job description to optimize for — or type "skip".',
    optional: true,
  },
] as const

export type ChatStepId = (typeof CHAT_FLOW)[number]['id']

export function acknowledgment(stepId: ChatStepId, value: string): string {
  const first = value.trim().split(/\s+/)[0] ?? ''
  switch (stepId) {
    case 'fullName':
      return first ? `Great to meet you, ${first}!` : 'Thanks!'
    case 'headline':
      return 'Perfect — that sets the tone for your CV.'
    case 'contact':
      return 'Got it.'
    case 'currentJob':
      return 'Added to your experience section.'
    case 'currentHighlights':
      return 'Strong — those bullets will stand out.'
    case 'previousJobs':
      return 'Excellent. Your full career history is shaping up.'
    case 'skills':
      return 'Skills and tools noted.'
    case 'education':
      return 'Education section updated.'
    case 'languages':
      return isSkip(value) ? 'No problem.' : 'Languages added.'
    case 'careerSummary':
      return isSkip(value) ? "I'll craft a professional summary for you." : 'That will make a great profile summary.'
    case 'targetJob':
      return "I'll align your CV toward that goal."
    case 'tone':
      return value.toLowerCase().includes('formal')
        ? 'Formal, professional tone it is.'
        : 'Clear, modern tone it is.'
    case 'jobOptimize':
      return isSkip(value) ? 'We can tailor later.' : "I'll use this for optimization."
    default:
      return 'Thanks!'
  }
}

export function isSkip(value: string): boolean {
  const v = value.trim().toLowerCase()
  return !v || v === 'skip' || v === 'no' || v === 'n/a' || v === 'none'
}
