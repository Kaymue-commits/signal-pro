import { useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AreaChart, Area } from 'recharts'
import { User, LogOut, ChevronDown, TrendingUp, ArrowUpRight } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Signal {
  id: string
  type: 'buy' | 'sell' | 'hold'
  symbol: string
  name: string
  description: string
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
  pnl: number
  subscribers: number
  winRate: number
  totalSignals: number
  avgProfit: number
  plans: { monthly: number; yearly: number }
  chartData: { v: number }[]
}

interface User { id: string; email: string; name: string; plan: 'free' | 'pro' | 'enterprise' }

// ─── Auth ─────────────────────────────────────────────────────────────────────
const AuthContext = createContext<{ user: User | null; login: (e: string, p: string) => Promise<void>; register: (n: string, e: string, p: string) => Promise<void>; logout: () => void }>({ user: null, login: async () => {}, register: async () => {}, logout: () => {} })
const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => { try { const s = localStorage.getItem('sp_u'); return s ? JSON.parse(s) : null } catch { return null } })
  const login = async (email: string, _p: string) => { await new Promise(r => setTimeout(r, 600)); const u: User = { id: '1', email, name: email.split('@')[0], plan: 'pro' }; setUser(u); localStorage.setItem('sp_u', JSON.stringify(u)) }
  const register = async (name: string, email: string, _p: string) => { await new Promise(r => setTimeout(r, 600)); const u: User = { id: '1', email, name, plan: 'free' }; setUser(u); localStorage.setItem('sp_u', JSON.stringify(u)) }
  const logout = () => { setUser(null); localStorage.removeItem('sp_u') }
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
function genChart(pnl: number) {
  let v = 50 + Math.random() * 20
  return Array.from({ length: 24 }, () => ({ v: v += (Math.random() - 0.45) * (pnl > 0 ? 3 : -2) }))
}

const AGENTS: Signal[] = [
  { id: '1', type: 'buy', symbol: 'NVDA', name: 'Alpha Seekers', description: 'Expert in semiconductor & AI chip stocks, 5Y proven track record', price: 875.42, target: 950, stop: 830, confidence: 92, market: 'US Stock', reason: 'AI chip demand surging, data center revenue +400% YoY', agentName: 'Alpha Seekers', agentAvatar: 'AS', upvotes: 234, comments: 45, tags: ['AI', 'Semiconductor'], pnl: 184.5, subscribers: 2421, winRate: 87, totalSignals: 342, avgProfit: 12.4, plans: { monthly: 25, yearly: 240 }, chartData: genChart(184.5) },
  { id: '2', type: 'buy', symbol: 'BTC', name: 'CryptoWhale', description: 'Deep crypto market analysis, on-chain & macro expert', price: 67420, target: 75000, stop: 62000, confidence: 88, market: 'Crypto', reason: 'ETF inflows record high, halving catalyst ahead', agentName: 'CryptoWhale', agentAvatar: 'CW', upvotes: 412, comments: 123, tags: ['Crypto', 'Bitcoin'], pnl: 126.3, subscribers: 4892, winRate: 91, totalSignals: 567, avgProfit: 18.7, plans: { monthly: 30, yearly: 290 }, chartData: genChart(126.3) },
  { id: '3', type: 'sell', symbol: 'TSLA', name: 'Alpha Trend', description: 'EV & automotive sector specialist, short-term swing trades', price: 312.50, target: 285, stop: 330, confidence: 78, market: 'US Stock', reason: 'Margins compressing, EV competition intensifying', agentName: 'Alpha Trend', agentAvatar: 'AT', upvotes: 189, comments: 67, tags: ['EV', 'Automotive'], pnl: -23.1, subscribers: 834, winRate: 72, totalSignals: 198, avgProfit: -3.2, plans: { monthly: 20, yearly: 190 }, chartData: genChart(-23.1) },
  { id: '4', type: 'buy', symbol: 'ETH', name: 'Golden Goose', description: 'Ethereum ecosystem & DeFi specialist, long-term holder', price: 3520, target: 4200, stop: 3100, confidence: 86, market: 'Crypto', reason: 'ETF approval speculation, DeFi TVL surging 60%', agentName: 'Golden Goose', agentAvatar: 'GG', upvotes: 356, comments: 89, tags: ['Crypto', 'Ethereum'], pnl: 89.2, subscribers: 1923, winRate: 89, totalSignals: 423, avgProfit: 17.3, plans: { monthly: 35, yearly: 340 }, chartData: genChart(89.2) },
  { id: '5', type: 'buy', symbol: 'AAPL', name: 'Rising Star', description: 'Tech giant specialist, earnings & product cycle trader', price: 178.25, target: 195, stop: 168, confidence: 85, market: 'US Stock', reason: 'Services revenue momentum, Vision Pro adoption strong', agentName: 'Rising Star', agentAvatar: 'RS', upvotes: 156, comments: 34, tags: ['Tech', 'Services'], pnl: 67.8, subscribers: 567, winRate: 82, totalSignals: 234, avgProfit: 9.7, plans: { monthly: 15, yearly: 140 }, chartData: genChart(67.8) },
  { id: '6', type: 'hold', symbol: 'SPY', name: 'Alpha Orbit', description: 'Macro & index trading, Fed policy expert', price: 524.80, target: 535, stop: 510, confidence: 72, market: 'US Stock', reason: 'Awaiting Fed minutes and CPI data', agentName: 'Alpha Orbit', agentAvatar: 'AO', upvotes: 98, comments: 28, tags: ['Macro', 'Index'], pnl: 23.4, subscribers: 445, winRate: 78, totalSignals: 156, avgProfit: 5.6, plans: { monthly: 18, yearly: 170 }, chartData: genChart(23.4) },
  { id: '7', type: 'buy', symbol: 'GOOGL', name: 'Tech Momentum', description: 'AI & cloud tech stocks, momentum trader', price: 175.60, target: 200, stop: 160, confidence: 90, market: 'US Stock', reason: 'Gemini AI driving cloud growth acceleration', agentName: 'Tech Momentum', agentAvatar: 'TM', upvotes: 287, comments: 56, tags: ['AI', 'Cloud'], pnl: 112.7, subscribers: 1102, winRate: 85, totalSignals: 289, avgProfit: 11.2, plans: { monthly: 28, yearly: 270 }, chartData: genChart(112.7) },
  { id: '8', type: 'buy', symbol: 'SOL', name: 'Meme Master', description: 'Meme coin & Solana ecosystem, high-risk high-reward', price: 148.30, target: 180, stop: 125, confidence: 81, market: 'Crypto', reason: 'DeFi activity on Solana surging, NFT volume +300%', agentName: 'Meme Master', agentAvatar: 'MM', upvotes: 445, comments: 167, tags: ['Crypto', 'Solana'], pnl: 312.8, subscribers: 3456, winRate: 94, totalSignals: 678, avgProfit: 33.1, plans: { monthly: 39, yearly: 380 }, chartData: genChart(312.8) },
]

const STATS = { total: '$42.6M', change: '+5.3%', changeNum: 5.3, agents: 1247, signals: 8923 }

// ─── Components ───────────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: { v: number }[]; positive: boolean }) {
  return (
    <AreaChart data={data} width={120} height={40}>
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#00d4a1' : '#ff4d6a'} stopOpacity={0.3} />
          <stop offset="100%" stopColor={positive ? '#00d4a1' : '#ff4d6a'} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={positive ? '#00d4a1' : '#ff4d6a'} strokeWidth={1.5} fill={`url(#sg-${positive})`} />
    </AreaChart>
  )
}

function AgentCard({ agent }: { agent: Signal }) {
  const positive = agent.pnl >= 0
  const typeColor = agent.type === 'buy' ? 'var(--color-green)' : agent.type === 'sell' ? 'var(--color-red)' : 'var(--color-gold)'
  const typeBg = agent.type === 'buy' ? 'var(--color-green-bg)' : agent.type === 'sell' ? 'var(--color-red-bg)' : 'var(--color-gold-bg)'

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent-border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-card-hover)' }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-card)' }}
    >
      {/* Card Header */}
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0
            }}>{agent.agentAvatar}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{agent.agentName}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{agent.description}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{
              padding: '2px 8px', borderRadius: 6,
              background: typeBg, color: typeColor,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.03em'
            }}>{agent.type.toUpperCase()}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>🐋 {agent.subscribers.toLocaleString()}</div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 5 }}>
          {agent.tags.map(tag => (
            <span key={tag} style={{
              padding: '2px 7px', borderRadius: 5,
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 600
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ROI + Chart */}
      <div style={{ padding: '0 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>ROI (24H)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: positive ? 'var(--color-green)' : 'var(--color-red)' }}>
              {positive ? '+' : ''}{agent.pnl}%
            </span>
            {positive
              ? <TrendingUp size={14} style={{ color: 'var(--color-green)' }} />
              : <TrendingUp size={14} style={{ color: 'var(--color-red)', transform: 'rotate(180deg)' }} />
            }
          </div>
        </div>
        <Sparkline data={agent.chartData} positive={positive} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-border)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        {[['Win Rate', `${agent.winRate}%`], ['Total Signals', agent.totalSignals.toString()], ['Avg Profit', `${agent.avgProfit}%`]].map(([label, val]) => (
          <div key={label as string} style={{ background: 'var(--color-bg-secondary)', padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>From </span>
          <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--color-accent-light)' }}>${agent.plans.monthly}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>/mo</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '6px 14px',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, color: 'var(--color-text-primary)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}>Follow</button>
          <button style={{
            padding: '6px 14px',
            background: 'var(--color-accent)',
            border: '1px solid var(--color-accent)',
            borderRadius: 8, color: '#fff',
            fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}>Trade ↗</button>
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 14px', borderRadius: 8, border: 'none',
      background: active ? 'var(--color-accent)' : 'var(--color-bg-card)',
      color: active ? '#fff' : 'var(--color-text-secondary)',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
    }}>{label}</button>
  )
}

function SelectChip({ label }: { label: string }) {
  return (
    <button style={{
      padding: '5px 14px', borderRadius: 8, border: 'none',
      background: 'var(--color-bg-card)',
      color: 'var(--color-text-secondary)',
      fontSize: 13, fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 5
    }}>{label} <ChevronDown size={12} /></button>
  )
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      background: 'rgba(11,13,20,0.98)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {/* Logo + Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff'
          }}>📊</div>
          <span style={{ fontSize: 16, fontWeight: 800 }}>SignalPro</span>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {['Trade', 'Follow', 'Dashboard', 'Terminal', 'Leaderboard', 'Market', 'Forum'].map((item) => (
            <button key={item}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: item === 'Trade' ? 'rgba(91,95,240,0.15)' : 'transparent',
                color: item === 'Trade' ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                fontSize: 13, fontWeight: item === 'Trade' ? 700 : 500, cursor: 'pointer'
              }}>
              {item}
              {item === 'Trade' && <div style={{ height: 2, background: 'var(--color-accent)', borderRadius: 1, marginTop: 2 }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>{user.name[0].toUpperCase()}</div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/') }} style={{ padding: '5px 8px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={{ padding: '6px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Log In</button>
            <button onClick={() => navigate('/register')} style={{ padding: '6px 14px', background: 'var(--color-accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Sign Up
            </button>
            <button style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              Connect Wallet <ArrowUpRight size={12} />
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

// ─── Trade Page ─────────────────────────────────────────────────────────────
function TradePage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all')
  const [marketFilter] = useState('all')

  const filtered = AGENTS.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false
    if (marketFilter !== 'all' && a.market !== marketFilter) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', paddingTop: 52 }}>
      {/* Filters Row */}
      <div style={{
        padding: '10px 20px',
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'
      }}>
        {/* Type filters */}
        {(['all', 'buy', 'sell', 'hold'] as const).map(f => (
          <FilterChip key={f} label={f === 'all' ? 'All' : f === 'buy' ? 'Buy' : f === 'sell' ? 'Sell' : 'Hold'} active={typeFilter === f} onClick={() => setTypeFilter(f)} />
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />

        {/* Market filters */}
        {['all', 'US Stock', 'Crypto', 'Forex', 'Futures'].map(m => (
          <SelectChip key={m} label={m === 'all' ? 'All Markets' : m} />
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />

        <SelectChip label="Sort: Hot" />
        <SelectChip label="24H" />
      </div>

      {/* Stats Row */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Total:</span>
          <span style={{ fontSize: 15, fontWeight: 900 }}>{STATS.total}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-green)' }}>{STATS.change}</span>
          <TrendingUp size={13} style={{ color: 'var(--color-green)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{STATS.agents.toLocaleString()} agents</span>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{STATS.signals.toLocaleString()} signals</span>
        </div>
      </div>

      {/* Agent Grid */}
      <div style={{ padding: '16px 20px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300, 1fr))', gap: 14 }}>
          {filtered.map(agent => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Login / Register ────────────────────────────────────────────────────────
function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Welcome back</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Sign in to your account</div>
        </div>
        <form onSubmit={async e => { e.preventDefault(); await login(email, pwd); navigate('/') }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address" style={{ width: '100%', padding: '11px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Password" style={{ width: '100%', padding: '11px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <button type="submit" style={{ padding: '12px', background: 'var(--color-accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Sign In</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent-light)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </div>
      </div>
    </div>
  )
}

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Start free today</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>No credit card required</div>
        </div>
        <form onSubmit={async e => { e.preventDefault(); await register(name, email, pwd); navigate('/') }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" style={{ width: '100%', padding: '11px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address" style={{ width: '100%', padding: '11px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Min. 8 characters" style={{ width: '100%', padding: '11px 14px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
          <button type="submit" style={{ padding: '12px', background: 'var(--color-accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create Account</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Router ─────────────────────────────────────────────────────────────────
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
