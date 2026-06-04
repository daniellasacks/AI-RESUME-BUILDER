import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DEMO_MODE } from '../lib/api'
import { Brand, Button, DemoPill } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

const nav = [
  { to: '/app/dashboard', label: 'Home' },
  { to: '/app/resumes', label: 'Resumes' },
  { to: '/app/job-targets', label: 'Jobs' },
  { to: '/app/templates', label: 'Templates' },
]

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to.endsWith('dashboard')}
      className={({ isActive }) =>
        'rounded-lg px-3 py-2 text-sm font-medium transition ' +
        (isActive ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200')
      }
    >
      {label}
    </NavLink>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const navTo = useNavigate()

  return (
    <div className="min-h-full">
      <header className="glass sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <button type="button" onClick={() => navTo('/app/dashboard')} className="text-left">
            <Brand />
          </button>
          <div className="flex items-center gap-3">
            {DEMO_MODE ? <DemoPill /> : null}
            <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">{user?.email}</span>
            <Button
              variant="ghost"
              className="!px-2 !py-1.5 text-xs"
              onClick={() => {
                logout()
                navTo('/', { replace: true })
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 lg:hidden">
          {nav.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-0.5">
              {nav.map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} />
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  )
}
