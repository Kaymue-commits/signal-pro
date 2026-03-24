import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { createSubscription, captureOrder, cancelSubscription, isPayPalConfigured } from './services/paypal.js'

// ─── Load Env ─────────────────────────────────────────────────────────────────
dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())
app.use(cors({
  origin: [FRONTEND_URL, /vercel\.app$/, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

// ─── Auth Middleware ──────────────────────────────────────────────────────────
async function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = auth.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ─── Mock Signals (in addition to DB signals) ─────────────────────────────────
const MOCK_SIGNALS = [
  { id: '1', type: 'buy', symbol: 'NVDA', name: 'NVIDIA Corp', price: 875.42, target: 950, stop: 830, confidence: 92, market: 'US Stock', reason: 'AI chip demand accelerating, data center revenue surging 400% YoY. Options flow shows heavy call buying at $900 strike.', agentName: 'AlphaTrader', agentAvatar: 'AT', upvotes: 234, comments: 45, tags: ['AI', 'Semiconductor'], pnl: 12.4 },
  { id: '2', type: 'sell', symbol: 'TSLA', name: 'Tesla Inc', price: 312.50, target: 285, stop: 330, confidence: 78, market: 'US Stock', reason: 'Margins compressing, EV competition intensifying. Bearish options flow with large put positions at $300.', agentName: 'BearAlpha', agentAvatar: 'BA', upvotes: 189, comments: 67, tags: ['EV', 'Automotive'], pnl: -3.2 },
  { id: '3', type: 'buy', symbol: 'BTC', name: 'Bitcoin', price: 67420, target: 75000, stop: 62000, confidence: 88, market: 'Crypto', reason: 'ETF inflows hitting record highs. On-chain metrics show accumulation phase. Halving catalyst ahead.', agentName: 'CryptoWhale', agentAvatar: 'CW', upvotes: 412, comments: 123, tags: ['Crypto', 'Bitcoin'], pnl: 8.7 },
  { id: '4', type: 'buy', symbol: 'AAPL', name: 'Apple Inc', price: 178.25, target: 195, stop: 168, confidence: 85, market: 'US Stock', reason: 'Services revenue momentum continues, Vision Pro adoption exceeding expectations. Technical breakout above $175.', agentName: 'ValueHunter', agentAvatar: 'VH', upvotes: 156, comments: 34, tags: ['Tech', 'Services'], pnl: 5.1 },
  { id: '5', type: 'hold', symbol: 'SPY', name: 'S&P 500 ETF', price: 524.80, target: 535, stop: 510, confidence: 72, market: 'US Stock', reason: 'Market at resistance. Awaiting Fed minutes and CPI data next week for directional clarity.', agentName: 'MacroKing', agentAvatar: 'MK', upvotes: 98, comments: 28, tags: ['Macro', 'Index'], pnl: 2.3 },
  { id: '6', type: 'buy', symbol: 'GOOGL', name: 'Alphabet Inc', price: 175.60, target: 200, stop: 160, confidence: 90, market: 'US Stock', reason: 'Gemini AI integration driving cloud growth acceleration. Privacy headwinds fading.', agentName: 'AITechFund', agentAvatar: 'AF', upvotes: 287, comments: 56, tags: ['AI', 'Cloud'], pnl: 7.8 },
  { id: '7', type: 'buy', symbol: 'ETH', name: 'Ethereum', price: 3520, target: 4200, stop: 3100, confidence: 86, market: 'Crypto', reason: 'ETF approval speculation building. DeFi TVL surging 60%. Layer 2 adoption accelerating.', agentName: 'CryptoWhale', agentAvatar: 'CW', upvotes: 198, comments: 42, tags: ['Crypto', 'Ethereum', 'DeFi'], pnl: 11.2 },
  { id: '8', type: 'sell', symbol: 'META', name: 'Meta Platforms', price: 502.30, target: 460, stop: 525, confidence: 75, market: 'US Stock', reason: 'Regulation headwinds in EU. Ad revenue growth slowing. Technical resistance at $510.', agentName: 'BearAlpha', agentAvatar: 'BA', upvotes: 134, comments: 29, tags: ['Tech', 'Social Media'], pnl: -1.5 },
]

// ─── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, plan: 'free' },
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      token,
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })

    res.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      token,
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', authenticate, async (req, res) => {
  const { password: _, ...user } = req.user
  res.json({ user })
})

// ─── User Routes ──────────────────────────────────────────────────────────────
app.get('/api/user', authenticate, async (req, res) => {
  const { password: _, ...user } = req.user
  res.json({ user })
})

// ─── Signals Routes ────────────────────────────────────────────────────────────
app.get('/api/signals', async (req, res) => {
  try {
    const { type, market, limit = 20 } = req.query

    // Get signals from DB
    const dbSignals = await prisma.signal.findMany({
      where: {
        isActive: true,
        ...(type && type !== 'all' ? { type } : {}),
        ...(market && market !== 'all' ? { market } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    })

    // Combine with mock signals
    const combined = [
      ...dbSignals.map(s => ({ ...s, tags: JSON.parse(s.tags || '[]') })),
      ...MOCK_SIGNALS,
    ]

    // Dedupe by id
    const seen = new Set()
    const signals = combined.filter(s => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })

    // Filter
    const filtered = signals.filter(s => {
      if (type && type !== 'all' && s.type !== type) return false
      if (market && market !== 'all' && s.market !== market) return false
      return true
    })

    res.json({ signals: filtered.slice(0, Number(limit)) })
  } catch (err) {
    console.error('Signals error:', err)
    res.status(500).json({ error: 'Failed to fetch signals' })
  }
})

// Pro signals (only for paid users)
app.get('/api/signals/pro', authenticate, async (req, res) => {
  if (req.user.plan === 'free') {
    return res.status(403).json({ error: 'Upgrade to Pro to access exclusive signals' })
  }
  // For now, return all signals with additional pro data
  const signals = await prisma.signal.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ signals: signals.map(s => ({ ...s, tags: JSON.parse(s.tags || '[]') })) })
})

// Create signal (admin/pro users)
app.post('/api/signals', authenticate, async (req, res) => {
  if (req.user.plan === 'free') {
    return res.status(403).json({ error: 'Pro/Enterprise plan required' })
  }

  try {
    const { type, symbol, name, price, target, stop, confidence, market, reason, agentName, agentAvatar, tags } = req.body

    const signal = await prisma.signal.create({
      data: {
        type, symbol, name, price: Number(price), target: Number(target),
        stop: Number(stop), confidence: Number(confidence), market,
        reason, agentName, agentAvatar,
        tags: JSON.stringify(tags || []),
        userId: req.user.id,
      },
    })

    res.status(201).json({ signal: { ...signal, tags: JSON.parse(signal.tags) } })
  } catch (err) {
    console.error('Create signal error:', err)
    res.status(500).json({ error: 'Failed to create signal' })
  }
})

// Upvote a signal
app.post('/api/signals/:id/upvote', authenticate, async (req, res) => {
  try {
    const signalId = req.params.id
    const existing = await prisma.upvote.findUnique({
      where: { userId_signalId: { userId: req.user.id, signalId } },
    })

    if (existing) {
      // Remove upvote
      await prisma.upvote.delete({ where: { id: existing.id } })
      await prisma.signal.update({ where: { id: signalId }, data: { upvotesCount: { decrement: 1 } } })
      res.json({ upvoted: false })
    } else {
      await prisma.upvote.create({ data: { userId: req.user.id, signalId } })
      await prisma.signal.update({ where: { id: signalId }, data: { upvotesCount: { increment: 1 } } })
      res.json({ upvoted: true })
    }
  } catch (err) {
    console.error('Upvote error:', err)
    res.status(500).json({ error: 'Failed to upvote' })
  }
})

// ─── PayPal Payment Routes ─────────────────────────────────────────────────────
app.post('/api/payments/create-order', authenticate, async (req, res) => {
  try {
    const { planId, annual = false } = req.body

    if (!['pro', 'enterprise'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    if (!isPayPalConfigured()) {
      // Demo mode - simulate PayPal
      const mockOrder = {
        orderId: `demo_order_${Date.now()}`,
        approvalUrl: `${FRONTEND_URL}/dashboard?demo=1&plan=${planId}&annual=${annual}`,
        status: 'CREATED',
      }

      await prisma.payment.create({
        data: {
          userId: req.user.id,
          orderId: mockOrder.orderId,
          amount: annual ? (planId === 'pro' ? 249 : 899) : (planId === 'pro' ? 29 : 99),
          status: 'CREATED',
          plan: planId,
        },
      })

      return res.json(mockOrder)
    }

    const { orderId, approvalUrl, status } = await createSubscription({
      userId: req.user.id,
      planId,
      annual,
    })

    await prisma.payment.create({
      data: {
        userId: req.user.id,
        orderId,
        amount: annual ? (planId === 'pro' ? 249 : 899) : (planId === 'pro' ? 29 : 99),
        status,
        plan: planId,
      },
    })

    res.json({ orderId, approvalUrl, status })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

app.post('/api/payments/capture/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params
    const payment = await prisma.payment.findUnique({ where: { orderId } })

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (payment.status === 'COMPLETED') {
      return res.json({ message: 'Already completed', payment })
    }

    if (isPayPalConfigured()) {
      await captureOrder(orderId)
    }

    await prisma.payment.update({
      where: { orderId },
      data: { status: 'COMPLETED' },
    })

    // Upgrade user plan
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        plan: payment.plan,
        subscriptionStatus: 'ACTIVE',
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paypalOrderId: orderId,
      },
    })

    res.json({ success: true, plan: payment.plan })
  } catch (err) {
    console.error('Capture error:', err)
    res.status(500).json({ error: 'Failed to capture payment' })
  }
})

app.get('/api/payments/status', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  res.json({
    plan: user?.plan,
    status: user?.subscriptionStatus,
    end: user?.subscriptionEnd,
  })
})

app.post('/api/payments/cancel', authenticate, async (req, res) => {
  try {
    if (!req.user.paypalSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' })
    }

    if (isPayPalConfigured()) {
      await cancelSubscription(req.user.paypalSubscriptionId)
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { plan: 'free', subscriptionStatus: 'CANCELLED' },
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    res.status(500).json({ error: 'Failed to cancel subscription' })
  }
})

// ─── PayPal Webhook ──────────────────────────────────────────────────────────
app.post('/api/webhooks/paypal', express.text({ type: 'application/json' }), async (req, res) => {
  // Handle PayPal webhooks for production
  console.log('PayPal webhook received:', req.body)
  res.json({ received: true })
})

// ─── Pricing Info ─────────────────────────────────────────────────────────────
app.get('/api/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free', price: { monthly: 0, yearly: 0 }, features: ['5 signals/day', 'Delayed feed (15min)', 'Basic overview'] },
      { id: 'pro', name: 'Pro', price: { monthly: 29, yearly: 249 }, features: ['Unlimited signals', 'Copy trading', 'Advanced analytics', 'Priority support'] },
      { id: 'enterprise', name: 'Enterprise', price: { monthly: 99, yearly: 899 }, features: ['Everything in Pro', 'API access', 'Dedicated manager', 'SLA'] },
    ],
    paypalConfigured: isPayPalConfigured(),
  })
})

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`SignalPro API running on http://localhost:${PORT}`)
  console.log(`PayPal: ${isPayPalConfigured() ? '✅ Configured' : '⚠️ Demo mode (set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env)'}`)
})
