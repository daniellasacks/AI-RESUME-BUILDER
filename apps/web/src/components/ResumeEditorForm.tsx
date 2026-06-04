import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { ResumeJson } from '../lib/resumeSchema'

const input =
  'h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500'
const textarea =
  'w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500'

export function ResumeEditorForm({
  draft,
  setDraft,
}: {
  draft: ResumeJson
  setDraft: Dispatch<SetStateAction<ResumeJson | null>>
}) {
  const basics = draft.basics

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="text-sm font-semibold text-zinc-100">Basics</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Full name">
            <input
              value={basics.fullName}
              onChange={(e) => setDraft((d) => (d ? { ...d, basics: { ...d.basics, fullName: e.target.value } } : d))}
              className={input}
            />
          </Field>
          <Field label="Headline">
            <input
              value={basics.headline ?? ''}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, basics: { ...d.basics, headline: e.target.value || undefined } } : d))
              }
              className={input}
            />
          </Field>
          <Field label="Email">
            <input
              value={basics.email ?? ''}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, basics: { ...d.basics, email: e.target.value || undefined } } : d))
              }
              className={input}
            />
          </Field>
          <Field label="Phone">
            <input
              value={basics.phone ?? ''}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, basics: { ...d.basics, phone: e.target.value || undefined } } : d))
              }
              className={input}
            />
          </Field>
          <Field label="Location" className="sm:col-span-2">
            <input
              value={basics.location ?? ''}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, basics: { ...d.basics, location: e.target.value || undefined } } : d))
              }
              className={input}
            />
          </Field>
        </div>
        <Field label="Summary" className="mt-3">
          <textarea
            rows={5}
            value={basics.summary ?? ''}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, basics: { ...d.basics, summary: e.target.value || undefined } } : d))
            }
            className={textarea}
          />
        </Field>
      </section>

      <ListSection
        title="Experience"
        emptyLabel="Add experience"
        onAdd={() =>
          setDraft((d) =>
            d
              ? {
                  ...d,
                  experience: [
                    ...(d.experience ?? []),
                    { company: '', title: '', highlights: [''] },
                  ],
                }
              : d,
          )
        }
      >
        {(draft.experience ?? []).map((exp, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setDraft((d) =>
                    d ? { ...d, experience: (d.experience ?? []).filter((_, j) => j !== i) } : d,
                  )
                }
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                Remove
              </button>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Field label="Company">
                <input
                  value={exp.company}
                  onChange={(e) => updateItem(setDraft, 'experience', i, { company: e.target.value })}
                  className={input}
                />
              </Field>
              <Field label="Title">
                <input
                  value={exp.title}
                  onChange={(e) => updateItem(setDraft, 'experience', i, { title: e.target.value })}
                  className={input}
                />
              </Field>
              <Field label="Start">
                <input
                  value={exp.startDate ?? ''}
                  onChange={(e) =>
                    updateItem(setDraft, 'experience', i, { startDate: e.target.value || undefined })
                  }
                  className={input}
                  placeholder="2022-01"
                />
              </Field>
              <Field label="End">
                <input
                  value={exp.endDate ?? ''}
                  onChange={(e) => updateItem(setDraft, 'experience', i, { endDate: e.target.value || undefined })}
                  className={input}
                  placeholder="Present"
                />
              </Field>
            </div>
            <Field label="Highlights (one per line)" className="mt-3">
              <textarea
                rows={4}
                value={(exp.highlights ?? []).join('\n')}
                onChange={(e) =>
                  updateItem(setDraft, 'experience', i, {
                    highlights: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className={textarea}
              />
            </Field>
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Skills"
        emptyLabel="Add skill group"
        onAdd={() =>
          setDraft((d) =>
            d ? { ...d, skills: [...(d.skills ?? []), { category: 'Technical', items: [''] }] } : d,
          )
        }
      >
        {(draft.skills ?? []).map((sk, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => (d ? { ...d, skills: (d.skills ?? []).filter((_, j) => j !== i) } : d))
                }
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                Remove
              </button>
            </div>
            <Field label="Category" className="mt-2">
              <input
                value={sk.category}
                onChange={(e) => updateItem(setDraft, 'skills', i, { category: e.target.value })}
                className={input}
              />
            </Field>
            <Field label="Skills (comma-separated)" className="mt-2">
              <input
                value={sk.items.join(', ')}
                onChange={(e) =>
                  updateItem(setDraft, 'skills', i, {
                    items: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className={input}
              />
            </Field>
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Projects"
        emptyLabel="Add project"
        onAdd={() =>
          setDraft((d) =>
            d ? { ...d, projects: [...(d.projects ?? []), { name: '', description: '' }] } : d,
          )
        }
      >
        {(draft.projects ?? []).map((p, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => (d ? { ...d, projects: (d.projects ?? []).filter((_, j) => j !== i) } : d))
                }
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                Remove
              </button>
            </div>
            <Field label="Name" className="mt-2">
              <input
                value={p.name}
                onChange={(e) => updateItem(setDraft, 'projects', i, { name: e.target.value })}
                className={input}
              />
            </Field>
            <Field label="Description" className="mt-2">
              <textarea
                rows={3}
                value={p.description ?? ''}
                onChange={(e) =>
                  updateItem(setDraft, 'projects', i, { description: e.target.value || undefined })
                }
                className={textarea}
              />
            </Field>
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Education"
        emptyLabel="Add education"
        onAdd={() =>
          setDraft((d) => (d ? { ...d, education: [...(d.education ?? []), { school: '' }] } : d))
        }
      >
        {(draft.education ?? []).map((ed, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => (d ? { ...d, education: (d.education ?? []).filter((_, j) => j !== i) } : d))
                }
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                Remove
              </button>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Field label="School">
                <input
                  value={ed.school}
                  onChange={(e) => updateItem(setDraft, 'education', i, { school: e.target.value })}
                  className={input}
                />
              </Field>
              <Field label="Degree">
                <input
                  value={ed.degree ?? ''}
                  onChange={(e) => updateItem(setDraft, 'education', i, { degree: e.target.value || undefined })}
                  className={input}
                />
              </Field>
            </div>
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Certifications"
        emptyLabel="Add certification"
        onAdd={() =>
          setDraft((d) => (d ? { ...d, certifications: [...(d.certifications ?? []), { name: '' }] } : d))
        }
      >
        {(draft.certifications ?? []).map((c, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setDraft((d) =>
                    d ? { ...d, certifications: (d.certifications ?? []).filter((_, j) => j !== i) } : d,
                  )
                }
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                Remove
              </button>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input
                  value={c.name}
                  onChange={(e) => updateItem(setDraft, 'certifications', i, { name: e.target.value })}
                  className={input}
                />
              </Field>
              <Field label="Issuer">
                <input
                  value={c.issuer ?? ''}
                  onChange={(e) =>
                    updateItem(setDraft, 'certifications', i, { issuer: e.target.value || undefined })
                  }
                  className={input}
                />
              </Field>
            </div>
          </div>
        ))}
      </ListSection>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={'grid gap-1 ' + className}>
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

function ListSection({
  title,
  children,
  onAdd,
  emptyLabel,
}: {
  title: string
  children: ReactNode
  onAdd: () => void
  emptyLabel: string
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
        >
          {emptyLabel}
        </button>
      </div>
      <div className="mt-3 grid gap-3">{children}</div>
    </section>
  )
}

function updateItem<K extends 'experience' | 'skills' | 'projects' | 'education' | 'certifications'>(
  setDraft: Dispatch<SetStateAction<ResumeJson | null>>,
  key: K,
  index: number,
  patch: Partial<NonNullable<ResumeJson[K]>[number]>,
) {
  setDraft((d) => {
    if (!d) return d
    const list = [...((d[key] as any[]) ?? [])]
    list[index] = { ...list[index], ...patch }
    return { ...d, [key]: list }
  })
}
