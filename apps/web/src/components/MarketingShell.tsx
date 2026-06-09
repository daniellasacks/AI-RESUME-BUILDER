import { Link, Outlet } from 'react-router-dom'
import { BRAND_MARK } from '../lib/brand'
import { ButtonLink } from './ui'

export function MarketingShell() {
  return (
    <div className="flex min-h-full flex-col bg-[#fafafa]">
      <header className="shrink-0 border-b border-[#eee] bg-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#3b7ddd] text-[11px] font-bold text-white">
              CV
            </div>
            <span className="text-[15px] font-bold uppercase tracking-wide text-[#1a1a1a]">{BRAND_MARK}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] text-[#444] md:flex">
            <span className="cursor-default">How it works</span>
            <Link to="/create" className="transition hover:text-[#1a1a1a]">
              Start building
            </Link>
            <span className="cursor-default">FAQ</span>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-[15px] font-medium text-[#444] transition hover:text-[#1a1a1a]">
              Sign in
            </Link>
            <ButtonLink to="/create" className="!rounded-full !px-6 !py-2.5 !text-[15px] shadow-md shadow-blue-500/20">
              Create CV
            </ButtonLink>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
