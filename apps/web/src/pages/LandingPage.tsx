import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Brand, ButtonLink } from '../components/ui'

export function LandingPage() {
  const { user } = useAuth()

  if (user) return <Navigate to="/app/chat" replace />

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Brand />
          <ButtonLink to="/auth" variant="ghost">
            Sign in
          </ButtonLink>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-md text-3xl font-bold tracking-tight text-slate-900">
          Build your CV through a simple AI conversation
        </h1>
        <p className="mt-4 max-w-sm text-slate-500">
          No forms. No templates. Just answer a few questions.
        </p>
        <div className="mt-8">
          <ButtonLink to="/auth?mode=register" className="!px-8 !py-3">
            Start Chat
          </ButtonLink>
        </div>
      </main>
    </div>
  )
}
