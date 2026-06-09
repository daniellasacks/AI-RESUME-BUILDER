import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DEMO_MODE } from '../lib/api'
import { Brand, Button, DemoPill } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

export function AppShell() {
  const { logout } = useAuth()
  const navTo = useNavigate()
  const location = useLocation()
  const isChat = location.pathname.startsWith('/app/chat')

  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className={'mx-auto flex h-14 items-center justify-between gap-4 px-5 ' + (isChat ? '' : 'max-w-5xl')}>
          <button type="button" onClick={() => navTo('/app/chat')}>
            <Brand />
          </button>
          {isChat ? (
            <NavLink
              to="/app/resumes"
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              My CVs
            </NavLink>
          ) : (
            <nav className="flex items-center gap-4">
              <NavLink to="/app/chat" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Build CV
              </NavLink>
              <NavLink to="/app/resumes" className="text-sm text-slate-500 hover:text-slate-900">
                My CVs
              </NavLink>
            </nav>
          )}
          <div className="flex items-center gap-3">
            {DEMO_MODE ? <DemoPill /> : null}
            <Button variant="ghost" className="!px-2 !text-xs" onClick={() => { logout(); navTo('/', { replace: true }) }}>
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
