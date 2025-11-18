import crypto from 'crypto'

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN
const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET

export type PlanType = 'free' | 'pro' | 'business'

export const PLANS = {
  free: {
    name: 'Free',
    credits: 1000,
    price: 0,
    description: '1.000 créditos/mês'
  },
  pro: {
    name: 'Pro',
    credits: 5000,
    price: 97,
    description: '5.000 créditos/mês'
  },
  business: {
    name: 'Business',
    credits: 20000,
    price: 297,
    description: '20.000 créditos/mês'
  }
} as const

export const CREDIT_PACKAGES = [
  { credits: 1000, price: 29 },
  { credits: 3000, price: 79 },
  { credits: 10000, price: 249 }
] as const

export type PreferenceData = {
  workspaceId: string
  userId: string
  type: 'subscription' | 'credits'
  plan?: PlanType
  creditsAmount?: number
}

export async function createPreference(data: PreferenceData) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('Mercado Pago não configurado')
  }

  const { workspaceId, userId, type, plan, creditsAmount } = data

  let title: string
  let price: number
  let metadata: Record<string, any>

  if (type === 'subscription' && plan) {
    const planData = PLANS[plan]
    title = `Reliora ${planData.name} - ${planData.description}`
    price = planData.price
    metadata = {
      type,
      plan,
      workspaceId,
      userId,
      credits: planData.credits
    }
  } else if (type === 'credits' && creditsAmount) {
    const pkg = CREDIT_PACKAGES.find(p => p.credits === creditsAmount)
    if (!pkg) {
      throw new Error('Pacote de créditos inválido')
    }
    title = `${creditsAmount} créditos Reliora`
    price = pkg.price
    metadata = {
      type,
      workspaceId,
      userId,
      credits: creditsAmount
    }
  } else {
    throw new Error('Dados de preferência inválidos')
  }

  const preference = {
    items: [
      {
        title,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: price
      }
    ],
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/app/billing?success=true`,
      failure: `${process.env.NEXTAUTH_URL}/app/billing?error=true`,
      pending: `${process.env.NEXTAUTH_URL}/app/billing?pending=true`
    },
    auto_return: 'approved',
    notification_url: `${process.env.NEXTAUTH_URL}/api/billing/webhook`,
    metadata,
    external_reference: `${type}_${workspaceId}_${Date.now()}`
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[MP] Error creating preference:', error)
      throw new Error('Falha ao criar preferência de pagamento')
    }

    const result = await response.json()

    return {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    }
  } catch (error) {
    console.error('[MP] Create preference error:', error)
    throw error
  }
}

export function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): boolean {
  if (!xSignature || !xRequestId || !MP_WEBHOOK_SECRET) {
    console.error('[MP] Missing webhook validation data')
    return false
  }

  const parts = xSignature.split(',')
  let ts: string | undefined
  let hash: string | undefined

  for (const part of parts) {
    const [key, value] = part.trim().split('=')
    if (key === 'ts') ts = value
    if (key === 'v1') hash = value
  }

  if (!ts || !hash) {
    console.error('[MP] Invalid signature format')
    return false
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hmac = crypto
    .createHmac('sha256', MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex')

  return hmac === hash
}

export async function getPaymentInfo(paymentId: string) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('Mercado Pago não configurado')
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch payment: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[MP] Get payment error:', error)
    throw error
  }
}
