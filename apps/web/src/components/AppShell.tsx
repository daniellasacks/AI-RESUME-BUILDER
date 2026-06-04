import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DEMO_MODE } from '../lib/api'
import { ErrorBoundary } from './ErrorBoundary'

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
        CV
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-zinc-50">AI Resume SaaS</div>
        <div className="text-xs text-zinc-400">Versions • ATS • Export</div>
      </div>
    </div>
  )
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'rounded-xl px-3 py-2 text-sm font-medium transition ' +
        (isActive ? 'bg-zinc-900 text-zinc-50' : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-50')
      }
      end
    >
      {label}
    </NavLink>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <button onClick={() => nav('/app/dashboard')} className="text-left">
            <Brand />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs text-zinc-300 sm:block">
              Signed in as <span className="font-medium text-zinc-100">{user?.email ?? user?.id}</span>
            </div>
            <button
              onClick={() => {
                logout()
                nav('/', { replace: true })
              }}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {DEMO_MODE ? (
        <div className="border-b border-amber-900/60 bg-amber-950/30 px-4 py-2 text-center text-xs text-amber-100">
          Portfolio demo mode — sign up, edit resumes, run ATS checks, and export. Data is stored in your browser only.
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="sticky top-[84px] hidden h-[calc(100vh-110px)] flex-col gap-1 self-start overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-3 lg:flex">
          <SideLink to="/app/dashboard" label="Dashboard" />
          <SideLink to="/app/resumes" label="Resumes" />
          <SideLink to="/app/job-targets" label="Job Targets" />
          <SideLink to="/app/templates" label="Templates" />
          <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
            <div className="font-semibold text-zinc-100">Tip</div>
            <div className="mt-1 text-zinc-300">Create a base resume, then tailor versions per job target and export.</div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
            <SideLink to="/app/dashboard" label="Dashboard" />
            <SideLink to="/app/resumes" label="Resumes" />
            <SideLink to="/app/job-targets" label="Job Targets" />
            <SideLink to="/app/templates" label="Templates" />
          </div>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

