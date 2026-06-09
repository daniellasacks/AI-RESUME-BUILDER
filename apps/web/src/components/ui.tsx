import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME } from '../lib/brand'

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-[10px] bg-indigo-500 text-[10px] font-bold text-white">
        CV
      </div>
      {!compact ? <span className="text-sm font-semibold tracking-tight text-[#111827]">{PRODUCT_NAME}</span> : null}
    </div>
  )
}

export function DemoPill() {
  return <span className="text-[11px] font-medium text-[#6b7280]">Demo</span>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#6b7280]">{subtitle}</p> : null}
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
      <div className="text-xs text-[#6b7280]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#111827]">{value}</div>
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean }

export function Button({ variant = 'primary', className = '', loading, children, disabled, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[12px] text-sm font-medium transition disabled:opacity-50'
  const styles = {
    primary: 'bg-indigo-500 px-4 py-2.5 text-white hover:bg-indigo-600',
    secondary: 'border border-[#e5e7eb] bg-white px-4 py-2.5 text-[#111827] hover:bg-[#f7f8fa]',
    ghost: 'px-3 py-2 text-[#6b7280] hover:bg-[#f7f8fa] hover:text-[#111827]',
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
  const base = 'inline-flex items-center justify-center gap-2 rounded-[12px] text-sm font-medium transition'
  const styles = {
    primary: 'bg-indigo-500 px-4 py-2.5 text-white hover:bg-indigo-600',
    secondary: 'border border-[#e5e7eb] bg-white px-4 py-2.5 text-[#111827] hover:bg-[#f7f8fa]',
    ghost: 'px-3 py-2 text-[#6b7280] hover:bg-[#f7f8fa]',
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
      {label ? <span className="text-sm font-medium text-[#111827]">{label}</span> : null}
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
    info: 'border-[#e5e7eb] bg-[#f7f8fa] text-[#6b7280]',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }
  return <div className={`rounded-[12px] border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[12px] bg-[#e5e7eb]/60 ${className}`} />
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="surface border-dashed px-8 py-16 text-center">
      <p className="text-sm text-[#6b7280]">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function StatusLine({ children }: { children: ReactNode }) {
  return <p className="text-xs text-[#6b7280]">{children}</p>
}

export function AiHint({ children }: { children: ReactNode }) {
  return <StatusLine>{children}</StatusLine>
}

export function ChangeBanner() {
  return null
}
