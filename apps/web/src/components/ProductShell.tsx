import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { PRODUCT_NAME } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="app-canvas flex h-full flex-col">
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 opacity-80 blur-sm" />
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 text-xs font-black text-white">
              AI
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-white">{PRODUCT_NAME}</p>
            {DEMO_MODE ? <p className="mt-0.5 text-[10px] text-zinc-500">live demo</p> : null}
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/app/resumes"
            className="glass rounded-full px-4 py-1.5 text-xs font-medium text-zinc-300 transition hover:text-white"
          >
            My CVs
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
          >
            Account
          </Link>
        </nav>
      </header>
      <main className="relative z-10 min-h-0 flex-1 px-3 pb-3 md:px-4 md:pb-4">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
