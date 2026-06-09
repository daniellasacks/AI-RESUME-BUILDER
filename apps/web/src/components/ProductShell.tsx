import { Link, Outlet } from 'react-router-dom'
import { DEMO_MODE } from '../lib/api'
import { BRAND_MARK } from '../lib/brand'
import { ButtonLink } from './ui'
import { ErrorBoundary } from './ErrorBoundary'

export function ProductShell() {
  return (
    <div className="flex h-full flex-col bg-[#fafafa]">
      <header className="shrink-0 border-b border-[#eee] bg-white">
        <div className="flex h-[60px] items-center justify-between px-5 md:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#3b7ddd] text-[10px] font-bold text-white">
              CV
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-[#1a1a1a]">{BRAND_MARK}</span>
            {DEMO_MODE ? (
              <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] font-medium text-[#888]">demo</span>
            ) : null}
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/app/resumes" className="text-sm font-medium text-[#666] transition hover:text-[#1a1a1a]">
              My CVs
            </Link>
            <Link to="/auth" className="text-sm font-medium text-[#666] transition hover:text-[#1a1a1a]">
              Sign in
            </Link>
            <ButtonLink to="/create" className="!rounded-full !px-5 !py-2 !text-sm shadow-sm">
              Create CV
            </ButtonLink>
          </div>
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
