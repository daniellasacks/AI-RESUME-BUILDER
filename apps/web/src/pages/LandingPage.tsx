import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Brand, Button, ButtonLink } from '../components/ui'

const steps = [
  { n: '1', title: 'Answer questions', desc: 'A guided form collects your experience, skills, and target role.' },
  { n: '2', title: 'AI builds your CV', desc: 'Structured data becomes professional, ATS-friendly copy.' },
  { n: '3', title: 'Edit or download', desc: 'Refine with AI actions, save versions, export PDF.' },
]

export function LandingPage() {
  const { user } = useAuth()
  const nav = useNavigate()

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Brand />
          {user ? (
            <Button onClick={() => nav('/app/create')}>Create my CV</Button>
          ) : (
            <ButtonLink to="/auth">Sign in</ButtonLink>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600">AI Career Profile Builder</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
            Build a job-ready CV in minutes with AI
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-slate-500">
            Answer a few questions, let AI write your professional profile, then edit and download — like a modern SaaS product.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink to={user ? '/app/create' : '/auth?mode=register'} className="min-w-[180px]">
              Create my CV
            </ButtonLink>
            <ButtonLink to={user ? '/app/create?upload=1' : '/auth?mode=register&upload=1'} variant="secondary" className="min-w-[180px]">
              Upload existing CV
            </ButtonLink>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="saas-card p-6 text-center md:text-left">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                {s.n}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="saas-card mx-auto mt-16 max-w-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-slate-100 p-8 md:border-b-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Preview</p>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-inner">
                <div className="h-2 w-28 rounded bg-slate-200" />
                <div className="mt-2 h-2 w-40 rounded bg-slate-100" />
                <div className="mt-6 space-y-2">
                  <div className="h-2 w-full rounded bg-slate-100" />
                  <div className="h-2 w-5/6 rounded bg-slate-100" />
                  <div className="h-2 w-4/6 rounded bg-slate-100" />
                </div>
              </div>
            </div>
            <div className="bg-slate-50/50 p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ATS match</p>
              <p className="mt-3 text-4xl font-bold text-emerald-600">84</p>
              <p className="text-sm text-slate-500">Strong keyword alignment</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        Portfolio project by{' '}
        <a href="https://daniellasacks.github.io/portfolio/" className="font-medium text-slate-700 hover:text-blue-600" target="_blank" rel="noopener noreferrer">
          Daniella Azar
        </a>
      </footer>
    </div>
  )
}
