import type { ResumeJson } from './resumeSchema'

export const landingPreviewResume: ResumeJson = {
  basics: {
    fullName: 'Jordan Lee',
    headline: 'Product Engineer',
    email: 'jordan@email.com',
    location: 'San Francisco, CA',
    summary:
      'Engineer focused on polished UX and reliable APIs. Shipped resume tooling used by thousands of candidates.',
  },
  experience: [
    {
      company: 'Northwind',
      title: 'Senior Engineer',
      startDate: '2021',
      endDate: 'Present',
      highlights: ['Led design system adoption', 'Cut export time by 60%'],
    },
    {
      company: 'Contoso',
      title: 'Full Stack Developer',
      startDate: '2018',
      endDate: '2021',
      highlights: ['Built ATS scoring pipeline', 'Mentored 4 engineers'],
    },
  ],
  skills: [
    { category: 'Stack', items: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'] },
    { category: 'Tools', items: ['Figma', 'CI/CD', 'OpenAI'] },
  ],
  education: [{ school: 'UC Berkeley', degree: 'B.S. Computer Science', endDate: '2018' }],
}
