import { acknowledgment, CHAT_FLOW, type ChatStepId, isSkip } from './chatFlow'
import { parseJobHeader, parseJobsText } from './resumeParse'
import type { ResumeJson } from './resumeSchema'
import { emptyWizard, type WizardInput } from './wizardTypes'
import { wizardToResumeRaw } from './wizardToResume'

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

function parseContact(value: string): { email: string; phone: string } {
  const email = value.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] ?? ''
  const phone = value.match(/[\d\-+() ]{8,}/)?.[0]?.trim() ?? ''
  return { email, phone }
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

  // Infer years from job date ranges
  if (step.id === 'previousJobs' || step.id === 'currentJob') {
    const jobs = wizard.experience.filter((e) => e.startDate)
    if (jobs.length) {
      const starts = jobs.map((j) => parseInt(j.startDate, 10)).filter((n) => !isNaN(n))
      if (starts.length) {
        const earliest = Math.min(...starts)
        yearsExperience = String(new Date().getFullYear() - earliest)
      }
    }
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
    case 'headline':
      return { ...draft, personal: { ...draft.personal, headline: value } }
    case 'contact': {
      const { email, phone } = parseContact(value)
      return { ...draft, personal: { ...draft.personal, email, phone } }
    }
    case 'currentJob': {
      const header = parseJobHeader(value.split('\n')[0] ?? value)
      const highlights = value.includes('\n')
        ? value.split('\n').slice(1).join('\n')
        : draft.experience[0]?.highlights ?? ''
      return {
        ...draft,
        personal: { ...draft.personal, headline: draft.personal.headline || header.title || '' },
        experience: [
          {
            company: header.company || '',
            title: header.title || '',
            startDate: header.startDate || '',
            endDate: header.endDate || '',
            highlights,
          },
          ...draft.experience.slice(1),
        ],
      }
    }
    case 'currentHighlights':
      return {
        ...draft,
        experience: [{ ...draft.experience[0], highlights: value }, ...draft.experience.slice(1)],
      }
    case 'previousJobs': {
      const previous = parseJobsText(value)
      const current = draft.experience[0]
      return { ...draft, experience: current?.company || current?.title ? [current, ...previous] : previous }
    }
    case 'skills':
      return { ...draft, skills: value }
    case 'education':
      return { ...draft, education: value }
    case 'languages':
      return isSkip(value) ? draft : { ...draft, languages: value }
    case 'careerSummary':
      return isSkip(value) ? draft : { ...draft, careerSummary: value }
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

/** Live preview while interviewing */
export function chatToLiveResume(state: ChatState): ResumeJson {
  const raw = wizardToResumeRaw(state.wizard, state.yearsExperience || undefined)
  const tone = state.tone

  if (tone === 'formal' && raw.basics.summary) {
    raw.basics.summary = raw.basics.summary
      .replace(/\bI'm\b/g, 'I am')
      .replace(/\bdon't\b/g, 'do not')
  }

  return raw
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
  if (out.size === 0) {
    out.add('summary')
    out.add('experience')
  }
  return [...out]
}
