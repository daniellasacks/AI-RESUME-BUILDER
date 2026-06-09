import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="studio-shell flex h-full flex-col">
      <header className="shrink-0 bg-violet-700 text-white shadow-lg shadow-violet-900/20">
        <div className="flex h-14 items-center justify-between px-5 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold leading-none">{PRODUCT_NAME}</p>
              {DEMO_MODE ? <p className="mt-0.5 text-[10px] font-medium text-violet-200">Demo mode</p> : null}
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              to="/app/resumes"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-violet-100 transition hover:bg-white/10 hover:text-white"
            >
              My CVs
            </Link>
            <Link
              to="/auth"
              className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/25"
            >
              Account
            </Link>
          </nav>
        </div>
      </header>
      <main className="min-h-0 flex-1 p-3 md:p-4">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
