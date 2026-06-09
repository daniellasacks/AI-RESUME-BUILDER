import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME } from '../lib/brand'

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-[11px] font-bold text-white shadow-md shadow-indigo-500/25">
        ✦
      </div>
      {!compact ? <span className="text-sm font-semibold text-[#0f172a]">{PRODUCT_NAME}</span> : null}
    </div>
  )
}

export function DemoPill() {
  return (
    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600">
      Demo
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-[#0f172a]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '', elevated }: { children: ReactNode; className?: string; elevated?: boolean }) {
  void elevated
  return <div className={'surface ' + className}>{children}</div>
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="surface px-4 py-4">
      <div className="text-xs text-[#64748b]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#0f172a]">{value}</div>
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean }

export function Button({ variant = 'primary', className = '', loading, children, disabled, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition disabled:opacity-50'
  const styles = {
    primary: 'gradient-btn px-5 py-2.5 text-white',
    secondary: 'border border-[#e2e8f0] bg-white px-5 py-2.5 text-[#0f172a] shadow-sm hover:bg-indigo-50/50',
    ghost: 'px-3 py-2 text-[#64748b] hover:bg-indigo-50/60 hover:text-[#0f172a]',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
          {children}
        </>
      ) : (
        children
      )}
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
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition'
  const styles = {
    primary: 'gradient-btn px-5 py-2.5 text-white',
    secondary: 'border border-[#e2e8f0] bg-white px-5 py-2.5 text-[#0f172a] shadow-sm hover:bg-indigo-50/50',
    ghost: 'px-3 py-2 text-[#64748b] hover:bg-indigo-50/60',
  }
  return (
    <Link to={to} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  )
}

export function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      {label ? <span className="text-sm font-medium text-[#0f172a]">{label}</span> : null}
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={'field-input ' + className} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={'field-textarea ' + className} {...props} />
}

export function Alert({ tone, children }: { tone: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-indigo-100 bg-indigo-50/50 text-indigo-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#e2e8f0]/60 ${className}`} />
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="surface border-dashed px-8 py-16 text-center">
      <p className="text-sm text-[#64748b]">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function StatusLine({ children }: { children: ReactNode }) {
  return <p className="text-xs text-indigo-600">{children}</p>
}

export function AiHint({ children }: { children: ReactNode }) {
  return <StatusLine>{children}</StatusLine>
}

export function ChangeBanner() {
  return null
}
