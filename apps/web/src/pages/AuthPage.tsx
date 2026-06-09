import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api, DEMO_MODE } from '../lib/api'
import { useAuth } from '../lib/auth'
import { PRODUCT_NAME } from '../lib/brand'
import { Alert, Brand, Button, Card, DemoPill, Field, Input } from '../components/ui'

export function AuthPage() {
  const { user, setToken } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(sp.get('mode') === 'register' ? 'register' : 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('Daniella Azar')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const afterAuth = sp.get('upload') === '1' ? '/app/create?upload=1' : '/app/create'

  useEffect(() => {
    if (!user) return
    const from = (loc.state as { from?: string } | null)?.from
    nav(typeof from === 'string' ? from : afterAuth, { replace: true })
  }, [user, nav, loc.state, afterAuth])

  async function onAuth(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login'
      const body = mode === 'register' ? { email, password, fullName: fullName || undefined } : { email, password }
      const res = await api<{ token: string }>(path, { method: 'POST', body: JSON.stringify(body) })
      setToken(res.token)
      nav(afterAuth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f7f8fa]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-6">
          <Link to="/">
            <Brand />
          </Link>
          {DEMO_MODE ? <DemoPill /> : null}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-xl font-semibold text-[#111827]">{mode === 'register' ? 'Create account' : 'Sign in'}</h1>
          <p className="mt-1 text-sm text-[#6b7280]">{PRODUCT_NAME}</p>

          <form onSubmit={onAuth} className="mt-8 grid gap-4">
            {mode === 'register' ? (
              <Field label="Name">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
            ) : null}
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            </Field>
            {error ? <Alert tone="error">{error}</Alert> : null}
            <Button type="submit" loading={busy} className="w-full">
              {mode === 'register' ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b7280]">
            {mode === 'register' ? (
              <>
                Have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-medium text-[#2563eb]">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button type="button" onClick={() => setMode('register')} className="font-medium text-[#2563eb]">
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
