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
      ? 'border-white/10 bg-zinc-900/90 text-white backdrop-blur-xl'
      : t.kind === 'error'
        ? 'border-red-500/30 bg-zinc-900/90 text-red-300 backdrop-blur-xl'
        : 'border-white/10 bg-zinc-900/90 text-zinc-300 backdrop-blur-xl'

  return (
    <div className={'rounded-[12px] border px-3 py-2.5 shadow-sm ' + colors}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">{t.title}</div>
          {t.message ? <div className="mt-0.5 text-xs text-slate-500">{t.message}</div> : null}
        </div>
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-700">
          ×
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

