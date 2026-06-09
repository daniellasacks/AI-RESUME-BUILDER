import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { PRODUCT_NAME } from '../lib/brand'
import { Brand, Button, ButtonLink } from '../components/ui'

const steps = [
  { title: 'Answer questions', desc: 'Quick guided form' },
  { title: 'AI builds your CV', desc: 'Professional, ATS-ready copy' },
  { title: 'Edit & download', desc: 'Tailor and export PDF' },
]

function ProductMockup() {
  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] px-4 py-3">
        <span className="size-2 rounded-full bg-[#e5e7eb]" />
        <span className="size-2 rounded-full bg-[#e5e7eb]" />
        <span className="size-2 rounded-full bg-[#e5e7eb]" />
      </div>
      <div className="grid md:grid-cols-2">
        <div className="space-y-2 border-[#e5e7eb] p-5 md:border-r">
          <div className="h-8 rounded-[8px] bg-[#2563eb]/10" />
          <div className="h-8 rounded-[8px] border border-[#e5e7eb]" />
          <div className="h-8 rounded-[8px] border border-[#e5e7eb]" />
        </div>
        <div className="bg-[#f7f8fa] p-5">
          <div className="mx-auto max-w-[140px] rounded border border-[#e5e7eb] bg-white p-4">
            <div className="h-2 w-16 rounded bg-[#111827]" />
            <div className="mt-2 h-1.5 w-24 rounded bg-[#e5e7eb]" />
            <div className="mt-4 space-y-1.5">
              <div className="h-1.5 w-full rounded bg-[#e5e7eb]" />
              <div className="h-1.5 w-4/5 rounded bg-[#e5e7eb]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const start = user ? '/app/create' : '/auth?mode=register'

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Brand />
          {user ? (
            <Button onClick={() => nav('/app/create')}>Create CV</Button>
          ) : (
            <ButtonLink to="/auth" variant="secondary">
              Sign in
            </ButtonLink>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#111827] md:text-4xl">
              Build a job-ready CV in minutes with AI
            </h1>
            <p className="mt-4 text-[#6b7280] leading-relaxed">
              {PRODUCT_NAME} turns your experience into a polished, ATS-friendly CV — then helps you tailor it to any role.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={start}>Create CV</ButtonLink>
              <ButtonLink to={user ? '/app/create?upload=1' : '/auth?mode=register&upload=1'} variant="secondary">
                Upload CV
              </ButtonLink>
            </div>
          </div>
          <ProductMockup />
        </div>

        <section className="mt-24">
          <h2 className="text-lg font-semibold text-[#111827]">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="surface p-6">
                <span className="text-sm font-medium text-[#2563eb]">{i + 1}</span>
                <h3 className="mt-2 font-medium text-[#111827]">{s.title}</h3>
                <p className="mt-1 text-sm text-[#6b7280]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e7eb] py-8 text-center text-xs text-[#6b7280]">
        {PRODUCT_NAME} ·{' '}
        <a href="https://daniellasacks.github.io/portfolio/" className="text-[#2563eb] hover:underline" target="_blank" rel="noopener noreferrer">
          Daniella Azar
        </a>
      </footer>
    </div>
  )
}
