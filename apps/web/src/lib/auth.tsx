import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, setToken as persistToken, getToken } from './api'

export type AuthUser = { id: string; email?: string; fullName?: string }

type AuthState = {
  token: string | null
  user: AuthUser | null
  setToken: (t: string | null) => void
  refreshMe: () => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<AuthUser | null>(null)

  function setToken(t: string | null) {
    persistToken(t)
    setTokenState(t)
  }

  async function refreshMe() {
    if (!token) return
    try {
      const res = await api<{ user: AuthUser }>('/auth/me')
      setUser(res.user)
    } catch {
      setToken(null)
      setUser(null)
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const value = useMemo<AuthState>(() => ({ token, user, setToken, refreshMe, logout }), [token, user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used inside AuthProvider')
  return v
}

