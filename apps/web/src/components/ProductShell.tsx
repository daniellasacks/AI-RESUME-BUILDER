import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { Brand } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <header className="shrink-0 border-b border-[#e5e7eb] bg-white">
        <div className="flex h-14 items-center justify-between px-5">
          <Brand />
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/app/resumes" className="text-[#6b7280] hover:text-[#111827]">
              My CVs
            </Link>
            <Link to="/auth" className="text-[#6b7280] hover:text-[#111827]">
              Account
            </Link>
            {DEMO_MODE ? (
              <span className="rounded-md bg-[#f7f8fa] px-2 py-0.5 text-xs text-[#6b7280]">Demo</span>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="min-h-0 flex-1 p-4 md:p-5">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
