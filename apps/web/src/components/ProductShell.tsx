import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="flex h-full flex-col bg-[#f3f2ef]">
      <header className="shrink-0 px-4 pt-4 md:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-indigo-500 text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3l1.8 5.5H19l-4.6 3.3 1.8 5.5L12 14l-4.2 3.3 1.8-5.5L5 8.5h5.2L12 3z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-900">{PRODUCT_NAME}</span>
            {DEMO_MODE ? (
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 ring-1 ring-zinc-200">
                Demo
              </span>
            ) : null}
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/app/resumes" className="text-zinc-500 transition hover:text-zinc-900">
              My CVs
            </Link>
            <Link to="/auth" className="text-zinc-500 transition hover:text-zinc-900">
              Account
            </Link>
          </nav>
        </div>
      </header>
      <main className="min-h-0 flex-1 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
