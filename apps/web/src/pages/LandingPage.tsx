import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Brand, ButtonLink, Card } from '../components/ui'

const features = [
  { icon: '◇', title: 'Version history', desc: 'Every edit saved' },
  { icon: '◎', title: 'Job tailoring', desc: 'Per role & company' },
  { icon: '◆', title: 'ATS score', desc: 'Keywords & tips' },
  { icon: '▣', title: 'Export', desc: 'PDF & DOCX' },
]

export function LandingPage() {
  const { user } = useAuth()
  const nav = useNavigate()

  return (
    <div className="min-h-full">
      <header className="glass sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Brand />
          {user ? (
            <button
              onClick={() => nav('/app/dashboard')}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400"
            >
              Open app
            </button>
          ) : (
            <ButtonLink to="/auth">Get started</ButtonLink>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-16 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div>
            <p className="text-sm font-medium text-indigo-400">AI-powered resume workspace</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              <span className="text-gradient">Resumes that land interviews.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-500">
              Upload, tailor to any job, track versions, and export — in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/auth">Start free</ButtonLink>
              <a
                href="https://github.com/daniellasacks/AI-RESUME-BUILDER"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.05]"
              >
                GitHub
              </a>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-lg text-indigo-400/80">{f.icon}</div>
                  <div className="mt-2 text-xs font-semibold text-zinc-200">{f.title}</div>
                  <div className="text-[11px] text-zinc-600">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden p-1 shadow-2xl shadow-indigo-500/10">
            <div className="rounded-[14px] bg-[#0c0c0e] p-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-zinc-700" />
                  <span className="size-2.5 rounded-full bg-zinc-700" />
                  <span className="size-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-[10px] text-zinc-600">v3 · Tailored</span>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="h-3 w-32 rounded bg-white/10" />
                  <div className="mt-2 h-2 w-48 rounded bg-white/[0.06]" />
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">ATS score</div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-semibold text-emerald-400">84</span>
                    <span className="mb-1 text-xs text-zinc-500">Strong match</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-indigo-500/10 px-3 py-2 text-center text-[11px] font-medium text-indigo-300">
                    PDF
                  </div>
                  <div className="rounded-lg border border-white/[0.08] px-3 py-2 text-center text-[11px] text-zinc-500">
                    DOCX
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-indigo-500/20 blur-3xl" />
          </Card>
        </div>
      </main>
    </div>
  )
}
