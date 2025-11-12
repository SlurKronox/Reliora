import { createClient } from '@/lib/db'

export type Workspace = {
  id: string
  creditLimit: number
  creditUsed: number
  creditPeriodStart: string
  plan: string | null
}

export type CreditState = {
  used: number
  limit: number
  remaining: number
  periodStart: Date
  resetDate: Date
}

/**
 * Get current credit state for a workspace
 */
export async function getCurrentCreditState(workspaceId: string): Promise<CreditState> {
  const supabase = createClient()

  const { data: workspace, error }: {
    data: { creditLimit: number; creditUsed: number; creditPeriodStart: string } | null;
    error: any;
  } = await supabase
    .from('Workspace')
    .select('creditLimit, creditUsed, creditPeriodStart')
    .eq('id', workspaceId)
    .single()

  if (error || !workspace) {
    throw new Error(`Failed to fetch workspace credit state: ${error?.message}`)
  }

  const periodStart = new Date(workspace.creditPeriodStart)
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

/**
 * Reset credits if current period has expired (monthly reset)
 */
export async function maybeResetCreditPeriod(workspace: Workspace): Promise<Workspace> {
  const periodStart = new Date(workspace.creditPeriodStart)
  const now = new Date()

  // Calculate next reset date (1 month from period start)
  const nextReset = new Date(periodStart)
  nextReset.setMonth(nextReset.getMonth() + 1)

  // If we're past the reset date, reset the period
  if (now >= nextReset) {
    const supabase = createClient()

    // @ts-ignore - new columns not yet in types
    const { data: updated, error }: { data: Workspace | null; error: any } = await (supabase as any)
      .from('Workspace')
      .update({
        creditUsed: 0,
        creditPeriodStart: now.toISOString(),
      })
      .eq('id', workspace.id)
      .select()
      .single()

    if (error || !updated) {
      console.error('Failed to reset credit period:', error)
      return workspace
    }

    console.log(`[Credits] Reset period for workspace ${workspace.id}. Used: ${workspace.creditUsed} -> 0`)

    // Log the reset in credit ledger
    // @ts-ignore - CreditLedger is a new table not yet in types
    await (supabase as any)
      .from('CreditLedger')
      .insert({
        workspaceId: workspace.id,
        delta: -workspace.creditUsed,
        reason: 'monthly_reset',
      })

    return {
      ...workspace,
      creditUsed: 0,
      creditPeriodStart: now.toISOString(),
    }
  }

  return workspace
}

/**
 * Estimate credit cost for an AI model
 */
export function estimateCostCredits(aiModel: string): number {
  const model = aiModel.toLowerCase()

  // Check environment variables first
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

  // Default costs by model family
  if (model.includes('gpt-4')) return 10
  if (model.includes('gpt-3.5')) return 1
  if (model.includes('claude-3-opus')) return 15
  if (model.includes('claude-3-sonnet') || model.includes('claude-3-5-sonnet')) return 5
  if (model.includes('claude-3-haiku')) return 2
  if (model.includes('gemini-pro')) return 3
  if (model.includes('gemini')) return 1

  // Default cost
  return 5
}

/**
 * Check if workspace has enough credits and consume them
 * Throws error if insufficient credits
 */
export async function ensureCreditsAndConsume(
  workspaceId: string,
  aiModel: string,
  reportId?: string
): Promise<number> {
  const supabase = createClient()

  // Get current workspace state
  const { data: workspace, error: fetchError } = await supabase
    .from('Workspace')
    .select('id, creditLimit, creditUsed, creditPeriodStart, plan')
    .eq('id', workspaceId)
    .single()

  if (fetchError || !workspace) {
    throw new Error(`Failed to fetch workspace: ${fetchError?.message}`)
  }

  // Maybe reset period if expired
  const currentWorkspace = await maybeResetCreditPeriod(workspace as Workspace)

  // Calculate cost
  const cost = estimateCostCredits(aiModel)
  const newUsed = currentWorkspace.creditUsed + cost

  // Check if sufficient credits
  if (newUsed > currentWorkspace.creditLimit) {
    const remaining = currentWorkspace.creditLimit - currentWorkspace.creditUsed
    throw new Error(
      `Insufficient credits. Required: ${cost}, Available: ${remaining}. ` +
      `Upgrade your plan to get more credits.`
    )
  }

  // Consume credits
  // @ts-ignore - new columns not yet in types
  const { error: updateError } = await (supabase as any)
    .from('Workspace')
    .update({ creditUsed: newUsed })
    .eq('id', workspaceId)

  if (updateError) {
    throw new Error(`Failed to consume credits: ${updateError.message}`)
  }

  // Log to credit ledger
  // @ts-ignore - CreditLedger is a new table not yet in types
  await (supabase as any)
    .from('CreditLedger')
    .insert({
      workspaceId,
      reportId: reportId || null,
      delta: cost,
      reason: 'report_generation',
    })

  console.log(
    `[Credits] Consumed ${cost} credits for workspace ${workspaceId}. ` +
    `Used: ${currentWorkspace.creditUsed} -> ${newUsed} / ${currentWorkspace.creditLimit}`
  )

  return cost
}

/**
 * Get credit ledger entries for a workspace
 */
export async function getCreditLedger(workspaceId: string, limit = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('CreditLedger')
    .select('*')
    .eq('workspaceId', workspaceId)
    .order('createdAt', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch credit ledger:', error)
    return []
  }

  return data || []
}
