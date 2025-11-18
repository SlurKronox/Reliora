import { prisma } from '@/lib/db'

export type Workspace = {
  id: string
  creditLimit: number
  creditUsed: number
  creditPeriodStart: Date
  plan: string | null
}

export type CreditState = {
  used: number
  limit: number
  remaining: number
  periodStart: Date
  resetDate: Date
}

export async function getCurrentCreditState(workspaceId: string): Promise<CreditState> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      creditLimit: true,
      creditUsed: true,
      creditPeriodStart: true
    }
  })

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  const periodStart = workspace.creditPeriodStart
  const resetDate = new Date(periodStart)
  resetDate.setMonth(resetDate.getMonth() + 1)

  return {
    used: workspace.creditUsed,
    limit: workspace.creditLimit,
    remaining: workspace.creditLimit - workspace.creditUsed,
    periodStart,
    resetDate,
  }
}

export async function maybeResetCreditPeriod(workspace: Workspace): Promise<Workspace> {
  const periodStart = workspace.creditPeriodStart
  const now = new Date()

  const nextReset = new Date(periodStart)
  nextReset.setMonth(nextReset.getMonth() + 1)

  if (now >= nextReset) {
    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        creditUsed: 0,
        creditPeriodStart: now,
      },
      select: {
        id: true,
        creditLimit: true,
        creditUsed: true,
        creditPeriodStart: true,
        plan: true
      }
    })

    console.log(`[Credits] Reset period for workspace ${workspace.id}. Used: ${workspace.creditUsed} -> 0`)

    await prisma.creditLedger.create({
      data: {
        workspaceId: workspace.id,
        delta: -workspace.creditUsed,
        reason: 'monthly_reset',
      }
    })

    return updated
  }

  return workspace
}

export function estimateCostCredits(aiModel: string): number {
  const model = aiModel.toLowerCase()

  if (model.includes('gpt-4o-mini')) {
    return parseInt(process.env.CREDIT_COST_GPT4O_MINI || '1')
  }
  if (model.includes('gpt-5-nano')) {
    return parseInt(process.env.CREDIT_COST_GPT5_NANO || '1')
  }
  if (model.includes('gpt-5')) {
    return parseInt(process.env.CREDIT_COST_GPT5 || '10')
  }
  if (model.includes('claude') && model.includes('sonnet')) {
    return parseInt(process.env.CREDIT_COST_CLAUDE_SONNET || '5')
  }
  if (model.includes('claude') && model.includes('haiku')) {
    return parseInt(process.env.CREDIT_COST_CLAUDE_HAIKU || '2')
  }
  if (model.includes('gemini') && model.includes('pro')) {
    return parseInt(process.env.CREDIT_COST_GEMINI_PRO || '3')
  }
  if (model.includes('gemini') && model.includes('flash')) {
    return parseInt(process.env.CREDIT_COST_GEMINI_FLASH || '1')
  }

  if (model.includes('gpt-4')) return 10
  if (model.includes('gpt-3.5')) return 1
  if (model.includes('claude-3-opus')) return 15
  if (model.includes('claude-3-sonnet') || model.includes('claude-3-5-sonnet')) return 5
  if (model.includes('claude-3-haiku')) return 2
  if (model.includes('gemini-pro')) return 3
  if (model.includes('gemini')) return 1

  return 5
}

export async function ensureCreditsAndConsume(
  workspaceId: string,
  aiModel: string,
  reportId?: string
): Promise<number> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      creditLimit: true,
      creditUsed: true,
      creditPeriodStart: true,
      plan: true
    }
  })

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  const currentWorkspace = await maybeResetCreditPeriod(workspace)

  const cost = estimateCostCredits(aiModel)
  const newUsed = currentWorkspace.creditUsed + cost

  if (newUsed > currentWorkspace.creditLimit) {
    const remaining = currentWorkspace.creditLimit - currentWorkspace.creditUsed
    throw new Error(
      `Insufficient credits. Required: ${cost}, Available: ${remaining}. ` +
      `Upgrade your plan to get more credits.`
    )
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { creditUsed: newUsed }
  })

  await prisma.creditLedger.create({
    data: {
      workspaceId,
      reportId: reportId || null,
      delta: cost,
      reason: 'report_generation',
    }
  })

  console.log(
    `[Credits] Consumed ${cost} credits for workspace ${workspaceId}. ` +
    `Used: ${currentWorkspace.creditUsed} -> ${newUsed} / ${currentWorkspace.creditLimit}`
  )

  return cost
}

export async function getCreditLedger(workspaceId: string, limit = 50) {
  return await prisma.creditLedger.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}
