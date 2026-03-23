import { cookies } from 'next/headers'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }

  const url = `${FASTAPI_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  })

  return response
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiFetch(path, { method: 'GET' })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}
