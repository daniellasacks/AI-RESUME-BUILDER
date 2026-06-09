import { useRef, useState } from 'react'

type Props = {
  onStartFresh: () => void
  onUpload: (file: File) => void
  uploadBusy: boolean
}

export function WelcomeScreen({ onStartFresh, onUpload, uploadBusy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function pickFile(file: File | undefined) {
    if (!file) return
    if (!/\.(pdf|docx?)$/i.test(file.name)) return
    onUpload(file)
  }

  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden px-6 py-10 md:px-10">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-teal-400/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">AI career coach</p>
        <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight text-stone-900 md:text-[2.35rem]">
          Turn your story into a <span className="text-gradient">sharp CV</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-600">
          Chat through your experience, or upload what you already have. Watch your resume take shape in real time.
        </p>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onStartFresh}
            className="group rounded-2xl border border-stone-200/80 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 transition group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M8 10h8M8 14h5M6 4h12a2 2 0 012 2v14l-4-2.5L12 20l-4-1.5V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-5 text-lg font-semibold text-stone-900">Start fresh</p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              Guided questions — ideal if you are building your first CV or switching fields.
            </p>
          </button>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              pickFile(e.dataTransfer.files[0])
            }}
            onClick={() => inputRef.current?.click()}
            className={
              'group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ' +
              (dragOver ? 'border-teal-400 bg-teal-50/40' : 'border-stone-300 bg-white/80 hover:border-teal-300')
            }
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-600 transition group-hover:bg-amber-50 group-hover:text-amber-700">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3v12m0 0l4-4m-4 4L8 11M4 19h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-5 text-lg font-semibold text-stone-900">Upload CV</p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              {uploadBusy ? 'Reading your file…' : 'PDF or Word — then tell us what to improve.'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {['Live preview', 'ATS-friendly', 'PDF export'].map((tag) => (
            <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
