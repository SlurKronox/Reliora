import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateWebhookSignature, getPaymentInfo, PLANS } from '@/lib/billing/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    const body = await request.json()

    console.log('[MP Webhook] Received:', {
      type: body.type,
      action: body.action,
      dataId: body.data?.id
    })

    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      console.error('[MP Webhook] Missing payment ID')
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    if (!validateWebhookSignature(xSignature, xRequestId, paymentId)) {
      console.error('[MP Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const paymentInfo = await getPaymentInfo(paymentId)

    console.log('[MP Webhook] Payment info:', {
      id: paymentInfo.id,
      status: paymentInfo.status,
      metadata: paymentInfo.metadata
    })

    const metadata = paymentInfo.metadata
    if (!metadata?.workspaceId) {
      console.error('[MP Webhook] Missing workspace ID in metadata')
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    const paymentHistory = await prisma.paymentHistory.findFirst({
      where: { externalId: paymentInfo.id.toString() }
    })

    if (paymentHistory) {
      await prisma.paymentHistory.update({
        where: { id: paymentHistory.id },
        data: {
          status: paymentInfo.status,
          externalStatus: paymentInfo.status_detail,
          metadata: JSON.stringify(paymentInfo.metadata)
        }
      })
    } else {
      await prisma.paymentHistory.create({
        data: {
          workspaceId: metadata.workspaceId,
          type: metadata.type || 'unknown',
          amount: paymentInfo.transaction_amount || 0,
          currency: paymentInfo.currency_id || 'BRL',
          status: paymentInfo.status,
          externalId: paymentInfo.id.toString(),
          externalStatus: paymentInfo.status_detail,
          plan: metadata.plan,
          creditsAdded: metadata.credits,
          metadata: JSON.stringify(metadata)
        }
      })
    }

    if (paymentInfo.status === 'approved') {
      const workspace = await prisma.workspace.findUnique({
        where: { id: metadata.workspaceId }
      })

      if (!workspace) {
        console.error('[MP Webhook] Workspace not found')
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
      }

      if (metadata.type === 'subscription' && metadata.plan) {
        const planData = PLANS[metadata.plan as keyof typeof PLANS]

        await prisma.workspace.update({
          where: { id: workspace.id },
          data: {
            plan: metadata.plan,
            creditLimit: planData.credits,
            creditUsed: 0,
            creditPeriodStart: new Date()
          }
        })

        await prisma.creditLedger.create({
          data: {
            workspaceId: workspace.id,
            delta: -workspace.creditUsed,
            reason: `plan_upgrade_${metadata.plan}`
          }
        })

        console.log(`[MP Webhook] Plan upgraded: ${workspace.id} -> ${metadata.plan}`)
      } else if (metadata.type === 'credits' && metadata.credits) {
        await prisma.workspace.update({
          where: { id: workspace.id },
          data: {
            creditLimit: workspace.creditLimit + metadata.credits
          }
        })

        await prisma.creditLedger.create({
          data: {
            workspaceId: workspace.id,
            delta: 0,
            reason: `credits_purchase_${metadata.credits}`
          }
        })

        console.log(`[MP Webhook] Credits added: ${workspace.id} +${metadata.credits}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[MP Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
