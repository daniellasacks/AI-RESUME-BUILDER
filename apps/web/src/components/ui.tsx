import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/25">
        CV
      </div>
      {!compact ? (
        <div>
          <span className="block text-sm font-bold text-slate-900">Career Profile</span>
          <span className="block text-[10px] font-medium text-slate-500">AI CV Builder</span>
        </div>
      ) : null}
    </div>
  )
}

export function DemoPill() {
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
      Demo
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '', elevated }: { children: ReactNode; className?: string; elevated?: boolean }) {
  return (
    <div className={(elevated ? 'saas-card shadow-md ' : 'saas-card ') + className}>{children}</div>
  )
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="saas-card px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }

export function Button({ variant = 'primary', className = '', children, ...props }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[12px] text-sm font-semibold transition disabled:opacity-50'
  const styles = {
    primary: 'bg-blue-600 px-5 py-2.5 text-white shadow-sm hover:bg-blue-700',
    secondary: 'border border-slate-200 bg-white px-5 py-2.5 text-slate-700 hover:bg-slate-50',
    ghost: 'px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900',
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
  const base = 'inline-flex items-center justify-center gap-2 rounded-[12px] text-sm font-semibold transition'
  const styles = {
    primary: 'bg-blue-600 px-5 py-2.5 text-white shadow-sm hover:bg-blue-700',
    secondary: 'border border-slate-200 bg-white px-5 py-2.5 text-slate-700 hover:bg-slate-50',
    ghost: 'px-3 py-2 text-slate-500 hover:bg-slate-100',
  }
  return (
    <Link to={to} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={'saas-input ' + className} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={'saas-textarea ' + className} {...props} />
}

export function Alert({ tone, children }: { tone: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>
}

export function AiHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs leading-relaxed text-blue-800">
      <span className="font-semibold">AI tip · </span>
      {children}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/60 ${className}`} />
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-16 text-center">
      <p className="text-sm text-slate-500">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
