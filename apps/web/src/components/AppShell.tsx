import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DEMO_MODE } from '../lib/api'
import { IconFiles, IconHome, IconLayout, IconTarget } from './icons'
import { Brand, Button, DemoPill, Panel } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

const nav = [
  { to: '/app/dashboard', label: 'Home', Icon: IconHome, end: true },
  { to: '/app/resumes', label: 'Resumes', Icon: IconFiles, end: false },
  { to: '/app/job-targets', label: 'Jobs', Icon: IconTarget, end: false },
  { to: '/app/templates', label: 'Templates', Icon: IconLayout, end: false },
]

function SidebarLink({
  to,
  label,
  Icon,
  end,
}: {
  to: string
  label: string
  Icon: typeof IconHome
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ' +
        (isActive
          ? 'bg-sky-500/15 text-white shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]'
          : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={
              'flex size-9 items-center justify-center rounded-lg transition ' +
              (isActive ? 'bg-sky-500/20 text-sky-300' : 'bg-zinc-800/80 text-zinc-500 group-hover:text-zinc-300')
            }
          >
            <Icon size={18} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const navTo = useNavigate()

  return (
    <div className="mesh-bg flex min-h-full">
      <aside className="glass-nav fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-white/[0.06] lg:flex">
        <div className="px-5 pt-6">
          <button type="button" onClick={() => navTo('/app/dashboard')} className="text-left">
            <Brand />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => (
            <SidebarLink key={item.to} to={item.to} label={item.label} Icon={item.Icon} end={item.end} />
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          {DEMO_MODE ? (
            <div className="mb-3 flex justify-center">
              <DemoPill />
            </div>
          ) : null}
          <p className="truncate px-2 text-xs text-zinc-600">{user?.email}</p>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start !px-2 text-xs"
            onClick={() => {
              logout()
              navTo('/', { replace: true })
            }}
          >
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-full flex-1 flex-col lg:pl-[240px]">
        <header className="glass-nav sticky top-0 z-30 flex h-16 items-center justify-between px-5 lg:hidden">
          <button type="button" onClick={() => navTo('/app/dashboard')}>
            <Brand compact />
          </button>
          <div className="flex items-center gap-2">
            {DEMO_MODE ? <DemoPill /> : null}
            <Button variant="ghost" className="!px-2 text-xs" onClick={() => logout()}>
              Out
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-3 py-2 lg:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ' +
                (isActive ? 'bg-sky-500/15 text-sky-200' : 'text-zinc-500')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Panel className="mx-auto max-w-5xl p-6 sm:p-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Panel>
        </main>
      </div>
    </div>
  )
}
