import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-9 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/25">
        <span className="text-sm font-bold tracking-tight text-white">R</span>
        <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-indigo-400/40 to-violet-600/0" />
      </div>
      {!compact ? (
        <span className="text-[15px] font-semibold tracking-tight text-white">Resumely</span>
      ) : null}
    </div>
  )
}

export function DemoPill() {
  return (
    <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-300">
      Demo
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={'rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm ' + className}>
      {children}
    </div>
  )
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</div>
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }

export function Button({ variant = 'primary', className = '', children, ...props }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50'
  const styles = {
    primary: 'bg-indigo-500 px-4 py-2.5 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400',
    secondary: 'border border-white/10 bg-white/[0.04] px-4 py-2.5 text-zinc-200 hover:bg-white/[0.08]',
    ghost: 'px-3 py-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white',
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
  const base =
    'inline-flex items-center justify-center rounded-xl text-sm font-medium transition'
  const styles = {
    primary: 'bg-indigo-500 px-4 py-2.5 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400',
    secondary: 'border border-white/10 bg-white/[0.04] px-4 py-2.5 text-zinc-200 hover:bg-white/[0.08]',
    ghost: 'px-3 py-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white',
  }
  return (
    <Link to={to} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={
        'h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 ' +
        className
      }
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={
        'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 ' +
        className
      }
      {...props}
    />
  )
}

export function Alert({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  const styles =
    tone === 'error'
      ? 'border-rose-500/20 bg-rose-500/10 text-rose-200'
      : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200'
  return <div className={`rounded-xl border px-3 py-2 text-xs ${styles}`}>{children}</div>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.04] ${className}`} />
}
