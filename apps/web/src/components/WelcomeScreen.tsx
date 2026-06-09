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
    const ok = /\.(pdf|docx?)$/i.test(file.name)
    if (!ok) return
    onUpload(file)
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        Build a professional CV with AI
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600">
        Answer a few guided questions, or upload an existing CV and tell the assistant what to change.
        Your resume updates live on the right as you go.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onStartFresh}
          className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-slate-900">Start from scratch</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            No CV yet? The assistant will interview you step by step.
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
            'cursor-pointer rounded-xl border-2 border-dashed p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ' +
            (dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md')
          }
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3v12m0 0l4-4m-4 4L8 11M4 19h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-slate-900">Upload existing CV</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {uploadBusy ? 'Reading your file…' : 'PDF or Word — then say what to update.'}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500">Demo mode — no sign-up required. Data stays in your browser.</p>
    </div>
  )
}
