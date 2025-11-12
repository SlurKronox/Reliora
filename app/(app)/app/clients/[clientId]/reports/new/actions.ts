'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/session'
import { getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { generateFakeMetrics } from '@/lib/fakeMetrics'
import { generateMarketingSummary } from '@/lib/ai/summary'

const reportSchema = z.object({
  clientId: z.string().min(1, 'Client ID obrigatório'),
  periodStart: z.string().min(1, 'Data inicial obrigatória'),
  periodEnd: z.string().min(1, 'Data final obrigatória'),
})

export async function createReportAction(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    redirect('/login')
  }

  const result = reportSchema.safeParse({
    clientId: formData.get('clientId'),
    periodStart: formData.get('periodStart'),
    periodEnd: formData.get('periodEnd'),
  })

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    }
  }

  const { clientId, periodStart, periodEnd } = result.data

  // Validate dates
  const startDate = new Date(periodStart)
  const endDate = new Date(periodEnd)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      error: 'Datas inválidas',
    }
  }

  if (startDate > endDate) {
    return {
      error: 'Data inicial deve ser anterior à data final',
    }
  }

  // Check if client belongs to workspace
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId: workspace.id,
    },
  }) as any

  if (!client) {
    return {
      error: 'Cliente não encontrado',
    }
  }

  try {
    // Generate fake metrics
    const metrics = generateFakeMetrics(startDate, endDate)

    // Generate AI summary
    const aiSummary = await generateMarketingSummary({
      periodStart,
      periodEnd,
      totals: metrics.totals,
      daily: metrics.daily,
      outputFormat: 'texto',
      tone: 'profissional',
      maxWords: 200,
      clientName: client.name,
      segment: 'Marketing Digital',
      objective: 'gerar leads e otimizar CAC',
      channels: 'Meta Ads, Google Ads',
    })

    // Create report
    const report = await prisma.report.create({
      data: {
        clientId,
        periodStart: startDate,
        periodEnd: endDate,
        rawDataJson: metrics as any,
        aiSummaryText: aiSummary,
      },
    }) as any

    revalidatePath(`/app/clients/${clientId}`)
    redirect(`/app/reports/${report.id}`)
  } catch (error) {
    console.error('Error creating report:', error)
    return {
      error: error instanceof Error ? error.message : 'Erro ao gerar relatório. Tente novamente.',
    }
  }
}
