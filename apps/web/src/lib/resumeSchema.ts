import { z } from 'zod'

export const ResumeSchema = z.object({
  basics: z.object({
    fullName: z.string().min(1),
    headline: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    links: z.array(z.object({ label: z.string().min(1), url: z.string().url() })).optional(),
    summary: z.string().optional(),
  }),
  skills: z
    .array(
      z.object({
        category: z.string().min(1),
        items: z.array(z.string().min(1)),
      }),
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string().min(1),
        title: z.string().min(1),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        highlights: z.array(z.string().min(1)).optional(),
        technologies: z.array(z.string().min(1)).optional(),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        highlights: z.array(z.string().min(1)).optional(),
        technologies: z.array(z.string().min(1)).optional(),
        link: z.string().url().optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().min(1),
        degree: z.string().optional(),
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string().min(1),
        issuer: z.string().optional(),
        date: z.string().optional(),
      }),
    )
    .optional(),
})

export type ResumeJson = z.infer<typeof ResumeSchema>

export function emptyResume(fullName = ''): ResumeJson {
  return {
    basics: { fullName },
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
  }
}

