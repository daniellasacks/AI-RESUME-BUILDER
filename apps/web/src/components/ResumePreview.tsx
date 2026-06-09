import type { ResumeJson } from '../lib/resumeSchema'

type TemplateMeta = {
  key?: string
  type?: string
  sections?: string[]
}

export type PreviewSection = 'summary' | 'experience' | 'projects' | 'skills' | 'education'

export function ResumePreview({
  resume,
  template,
  compact,
  a4,
  highlightSections,
  generated,
}: {
  resume: ResumeJson
  template?: TemplateMeta | null
  compact?: boolean
  a4?: boolean
  highlightSections?: PreviewSection[]
  generated?: boolean
}) {
  const isCompact = compact ?? template?.type === 'single-column-compact'
  const sections = template?.sections ?? ['summary', 'experience', 'projects', 'skills', 'education']
  const pad = a4 ? 'p-10' : isCompact ? 'p-4' : 'p-6'
  const gap = isCompact ? 'gap-3' : 'gap-4'
  const textSize = a4 ? 'text-[12px] leading-relaxed' : isCompact ? 'text-[10px] leading-snug' : 'text-[11px] leading-relaxed'

  const hl = (section: PreviewSection) =>
    highlightSections?.includes(section)
      ? 'rounded-[8px] bg-[#2563eb]/[0.06] ring-1 ring-[#2563eb]/20 -mx-1 px-1 transition-all duration-500'
      : ''

  return (
    <div
      className={
        'overflow-hidden bg-white text-zinc-900 transition-all duration-500 ' +
        (a4 ? 'min-h-[297mm] rounded-none border-0 ' : 'rounded-xl border border-zinc-200 shadow-inner ') +
        (generated ? 'shadow-md ' : '') +
        textSize
      }
    >
      <div className={pad + ' ' + gap + ' flex flex-col'}>
        <header className={isCompact ? 'border-b border-zinc-200 pb-2' : 'border-b border-zinc-200 pb-3'}>
          <div className={isCompact ? 'text-sm font-bold' : 'text-base font-bold'}>{resume.basics.fullName}</div>
          {resume.basics.headline ? (
            <div className="mt-0.5 text-zinc-600">{resume.basics.headline}</div>
          ) : null}
          <div className="mt-1 text-zinc-500">
            {[resume.basics.email, resume.basics.phone, resume.basics.location].filter(Boolean).join(' · ')}
          </div>
        </header>

        {sections.includes('summary') && resume.basics.summary ? (
          <Section title="Summary" compact={isCompact} className={hl('summary')}>
            <p className="text-zinc-700">{resume.basics.summary}</p>
          </Section>
        ) : null}

        {sections.includes('experience') && (resume.experience?.length ?? 0) > 0 ? (
          <Section title="Experience" compact={isCompact} className={hl('experience')}>
            <div className="space-y-2">
              {resume.experience!.map((e, i) => (
                <div key={i}>
                  <div className="font-semibold text-zinc-800">
                    {e.title} — {e.company}
                  </div>
                  {(e.startDate || e.endDate) && (
                    <div className="text-zinc-500">
                      {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  )}
                  <ul className="mt-0.5 list-disc pl-4 text-zinc-700">
                    {(e.highlights ?? []).slice(0, isCompact ? 2 : 4).map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {sections.includes('projects') && (resume.projects?.length ?? 0) > 0 ? (
          <Section title="Projects" compact={isCompact}>
            <div className="space-y-2">
              {resume.projects!.map((p, i) => (
                <div key={i}>
                  <div className="font-semibold text-zinc-800">{p.name}</div>
                  {p.description ? <div className="text-zinc-600">{p.description}</div> : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {sections.includes('skills') && (resume.skills?.length ?? 0) > 0 ? (
          <Section title="Skills" compact={isCompact} className={hl('skills')}>
            <div className="space-y-1">
              {resume.skills!.map((s, i) => (
                <div key={i}>
                  <span className="font-medium text-zinc-800">{s.category}:</span>{' '}
                  <span className="text-zinc-700">{s.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {sections.includes('education') && (resume.education?.length ?? 0) > 0 ? (
          <Section title="Education" compact={isCompact} className={hl('education')}>
            <div className="space-y-1">
              {resume.education!.map((ed, i) => (
                <div key={i}>
                  <div className="font-semibold text-zinc-800">{ed.school}</div>
                  <div className="text-zinc-600">
                    {[ed.degree, ed.field].filter(Boolean).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  )
}

function Section({ title, children, compact, className = '' }: { title: string; children: React.ReactNode; compact?: boolean; className?: string }) {
  return (
    <section className={className}>
      <div className={'font-semibold uppercase tracking-wide text-zinc-500 ' + (compact ? 'text-[9px]' : 'text-[10px]')}>
        {title}
      </div>
      <div className="mt-1">{children}</div>
    </section>
  )
}
