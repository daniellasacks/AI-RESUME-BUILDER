import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex size-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 4h10v3H7V4zm0 6h7v3H7v-3zm0 6h10v3H7v-3z"
            fill="white"
            fillOpacity="0.95"
          />
        </svg>
      </div>
      {!compact ? (
        <div>
          <span className="block text-[15px] font-bold tracking-tight text-white">Resumely</span>
          <span className="block text-[10px] font-medium text-zinc-500">Resume studio</span>
        </div>
      ) : null}
    </div>
  )
}

export function DemoPill() {
  return (
    <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-sky-300">
      Live demo
    </span>
  )
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
      <span className="size-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
      {children}
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '', elevated }: { children: ReactNode; className?: string; elevated?: boolean }) {
  return (
    <div className={(elevated ? 'surface-raised' : 'surface') + ' rounded-2xl ' + className}>{children}</div>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={'surface-raised min-h-0 rounded-2xl ' + className}>{children}</div>
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="surface rounded-xl px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1.5 text-3xl font-bold tabular-nums tracking-tight text-white">{value}</div>
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }

export function Button({ variant = 'primary', className = '', children, ...props }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:pointer-events-none disabled:opacity-45'
  const styles = {
    primary:
      'bg-white px-5 py-2.5 text-zinc-950 shadow-lg shadow-white/10 hover:bg-zinc-100 active:scale-[0.98]',
    secondary:
      'surface px-5 py-2.5 text-zinc-200 hover:border-white/20 hover:bg-zinc-800/80 active:scale-[0.98]',
    ghost: 'px-3 py-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  variant = 'primary',
  className = '',
  children,
}: {
  to: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  children: ReactNode
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200'
  const styles = {
    primary: 'bg-white px-5 py-2.5 text-zinc-950 shadow-lg shadow-white/10 hover:bg-zinc-100',
    secondary: 'surface px-5 py-2.5 text-zinc-200 hover:border-white/20 hover:bg-zinc-800/80',
    ghost: 'px-3 py-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white',
  }
  return (
    <Link to={to} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

const fieldCls =
  'w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldCls + ' h-11 ' + className} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={fieldCls + ' py-3 ' + className} {...props} />
}

export function Alert({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  const styles =
    tone === 'error'
      ? 'border-rose-500/25 bg-rose-500/10 text-rose-100'
      : 'border-sky-500/25 bg-sky-500/10 text-sky-100'
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-zinc-800/60 ${className}`} />
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 px-8 py-16 text-center">
      <p className="text-sm text-zinc-500">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
