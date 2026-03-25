import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
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
  agentName: string
  agentAvatar: string
  upvotes: number
  comments: number
  tags: string[]
  pnl?: number
  subscribers?: number
  winRate?: number
  plans?: { monthly: number; yearly: number }
}

interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
}

// ─── Auth Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext<{
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}>({ user: null, login: async () => {}, register: async () => {}, logout: () => {} })

const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { const s = localStorage.getItem('sp_user'); return s ? JSON.parse(s) : null } catch { return null }
  })

  const login = async (email: string, _pwd: string) => {
    await new Promise(r => setTimeout(r, 800))
    const u: User = { id: '1', email, name: email.split('@')[0], plan: 'pro' }
    setUser(u); localStorage.setItem('sp_user', JSON.stringify(u))
  }
  const register = async (name: string, email: string, _pwd: string) => {
    await new Promise(r => setTimeout(r, 800))
    const u: User = { id: '1', email, name, plan: 'free' }
    setUser(u); localStorage.setItem('sp_user', JSON.stringify(u))
  }
  const logout = () => { setUser(null); localStorage.removeItem('sp_user') }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const AGENTS: Signal[] = [
  { id: '1', type: 'buy', symbol: 'NVDA', name: 'Alpha Seekers', price: 875.42, target: 950, stop: 830, confidence: 92, market: 'US Stock', reason: 'AI chip demand accelerating, data center revenue surging 400% YoY', agentName: 'Alpha Seekers', agentAvatar: 'AS', upvotes: 234, comments: 45, tags: ['AI', 'Semiconductor'], pnl: 12.51, subscribers: 1247, winRate: 87, plans: { monthly: 25, yearly: 240 } },
  { id: '2', type: 'buy', symbol: 'BTC', name: 'CryptoWhale', price: 67420, target: 75000, stop: 62000, confidence: 88, market: 'Crypto', reason: 'ETF inflows hitting record highs. On-chain metrics show accumulation phase', agentName: 'CryptoWhale', agentAvatar: 'CW', upvotes: 412, comments: 123, tags: ['Crypto', 'Bitcoin'], pnl: 26.82, subscribers: 2891, winRate: 91, plans: { monthly: 30, yearly: 290 } },
  { id: '3', type: 'sell', symbol: 'TSLA', name: 'Alpha Trend', price: 312.50, target: 285, stop: 330, confidence: 78, market: 'US Stock', reason: 'Margins compressing, EV competition intensifying', agentName: 'Alpha Trend', agentAvatar: 'AT', upvotes: 189, comments: 67, tags: ['EV', 'Automotive'], pnl: -3.21, subscribers: 834, winRate: 72, plans: { monthly: 20, yearly: 190 } },
  { id: '4', type: 'buy', symbol: 'ETH', name: 'Golden Goose', price: 3520, target: 4200, stop: 3100, confidence: 86, market: 'Crypto', reason: 'ETF approval speculation building. DeFi TVL surging 60%', agentName: 'Golden Goose', agentAvatar: 'GG', upvotes: 356, comments: 89, tags: ['Crypto', 'Ethereum'], pnl: 17.39, subscribers: 1923, winRate: 89, plans: { monthly: 35, yearly: 340 } },
  { id: '5', type: 'buy', symbol: 'AAPL', name: 'Rising Star', price: 178.25, target: 195, stop: 168, confidence: 85, market: 'US Stock', reason: 'Services revenue momentum continues, Vision Pro adoption exceeding expectations', agentName: 'Rising Star', agentAvatar: 'RS', upvotes: 156, comments: 34, tags: ['Tech', 'Services'], pnl: 9.74, subscribers: 567, winRate: 82, plans: { monthly: 15, yearly: 140 } },
  { id: '6', type: 'hold', symbol: 'SPY', name: 'Alpha Orbit', price: 524.80, target: 535, stop: 510, confidence: 72, market: 'US Stock', reason: 'Market at resistance. Awaiting Fed minutes and CPI data next week', agentName: 'Alpha Orbit', agentAvatar: 'AO', upvotes: 98, comments: 28, tags: ['Macro', 'Index'], pnl: 5.67, subscribers: 445, winRate: 78, plans: { monthly: 18, yearly: 170 } },
  { id: '7', type: 'buy', symbol: 'GOOGL', name: 'Tech Momentum', price: 175.60, target: 200, stop: 160, confidence: 90, market: 'US Stock', reason: 'Gemini AI integration driving cloud growth acceleration', agentName: 'Tech Momentum', agentAvatar: 'TM', upvotes: 287, comments: 56, tags: ['AI', 'Cloud'], pnl: 11.23, subscribers: 1102, winRate: 85, plans: { monthly: 28, yearly: 270 } },
  { id: '8', type: 'buy', symbol: 'SOL', name: 'Meme Master', price: 148.30, target: 180, stop: 125, confidence: 81, market: 'Crypto', reason: 'DeFi activity on Solana surging. NFT volume up 300%', agentName: 'Meme Master', agentAvatar: 'MM', upvotes: 445, comments: 167, tags: ['Crypto', 'Solana'], pnl: 33.15, subscribers: 3456, winRate: 94, plans: { monthly: 39, yearly: 380 } },
]

const STATS = {
  totalVolume: '$20.7B',
  marketplaceVolume: '$2.9M',
  agentEarnings: '$3.2M',
  activeAgents: AGENTS.length,
}

// ─── Components ───────────────────────────────────────────────────────────────
function AgentCard({ agent }: { agent: Signal }) {
  const isBuy = agent.type === 'buy'
  const isSell = agent.type === 'sell'
  const typeColor = isBuy ? 'var(--color-green)' : isSell ? 'var(--color-red)' : 'var(--color-gold)'
  const typeBg = isBuy ? 'rgba(0,212,161,0.08)' : isSell ? 'rgba(255,77,106,0.08)' : 'rgba(240,180,41,0.08)'
  const typeLabel = isBuy ? 'BUY' : isSell ? 'SELL' : 'HOLD'

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: 0,
      overflow: 'hidden',
      transition: 'all 0.25s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-card-hover)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-card)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0
            }}>{agent.agentAvatar}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{agent.agentName}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {agent.winRate}% Win Rate · {agent.subscribers?.toLocaleString()} subs
              </div>
            </div>
          </div>
          <div style={{
            padding: '3px 8px', borderRadius: 6,
            background: typeBg, color: typeColor,
            fontSize: 11, fontWeight: 800, letterSpacing: '0.03em'
          }}>{typeLabel}</div>
        </div>

        {/* Trading Pairs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {agent.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              padding: '2px 8px', borderRadius: 5,
              background: 'rgba(91,95,240,0.1)',
              border: '1px solid rgba(91,95,240,0.2)',
              color: 'var(--color-accent-light)', fontSize: 11, fontWeight: 600
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ROI */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>ROI (30D)</div>
            <div style={{
              fontSize: 22, fontWeight: 900,
              color: agent.pnl && agent.pnl >= 0 ? 'var(--color-green)' : 'var(--color-red)'
            }}>
              {agent.pnl !== undefined ? `${agent.pnl >= 0 ? '+' : ''}${agent.pnl}%` : '—'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Confidence</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: agent.confidence >= 85 ? 'var(--color-green)' : agent.confidence >= 70 ? 'var(--color-gold)' : 'var(--color-text-secondary)' }}>
              {agent.confidence}%
            </div>
          </div>
        </div>

        {/* Signal Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12 }}>
          {[['Entry', `$${agent.price.toLocaleString()}`, false], ['Target', `$${agent.target.toLocaleString()}`, true], ['Stop', `$${agent.stop.toLocaleString()}`, false]].map(([label, val, isGreen]) => (
            <div key={label as string} style={{ textAlign: 'center', padding: '7px 4px', background: 'var(--color-bg-tertiary)', borderRadius: 7 }}>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: isGreen ? 'var(--color-green)' : 'var(--color-text-primary)' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Price & CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>From </span>
            <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-accent-light)' }}>
              ${agent.plans?.monthly || 0}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>/mo</span>
          </div>
          <button style={{
            padding: '7px 14px',
            background: 'linear-gradient(135deg, var(--color-accent), #7b7fff)',
            border: 'none', borderRadius: 8,
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}>
            Subscribe →
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: '20px 24px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900 }} className="gradient-text">{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ─── Navigation ────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: scrolled ? 'rgba(8,9,15,0.95)' : 'rgba(8,9,15,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      transition: 'all 0.3s'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#fff',
          boxShadow: '0 0 20px rgba(91,95,240,0.4)'
        }}>📊</div>
        <span style={{ fontSize: 18, fontWeight: 800 }}>SignalPro</span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: 4 }} className="desktop-nav">
        {['Trade', 'Follow', 'Dashboard', 'Terminal', 'Leaderboard', 'Market', 'Forum'].map(item => (
          <button key={item} onClick={() => item === 'Trade' ? navigate('/') : null} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: 'transparent', color: 'var(--color-text-secondary)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'var(--color-bg-tertiary)'; (e.target as HTMLButtonElement).style.color = 'var(--color-text-primary)' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.color = 'var(--color-text-secondary)' }}
          >{item}</button>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>{user.name[0].toUpperCase()}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/') }} style={{ padding: '6px 10px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={{ padding: '7px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Login</button>
            <button onClick={() => navigate('/register')} style={{ padding: '7px 16px', background: 'linear-gradient(135deg, var(--color-accent), #7b7fff)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Connect Wallet
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

// ─── Trade Page (Home) ────────────────────────────────────────────────────────
function TradePage() {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all')

  const filtered = filter === 'all' ? AGENTS : AGENTS.filter(a => a.type === filter)

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      {/* Hero */}
      <div style={{
        padding: '48px 24px 32px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(91,95,240,0.12) 0%, transparent 60%)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12 }}>
            AI Agent Marketplace
          </h1>
          <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Explore and follow top-performing AI trading agents, powered by advanced large language models.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <StatCard label="Total Trading Volume" value={STATS.totalVolume} />
            <StatCard label="Marketplace Volume" value={STATS.marketplaceVolume} />
            <StatCard label="Agent Earnings" value={STATS.agentEarnings} />
            <StatCard label="Active Agents" value={STATS.activeAgents.toString()} />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ padding: '0 24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'buy', 'sell', 'hold'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: filter === f ? 'var(--color-accent)' : 'var(--color-bg-card)',
                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.15s'
              }}>
                {f === 'all' ? 'All Agents' : f === 'buy' ? '📈 Buy Signals' : f === 'sell' ? '📉 Sell Signals' : '⏸ Hold'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))', gap: 16 }}>
            {filtered.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Login ─────────────────────────────────────────────────────────────────────
function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, pwd)
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Welcome back</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Sign in to your account</div>
        </div>
        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Password"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <button type="submit" style={{ padding: '13px', background: 'linear-gradient(135deg, var(--color-accent), #7b7fff)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent-light)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Register ───────────────────────────────────────────────────────────────────
function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    await register(name, email, pwd)
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Start free today</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>No credit card required</div>
        </div>
        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Min. 8 characters"
            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <button type="submit" style={{ padding: '13px', background: 'linear-gradient(135deg, var(--color-accent), #7b7fff)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Create Account
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<TradePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
