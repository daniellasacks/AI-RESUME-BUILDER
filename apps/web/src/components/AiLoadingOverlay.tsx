import { useEffect, useState } from 'react'

const STEPS = [
  'Reading your experience…',
  'Writing professional summary…',
  'Structuring for ATS scanners…',
  'Tailoring to your target role…',
  'Final polish…',
]

export function AiLoadingOverlay({ open, onDone }: { open: boolean; onDone?: () => void }) {
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!open) {
      setStep(0)
      setTyped('')
      return
    }
    const line = STEPS[step] ?? STEPS[STEPS.length - 1]
    let i = 0
    setTyped('')
    const typeTimer = window.setInterval(() => {
      i++
      setTyped(line.slice(0, i))
      if (i >= line.length) window.clearInterval(typeTimer)
    }, 28)

    const stepTimer = window.setTimeout(() => {
      if (step < STEPS.length - 1) setStep((s) => s + 1)
      else onDone?.()
    }, 1400)

    return () => {
      window.clearInterval(typeTimer)
      window.clearTimeout(stepTimer)
    }
  }, [open, step, onDone])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="saas-card mx-4 w-full max-w-md p-8 text-center shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-blue-500/30">
          <span className="animate-pulse text-2xl">✦</span>
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-900">AI is building your CV</p>
        <p className="mt-3 min-h-[1.5rem] font-mono text-sm text-blue-600">
          {typed}
          <span className="animate-pulse">|</span>
        </p>
        <div className="mt-6 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={'h-1.5 w-8 rounded-full transition-all duration-500 ' + (i <= step ? 'bg-blue-500' : 'bg-slate-200')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
