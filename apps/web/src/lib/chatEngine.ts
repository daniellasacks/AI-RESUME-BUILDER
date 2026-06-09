import { acknowledgment, CHAT_FLOW, type ChatStepId, isSkip } from './chatFlow'
import type { ResumeJson } from './resumeSchema'
import { emptyWizard, type WizardInput } from './wizardTypes'
import { wizardToResume, wizardToResumeRaw } from './wizardToResume'

export type ChatPhase = 'interview' | 'ready' | 'generated'

export type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export type ChatState = {
  wizard: WizardInput
  tone: 'formal' | 'modern' | ''
  yearsExperience: string
  stepIndex: number
  phase: ChatPhase
  messages: ChatMessage[]
}

const TECH_KEYWORDS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'SQL',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'Figma', 'HTML', 'CSS', 'Vue',
  'Angular', 'Next.js', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis',
]

function uid() {
  return crypto.randomUUID()
}

export function createChatSession(): ChatState {
  const first = CHAT_FLOW[0]
  return {
    wizard: emptyWizard(),
    tone: '',
    yearsExperience: '',
    stepIndex: 0,
    phase: 'interview',
    messages: [{ id: uid(), role: 'assistant', content: first.question }],
  }
}

function inferSkills(text: string): string {
  const found = TECH_KEYWORDS.filter((k) => text.toLowerCase().includes(k.toLowerCase()))
  const commaParts = text
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40 && s.split(' ').length <= 4)
  const merged = [...new Set([...found, ...commaParts.slice(0, 8)])]
  return merged.join(', ')
}

export function applyChatAnswer(state: ChatState, value: string): ChatState {
  const step = CHAT_FLOW[state.stepIndex]
  if (!step || state.phase !== 'interview') return state

  const trimmed = value.trim()
  const wizard = applyToWizard(state.wizard, step.id, trimmed)

  let tone = state.tone
  let yearsExperience = state.yearsExperience

  if (step.id === 'tone') {
    tone = trimmed.toLowerCase().includes('formal') ? 'formal' : 'modern'
  }
  if (step.id === 'yearsExperience') {
    yearsExperience = trimmed.replace(/[^\d.]/g, '') || trimmed
  }

  const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed }
  const nextIndex = state.stepIndex + 1
  const isLast = nextIndex >= CHAT_FLOW.length

  if (isLast) {
    return {
      ...state,
      wizard,
      tone,
      yearsExperience,
      stepIndex: nextIndex,
      phase: 'ready',
      messages: [
        ...state.messages,
        userMsg,
        { id: uid(), role: 'assistant', content: 'I have enough information to generate your CV. Ready?' },
      ],
    }
  }

  const nextStep = CHAT_FLOW[nextIndex]
  const ack = acknowledgment(step.id, trimmed)

  return {
    ...state,
    wizard,
    tone,
    yearsExperience,
    stepIndex: nextIndex,
    messages: [
      ...state.messages,
      userMsg,
      { id: uid(), role: 'assistant', content: `${ack} ${nextStep.question}` },
    ],
  }
}

function applyToWizard(draft: WizardInput, stepId: ChatStepId, value: string): WizardInput {
  switch (stepId) {
    case 'fullName':
      return { ...draft, personal: { ...draft.personal, fullName: value } }
    case 'role':
      return {
        ...draft,
        personal: { ...draft.personal, headline: value },
        experience: [
          { ...draft.experience[0], title: value, company: draft.experience[0]?.company || 'Recent employer' },
          ...draft.experience.slice(1),
        ],
      }
    case 'responsibilities': {
      const skills = inferSkills(value)
      return {
        ...draft,
        experience: [{ ...draft.experience[0], highlights: value }, ...draft.experience.slice(1)],
        skills: skills || draft.skills,
      }
    }
    case 'yearsExperience':
      return draft
    case 'targetJob':
      return { ...draft, target: { ...draft.target, title: value } }
    case 'tone':
      return draft
    case 'jobOptimize':
      if (isSkip(value)) return draft
      return { ...draft, target: { ...draft.target, description: value } }
    default:
      return draft
  }
}

/** Live preview while interviewing — updates after each answer */
export function chatToLiveResume(state: ChatState): ResumeJson {
  const raw = wizardToResumeRaw(state.wizard)
  const years = state.yearsExperience
  const tone = state.tone

  if (raw.basics.summary && years) {
    raw.basics.summary = `${years}+ years of experience. ${raw.basics.summary}`
  }

  if (state.wizard.target.title && raw.basics.summary && !raw.basics.summary.includes(state.wizard.target.title)) {
    raw.basics.summary = `${raw.basics.summary} Seeking ${state.wizard.target.title} opportunities.`
  }

  if (tone === 'formal' && raw.basics.summary) {
    raw.basics.summary = raw.basics.summary
      .replace(/\bI'm\b/g, 'I am')
      .replace(/\bdon't\b/g, 'do not')
      .replace(/\bcan't\b/g, 'cannot')
  } else if (tone === 'modern' && raw.basics.headline) {
    raw.basics.headline = raw.basics.headline.replace(/\bSenior\b/i, 'Lead')
  }

  return raw
}

export function polishedResume(state: ChatState): ResumeJson {
  const base = wizardToResume(state.wizard)
  if (state.yearsExperience && base.basics.summary) {
    base.basics.summary = `Professional with ${state.yearsExperience}+ years of experience. ${base.basics.summary}`
  }
  if (state.tone === 'formal' && base.basics.summary) {
    base.basics.summary = base.basics.summary.replace(/\bI'm\b/g, 'I am')
  }
  return base
}

export type HighlightSection = 'summary' | 'experience' | 'skills' | 'education'

export function sectionsFromChanges(changes: string[]): HighlightSection[] {
  const out = new Set<HighlightSection>()
  for (const c of changes) {
    const lower = c.toLowerCase()
    if (lower.includes('summary')) out.add('summary')
    if (lower.includes('experience') || lower.includes('bullet')) out.add('experience')
    if (lower.includes('skill')) out.add('skills')
    if (lower.includes('education')) out.add('education')
  }
  if (out.size === 0) out.add('summary')
  return [...out]
}
