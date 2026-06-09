import type { ResumeJson } from './resumeSchema'
import type { WizardInput } from './wizardTypes'
import { parseEducationLines, parseSkillCategories } from './resumeParse'

function bullets(text: string): string[] {
  return text
    .split(/\n|•|·/)
    .map((s) => s.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean)
    .map((s) => polishBullet(s))
}

function polishBullet(s: string): string {
  const trimmed = s.trim()
  if (!trimmed) return trimmed
  const withPeriod = trimmed.endsWith('.') ? trimmed : `${trimmed}.`
  if (/^(Led|Managed|Developed|Established|Collaborated|Oversaw|Planned|Initiated|Built|Improved|Organized|Supported|Advised|Recruited|Coordinated)/i.test(withPeriod)) {
    return withPeriod
  }
  return withPeriod
}

function roleCount(input: WizardInput): number {
  return input.experience.filter((e) => e.company && e.title).length
}

function inferYears(input: WizardInput): string | undefined {
  const starts = input.experience.map((e) => parseInt(e.startDate, 10)).filter((n) => !isNaN(n))
  if (!starts.length) return undefined
  return String(new Date().getFullYear() - Math.min(...starts))
}

function professionalSummary(input: WizardInput, yearsExperience?: string): string {
  if (input.careerSummary.trim()) {
    const base = input.careerSummary.trim()
    if (input.target.title && !base.toLowerCase().includes(input.target.title.toLowerCase())) {
      return `${base} Seeking ${input.target.title} opportunities where I can contribute my experience and help the organization grow.`
    }
    return base.endsWith('.') ? base : `${base}.`
  }

  const headline = input.personal.headline || input.experience[0]?.title || 'Professional'
  const years = yearsExperience || ''
  const roles = roleCount(input)
  const skillSample = input.skills
    .split(/[,;\n:]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 40)
    .slice(0, 5)
    .join(', ')

  const parts: string[] = [
    `${headline} with extensive experience${years ? ` across ${years}+ years` : ''}${roles > 1 ? ` and ${roles} progressive roles` : ''}.`,
    'Specializes in delivering measurable results, cross-functional collaboration, and building strong organizational culture.',
    'Experienced in managing teams, budgets, stakeholders, and complex processes while adapting to evolving business needs.',
  ]

  if (skillSample) parts.push(`Proficient with ${skillSample}.`)
  if (input.target.title) {
    parts.push(`Seeking ${input.target.title} opportunities to contribute expertise and drive organizational success.`)
  }

  return parts.join(' ')
}

function mapExperience(input: WizardInput) {
  return input.experience
    .filter((e) => e.company && e.title)
    .map((e) => ({
      company: e.company,
      title: e.title,
      startDate: e.startDate || undefined,
      endDate: e.endDate || undefined,
      highlights: bullets(e.highlights),
    }))
}

function mapSkills(input: WizardInput) {
  const categories = parseSkillCategories(input.skills)
  if (categories.length) return categories

  const flat = input.skills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
  return flat.length ? [{ category: 'Skills & Tools', items: flat }] : []
}

function mapEducation(input: WizardInput) {
  if (!input.education.trim()) return []
  return parseEducationLines(input.education).map((ed) => ({
    school: ed.school,
    degree: ed.degree,
    startDate: ed.startDate,
    endDate: ed.endDate,
  }))
}

function basicsSummary(input: WizardInput, polished: boolean, yearsExperience?: string): string {
  const summary = polished
    ? professionalSummary(input, yearsExperience)
    : input.careerSummary.trim() ||
      input.experience[0]?.highlights?.split('\n').slice(0, 2).join(' ') ||
      `${input.personal.headline || 'Experienced professional'} seeking new opportunities.`

  let languagesNote = ''
  if (input.languages.trim()) languagesNote = ` Languages: ${input.languages.trim()}.`

  return summary + languagesNote
}

/** Literal mapping — used for before/after AI reveal */
export function wizardToResumeRaw(input: WizardInput, yearsExperience?: string): ResumeJson {
  const years = yearsExperience ?? inferYears(input)
  return {
    basics: {
      fullName: input.personal.fullName || 'Your Name',
      headline: input.personal.headline || input.target.title || undefined,
      email: input.personal.email || undefined,
      phone: input.personal.phone || undefined,
      location: input.personal.location || undefined,
      summary: basicsSummary(input, false, years),
    },
    experience: mapExperience(input),
    skills: mapSkills(input),
    education: mapEducation(input),
    projects: [],
    certifications: [],
  }
}

export function wizardToResume(input: WizardInput, yearsExperience?: string): ResumeJson {
  const years = yearsExperience ?? inferYears(input)
  return {
    basics: {
      fullName: input.personal.fullName || 'Your Name',
      headline: input.personal.headline || input.target.title || undefined,
      email: input.personal.email || undefined,
      phone: input.personal.phone || undefined,
      location: input.personal.location || undefined,
      summary: professionalSummary(input, years),
    },
    experience: mapExperience(input),
    skills: mapSkills(input),
    education: mapEducation(input),
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
