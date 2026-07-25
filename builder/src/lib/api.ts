import { supabase } from './supabase'
import type { Flow } from './component-types'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not signed in')

  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  listFlows: (): Promise<Flow[]> => authedFetch('/flows'),
  getFlow: (id: string): Promise<Flow> => authedFetch(`/flows/${id}`),
  createFlow: (input: { name: string; steps?: Flow['steps'] }): Promise<Flow> =>
    authedFetch('/flows', { method: 'POST', body: JSON.stringify(input) }),
  updateFlow: (id: string, input: { name?: string; steps?: Flow['steps'] }): Promise<Flow> =>
    authedFetch(`/flows/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteFlow: (id: string): Promise<null> => authedFetch(`/flows/${id}`, { method: 'DELETE' }),
}
