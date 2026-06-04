import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, DEMO_MODE } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Alert, Brand, Button, Card, DemoPill, Field, Input } from '../components/ui'

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
    const from = (loc.state as { from?: string } | null)?.from
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
    <div className="mesh-bg flex min-h-full flex-col">
      <header className="glass-nav">
        <div className="mx-auto flex h-[72px] max-w-lg items-center justify-between px-6">
          <Link to="/">
            <Brand />
          </Link>
          {DEMO_MODE ? <DemoPill /> : null}
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/25 blur-[80px]" />
        <Card elevated className="relative w-full max-w-[420px] p-8 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'register' ? 'Create account' : 'Welcome back'}
          </h1>

          <form onSubmit={onAuth} className="mt-8 grid gap-5">
            {mode === 'register' ? (
              <Field label="Name">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
              </Field>
            ) : null}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </Field>
            {error ? <Alert tone="error">{error}</Alert> : null}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? '…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            {mode === 'register' ? (
              <>
                Have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-semibold text-sky-400 hover:text-sky-300">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button type="button" onClick={() => setMode('register')} className="font-semibold text-sky-400 hover:text-sky-300">
                  Create account
                </button>
              </>
            )}
          </p>
        </Card>
      </main>
    </div>
  )
}
