import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-6">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">{PRODUCT_NAME}</span>
          {DEMO_MODE ? (
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">Demo</span>
          ) : null}
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/app/resumes" className="text-neutral-500 transition hover:text-neutral-900">
            My CVs
          </Link>
          <Link to="/auth" className="text-neutral-500 transition hover:text-neutral-900">
            Account
          </Link>
        </nav>
      </header>
      <main className="min-h-0 flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
