'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/session'
import { getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { generateFakeMetrics } from '@/lib/fakeMetrics'
import { generateWithFallback } from '@/lib/ai/providers'
import { UnauthorizedError, NotFoundError, ValidationError, InsufficientCreditsError } from '@/lib/errors'
import { fetchGA4Metrics } from '@/lib/google/ga4'
import { checkReportRateLimit } from '@/lib/rate-limit'

const reportSchema = z.object({
  clientId: z.string().min(1, 'Client ID obrigatório'),
  periodStart: z.string().min(1, 'Data inicial obrigatória'),
  periodEnd: z.string().min(1, 'Data final obrigatória'),
})

export async function createReportAction(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError('Usuário não autenticado')
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const result = reportSchema.safeParse({
    clientId: formData.get('clientId'),
    periodStart: formData.get('periodStart'),
    periodEnd: formData.get('periodEnd'),
  })

  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message)
  }

  const { clientId, periodStart, periodEnd } = result.data

  // Validate dates
  const startDate = new Date(periodStart)
  const endDate = new Date(periodEnd)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ValidationError('Datas inválidas')
  }

  if (startDate > endDate) {
    throw new ValidationError('Data inicial deve ser anterior à data final')
  }

  // Check if client belongs to workspace
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId: workspace.id,
    },
  }) as any

  if (!client) {
    throw new NotFoundError('Cliente não encontrado')
  }

  await checkReportRateLimit(workspace.id)

  try {
    let metrics
    let useRealData = false

    if (client.ga4PropertyId) {
      try {
        console.log(`[Report] Fetching GA4 metrics for property ${client.ga4PropertyId}`)
        metrics = await fetchGA4Metrics(workspace.id, client.ga4PropertyId, startDate, endDate)
        useRealData = true
        console.log('[Report] Using real GA4 data')
      } catch (ga4Error) {
        console.error('[Report] GA4 fetch failed, falling back to fake metrics:', ga4Error)
        metrics = generateFakeMetrics(startDate, endDate)
        useRealData = false
      }
    } else {
      console.log('[Report] No GA4 property linked, using fake metrics')
      metrics = generateFakeMetrics(startDate, endDate)
    }

    const estimatedCost = 5
    const creditsAvailable = workspace.creditLimit - workspace.creditUsed

    if (creditsAvailable < estimatedCost) {
      throw new InsufficientCreditsError(
        'Créditos insuficientes para gerar relatório',
        estimatedCost,
        creditsAvailable
      )
    }

    const { summary, provider, cost } = await generateWithFallback(
      metrics,
      startDate,
      endDate
    )

    console.log(`[Report] Gerado com ${provider}, custo: ${cost} créditos, GA4 real: ${useRealData}`)

    const report = await prisma.report.create({
      data: {
        clientId,
        periodStart: startDate,
        periodEnd: endDate,
        rawDataJson: JSON.stringify(metrics),
        aiSummaryText: summary,
        aiModel: provider,
        costCredits: cost,
        useRealData
      },
    })

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        creditUsed: {
          increment: cost
        }
      }
    })

    await prisma.creditLedger.create({
      data: {
        workspaceId: workspace.id,
        reportId: report.id,
        delta: -cost,
        reason: `Relatório gerado com ${provider}`
      }
    })

    revalidatePath(`/app/clients/${clientId}`)
    revalidatePath('/app')
    redirect(`/app/reports/${report.id}`)
  } catch (error) {
    console.error('[Report] Error creating report:', error)
    throw error
  }
}
