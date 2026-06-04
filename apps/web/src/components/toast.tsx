import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type ToastKind = 'success' | 'error' | 'info'
export type Toast = {
  id: string
  kind: ToastKind
  title: string
  message?: string
}

type ToastApi = {
  push: (t: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const Ctx = createContext<ToastApi | null>(null)

function ToastItem({ t, onClose }: { t: Toast; onClose: () => void }) {
  const colors =
    t.kind === 'success'
      ? 'border-emerald-900 bg-emerald-950/40 text-emerald-100'
      : t.kind === 'error'
        ? 'border-rose-900 bg-rose-950/40 text-rose-100'
        : 'border-zinc-800 bg-zinc-950 text-zinc-100'

  return (
    <div className={'rounded-2xl border p-3 shadow-xl backdrop-blur ' + colors}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{t.title}</div>
          {t.message ? <div className="mt-0.5 text-xs opacity-90">{t.message}</div> : null}
        </div>
        <button onClick={onClose} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-800">
          Close
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [{ id, ...t }, ...prev].slice(0, 4))
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4500)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (title, message) => push({ kind: 'success', title, message }),
      error: (title, message) => push({ kind: 'error', title, message }),
      info: (title, message) => push({ kind: 'info', title, message }),
    }),
    [push],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 grid w-[min(420px,calc(100vw-2rem))] gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem t={t} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToasts() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useToasts must be used inside ToastProvider')
  return v
}

