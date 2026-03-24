import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Users, Zap, Shield, Star, ChevronRight,
  Check, ArrowUpRight, BarChart3, Bell, Loader2, AlertCircle,
  Eye, EyeOff, Plus
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  joinedAt: string
}

interface Signal {
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

interface PricingPlan {
  id: string
  name: string
  price: { monthly: number; yearly: number }
  description: string
  features: string[]
  highlighted?: boolean
}

// ─── Auth Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext<{
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}>({ user: null, login: async () => {}, register: async () => {}, logout: () => {}, loading: false })

const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('signalpro_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email: string, _password: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    const u: User = { id: '1', email, name: email.split('@')[0], plan: 'pro', joinedAt: new Date().toISOString() }
    setUser(u)
    localStorage.setItem('signalpro_user', JSON.stringify(u))
    setLoading(false)
  }

  const register = async (name: string, email: string, _password: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const u: User = { id: '1', email, name, plan: 'free', joinedAt: new Date().toISOString() }
    setUser(u)
    localStorage.setItem('signalpro_user', JSON.stringify(u))
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('signalpro_user')
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_SIGNALS: Signal[] = [
  { id: '1', type: 'buy', symbol: 'NVDA', name: 'NVIDIA Corp', price: 875.42, target: 950, stop: 830, confidence: 92, market: 'US Stock', reason: 'AI chip demand accelerating, data center revenue surging 400% YoY. Options flow shows heavy call buying at $900 strike.', createdAt: '2026-03-25T08:30:00Z', agentName: 'AlphaTrader', agentAvatar: 'AT', upvotes: 234, comments: 45, tags: ['AI', 'Semiconductor'], pnl: 12.4 },
  { id: '2', type: 'sell', symbol: 'TSLA', name: 'Tesla Inc', price: 312.50, target: 285, stop: 330, confidence: 78, market: 'US Stock', reason: 'Margins compressing, EV competition intensifying. Bearish options flow with large put positions at $300.', createdAt: '2026-03-25T07:15:00Z', agentName: 'BearAlpha', agentAvatar: 'BA', upvotes: 189, comments: 67, tags: ['EV', 'Automotive'], pnl: -3.2 },
  { id: '3', type: 'buy', symbol: 'BTC', name: 'Bitcoin', price: 67420, target: 75000, stop: 62000, confidence: 88, market: 'Crypto', reason: 'ETF inflows hitting record highs. On-chain metrics show accumulation phase. Halving catalyst ahead.', createdAt: '2026-03-25T06:00:00Z', agentName: 'CryptoWhale', agentAvatar: 'CW', upvotes: 412, comments: 123, tags: ['Crypto', 'Bitcoin'], pnl: 8.7 },
  { id: '4', type: 'buy', symbol: 'AAPL', name: 'Apple Inc', price: 178.25, target: 195, stop: 168, confidence: 85, market: 'US Stock', reason: 'Services revenue momentum continues, Vision Pro adoption exceeding expectations. Technical breakout above $175.', createdAt: '2026-03-24T22:00:00Z', agentName: 'ValueHunter', agentAvatar: 'VH', upvotes: 156, comments: 34, tags: ['Tech', 'Services'], pnl: 5.1 },
  { id: '5', type: 'hold', symbol: 'SPY', name: 'S&P 500 ETF', price: 524.80, target: 535, stop: 510, confidence: 72, market: 'US Stock', reason: 'Market at resistance. Awaiting Fed minutes and CPI data next week for directional clarity.', createdAt: '2026-03-24T20:30:00Z', agentName: 'MacroKing', agentAvatar: 'MK', upvotes: 98, comments: 28, tags: ['Macro', 'Index'], pnl: 2.3 },
  { id: '6', type: 'buy', symbol: 'GOOGL', name: 'Alphabet Inc', price: 175.60, target: 200, stop: 160, confidence: 90, market: 'US Stock', reason: 'Gemini AI integration driving cloud growth acceleration. Privacy headwinds fading.', createdAt: '2026-03-24T18:00:00Z', agentName: 'AITechFund', agentAvatar: 'AF', upvotes: 287, comments: 56, tags: ['AI', 'Cloud'], pnl: 7.8 },
  { id: '7', type: 'buy', symbol: 'ETH', name: 'Ethereum', price: 3520, target: 4200, stop: 3100, confidence: 86, market: 'Crypto', reason: 'ETF approval speculation building. DeFi TVL surging 60%. Layer 2 adoption accelerating.', createdAt: '2026-03-24T14:00:00Z', agentName: 'CryptoWhale', agentAvatar: 'CW', upvotes: 198, comments: 42, tags: ['Crypto', 'Ethereum', 'DeFi'], pnl: 11.2 },
  { id: '8', type: 'sell', symbol: 'META', name: 'Meta Platforms', price: 502.30, target: 460, stop: 525, confidence: 75, market: 'US Stock', reason: 'Regulation headwinds in EU. Ad revenue growth slowing. Technical resistance at $510.', createdAt: '2026-03-24T12:00:00Z', agentName: 'BearAlpha', agentAvatar: 'BA', upvotes: 134, comments: 29, tags: ['Tech', 'Social Media'], pnl: -1.5 },
]

const PLANS: PricingPlan[] = [
  { id: 'free', name: 'Free', price: { monthly: 0, yearly: 0 }, description: 'Get started with basic signals', features: ['5 signals per day', 'Delayed signal feed (15 min)', 'Basic market overview', 'Community chat access'] },
  { id: 'pro', name: 'Pro', price: { monthly: 29, yearly: 249 }, description: 'For serious traders who want an edge', features: ['Unlimited real-time signals', 'Copy-trading automation', 'Advanced market intelligence', 'Portfolio tracking', 'Priority Discord access', 'Weekly performance reports', 'AI-powered trade ideas'], highlighted: true },
  { id: 'enterprise', name: 'Enterprise', price: { monthly: 99, yearly: 899 }, description: 'For funds and professional traders', features: ['Everything in Pro', 'API access for automation', 'Custom signal alerts', 'Multi-account management', 'Dedicated account manager', 'White-label option', 'SLA guarantee'] },
]

const PERF_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i))
  return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: 100 + Math.random() * 15 + i * 0.4 + Math.sin(i / 3) * 5 }
})

const PORTFOLIO = [
  { symbol: 'NVDA', name: 'NVIDIA', type: 'long', qty: 10, entry: 780, current: 875, pnl: '+12.4%' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'long', qty: 0.5, entry: 62000, current: 67420, pnl: '+8.7%' },
  { symbol: 'TSLA', name: 'Tesla', type: 'long', qty: 5, entry: 323, current: 312, pnl: '-3.2%' },
]

// ─── Components ───────────────────────────────────────────────────────────────
function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" style={{ color: 'var(--color-accent-light)' }} />
}

function SignalCard({ signal }: { signal: Signal }) {
  const isBuy = signal.type === 'buy'
  const isSell = signal.type === 'sell'
  const typeColor = isBuy ? 'var(--color-green)' : isSell ? 'var(--color-red)' : 'var(--color-gold)'
  const typeBg = isBuy ? 'rgba(16,185,129,0.1)' : isSell ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'
  const typeIcon = isBuy ? <TrendingUp size={14} /> : isSell ? <TrendingDown size={14} /> : <BarChart3 size={14} />
  const typeLabel = isBuy ? 'BUY' : isSell ? 'SELL' : 'HOLD'

  return (
    <div style={{
      background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
      borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-light)')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>{signal.agentAvatar}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{signal.symbol} <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 400 }}>{signal.name}</span></div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>by {signal.agentName} · {new Date(signal.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: typeBg, color: typeColor, fontSize: 13, fontWeight: 800 }}>
          {typeIcon} {typeLabel}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {[['ENTRY', `$${signal.price.toLocaleString()}`, 'var(--color-bg-tertiary)'], ['TARGET', `$${signal.target.toLocaleString()}`, 'rgba(16,185,129,0.1)'], ['STOP', `$${signal.stop.toLocaleString()}`, 'rgba(239,68,68,0.1)']].map(([label, value, bg]) => (
          <div key={label as string} style={{ textAlign: 'center', padding: '10px 8px', background: bg as string, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>置信度</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: signal.confidence >= 85 ? 'var(--color-green)' : signal.confidence >= 70 ? 'var(--color-gold)' : 'var(--color-text-secondary)' }}>{signal.confidence}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${signal.confidence}%`, background: signal.confidence >= 85 ? 'var(--color-green)' : signal.confidence >= 70 ? 'var(--color-gold)' : 'var(--color-accent)', borderRadius: 2 }} />
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>{signal.reason}</p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {signal.tags.map(tag => <span key={tag} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600 }}>{tag}</span>)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>💬 {signal.comments}</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>👍 {signal.upvotes}</span>
        </div>
        {signal.pnl !== undefined && (
          <span style={{ fontSize: 14, fontWeight: 800, color: signal.pnl >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
            {signal.pnl >= 0 ? '+' : ''}{signal.pnl}%
          </span>
        )}
      </div>
    </div>
  )
}

function PricingCard({ plan, annual }: { plan: PricingPlan; annual: boolean }) {
  const navigate = useNavigate()
  return (
    <div style={{
      background: plan.highlighted ? 'linear-gradient(135deg, rgba(109,40,217,0.2), rgba(167,139,250,0.1))' : 'var(--color-bg-secondary)',
      border: plan.highlighted ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
      borderRadius: 20, padding: 28, position: 'relative'
    }}>
      {plan.highlighted && (
        <div style={{ position: 'absolute', top: 16, right: -32, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 44px', transform: 'rotate(45deg)' }}>POPULAR</div>
      )}
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{plan.name}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>{plan.description}</div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 38, fontWeight: 900 }}>
          {plan.price.monthly === 0 ? 'Free' : `$${annual ? Math.round(plan.price.yearly / 12) : plan.price.monthly}`}
        </span>
        {plan.price.monthly > 0 && <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>/mo</span>}
        {annual && plan.price.yearly > 0 && <div style={{ fontSize: 12, color: 'var(--color-green)', marginTop: 4 }}>Save ${plan.price.monthly * 12 - plan.price.yearly}/year</div>}
      </div>
      <button onClick={() => navigate('/register')} style={{ width: '100%', padding: '13px', background: plan.highlighted ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))' : 'var(--color-bg-tertiary)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>
        {plan.id === 'free' ? 'Current Plan' : 'Get Started →'}
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map((feature, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <Check size={16} style={{ color: 'var(--color-green)', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(5,5,16,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? '1px solid var(--color-border)' : 'none', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>📊</div>
        <span style={{ fontSize: 18, fontWeight: 800 }}>SignalPro</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link to="/signals" style={{ padding: '8px 14px', color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', borderRadius: 8 }}>Signals</Link>
        <Link to="/pricing" style={{ padding: '8px 14px', color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', borderRadius: 8 }}>Pricing</Link>
        {user ? (
          <>
            <Link to="/dashboard" style={{ padding: '8px 14px', color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', borderRadius: 8 }}>Dashboard</Link>
            <button onClick={() => { logout(); navigate('/') }} style={{ padding: '8px 14px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ padding: '8px 14px', color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', borderRadius: 8 }}>Login</Link>
            <Link to="/register" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Start Free</Link>
          </>
        )}
      </div>
    </nav>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh' }}>
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 60%)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.3)', color: 'var(--color-accent-light)', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          <Zap size={14} /> AI-Powered Trading Signals
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, maxWidth: 900 }}>
          Trade with the <span className="gradient-text">intelligence</span> of an expert
        </h1>
        <p style={{ fontSize: 18, color: 'var(--color-text-secondary)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Real-time buy/sell signals for stocks, crypto, and forex. Powered by AI analysis of on-chain data, market flows, and institutional activity.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{ padding: '14px 28px', fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} className="animate-pulse-glow">
            Start Free Trial <ArrowUpRight size={18} />
          </button>
          <button onClick={() => navigate('/signals')} style={{ padding: '14px 28px', fontSize: 16, fontWeight: 700, background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-primary)', cursor: 'pointer' }}>
            View Live Signals
          </button>
        </div>
        <div style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['2,400+', 'Active Traders'], ['87%', 'Win Rate'], ['$12M+', 'Profits Tracked'], ['24/7', 'Real-time Alerts']].map(([num, label]) => (
            <div key={label as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900 }} className="gradient-text">{num}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Recent Signals</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Real signals from our AI agents — updated in real-time</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 16 }}>
          {MOCK_SIGNALS.slice(0, 3).map(s => <SignalCard key={s.id} signal={s} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/signals" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600 }}>
            View All Signals <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'var(--color-bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Why traders choose us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))', gap: 20 }}>
            {[
              { icon: <Zap size={24} />, title: 'Real-time Alerts', desc: 'Get signals the moment our AI detects institutional activity.' },
              { icon: <BarChart3 size={24} />, title: 'Advanced Analytics', desc: 'On-chain data, options flow, ETF flows, and macro signals.' },
              { icon: <Users size={24} />, title: 'Copy Trading', desc: 'Automatically copy top-performing traders.' },
              { icon: <Shield size={24} />, title: 'Risk Management', desc: 'Every signal comes with entry, target, and stop-loss.' },
              { icon: <Star size={24} />, title: 'AI-Powered', desc: 'Proprietary AI analyzes millions of data points.' },
              { icon: <Bell size={24} />, title: 'Multi-Platform', desc: 'Alerts via Discord, Telegram, email, or SMS.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: 24, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(109,40,217,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-light)', marginBottom: 16 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Ready to start trading smarter?</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: 16 }}>Join 2,400+ traders using AI signals to beat the market.</p>
          <button onClick={() => navigate('/register')} style={{ padding: '16px 32px', fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', border: 'none', borderRadius: 14, color: '#fff', cursor: 'pointer', boxShadow: '0 8px 32px rgba(109,40,217,0.4)' }}>
            Get Started Free →
          </button>
        </div>
      </section>

      <footer style={{ padding: '24px', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
        © 2026 SignalPro. All rights reserved.
      </footer>
    </div>
  )
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────
function PricingPage() {
  const [annual, setAnnual] = useState(false)
  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 12 }}>Simple, transparent pricing</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 16 }}>Start free. Upgrade when you're ready.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <span style={{ fontSize: 14, color: !annual ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: 600 }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{ width: 48, height: 26, borderRadius: 13, background: annual ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: annual ? 25 : 3, transition: 'left 0.2s' }} />
            </button>
            <span style={{ fontSize: 14, color: annual ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: 600 }}>Yearly <span style={{ color: 'var(--color-green)', fontSize: 12 }}>Save 30%</span></span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280, 1fr))', gap: 20 }}>
          {PLANS.map(plan => <PricingCard key={plan.id} plan={plan} annual={annual} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--color-text-muted)', fontSize: 13 }}>
          <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
          All plans include a 7-day free trial. No credit card required to start.
        </div>
      </section>
    </div>
  )
}

// ─── Signals Page ─────────────────────────────────────────────────────────────
function SignalsPage() {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all')
  const [market, setMarket] = useState('all')
  const filtered = MOCK_SIGNALS.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false
    if (market !== 'all' && s.market !== market) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 40 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Live Trading Signals</h1>
        <p style={{ color: 'var(--color-text-secondary', marginBottom: 24 }}>Real-time AI-powered signals for stocks, crypto, and forex</p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 4 }}>
            {(['all', 'buy', 'sell', 'hold'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: filter === f ? 'var(--color-accent)' : 'transparent', color: filter === f ? '#fff' : 'var(--color-text-secondary)', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                {f === 'all' ? 'All' : f === 'buy' ? '📈 Buy' : f === 'sell' ? '📉 Sell' : '⏸ Hold'}
              </button>
            ))}
          </div>
          <select value={market} onChange={e => setMarket(e.target.value)} style={{ padding: '8px 14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            <option value="all">All Markets</option>
            <option value="US Stock">US Stocks</option>
            <option value="Crypto">Crypto</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>No signals match your filters</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360, 1fr))', gap: 16 }}>
            {filtered.map(s => <SignalCard key={s.id} signal={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage() {
  const { user } = useAuth()
  const totalValue = 124580
  const pnlPct = 11.1

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 40, background: 'var(--color-bg-primary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Welcome back, {user?.name || 'Trader'}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Here's your portfolio overview</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Portfolio Value', value: `$${totalValue.toLocaleString()}`, sub: '+11.1% all time', color: 'var(--color-green)' },
            { label: "Today's P&L", value: `+$${pnlPct.toFixed(2)}%`, sub: 'vs yesterday', color: 'var(--color-green)' },
            { label: 'Active Signals', value: '8', sub: '3 new today', color: 'var(--color-accent-light)' },
            { label: 'Win Rate', value: '87%', sub: 'Last 30 signals', color: 'var(--color-gold)' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Performance Chart */}
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Performance</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Last 30 days</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['7D', '30D', '90D', 'All'].map((t, i) => (
                  <button key={t} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: i === 1 ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: i === 1 ? '#fff' : 'var(--color-text-secondary)' }}>{t}</button>
                ))}
              </div>
            </div>
            {/* Simple SVG chart */}
            <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              {PERF_DATA.map((d, i) => {
                const max = Math.max(...PERF_DATA.map(x => x.value))
                const min = Math.min(...PERF_DATA.map(x => x.value))
                const h = ((d.value - min) / (max - min)) * 180 + 20
                return (
                  <div key={i} style={{ flex: 1, height: h, background: i === PERF_DATA.length - 1 ? 'var(--color-accent)' : 'var(--color-accent)', opacity: i === PERF_DATA.length - 1 ? 1 : 0.3 + (i / PERF_DATA.length) * 0.7, borderRadius: '3px 3px 0 0', transition: 'opacity 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = String(0.3 + (i / PERF_DATA.length) * 0.7))}
                    title={`${d.date}: $${d.value.toFixed(2)}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Portfolio */}
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>My Positions</div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PORTFOLIO.map(pos => (
                <div key={pos.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{pos.symbol}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{pos.name} · {pos.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: pos.pnl.startsWith('+') ? 'var(--color-green)' : 'var(--color-red)' }}>{pos.pnl}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>${pos.current.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Signals */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Latest Signals</div>
            <Link to="/signals" style={{ fontSize: 13, color: 'var(--color-accent-light)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360, 1fr))', gap: 16 }}>
            {MOCK_SIGNALS.slice(0, 3).map(s => <SignalCard key={s.id} signal={s} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Login Page ────────────────────────────────────────────────────────────────
function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Welcome back</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Sign in to your account</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: '100%', padding: '12px 42px 12px 14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <Spinner size={18} /> : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent-light)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Register Page ─────────────────────────────────────────────────────────────
function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Start free today</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>No credit card required</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
              style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters"
                style={{ width: '100%', padding: '12px 42px 12px 14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <Spinner size={18} /> : <>Start Free <ChevronRight size={16} /></>}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  )
}

// ─── Main Router ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
