import paypal from '@paypal/checkout-server-sdk'

// ─── PayPal Client Setup ────────────────────────────────────────────────────────
function getPayPalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const mode = process.env.PAYPAL_MODE || 'sandbox'

  if (mode === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

function getPayPalClient() {
  return new paypal.PayPalHttpClient(getPayPalEnvironment())
}

// ─── Plans Configuration ───────────────────────────────────────────────────────
const PLANS = {
  pro: {
    name: 'SignalPro Pro',
    description: 'Pro Plan - Unlimited signals, copy trading, advanced analytics',
    price: '29.00', // USD
    priceYearly: '249.00',
  },
  enterprise: {
    name: 'SignalPro Enterprise',
    description: 'Enterprise Plan - Everything in Pro + API access, SLA guarantee',
    price: '99.00',
    priceYearly: '899.00',
  },
}

// ─── Create Subscription ───────────────────────────────────────────────────────
export async function createSubscription({ userId, planId, annual = false }) {
  const plan = PLANS[planId]
  if (!plan) throw new Error(`Unknown plan: ${planId}`)

  const price = annual ? plan.priceYearly : plan.price
  const interval = annual ? 'YEAR' : 'M'

  const request = new paypal.orders.OrdersCreateRequest()
  request.prefer('return=representation')
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      description: `${plan.name} (${annual ? 'yearly' : 'monthly'})`,
      amount: {
        currency_code: 'USD',
        value: price,
      },
      custom_id: `${userId}|${planId}|${annual ? 'yearly' : 'monthly'}`,
    }],
    application_context: {
      brand_name: 'SignalPro',
      landing_page: 'BILLING',
      user_action: 'PAY_NOW',
      return_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
    },
  })

  const client = getPayPalClient()
  const response = await client.execute(request)
  const order = response.result

  return {
    orderId: order.id,
    approvalUrl: order.links.find(l => l.rel === 'approve')?.href,
    status: order.status,
  }
}

// ─── Capture Order (after PayPal approval) ─────────────────────────────────────
export async function captureOrder(orderId) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId)
  request.prefer('return=representation')
  request.requestBody({})

  const client = getPayPalClient()
  const response = await client.execute(request)
  return response.result
}

// ─── Get Subscription Details ─────────────────────────────────────────────────
export async function getSubscriptionDetails(subscriptionId) {
  const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId)
  const client = getPayPalClient()
  const response = await client.execute(request)
  return response.result
}

// ─── Cancel Subscription ───────────────────────────────────────────────────────
export async function cancelSubscription(subscriptionId) {
  const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId)
  request.requestBody({ note: 'Customer requested cancellation' })
  const client = getPayPalClient()
  await client.execute(request)
  return { success: true }
}

// ─── Check if PayPal is configured ───────────────────────────────────────────
export function isPayPalConfigured() {
  return !!(
    process.env.PAYPAL_CLIENT_ID &&
    process.env.PAYPAL_CLIENT_SECRET &&
    process.env.PAYPAL_CLIENT_ID !== 'your-paypal-client-id'
  )
}
