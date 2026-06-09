import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DEMO_MODE } from '../lib/api'
import { Brand, Button, DemoPill } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

const nav = [
  { to: '/app/create', label: 'Create CV', end: false },
  { to: '/app/resumes', label: 'My CVs', end: false },
  { to: '/app/job-targets', label: 'Jobs', end: false },
]

function NavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        'rounded-lg px-3 py-2 text-sm font-medium transition ' +
        (isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')
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
    <div className="min-h-full bg-[#f8fafc]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <button type="button" onClick={() => navTo('/app/create')}>
            <Brand />
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} end={item.end} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {DEMO_MODE ? <DemoPill /> : null}
            <span className="hidden max-w-[140px] truncate text-xs text-slate-400 sm:inline">{user?.email}</span>
            <Button variant="ghost" className="!px-2 text-xs" onClick={() => { logout(); navTo('/', { replace: true }) }}>
              Log out
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {nav.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} end={item.end} />
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
