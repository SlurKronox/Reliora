import { PLANS, PlanType } from './billing/mercadopago'
import { prisma } from './db'

export async function checkClientLimit(workspaceId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true }
  })

  if (!workspace) {
    throw new Error('Workspace não encontrado')
  }

  const planType = (workspace.plan || 'free') as PlanType
  const planLimits = PLANS[planType]

  if (planLimits.maxClients === -1) {
    return
  }

  const clientCount = await prisma.client.count({
    where: { workspaceId }
  })

  if (clientCount >= planLimits.maxClients) {
    throw new Error(
      `Limite de ${planLimits.maxClients} clientes atingido. Faça upgrade do seu plano para adicionar mais clientes.`
    )
  }
}

export async function checkPdfPermission(workspaceId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true }
  })

  if (!workspace) {
    throw new Error('Workspace não encontrado')
  }

  const planType = (workspace.plan || 'free') as PlanType
  const planLimits = PLANS[planType]

  if (!planLimits.allowPdf) {
    throw new Error(
      'Exportar PDF não está disponível no seu plano. Faça upgrade para Pro ou Agency.'
    )
  }
}

export async function checkPublicLinkPermission(workspaceId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true }
  })

  if (!workspace) {
    throw new Error('Workspace não encontrado')
  }

  const planType = (workspace.plan || 'free') as PlanType
  const planLimits = PLANS[planType]

  if (!planLimits.allowPublicLink) {
    throw new Error(
      'Link público não está disponível no seu plano. Faça upgrade para Pro ou Agency.'
    )
  }
}

export function getPlanLimits(planType: PlanType) {
  return PLANS[planType]
}
