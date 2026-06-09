export function Stepper({ steps, current }: { steps: readonly { label: string }[]; current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-0">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.label} className="flex flex-1 items-center">
            <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
              <span
                className={
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ' +
                  (done
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400')
                }
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={
                  'hidden truncate text-xs font-medium sm:block sm:text-sm ' +
                  (active ? 'text-slate-900' : 'text-slate-400')
                }
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div className={'mx-2 hidden h-px flex-1 sm:block ' + (done ? 'bg-emerald-300' : 'bg-slate-200')} />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
