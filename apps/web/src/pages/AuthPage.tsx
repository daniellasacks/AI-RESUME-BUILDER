import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export function AuthPage() {
  const { user, setToken } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const from = (loc.state as any)?.from
    nav(typeof from === 'string' ? from : '/app/dashboard', { replace: true })
  }, [user, nav, loc.state])

  async function onAuth(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login'
      const body = mode === 'register' ? { email, password, fullName: fullName || undefined } : { email, password }
      const res = await api<{ token: string }>(path, { method: 'POST', body: JSON.stringify(body) })
      setToken(res.token)
      nav('/app/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
              CV
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zinc-50">AI Resume SaaS</div>
              <div className="text-xs text-zinc-400">Sign in to manage versions & exports</div>
            </div>
          </Link>
          <Link to="/" className="text-xs font-semibold text-zinc-300 hover:text-zinc-100">
            Back to landing
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
        <section className="hidden lg:block">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-sm font-semibold text-zinc-100">Why this is “production-style”</div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="font-semibold text-zinc-100">Clean API modules</div>
                <div className="mt-1 text-xs text-zinc-400">NestJS + Prisma with consistent error handling.</div>
              </li>
              <li className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="font-semibold text-zinc-100">Versioned domain model</div>
                <div className="mt-1 text-xs text-zinc-400">Immutable resume versions for auditability and diffs.</div>
              </li>
              <li className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="font-semibold text-zinc-100">Export pipeline</div>
                <div className="mt-1 text-xs text-zinc-400">Server-side PDF/DOCX generation for real deliverables.</div>
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <div className="text-base font-semibold text-zinc-100">{mode === 'register' ? 'Create account' : 'Sign in'}</div>
            <div className="mt-1 text-sm text-zinc-400">JWT auth + resume history + exports.</div>
          </div>
          <form onSubmit={onAuth} className="mt-5 grid gap-3">
            {mode === 'register' ? (
              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Full name (optional)</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500"
                  placeholder="Jane Doe"
                />
              </label>
            ) : null}
            <label className="grid gap-1">
              <span className="text-xs text-zinc-400">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500"
                placeholder="you@email.com"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-zinc-400">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-violet-500"
                placeholder="min 8 characters"
              />
            </label>
            {error ? <div className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-xs text-rose-200">{error}</div> : null}
            <button
              disabled={busy}
              className="h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Working…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <div className="mt-4 text-xs text-zinc-400">
            {mode === 'register' ? (
              <button onClick={() => setMode('login')} className="text-violet-300 hover:text-violet-200">
                Already have an account? Sign in
              </button>
            ) : (
              <button onClick={() => setMode('register')} className="text-violet-300 hover:text-violet-200">
                New here? Create an account
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

