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
    <div className="flex h-full flex-col justify-center px-6 py-10 md:px-12">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">AI career coach</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-stone-900 md:text-[3.25rem]">
          Your story,
          <br />
          <span className="text-gradient">told sharply.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-stone-600">
          Answer a short interview — or upload the CV you have — and watch a polished, job-ready resume build itself beside you.
        </p>

        <div className="mt-10 space-y-3">
          <button
            type="button"
            onClick={onStartFresh}
            className="group flex w-full items-center gap-5 rounded-2xl bg-teal-700 p-5 text-left shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M8 10h8M8 14h5M6 4h12a2 2 0 012 2v14l-4-2.5L12 20l-4-1.5V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-white">Start the interview</p>
              <p className="mt-0.5 text-sm text-teal-100">Eight quick questions. No CV needed.</p>
            </div>
            <span className="text-2xl text-teal-200 transition group-hover:translate-x-1 group-hover:text-white" aria-hidden>
              →
            </span>
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
              'group flex w-full cursor-pointer items-center gap-5 rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ' +
              (dragOver ? 'border-teal-400 bg-teal-50/60' : 'border-stone-200 hover:border-teal-300')
            }
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition group-hover:bg-teal-50 group-hover:text-teal-700">
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
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-stone-900">Upload your CV</p>
              <p className="mt-0.5 text-sm text-stone-500">
                {uploadBusy ? 'Reading your file…' : 'PDF or Word, then tell the coach what to improve.'}
              </p>
            </div>
            <span className="text-2xl text-stone-300 transition group-hover:translate-x-1 group-hover:text-teal-600" aria-hidden>
              →
            </span>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500">
          {['Live preview', 'ATS-friendly output', 'One-click PDF'].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-teal-600" aria-hidden>
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
