// SignalPro API Service
// Connects frontend to backend API

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiUser {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  subscriptionStatus?: string
  subscriptionEnd?: string
}

export interface Signal {
  id: string
  type: 'buy' | 'sell' | 'hold'
  symbol: string
  name: string
  price: number
  target: number
  stop: number
  confidence: number
  market: string
  reason: string
  createdAt: string
  agentName: string
  agentAvatar: string
  upvotes: number
  comments: number
  tags: string[]
  pnl?: number
}

// ─── Auth Helpers ──────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('signalpro_token')
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    localStorage.removeItem('signalpro_token')
    localStorage.removeItem('signalpro_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`)
  }
  return data
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const api = {
  // Auth
  register: async (name: string, email: string, password: string) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    localStorage.setItem('signalpro_token', data.token)
    localStorage.setItem('signalpro_user', JSON.stringify(data.user))
    return data.user as ApiUser
  },

  login: async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('signalpro_token', data.token)
    localStorage.setItem('signalpro_user', JSON.stringify(data.user))
    return data.user as ApiUser
  },

  logout: () => {
    localStorage.removeItem('signalpro_token')
    localStorage.removeItem('signalpro_user')
  },

  getMe: async (): Promise<ApiUser | null> => {
    const saved = localStorage.getItem('signalpro_user')
    if (!saved) return null
    try {
      const data = await apiFetch('/auth/me')
      return data.user as ApiUser
    } catch {
      return null
    }
  },

  // Signals
  getSignals: async (params?: { type?: string; market?: string; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.type && params.type !== 'all') search.set('type', params.type)
    if (params?.market && params.market !== 'all') search.set('market', params.market)
    if (params?.limit) search.set('limit', String(params.limit))
    const qs = search.toString() ? `?${search.toString()}` : ''
    const data = await apiFetch(`/signals${qs}`)
    return data.signals as Signal[]
  },

  getProSignals: async () => {
    const data = await apiFetch('/signals/pro')
    return data.signals as Signal[]
  },

  upvoteSignal: async (signalId: string) => {
    const data = await apiFetch(`/signals/${signalId}/upvote`, { method: 'POST' })
    return data.upvoted as boolean
  },

  // Payments
  createOrder: async (planId: string, annual: boolean) => {
    const data = await apiFetch('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, annual }),
    })
    return data as { orderId: string; approvalUrl: string; status: string }
  },

  captureOrder: async (orderId: string) => {
    const data = await apiFetch(`/payments/capture/${orderId}`, { method: 'POST' })
    return data as { success: boolean; plan: string }
  },

  getPaymentStatus: async () => {
    const data = await apiFetch('/payments/status')
    return data as { plan: string; status: string; end: string }
  },

  cancelSubscription: async () => {
    const data = await apiFetch('/payments/cancel', { method: 'POST' })
    return data as { success: boolean }
  },

  // Plans
  getPlans: async () => {
    const data = await apiFetch('/plans')
    return data as { plans: any[]; paypalConfigured: boolean }
  },

  // Health
  health: async () => {
    try {
      await fetch(`${API_BASE}/health`)
      return true
    } catch {
      return false
    }
  },
}

export default api
