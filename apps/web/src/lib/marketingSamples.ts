import type { ResumeJson } from './resumeSchema'

/** Raw user input style — before AI */
export const cvBefore: ResumeJson = {
  basics: {
    fullName: 'Alex Morgan',
    headline: 'developer',
    summary:
      'I am a developer with experience in web apps. I worked on different projects and helped the team. Good at React and Node.',
  },
  experience: [
    {
      company: 'StartupCo',
      title: 'Developer',
      startDate: '2022',
      endDate: 'Present',
      highlights: ['worked on website', 'fixed bugs', 'helped with new features'],
    },
  ],
  skills: [{ category: 'Skills', items: ['react', 'javascript', 'node'] }],
  education: [{ school: 'State University', degree: 'Computer Science' }],
}

/** AI-polished output */
export const cvAfter: ResumeJson = {
  basics: {
    fullName: 'Alex Morgan',
    headline: 'Full Stack Developer',
    summary:
      'Full stack developer with 3+ years building production web applications. Delivered features used by 50k+ users while improving release velocity and code quality across React and Node.js stacks.',
  },
  experience: [
    {
      company: 'StartupCo',
      title: 'Full Stack Developer',
      startDate: '2022',
      endDate: 'Present',
      highlights: [
        'Shipped customer-facing features in React, increasing weekly active users by 28%.',
        'Reduced production incidents 40% through targeted bug fixes and test coverage.',
        'Collaborated with product to deliver 12+ releases on a two-week sprint cadence.',
      ],
    },
  ],
  skills: [{ category: 'Core', items: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'PostgreSQL'] }],
  education: [{ school: 'State University', degree: 'B.S. Computer Science' }],
}
