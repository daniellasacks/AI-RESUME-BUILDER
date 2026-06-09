/** One question per screen — minimal interview flow */
export const WIZARD_FLOW = [
  { id: 'fullName', question: 'What is your full name?', placeholder: 'Daniella Azar' },
  { id: 'headline', question: 'What is your professional headline?', placeholder: 'Full Stack Developer' },
  { id: 'email', question: 'What is your email?', placeholder: 'you@email.com' },
  { id: 'location', question: 'Where are you based?', placeholder: 'Tel Aviv, Israel' },
  { id: 'jobTitle', question: 'What is your most recent job title?', placeholder: 'Software Engineer' },
  { id: 'company', question: 'Which company was that at?', placeholder: 'Acme Corp' },
  { id: 'achievements', question: 'What were your key achievements?', placeholder: 'One per line…', multiline: true },
  { id: 'skills', question: 'What are your main skills?', placeholder: 'React, TypeScript, Node.js…', multiline: true },
  { id: 'education', question: 'What is your education?', placeholder: 'University — B.S. Computer Science' },
  { id: 'targetRole', question: 'What role are you applying for?', placeholder: 'Junior Full Stack Developer' },
  { id: 'jobDescription', question: 'Paste the job description', placeholder: 'Paste the posting…', multiline: true },
  { id: 'upload', question: 'Upload an existing CV (optional)', optional: true },
] as const

export type WizardScreenId = (typeof WIZARD_FLOW)[number]['id']
