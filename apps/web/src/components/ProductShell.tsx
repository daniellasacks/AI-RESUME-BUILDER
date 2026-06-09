import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="app-canvas flex h-full flex-col">
      <header className="shrink-0 px-4 pt-4 md:px-6">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md shadow-teal-600/25"
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6M12 9v6M7 3h10a2 2 0 012 2v14l-5-3-5 3V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-stone-900">{PRODUCT_NAME}</span>
            {DEMO_MODE ? (
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700 ring-1 ring-teal-200">
                Demo · build 1d016b7
              </span>
            ) : null}
          </div>
          <nav className="flex items-center gap-1 text-sm" aria-label="Account navigation">
            <Link
              to="/app/resumes"
              className="rounded-lg px-3 py-2 font-medium text-stone-600 transition hover:bg-stone-50 hover:text-stone-900"
            >
              My CVs
            </Link>
            <Link
              to="/auth"
              className="rounded-lg bg-stone-900 px-3.5 py-2 font-medium text-white transition hover:bg-stone-800"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto min-h-0 w-full max-w-[1520px] flex-1 px-4 pb-4 pt-3 md:px-6 md:pb-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
