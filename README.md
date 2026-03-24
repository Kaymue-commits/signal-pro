# SignalPro - AI Trading Signals Platform

A commercial-ready AI-powered trading signals platform with PayPal payments, user authentication, and real-time signal delivery.

**Live Demo:** https://signal-pro-two.vercel.app

---

## 🏗️ Architecture

```
signal-pro/
├── src/                    # React frontend (Vercel)
│   ├── App.tsx            # Main app with routing
│   ├── index.css          # Global styles
│   └── services/
│       └── api.ts         # API service layer
├── server/                # Node.js backend
│   ├── src/
│   │   ├── index.js      # Express API server
│   │   └── services/
│   │       └── paypal.js # PayPal SDK integration
│   └── prisma/
│       └── schema.prisma  # Database schema
├── vercel.json            # Vercel frontend config
└── data/                  # SQLite database (gitignored)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/signal-pro.git
cd signal-pro
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Set Up Backend

```bash
cd server

# Copy environment variables
cp .env.example .env

# Edit .env with your values:
# - JWT_SECRET: generate a long random string
# - PAYPAL_CLIENT_ID: from developer.paypal.com
# - PAYPAL_CLIENT_SECRET: from developer.paypal.com
# - DATABASE_URL: for local SQLite use: file../../data/signalpro.db

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Start backend
npm run dev
```

Backend runs on **http://localhost:3001**

### 3. Set Up Frontend

```bash
# In another terminal
cd signal-pro
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔧 Environment Variables

### Server (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite local or PostgreSQL production | `file../../data/signalpro.db` |
| `JWT_SECRET` | Random secret for JWT signing | `your-very-long-secret-key` |
| `PAYPAL_CLIENT_ID` | From PayPal Developer Dashboard | `AeXxx...` |
| `PAYPAL_CLIENT_SECRET` | From PayPal Developer Dashboard | `EIXxx...` |
| `PAYPAL_MODE` | `sandbox` (dev) or `live` (prod) | `sandbox` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Your frontend URL | `http://localhost:5173` |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (empty = same origin in production) |

---

## 💳 PayPal Setup

1. Go to https://developer.paypal.com
2. Create a **Sandbox** app (for testing) or **Live** app (for production)
3. Copy **Client ID** and **Client Secret**
4. Add them to your `.env` file
5. Set `PAYPAL_MODE=sandbox` for testing, `PAYPAL_MODE=live` for production

### PayPal Testing Flow
1. Create a PayPal Developer account
2. Use sandbox accounts from the Developer Dashboard
3. Test the full payment flow without real money

---

## 🗄️ Database

### Local Development (SQLite)
```env
DATABASE_URL="file../../data/signalpro.db"
```

Data is stored in `data/signalpro.db` (gitignored).

### Production (PostgreSQL Recommended)

**Supabase (easiest):**
1. Create project at supabase.com
2. Get connection string from Settings → Database
3. Update `DATABASE_URL`:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

**Neon, Railway, Render, etc.:** Similar PostgreSQL connection strings.

After changing `DATABASE_URL`:
```bash
cd server
npx prisma db push    # Push schema
npx prisma generate   # Regenerate client
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd signal-pro
vercel --prod
```

Vercel auto-detects Vite + React.

### Backend → Railway/Render/Fly.io

**Railway (recommended for simplicity):**
1. Connect GitHub repo to Railway
2. Set environment variables from `.env`
3. Railway auto-detects Node.js and starts `npm start`
4. Note the deployment URL (e.g., `https://signal-pro.up.railway.app`)
5. Update frontend `VITE_API_URL` to your Railway URL

### Custom Domain

**Vercel Frontend:** Add domain in Project Settings → Domains

**Backend:** Add domain in Railway/Render settings → Custom Domains

---

## 🔐 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a long random value
- [ ] Set `PAYPAL_MODE=live`
- [ ] Use real PostgreSQL (not SQLite) in production
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set correct `FRONTEND_URL` to your production domain
- [ ] Review PayPal IPN/webhook configuration
- [ ] Enable database connection pooling for PostgreSQL

---

## 📊 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/signals` | ❌ | List signals |
| GET | `/api/signals/pro` | ✅ Pro | Pro signals only |
| POST | `/api/signals` | ✅ Pro | Create signal |
| POST | `/api/signals/:id/upvote` | ✅ | Toggle upvote |
| POST | `/api/payments/create-order` | ✅ | Create PayPal order |
| POST | `/api/payments/capture/:orderId` | ✅ | Capture payment |
| GET | `/api/payments/status` | ✅ | Get subscription status |
| POST | `/api/payments/cancel` | ✅ | Cancel subscription |
| GET | `/api/plans` | ❌ | Get plan info |
| GET | `/api/health` | ❌ | Health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS 4, React Router, Recharts |
| Backend | Node.js, Express, Prisma ORM |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Payments | PayPal Checkout SDK |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend), Railway (backend) |

---

## 📝 License

MIT
