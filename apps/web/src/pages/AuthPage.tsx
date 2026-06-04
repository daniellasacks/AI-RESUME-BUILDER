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
    <div className="flex min-h-full flex-col">
      <header className="glass">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-5">
          <Link to="/">
            <Brand />
          </Link>
          {DEMO_MODE ? <DemoPill /> : null}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-xl font-semibold text-white">{mode === 'register' ? 'Create account' : 'Welcome back'}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === 'register' ? 'Start building your resume.' : 'Sign in to continue.'}
          </p>

          <form onSubmit={onAuth} className="mt-8 grid gap-4">
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

          <p className="mt-6 text-center text-sm text-zinc-500">
            {mode === 'register' ? (
              <>
                Have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-medium text-indigo-400 hover:text-indigo-300">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button type="button" onClick={() => setMode('register')} className="font-medium text-indigo-400 hover:text-indigo-300">
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
