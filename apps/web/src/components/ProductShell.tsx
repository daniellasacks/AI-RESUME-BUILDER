import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 items-center justify-center rounded-lg bg-blue-700 text-xs font-bold text-white"
              aria-hidden
            >
              AI
            </div>
            <span className="text-[15px] font-semibold text-slate-900">{PRODUCT_NAME}</span>
            {DEMO_MODE ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Demo</span>
            ) : null}
          </div>
          <nav className="flex items-center gap-5 text-sm" aria-label="Account navigation">
            <Link to="/app/resumes" className="text-slate-600 hover:text-slate-900">
              My CVs
            </Link>
            <Link to="/auth" className="text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto min-h-0 w-full max-w-[1600px] flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
