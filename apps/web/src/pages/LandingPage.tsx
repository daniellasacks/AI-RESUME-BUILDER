import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { PRODUCT_NAME } from '../lib/brand'
import { cvAfter, cvBefore } from '../lib/marketingSamples'
import { BeforeAfterCv } from '../components/BeforeAfterCv'
import { BuilderMockup } from '../components/BuilderMockup'
import { Brand, Button, ButtonLink } from '../components/ui'

const flow = [
  { n: '1', title: 'Answer questions', desc: 'Guided form — no blank page syndrome.' },
  { n: '2', title: 'AI builds your CV', desc: 'Professional copy, ATS structure, instant preview.' },
  { n: '3', title: 'Tailor & download', desc: 'Paste any job posting and optimize in one click.' },
]

export function LandingPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const start = user ? '/app/create' : '/auth?mode=register'

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Brand />
          {user ? (
            <Button onClick={() => nav('/app/create')}>Create my CV</Button>
          ) : (
            <ButtonLink to="/auth">Sign in</ButtonLink>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.08),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="size-1.5 animate-pulse rounded-full bg-blue-500" />
              AI transforms your experience in seconds
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem]">
              Build a job-ready CV in minutes with AI
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-500">
              {PRODUCT_NAME} interviews you, writes ATS-friendly copy, and tailors your CV to any role — then exports a polished PDF.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={start} className="min-w-[160px]">
                Create my CV
              </ButtonLink>
              <ButtonLink to={user ? '/app/create?upload=1' : '/auth?mode=register&upload=1'} variant="secondary">
                Upload existing CV
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-slate-400">Free demo · No credit card · PDF export included</p>
          </div>
          <div className="lg:pl-4">
            <BuilderMockup />
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-emerald-600">The AI difference</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">See the transformation</h2>
          <p className="mt-3 text-slate-500">Same facts. Professional language, metrics, and ATS-friendly structure.</p>
        </div>
        <div className="mt-12">
          <BeforeAfterCv before={cvBefore} after={cvAfter} />
        </div>
      </section>

      {/* Job tailoring — key feature */}
      <section className="border-y border-slate-200 bg-gradient-to-b from-blue-50/50 to-white py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-blue-600">Core feature</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Optimize for any job in one click</h2>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Paste a job link or description. AI rewrites your summary and bullets to match keywords recruiters and ATS systems look for.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-blue-500">✓</span> Paste job URL or full posting</li>
              <li className="flex gap-2"><span className="text-blue-500">✓</span> Instant ATS match score</li>
              <li className="flex gap-2"><span className="text-blue-500">✓</span> Version history per role</li>
            </ul>
            <ButtonLink to={start} className="mt-8">
              Try job tailoring
            </ButtonLink>
          </div>
          <div className="saas-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target job</p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Senior Frontend Developer · Acme Corp
            </div>
            <div className="mt-4 w-full rounded-[12px] bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white opacity-90">
              Optimize CV for this job
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-medium text-emerald-800">ATS match</span>
              <span className="text-2xl font-bold text-emerald-600">91</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {flow.map((s) => (
            <div key={s.n} className="saas-card p-8">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white">{s.n}</span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <ButtonLink to={start} className="min-w-[200px]">
            Get started — it&apos;s free
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10 text-center text-sm text-slate-500">
        <p className="font-medium text-slate-700">{PRODUCT_NAME}</p>
        <p className="mt-1">
          Portfolio project by{' '}
          <a href="https://daniellasacks.github.io/portfolio/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Daniella Azar
          </a>
        </p>
      </footer>
    </div>
  )
}
