import type { WizardExperience } from './wizardTypes'

/** Parse "Company | Title | 2019–Today" or "Company | Title | 2017 - 2019" */
export function parseJobHeader(line: string): Partial<WizardExperience> {
  const trimmed = line.trim()
  if (!trimmed) return {}

  const pipe = trimmed.split('|').map((s) => s.trim())
  if (pipe.length >= 2) {
    const company = pipe[0] ?? ''
    const title = pipe[1] ?? ''
    const dates = pipe[2] ?? ''
    const { startDate, endDate } = parseDateRange(dates)
    return { company, title, startDate, endDate }
  }

  const dash = trimmed.match(/^(.+?)\s+[-–—]\s+(.+?)\s*\(([^)]+)\)\s*$/)
  if (dash) {
    const { startDate, endDate } = parseDateRange(dash[3])
    return { company: dash[1].trim(), title: dash[2].trim(), startDate, endDate }
  }

  return { title: trimmed, company: '' }
}

function parseDateRange(dates: string): { startDate: string; endDate: string } {
  const parts = dates.split(/[–—-]/).map((s) => s.trim()).filter(Boolean)
  if (parts.length >= 2) return { startDate: parts[0], endDate: parts[1] }
  if (parts.length === 1) return { startDate: parts[0], endDate: 'Present' }
  return { startDate: '', endDate: '' }
}

function parseHighlights(lines: string[]): string {
  return lines
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .join('\n')
}

/** Parse freeform current role — pipe format, "Title at Company", or natural text + bullet lines */
export function parseCurrentRole(text: string): WizardExperience {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return { company: '', title: '', startDate: '', endDate: '', highlights: '' }

  const first = lines[0]
  const pipe = parseJobHeader(first)
  if (pipe.company && pipe.title) {
    return {
      company: pipe.company,
      title: pipe.title,
      startDate: pipe.startDate || '',
      endDate: pipe.endDate || 'Present',
      highlights: lines.slice(1).join('\n'),
    }
  }

  const dotParts = first.split(/[·•|]/).map((s) => s.trim()).filter(Boolean)
  if (dotParts.length >= 2) {
    const since = first.match(/since\s+(\d{4})/i)?.[1] ?? first.match(/(\d{4})\s*[–—-]\s*(Today|Present|\d{4})/i)
    const dates = since
      ? typeof since === 'string'
        ? { startDate: since, endDate: 'Present' }
        : parseDateRange(`${since[1]}–${since[2]}`)
      : { startDate: '', endDate: '' }
    return {
      company: dotParts[0],
      title: dotParts[1],
      startDate: dates.startDate,
      endDate: dates.endDate,
      highlights: lines.slice(1).join('\n') || dotParts.slice(2).join('\n'),
    }
  }

  const titleAt = first.match(/^(.+?)\s+at\s+(.+?)$/i)
  if (titleAt) {
    return {
      title: titleAt[1].trim(),
      company: titleAt[2].trim(),
      startDate: '',
      endDate: 'Present',
      highlights: lines.slice(1).join('\n'),
    }
  }

  return {
    company: lines.length > 1 ? first : '',
    title: lines.length > 1 ? '' : first,
    startDate: '',
    endDate: 'Present',
    highlights: lines.slice(1).join('\n'),
  }
}

/** Parse one or more job blocks separated by blank lines */
export function parseJobsText(text: string): WizardExperience[] {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  const jobs: WizardExperience[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue

    const header = parseJobHeader(lines[0])
    const highlights = parseHighlights(lines.slice(1))
    if (!header.company && !header.title) continue

    jobs.push({
      company: header.company || 'Company',
      title: header.title || 'Role',
      startDate: header.startDate || '',
      endDate: header.endDate || '',
      highlights,
    })
  }

  return jobs
}

/** Parse "Category: a, b, c" lines or comma-separated flat list */
export function parseSkillCategories(text: string): { category: string; items: string[] }[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const categories: { category: string; items: string[] }[] = []

  for (const line of lines) {
    const colon = line.match(/^([^:]+):\s*(.+)$/)
    if (colon) {
      const items = colon[2].split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      if (items.length) categories.push({ category: colon[1].trim(), items })
      continue
    }
  }

  if (categories.length) return categories

  const flat = text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
  if (flat.length) return [{ category: 'Skills & Tools', items: flat }]
  return []
}

/** Parse education lines: "School — Degree (2013–2017)" or "School | Degree | years" */
export function parseEducationLines(text: string): { school: string; degree?: string; startDate?: string; endDate?: string }[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.split('|').map((s) => s.trim())
      if (pipe.length >= 2) {
        const school = pipe[0]
        const degree = pipe[1]
        const dates = pipe[2] ? parseDateRange(pipe[2]) : { startDate: '', endDate: '' }
        return { school, degree, ...dates }
      }
      const em = line.split('—').map((s) => s.trim())
      const school = em[0] ?? line
      const degree = em[1]
      const yearMatch = line.match(/\((\d{4})\s*[–—-]\s*(\d{4}|Today|Present)\)/i)
      if (yearMatch) {
        return {
          school: school.replace(/\(\d{4}.*\)/, '').trim(),
          degree,
          startDate: yearMatch[1],
          endDate: yearMatch[2],
        }
      }
      return { school, degree }
    })
}
