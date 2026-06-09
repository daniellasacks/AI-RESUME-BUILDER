import { useAuth } from '../lib/auth'
import { Brand, ButtonLink } from '../components/ui'

export function LandingPage() {
  const { user } = useAuth()
  const start = user ? '/app/chat' : '/auth?mode=register'

  return (
    <div className="flex min-h-full flex-col bg-[#f7f8fa]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Brand />
          {user ? (
            <ButtonLink to="/app/chat">Start Chat</ButtonLink>
          ) : (
            <ButtonLink to="/auth" variant="secondary">
              Sign in
            </ButtonLink>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#111827] md:text-4xl">
          Build your CV through a simple AI conversation
        </h1>
        <p className="mt-4 max-w-md text-[#6b7280] leading-relaxed">
          No forms. No templates. Just answer a few questions.
        </p>
        <div className="mt-10">
          <ButtonLink to={start}>Start Chat</ButtonLink>
        </div>
      </main>

      <footer className="border-t border-[#e5e7eb] py-8 text-center text-xs text-[#6b7280]">
        <a href="https://daniellasacks.github.io/portfolio/" className="text-[#2563eb] hover:underline" target="_blank" rel="noopener noreferrer">
          Daniella Azar
        </a>
      </footer>
    </div>
  )
}
