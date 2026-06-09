import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DEMO_MODE } from '../lib/api'
import { Brand, Button, DemoPill } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

const nav = [
  { to: '/app/chat', label: 'Build CV' },
  { to: '/app/resumes', label: 'My CVs' },
]

export function AppShell() {
  const { logout } = useAuth()
  const navTo = useNavigate()
  const location = useLocation()
  const isChat = location.pathname.startsWith('/app/chat')

  return (
    <div className="mesh-bg min-h-full">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className={'mx-auto flex h-14 items-center justify-between gap-4 px-6 ' + (isChat ? '' : 'max-w-5xl')}>
          <button type="button" onClick={() => navTo('/app/chat')}>
            <Brand />
          </button>
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  'rounded-xl px-3 py-1.5 text-sm transition ' +
                  (isActive
                    ? 'bg-indigo-50 font-semibold text-indigo-700'
                    : 'text-[#64748b] hover:bg-indigo-50/50 hover:text-[#0f172a]')
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

      <main className={isChat ? '' : 'mx-auto max-w-5xl px-6 py-8'}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
