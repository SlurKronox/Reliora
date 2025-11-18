'use server'

import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'

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

  const workspaceData = await prisma.workspace.findUnique({
    where: { id: workspace.id },
    select: {
      creditLimit: true,
      creditUsed: true,
      creditPeriodStart: true
    }
  })

  if (!workspaceData) {
    console.error('[Credits] Failed to fetch workspace credit state')
    return null
  }

  const periodStart = new Date(workspaceData.creditPeriodStart)
  const resetDate = new Date(periodStart)
  resetDate.setMonth(resetDate.getMonth() + 1)

  const remaining = workspaceData.creditLimit - workspaceData.creditUsed
  const percentageUsed = workspaceData.creditLimit > 0
    ? (workspaceData.creditUsed / workspaceData.creditLimit) * 100
    : 0
  const isLowCredits = percentageUsed >= 80

  return {
    used: workspaceData.creditUsed,
    limit: workspaceData.creditLimit,
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

  const data = await prisma.creditLedger.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      createdAt: true,
      delta: true,
      reason: true,
      reportId: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return data.map(entry => ({
    ...entry,
    createdAt: entry.createdAt.toISOString()
  }))
}
