import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'

/** Full-screen app chrome — not a marketing layout */
export function ProductShell() {
  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-slate-900 text-[9px] font-bold text-white">
            CV
          </div>
          <span className="text-sm font-medium text-slate-800">{PRODUCT_NAME}</span>
          {DEMO_MODE ? (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">demo</span>
          ) : null}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/app/resumes" className="text-slate-500 hover:text-slate-900">
            Saved CVs
          </Link>
          <Link to="/auth" className="text-slate-500 hover:text-slate-900">
            Account
          </Link>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
