import type { ResumeJson } from './resumeSchema'

export function describeResumeChanges(before: ResumeJson, after: ResumeJson): string[] {
  const changes: string[] = []

  if (before.basics.summary !== after.basics.summary) {
    changes.push('Rewrote professional summary with stronger impact language')
  }
  if (before.basics.headline !== after.basics.headline) {
    changes.push(`Updated headline to “${after.basics.headline ?? ''}”`)
  }

  const bExp = before.experience?.[0]
  const aExp = after.experience?.[0]
  if (bExp && aExp && bExp.title !== aExp.title) {
    changes.push(`Refined job title to “${aExp.title}”`)
  }
  if (bExp && aExp && JSON.stringify(bExp.highlights) !== JSON.stringify(aExp.highlights)) {
    changes.push('Transformed experience bullets with metrics and action verbs')
  }

  const bSkills = before.skills?.[0]?.items?.join(',') ?? ''
  const aSkills = after.skills?.[0]?.items?.join(',') ?? ''
  if (bSkills !== aSkills) {
    changes.push('Expanded and normalized skills for ATS keyword matching')
  }

  if (after.basics.summary?.includes('Optimized for') || after.basics.summary?.toLowerCase().includes('tailored')) {
    changes.push('Aligned keywords and phrasing to your target job')
  }

  if (changes.length === 0) {
    changes.push('Polished wording across summary and experience sections')
  }

  return changes
}
