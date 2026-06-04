export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
export const TOKEN_KEY = 'ai-resume-token'

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown
  constructor(input: { message: string; status: number; code?: string; details?: unknown }) {
    super(input.message)
    this.name = 'ApiError'
    this.status = input.status
    this.code = input.code
    this.details = input.details
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const j = (await res.json().catch(() => null)) as any
      throw new ApiError({
        message: j?.message || `Request failed: ${res.status}`,
        status: res.status,
        code: j?.code,
        details: j,
      })
    }
    const text = await res.text().catch(() => '')
    throw new ApiError({ message: text || `Request failed: ${res.status}`, status: res.status })
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return (await res.json()) as T
  return (await res.blob()) as T
}

