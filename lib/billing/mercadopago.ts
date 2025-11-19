import crypto from 'crypto'

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN
const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET

export type PlanType = 'free' | 'starter' | 'pro' | 'agency'

export const PLANS = {
  free: {
    name: 'Free',
    credits: 1000,
    price: 0,
    description: 'Teste Reliora',
    maxClients: 3,
    maxUsers: 1,
    allowPdf: false,
    allowPublicLink: false,
    hasWatermark: true
  },
  starter: {
    name: 'Starter',
    credits: 5000,
    price: 47,
    description: 'Para quem está começando',
    maxClients: 10,
    maxUsers: 1,
    allowPdf: false,
    allowPublicLink: false,
    hasWatermark: false
  },
  pro: {
    name: 'Pro',
    credits: 20000,
    price: 97,
    description: 'Plano recomendado',
    maxClients: -1,
    maxUsers: 2,
    allowPdf: true,
    allowPublicLink: true,
    hasWatermark: false
  },
  agency: {
    name: 'Agency',
    credits: 50000,
    price: 197,
    description: 'Para agências que vivem de relatório',
    maxClients: -1,
    maxUsers: 5,
    allowPdf: true,
    allowPublicLink: true,
    hasWatermark: false
  }
} as const

export const CREDIT_PACKAGES = [
  { credits: 10000, price: 37 },
  { credits: 50000, price: 147 }
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
