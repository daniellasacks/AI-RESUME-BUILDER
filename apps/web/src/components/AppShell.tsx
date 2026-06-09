import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DEMO_MODE } from '../lib/api'
import { Brand, Button, DemoPill } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

const nav = [
  { to: '/app/create', label: 'Create' },
  { to: '/app/resumes', label: 'My CVs' },
]

export function AppShell() {
  const { logout } = useAuth()
  const navTo = useNavigate()

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <button type="button" onClick={() => navTo('/app/create')}>
            <Brand />
          </button>
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  'rounded-[8px] px-3 py-1.5 text-sm ' +
                  (isActive ? 'font-medium text-[#111827]' : 'text-[#6b7280] hover:text-[#111827]')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {DEMO_MODE ? <DemoPill /> : null}
            <Button variant="ghost" className="!px-2 text-xs" onClick={() => { logout(); navTo('/', { replace: true }) }}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
