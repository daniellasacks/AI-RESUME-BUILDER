import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function LandingPage() {
  const { user } = useAuth()
  const nav = useNavigate()

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
              CV
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zinc-50">AI Resume SaaS</div>
              <div className="text-xs text-zinc-400">Production-style portfolio project</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => nav('/app/dashboard')}
                className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white"
              >
                Open app
              </button>
            ) : (
              <Link
                to="/auth"
                className="h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-semibold text-white inline-flex items-center"
              >
                Get started
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="self-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
            <span className="text-zinc-100">SaaS features</span>
            <span className="text-zinc-500">•</span>
            <span>Versions</span>
            <span className="text-zinc-500">•</span>
            <span>Job targets</span>
            <span className="text-zinc-500">•</span>
            <span>ATS scoring</span>
            <span className="text-zinc-500">•</span>
            <span>PDF/DOCX export</span>
          </div>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Build tailored, ATS-friendly resumes with real version history.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-zinc-300">
            Upload an existing resume or start from scratch, store a structured “source of truth” JSON model, then generate
            job-specific versions, visualize ATS fit, and export to PDF/DOCX.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white inline-flex items-center"
            >
              Create an account
            </Link>
            <a
              href="https://github.com/daniellasacks/AI-RESUME-BUILDER"
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-900 inline-flex items-center"
            >
              View on GitHub
            </a>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              { t: 'Structured editor', d: 'Edit resume data as typed sections; every save becomes a version.' },
              { t: 'Job targets', d: 'Store each job description with company/role metadata for tailoring.' },
              { t: 'Version diffs', d: 'Compare versions to explain what changed and why.' },
              { t: 'Export pipeline', d: 'One-click PDF/DOCX download via server-side generation.' },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-sm font-semibold text-zinc-100">{x.t}</div>
                <div className="mt-1 text-xs leading-relaxed text-zinc-400">{x.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-950/60 p-6">
          <div className="text-sm font-semibold text-zinc-100">What you can demo in interviews</div>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            <li className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="font-semibold text-zinc-100">Data modeling</div>
              <div className="mt-1 text-xs text-zinc-400">Immutable resume versions, derived versions, and job-target linkage.</div>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="font-semibold text-zinc-100">AI safety</div>
              <div className="mt-1 text-xs text-zinc-400">Schema-validated JSON outputs + demo-mode fallbacks.</div>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="font-semibold text-zinc-100">Export & UX polish</div>
              <div className="mt-1 text-xs text-zinc-400">Download flows, loading states, error handling, and responsive UI.</div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}

