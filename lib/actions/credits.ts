'use server'

import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { createClient } from '@/lib/db'

export type CreditState = {
  used: number
  limit: number
  remaining: number
  percentageUsed: number
  periodStart: Date
  resetDate: Date
  isLowCredits: boolean
}

export type CreditHistoryEntry = {
  id: string
  createdAt: string
  delta: number
  reason: string
  reportId: string | null
}

export async function getCreditState(): Promise<CreditState | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const workspace = await getUserWorkspace(user.id)
  if (!workspace) return null

  const supabase = createClient()

  const { data: workspaceData, error } = await supabase
    .from('Workspace')
    .select('creditLimit, creditUsed, creditPeriodStart')
    .eq('id', workspace.id)
    .single()

  if (error || !workspaceData) {
    console.error('[Credits] Failed to fetch workspace credit state:', error)
    return null
  }

  const wsData = workspaceData as {
    creditLimit: number
    creditUsed: number
    creditPeriodStart: string
  }

  const periodStart = new Date(wsData.creditPeriodStart)
  const resetDate = new Date(periodStart)
  resetDate.setMonth(resetDate.getMonth() + 1)

  const remaining = wsData.creditLimit - wsData.creditUsed
  const percentageUsed = wsData.creditLimit > 0
    ? (wsData.creditUsed / wsData.creditLimit) * 100
    : 0
  const isLowCredits = percentageUsed >= 80

  return {
    used: wsData.creditUsed,
    limit: wsData.creditLimit,
    remaining: Math.max(0, remaining),
    percentageUsed: Math.min(100, Math.max(0, percentageUsed)),
    periodStart,
    resetDate,
    isLowCredits,
  }
}

export async function getCreditHistory(
  limit: number = 50
): Promise<CreditHistoryEntry[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const workspace = await getUserWorkspace(user.id)
  if (!workspace) return []

  const supabase = createClient()

  const { data, error } = await (supabase as any)
    .from('CreditLedger')
    .select('id, createdAt, delta, reason, reportId')
    .eq('workspaceId', workspace.id)
    .order('createdAt', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Credits] Failed to fetch credit history:', error)
    return []
  }

  return (data || []) as CreditHistoryEntry[]
}
