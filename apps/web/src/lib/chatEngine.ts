import { acknowledgment, CHAT_FLOW, type ChatStepId, isSkip } from './chatFlow'
import { parseCurrentRole, parseJobsText } from './resumeParse'
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

function inferYears(wizard: WizardInput): string {
  const starts = wizard.experience.map((e) => parseInt(e.startDate, 10)).filter((n) => !isNaN(n))
  if (!starts.length) return ''
  return String(new Date().getFullYear() - Math.min(...starts))
}

export function applyChatAnswer(state: ChatState, value: string): ChatState {
  const step = CHAT_FLOW[state.stepIndex]
  if (!step || state.phase !== 'interview') return state

  const trimmed = value.trim()
  const wizard = applyToWizard(state.wizard, step.id, trimmed)
  let yearsExperience = inferYears(wizard) || state.yearsExperience

  const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed }
  const nextIndex = state.stepIndex + 1
  const isLast = nextIndex >= CHAT_FLOW.length

  if (isLast) {
    return {
      ...state,
      wizard,
      yearsExperience,
      stepIndex: nextIndex,
      phase: 'ready',
      messages: [
        ...state.messages,
        userMsg,
        { id: uid(), role: 'assistant', content: "You're all set! 🎉 Tap below and I'll craft your professional CV." },
      ],
    }
  }

  const nextStep = CHAT_FLOW[nextIndex]
  const ack = acknowledgment(step.id, trimmed)

  return {
    ...state,
    wizard,
    yearsExperience,
    stepIndex: nextIndex,
    messages: [
      ...state.messages,
      userMsg,
      { id: uid(), role: 'assistant', content: ack },
      { id: uid(), role: 'assistant', content: nextStep.question },
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
    case 'currentRole': {
      const role = parseCurrentRole(value)
      return {
        ...draft,
        personal: { ...draft.personal, headline: draft.personal.headline || role.title },
        experience: [role, ...draft.experience.slice(1)],
      }
    }
    case 'previousRoles': {
      if (isSkip(value)) return draft
      const previous = parseJobsText(value)
      const current = draft.experience[0]
      return { ...draft, experience: current?.company || current?.title ? [current, ...previous] : previous }
    }
    case 'skills':
      return { ...draft, skills: value }
    case 'education':
      return { ...draft, education: value }
    case 'targetJob':
      return { ...draft, target: { ...draft.target, title: value } }
    default:
      return draft
  }
}

/** Live preview while interviewing */
export function chatToLiveResume(state: ChatState): ResumeJson {
  return wizardToResumeRaw(state.wizard, state.yearsExperience || undefined)
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
