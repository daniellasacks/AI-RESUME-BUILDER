import { ApiError } from './api'
import {
  getUserFromToken,
  hashPassword,
  loadState,
  makeToken,
  sampleExtractedResume,
  saveState,
  type DemoState,
  type DemoUser,
} from './demoStore'
import { ResumeSchema, type ResumeJson } from './resumeSchema'

function parseBody(init?: RequestInit) {
  if (!init?.body || typeof init.body !== 'string') return {}
  try {
    return JSON.parse(init.body) as Record<string, unknown>
  } catch {
    return {}
  }
}

function resumeToText(r: ResumeJson) {
  const lines: string[] = [r.basics.fullName, r.basics.headline ?? '', '', r.basics.summary ?? '']
  if (r.experience?.length) {
    lines.push('', 'EXPERIENCE')
    for (const e of r.experience) {
      lines.push(`${e.title} — ${e.company}`)
      for (const h of e.highlights ?? []) lines.push(`• ${h}`)
    }
  }
  return lines.filter(Boolean).join('\n')
}

export async function demoApi<T>(path: string, init?: RequestInit): Promise<T> {
  await new Promise((r) => setTimeout(r, 120))
  const method = (init?.method ?? 'GET').toUpperCase()
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ai-resume-token') : null
  const user = getUserFromToken(token)
  const state = loadState()
  const body = parseBody(init)

  if (path === '/auth/register' && method === 'POST') {
    const email = String(body.email ?? '')
    const password = String(body.password ?? '')
    if (!email || password.length < 8) throw new ApiError({ message: 'Invalid credentials', status: 400 })
    if (state.users.some((u) => u.email === email)) throw new ApiError({ message: 'Email already registered', status: 400 })
    const u: DemoUser = { id: crypto.randomUUID(), email, fullName: body.fullName as string | undefined, passwordHash: hashPassword(password) }
    state.users.push(u)
    saveState(state)
    return { token: makeToken(u.id) } as T
  }

  if (path === '/auth/login' && method === 'POST') {
    const email = String(body.email ?? '')
    const password = String(body.password ?? '')
    const u = state.users.find((x) => x.email === email && x.passwordHash === hashPassword(password))
    if (!u) throw new ApiError({ message: 'Invalid email or password', status: 401 })
    return { token: makeToken(u.id) } as T
  }

  if (path === '/auth/me') {
    if (!user) throw new ApiError({ message: 'Unauthorized', status: 401 })
    return { user: { id: user.id, email: user.email, fullName: user.fullName } } as T
  }

  if (!user) throw new ApiError({ message: 'Unauthorized', status: 401 })

  if (path === '/templates' && method === 'GET') {
    return state.templates as T
  }

  if (path === '/resume' && method === 'GET') {
    return state.resumes
      .filter((r) => r.userId === user.id)
      .map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        _count: { versions: r.versions.length },
      })) as T
  }

  if (path === '/resume' && method === 'POST') {
    const title = String(body.title ?? 'My Resume')
    const rid = crypto.randomUUID()
    const resume = {
      id: rid,
      userId: user.id,
      title,
      status: 'draft' as const,
      createdAt: now(),
      updatedAt: now(),
      versions: [] as DemoState['resumes'][0]['versions'],
    }
    state.resumes.unshift(resume)
    saveState(state)
    return { id: rid, title, status: resume.status, createdAt: resume.createdAt, updatedAt: resume.updatedAt } as T
  }

  const resumeMatch = path.match(/^\/resume\/([^/]+)$/)
  if (resumeMatch && method === 'GET') {
    const resume = state.resumes.find((r) => r.id === resumeMatch[1] && r.userId === user.id)
    if (!resume) throw new ApiError({ message: 'Resume not found', status: 404 })
    return {
      ...resume,
      versions: [...resume.versions].sort((a, b) => b.version - a.version),
    } as T
  }

  if (path === '/resume/versions' && method === 'POST') {
    const resumeId = String(body.resumeId ?? '')
    const resume = state.resumes.find((r) => r.id === resumeId && r.userId === user.id)
    if (!resume) throw new ApiError({ message: 'Resume not found', status: 404 })
    const parsed = ResumeSchema.safeParse(body.structuredJson)
    if (!parsed.success) throw new ApiError({ message: 'Invalid resume JSON', status: 400 })
    const nextVersion = (resume.versions.at(-1)?.version ?? 0) + 1
    const version = {
      id: crypto.randomUUID(),
      resumeId,
      version: nextVersion,
      structuredJson: parsed.data,
      jobTargetId: (body.jobTargetId as string) ?? null,
      templateId: (body.templateId as string) ?? null,
      derivedFromVersionId: (body.derivedFromVersionId as string) ?? null,
      createdAt: now(),
    }
    resume.versions.push(version)
    resume.updatedAt = now()
    saveState(state)
    return version as T
  }

  if (path === '/resume/tailor' && method === 'POST') {
    const baseVersionId = String(body.baseVersionId ?? '')
    const jobTargetId = String(body.jobTargetId ?? '')
    const resume = state.resumes.find((r) => r.userId === user.id && r.versions.some((v) => v.id === baseVersionId))
    if (!resume) throw new ApiError({ message: 'Base version not found', status: 404 })
    const base = resume.versions.find((v) => v.id === baseVersionId)!
    const jt = state.jobTargets.find((j) => j.id === jobTargetId && j.userId === user.id)
    if (!jt) throw new ApiError({ message: 'Job target not found', status: 404 })
    const tailored: ResumeJson = {
      ...base.structuredJson,
      basics: {
        ...base.structuredJson.basics,
        summary:
          (base.structuredJson.basics.summary ?? '') +
          `\n\nTailored for ${jt.title}${jt.company ? ` at ${jt.company}` : ''}.`,
      },
    }
    const nextVersion = (resume.versions.at(-1)?.version ?? 0) + 1
    const version = {
      id: crypto.randomUUID(),
      resumeId: resume.id,
      version: nextVersion,
      structuredJson: tailored,
      jobTargetId: jt.id,
      templateId: base.templateId,
      derivedFromVersionId: base.id,
      createdAt: now(),
    }
    resume.versions.push(version)
    resume.updatedAt = now()
    saveState(state)
    return version as T
  }

  if (path === '/resume/extract' && method === 'POST') {
    const resumeJson = sampleExtractedResume()
    return { documentId: crypto.randomUUID(), resumeJson } as T
  }

  if (path === '/job-targets' && method === 'GET') {
    return state.jobTargets.filter((j) => j.userId === user.id) as T
  }

  if (path === '/job-targets' && method === 'POST') {
    const jt = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: String(body.title ?? ''),
      company: (body.company as string) ?? null,
      industry: (body.industry as string) ?? null,
      location: (body.location as string) ?? null,
      jobDescriptionText: (body.jobDescriptionText as string) ?? null,
      createdAt: now(),
      updatedAt: now(),
    }
    state.jobTargets.unshift(jt)
    saveState(state)
    return jt as T
  }

  const jtDelete = path.match(/^\/job-targets\/([^/]+)$/)
  if (jtDelete && method === 'DELETE') {
    state.jobTargets = state.jobTargets.filter((j) => !(j.id === jtDelete[1] && j.userId === user.id))
    saveState(state)
    return { ok: true } as T
  }

  if (path === '/ats/evaluate' && method === 'POST') {
    const resumeVersionId = String(body.resumeVersionId ?? '')
    const jobTargetId = String(body.jobTargetId ?? '')
    const resume = state.resumes.find((r) => r.userId === user.id && r.versions.some((v) => v.id === resumeVersionId))
    const version = resume?.versions.find((v) => v.id === resumeVersionId)
    const jt = state.jobTargets.find((j) => j.id === jobTargetId && j.userId === user.id)
    if (!version || !jt) throw new ApiError({ message: 'Not found', status: 404 })
    const score = 62 + Math.min(28, Math.floor((jt.jobDescriptionText?.length ?? 0) / 200))
    return {
      id: crypto.randomUUID(),
      score,
      verdict: score >= 80 ? 'strong' : score >= 55 ? 'ok' : 'weak',
      suggestionsJson: {
        summary: `Demo ATS evaluation for ${jt.title}. Connect a deployed API + OpenAI key for AI-powered suggestions.`,
        missingKeywords: ['kubernetes', 'ci/cd', 'typescript'],
        suggestions: [
          'Mirror key phrases from the job description in your summary.',
          'Quantify impact in experience bullets (%, $, time saved).',
          'Add a skills section grouped by category for ATS parsing.',
        ],
      },
    } as T
  }

  if (path === '/conversations/start' && method === 'POST') {
    const session = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: 'Conversational Builder',
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'Welcome! This is portfolio demo mode — tell me about your latest role and I will help build your resume.',
          createdAt: now(),
        },
      ],
    }
    state.conversations.unshift(session)
    saveState(state)
    return session as T
  }

  const msgMatch = path.match(/^\/conversations\/([^/]+)\/messages$/)
  if (msgMatch && method === 'POST') {
    const session = state.conversations.find((s) => s.id === msgMatch[1] && s.userId === user.id)
    if (!session) throw new ApiError({ message: 'Session not found', status: 404 })
    const content = String(body.content ?? '')
    session.messages.push({ id: crypto.randomUUID(), role: 'user', content, createdAt: now() })
    session.messages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'Great — in production this uses OpenAI. For demo mode, continue to the editor to add structured sections, then tailor to a job target.',
      createdAt: now(),
    })
    saveState(state)
    return session as T
  }

  if (path === '/uploads' && method === 'POST') {
    return { id: crypto.randomUUID(), filename: 'uploaded-resume.pdf' } as T
  }

  const exportMatch = path.match(/^\/export\/resume\/([^/]+)\.(pdf|docx)$/)
  if (exportMatch && method === 'GET') {
    const versionId = exportMatch[1]
    const kind = exportMatch[2]
    const resume = state.resumes.find((r) => r.userId === user.id && r.versions.some((v) => v.id === versionId))
    const version = resume?.versions.find((v) => v.id === versionId)
    if (!version) throw new ApiError({ message: 'Version not found', status: 404 })
    const text = resumeToText(version.structuredJson)
    const mime = kind === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    return new Blob([text], { type: mime }) as T
  }

  throw new ApiError({ message: `Demo API: not implemented for ${method} ${path}`, status: 404 })
}

function now() {
  return new Date().toISOString()
}
