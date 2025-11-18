'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import crypto from 'crypto'
import { UnauthorizedError, NotFoundError, ValidationError } from '@/lib/errors'

export async function generatePublicLink(reportId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }

  const workspace = await getUserWorkspace(user.id)
  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      client: {
        workspaceId: workspace.id
      }
    }
  })

  if (!report) {
    throw new NotFoundError('Relatório não encontrado')
  }

  const existingPublicReport = await prisma.publicReport.findUnique({
    where: { reportId }
  })

  if (existingPublicReport && !existingPublicReport.revokedAt) {
    return {
      success: true,
      token: existingPublicReport.token,
      url: `/public/reports/${existingPublicReport.token}`
    }
  }

  const token = crypto.randomBytes(32).toString('hex')

  const publicReport = await prisma.publicReport.create({
    data: {
      reportId,
      token,
      revokedAt: null
    }
  })

  revalidatePath(`/app/reports/${reportId}`)

  return {
    success: true,
    token: publicReport.token,
    url: `/public/reports/${publicReport.token}`
  }
}

export async function revokePublicLink(reportId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }

  const workspace = await getUserWorkspace(user.id)
  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      client: {
        workspaceId: workspace.id
      }
    }
  })

  if (!report) {
    throw new NotFoundError('Relatório não encontrado')
  }

  const publicReport = await prisma.publicReport.findUnique({
    where: { reportId }
  })

  if (!publicReport) {
    return { success: true, message: 'Nenhum link público encontrado' }
  }

  await prisma.publicReport.update({
    where: { reportId },
    data: { revokedAt: new Date() }
  })

  revalidatePath(`/app/reports/${reportId}`)

  return { success: true }
}

export async function getPublicReport(token: string) {
  const publicReport = await prisma.publicReport.findUnique({
    where: { token },
    include: {
      report: {
        include: {
          client: {
            include: {
              workspace: {
                select: {
                  name: true,
                  brandPrimary: true,
                  brandAccent: true,
                  brandLogoUrl: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!publicReport || publicReport.revokedAt) {
    return null
  }

  return {
    report: {
      id: publicReport.report.id,
      periodStart: publicReport.report.periodStart,
      periodEnd: publicReport.report.periodEnd,
      aiSummaryText: publicReport.report.aiSummaryText,
      rawDataJson: publicReport.report.rawDataJson,
      createdAt: publicReport.report.createdAt,
      clientName: publicReport.report.client.name
    },
    workspace: publicReport.report.client.workspace
  }
}

const deleteReportSchema = z.object({
  reportId: z.string().min(1, 'Report ID é obrigatório')
})

export async function deleteReport(reportId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }

  const workspace = await getUserWorkspace(user.id)
  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const result = deleteReportSchema.safeParse({ reportId })
  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message)
  }

  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      client: {
        workspaceId: workspace.id
      }
    },
    include: {
      client: true
    }
  })

  if (!report) {
    throw new NotFoundError('Relatório não encontrado')
  }

  try {
    await prisma.report.delete({
      where: { id: reportId }
    })

    revalidatePath('/app')
    revalidatePath('/app/clients')
    revalidatePath(`/app/clients/${report.clientId}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting report:', error)
    return { error: 'Erro ao excluir relatório. Tente novamente.' }
  }
}
