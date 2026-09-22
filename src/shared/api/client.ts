import type { ApiResponse, AuthResponse } from '../types/api'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

type TokenGetter = () => string | null
type TokenSetter = (access: string | null, refresh?: string | null) => void

let getAccessToken: TokenGetter = () => null
let getRefreshToken: TokenGetter = () => null
let setTokens: TokenSetter = () => undefined

export function bindAuthTokens(opts: {
  getAccessToken: TokenGetter
  getRefreshToken: TokenGetter
  setTokens: TokenSetter
}) {
  getAccessToken = opts.getAccessToken
  getRefreshToken = opts.getRefreshToken
  setTokens = opts.setTokens
}

async function refreshAccess(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) {
    setTokens(null, null)
    return null
  }
  const json = (await res.json()) as ApiResponse<AuthResponse>
  setTokens(json.data.accessToken, json.data.refreshToken)
  return json.data.accessToken
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401 && retry) {
    const next = await refreshAccess()
    if (next) return api<T>(path, options, false)
  }

  if (res.status === 204) return undefined as T

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = json?.message || `İstek başarısız (${res.status})`
    throw new Error(message)
  }
  return (json?.data !== undefined ? json.data : json) as T
}

export async function apiPage<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; pagination?: ApiResponse<T>['pagination'] }> {
  const headers = new Headers(options.headers)
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const json = (await res.json()) as ApiResponse<T> & { message?: string }
  if (!res.ok) throw new Error(json?.message || 'İstek başarısız')
  return { data: json.data, pagination: json.pagination }
}
