'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { createPreference, PLANS, PlanType, CREDIT_PACKAGES } from '@/lib/billing/mercadopago'
import { UnauthorizedError, ValidationError, NotFoundError } from '@/lib/errors'
import { handleActionError } from '@/lib/error-handler'

const upgradePlanSchema = z.object({
  plan: z.enum(['pro', 'business'])
})

const buyCreditsSchema = z.object({
  amount: z.number().min(1000).max(10000)
})

export async function upgradePlan(plan: PlanType) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new UnauthorizedError()
    }

    const workspace = await getUserWorkspace(user.id)
    if (!workspace) {
      throw new NotFoundError('Workspace não encontrado')
    }

    const result = upgradePlanSchema.safeParse({ plan })
    if (!result.success) {
      throw new ValidationError(result.error.errors[0].message)
    }

    const preference = await createPreference({
      workspaceId: workspace.id,
      userId: user.id,
      type: 'subscription',
      plan
    })

    await prisma.paymentHistory.create({
      data: {
        workspaceId: workspace.id,
        type: 'subscription',
        amount: PLANS[plan].price,
        currency: 'BRL',
        status: 'pending',
        externalId: preference.id,
        plan
      }
    })

    return {
      success: true,
      checkoutUrl: process.env.NODE_ENV === 'production'
        ? preference.init_point
        : preference.sandbox_init_point
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function buyCredits(amount: number) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new UnauthorizedError()
    }

    const workspace = await getUserWorkspace(user.id)
    if (!workspace) {
      throw new NotFoundError('Workspace não encontrado')
    }

    const result = buyCreditsSchema.safeParse({ amount })
    if (!result.success) {
      throw new ValidationError(result.error.errors[0].message)
    }

    const pkg = CREDIT_PACKAGES.find(p => p.credits === amount)
    if (!pkg) {
      throw new ValidationError('Pacote de créditos inválido')
    }

    const preference = await createPreference({
      workspaceId: workspace.id,
      userId: user.id,
      type: 'credits',
      creditsAmount: amount
    })

    await prisma.paymentHistory.create({
      data: {
        workspaceId: workspace.id,
        type: 'credits',
        amount: pkg.price,
        currency: 'BRL',
        status: 'pending',
        externalId: preference.id,
        creditsAdded: amount
      }
    })

    return {
      success: true,
      checkoutUrl: process.env.NODE_ENV === 'production'
        ? preference.init_point
        : preference.sandbox_init_point
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getPaymentHistory(limit: number = 20) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new UnauthorizedError()
    }

    const workspace = await getUserWorkspace(user.id)
    if (!workspace) {
      throw new NotFoundError('Workspace não encontrado')
    }

    const history = await prisma.paymentHistory.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return {
      success: true,
      data: history.map(h => ({
        id: h.id,
        type: h.type,
        amount: h.amount,
        currency: h.currency,
        status: h.status,
        plan: h.plan,
        creditsAdded: h.creditsAdded,
        createdAt: h.createdAt.toISOString()
      }))
    }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getCurrentPlan() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new UnauthorizedError()
    }

    const workspace = await getUserWorkspace(user.id)
    if (!workspace) {
      throw new NotFoundError('Workspace não encontrado')
    }

    const workspaceData = await prisma.workspace.findUnique({
      where: { id: workspace.id },
      select: {
        plan: true,
        creditLimit: true,
        creditUsed: true,
        creditPeriodStart: true
      }
    })

    if (!workspaceData) {
      throw new NotFoundError('Dados do workspace não encontrados')
    }

    const currentPlan = (workspaceData.plan || 'free') as PlanType
    const planDetails = PLANS[currentPlan]

    return {
      success: true,
      data: {
        plan: currentPlan,
        planName: planDetails.name,
        planDescription: planDetails.description,
        creditLimit: workspaceData.creditLimit,
        creditUsed: workspaceData.creditUsed,
        creditPeriodStart: workspaceData.creditPeriodStart.toISOString()
      }
    }
  } catch (error) {
    return handleActionError(error)
  }
}
