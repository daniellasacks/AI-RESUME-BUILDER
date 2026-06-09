import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, token, booting } = useAuth()
  const loc = useLocation()

  if (!token) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />
  if (booting) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#6b7280]">
        Loading…
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />
  return children
}
