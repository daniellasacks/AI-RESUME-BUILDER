import { emptyResume, type ResumeJson } from './resumeSchema'

const KEY = 'ai-resume-demo-v1'

export type DemoUser = { id: string; email: string; fullName?: string; passwordHash: string }

export type DemoState = {
  users: DemoUser[]
  resumes: Array<{
    id: string
    userId: string
    title: string
    status: 'draft' | 'published' | 'archived'
    createdAt: string
    updatedAt: string
    versions: Array<{
      id: string
      resumeId: string
      version: number
      structuredJson: ResumeJson
      plainText?: string
      jobTargetId?: string | null
      templateId?: string | null
      derivedFromVersionId?: string | null
      createdAt: string
    }>
  }>
  jobTargets: Array<{
    id: string
    userId: string
    title: string
    company?: string | null
    industry?: string | null
    location?: string | null
    jobDescriptionText?: string | null
    createdAt: string
    updatedAt: string
  }>
  conversations: Array<{
    id: string
    userId: string
    title?: string | null
    messages: Array<{ id: string; role: string; content: string; createdAt: string }>
  }>
  templates: Array<{ id: string; key: string; name: string; description?: string | null; templateJson?: any }>
}

function seedTemplates(): DemoState['templates'] {
  return [
    {
      id: 'tpl-modern',
      key: 'modern-1',
      name: 'Modern',
      description: 'Clean, single-column, ATS-friendly layout.',
      templateJson: { type: 'single-column', sections: ['summary', 'experience', 'projects', 'skills', 'education'] },
    },
    {
      id: 'tpl-compact',
      key: 'compact-1',
      name: 'Compact',
      description: 'Tight spacing for 1-page resumes.',
      templateJson: { type: 'single-column-compact', sections: ['summary', 'skills', 'experience', 'projects', 'education'] },
    },
  ]
}

export function loadState(): DemoState {
  const raw = localStorage.getItem(KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as DemoState
    } catch {
      /* fall through */
    }
  }
  const initial: DemoState = {
    users: [],
    resumes: [],
    jobTargets: [],
    conversations: [],
    templates: seedTemplates(),
  }
  saveState(initial)
  return initial
}

export function saveState(state: DemoState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function getUserFromToken(token: string | null): DemoUser | null {
  if (!token?.startsWith('demo:')) return null
  const userId = token.slice(5)
  const state = loadState()
  return state.users.find((u) => u.id === userId) ?? null
}

export function makeToken(userId: string) {
  return `demo:${userId}`
}

export function hashPassword(password: string) {
  return `demo-${password}`
}

export function sampleExtractedResume(): ResumeJson {
  return {
    ...emptyResume('Alex Morgan'),
    basics: {
      fullName: 'Alex Morgan',
      headline: 'Senior Full Stack Engineer',
      email: 'alex@email.com',
      location: 'Remote',
      summary:
        'Full-stack engineer building SaaS products with React, Node.js, and PostgreSQL. Passionate about clean architecture and AI-assisted workflows.',
    },
    experience: [
      {
        company: 'Acme Corp',
        title: 'Senior Engineer',
        startDate: '2022',
        endDate: 'Present',
        highlights: ['Led migration to NestJS + Prisma', 'Shipped ATS-friendly resume export pipeline'],
      },
    ],
    skills: [{ category: 'Backend', items: ['Node.js', 'PostgreSQL', 'Prisma'] }],
    education: [{ school: 'State University', degree: 'B.S. Computer Science' }],
  }
}
