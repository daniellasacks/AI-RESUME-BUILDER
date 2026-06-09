import type { ResumeJson } from './resumeSchema'
import type { WizardInput } from './wizardTypes'

function bullets(text: string): string[] {
  return text
    .split(/\n|•|·|-/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith('.') ? s : `${s}.`))
}

function professionalSummary(input: WizardInput): string {
  const name = input.personal.fullName || 'Professional'
  const role = input.target.title || input.personal.headline || 'their field'
  const years = input.experience.filter((e) => e.company).length
  const skillSample = input.skills
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(', ')

  const parts = [
    `${name} is a results-driven professional targeting ${role} roles.`,
    years > 0
      ? `Brings hands-on experience across ${years} role${years > 1 ? 's' : ''} with a focus on measurable impact and clear communication.`
      : 'Combines strong fundamentals with a growth mindset and attention to detail.',
  ]
  if (skillSample) parts.push(`Core strengths include ${skillSample}.`)
  if (input.target.company) parts.push(`Currently positioning for opportunities at ${input.target.company}.`)
  return parts.join(' ')
}

/** Literal mapping — used for before/after AI reveal */
export function wizardToResumeRaw(input: WizardInput): ResumeJson {
  const skillItems = input.skills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
  return {
    basics: {
      fullName: input.personal.fullName || 'Your Name',
      headline: input.personal.headline || input.target.title || undefined,
      email: input.personal.email || undefined,
      phone: input.personal.phone || undefined,
      location: input.personal.location || undefined,
      summary: input.experience[0]?.highlights?.split('\n')[0] || 'Experienced professional seeking new opportunities.',
    },
    experience: input.experience
      .filter((e) => e.company && e.title)
      .map((e) => ({
        company: e.company,
        title: e.title,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined,
        highlights: e.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      })),
    skills: skillItems.length ? [{ category: 'Skills', items: skillItems }] : [],
    education: input.education
      ? [{ school: input.education.split('—')[0]?.trim() || input.education, degree: input.education.split('—')[1]?.trim() }]
      : [],
    projects: [],
    certifications: [],
  }
}

export function wizardToResume(input: WizardInput): ResumeJson {
  const skillItems = input.skills
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)

  const eduLines = input.education
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    basics: {
      fullName: input.personal.fullName || 'Your Name',
      headline: input.personal.headline || input.target.title || undefined,
      email: input.personal.email || undefined,
      phone: input.personal.phone || undefined,
      location: input.personal.location || undefined,
      summary: professionalSummary(input),
    },
    experience: input.experience
      .filter((e) => e.company && e.title)
      .map((e) => ({
        company: e.company,
        title: e.title,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined,
        highlights: bullets(e.highlights),
      })),
    skills: skillItems.length ? [{ category: 'Skills', items: skillItems }] : [],
    education: eduLines.length
      ? eduLines.map((line) => {
          const [school, degree] = line.split('—').map((s) => s.trim())
          return degree ? { school, degree } : { school: line }
        })
      : [],
    projects: [],
    certifications: [],
  }
}

export function linkedInSummary(resume: ResumeJson): string {
  const b = resume.basics
  const lines = [b.summary ?? '', '', b.headline ? `🎯 ${b.headline}` : '', b.location ? `📍 ${b.location}` : '']
  if (resume.skills?.[0]?.items?.length) {
    lines.push('', `Skills: ${resume.skills[0].items.slice(0, 8).join(' · ')}`)
  }
  return lines.filter(Boolean).join('\n')
}
