import {
  acknowledgment,
  FRESH_FLOW,
  getFlow,
  getStepHints,
  isSkip,
  totalSteps,
  type ChatStep,
} from './chatFlow'
import { parseCurrentRole, parseJobsText } from './resumeParse'
import type { ResumeJson } from './resumeSchema'
import { emptyWizard, type WizardInput } from './wizardTypes'
import { wizardToResumeRaw } from './wizardToResume'

export type ChatMode = 'fresh' | 'update'
export type ChatPhase = 'welcome' | 'interview' | 'ready' | 'generated'

export type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export type ChatState = {
  mode: ChatMode | null
  wizard: WizardInput
  yearsExperience: string
  stepIndex: number
  phase: ChatPhase
  messages: ChatMessage[]
  importedFileName?: string
}

function uid() {
  return crypto.randomUUID()
}

export function createWelcomeSession(): ChatState {
  return {
    mode: null,
    wizard: emptyWizard(),
    yearsExperience: '',
    stepIndex: 0,
    phase: 'welcome',
    messages: [],
  }
}

export function startFreshInterview(): ChatState {
  const flow = FRESH_FLOW
  return {
    mode: 'fresh',
    wizard: emptyWizard(),
    yearsExperience: '',
    stepIndex: 0,
    phase: 'interview',
    messages: [{ id: uid(), role: 'assistant', content: flow[0].question }],
  }
}

export function startUpdateInterview(wizard: WizardInput, fileName?: string): ChatState {
  const flow = getFlow('update')
  const name = wizard.personal.fullName.trim()
  const intro = name
    ? `I imported ${fileName ? `"${fileName}"` : 'your CV'} for ${name}. ${flow[0].question}`
    : `I imported ${fileName ? `"${fileName}"` : 'your CV'}. ${flow[0].question}`
  return {
    mode: 'update',
    wizard,
    yearsExperience: inferYears(wizard),
    stepIndex: 0,
    phase: 'interview',
    messages: [{ id: uid(), role: 'assistant', content: intro }],
    importedFileName: fileName,
  }
}

export function activeFlow(state: ChatState): ChatStep[] {
  if (!state.mode) return FRESH_FLOW
  return getFlow(state.mode)
}

export function flowTotal(state: ChatState): number {
  if (!state.mode) return FRESH_FLOW.length
  return totalSteps(state.mode)
}

export { getStepHints }

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
  if (!state.mode || state.phase !== 'interview') return state

  const flow = getFlow(state.mode)
  const step = flow[state.stepIndex]
  if (!step) return state

  const trimmed = value.trim()
  const wizard = applyToWizard(state.wizard, step.id, trimmed, state.mode)
  const yearsExperience = inferYears(wizard) || state.yearsExperience

  const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed }
  const nextIndex = state.stepIndex + 1
  const isLast = nextIndex >= flow.length

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
        {
          id: uid(),
          role: 'assistant',
          content:
            state.mode === 'update'
              ? 'I have your instructions. Press Generate CV and I will produce an updated version.'
              : 'That covers the basics. Press Generate CV when you are ready.',
        },
      ],
    }
  }

  const nextStep = flow[nextIndex]
  const ack = acknowledgment(step.id, trimmed, state.mode)

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

function applyToWizard(draft: WizardInput, stepId: string, value: string, mode: ChatMode): WizardInput {
  if (mode === 'update') {
    switch (stepId) {
      case 'updateGoals':
        return { ...draft, target: { ...draft.target, description: value } }
      case 'addDetails':
        if (isSkip(value)) return draft
        return {
          ...draft,
          careerSummary: [draft.careerSummary, value].filter(Boolean).join('\n\n'),
        }
      case 'targetJob':
        return { ...draft, target: { ...draft.target, title: value } }
      default:
        return draft
    }
  }

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
