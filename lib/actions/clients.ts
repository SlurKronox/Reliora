'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { UnauthorizedError, NotFoundError, ValidationError } from '@/lib/errors'
import { checkClientRateLimit } from '@/lib/rate-limit'

const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  notes: z.string().max(1000, 'Notas muito longas').optional(),
})

export async function createClient(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const data = {
    name: formData.get('name') as string,
    notes: formData.get('notes') as string,
  }

  const result = createClientSchema.safeParse(data)

  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message)
  }

  await checkClientRateLimit(workspace.id)

  try {
    const client = await prisma.client.create({
      data: {
        name: result.data.name,
        notes: result.data.notes || null,
        workspaceId: workspace.id,
      },
    }) as any

    revalidatePath('/app/clients')
    redirect(`/app/clients/${client.id}`)
  } catch (error) {
    console.error('Error creating client:', error)
    return {
      error: 'Erro ao criar cliente. Tente novamente.',
    }
  }
}

export async function updateClient(clientId: string, formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId: workspace.id,
    },
  })

  if (!existingClient) {
    throw new NotFoundError('Cliente não encontrado')
  }

  const data = {
    name: formData.get('name') as string,
    notes: formData.get('notes') as string,
  }

  const result = createClientSchema.safeParse(data)

  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message)
  }

  try {
    await prisma.client.update({
      where: {
        id: clientId,
      },
      data: {
        name: result.data.name,
        notes: result.data.notes || null,
      },
    })

    revalidatePath('/app/clients')
    revalidatePath(`/app/clients/${clientId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating client:', error)
    return {
      error: 'Erro ao atualizar cliente. Tente novamente.',
    }
  }
}

export async function deleteClient(clientId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId: workspace.id,
    },
  })

  if (!existingClient) {
    throw new NotFoundError('Cliente não encontrado')
  }

  try {
    await prisma.client.delete({
      where: {
        id: clientId,
      },
    })

    revalidatePath('/app/clients')
    redirect('/app/clients')
  } catch (error) {
    console.error('Error deleting client:', error)
    return {
      error: 'Erro ao excluir cliente. Tente novamente.',
    }
  }
}

const updateGA4Schema = z.object({
  ga4PropertyId: z.string().min(1, 'Property ID é obrigatório'),
  ga4PropertyDisplay: z.string().min(1, 'Nome da propriedade é obrigatório'),
})

export async function updateClientGA4(
  clientId: string,
  ga4PropertyId: string,
  ga4PropertyDisplay: string
) {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    throw new NotFoundError('Workspace não encontrado')
  }

  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId: workspace.id,
    },
  })

  if (!existingClient) {
    throw new NotFoundError('Cliente não encontrado')
  }

  const result = updateGA4Schema.safeParse({
    ga4PropertyId,
    ga4PropertyDisplay,
  })

  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message)
  }

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        ga4PropertyId: result.data.ga4PropertyId,
        ga4PropertyDisplay: result.data.ga4PropertyDisplay,
      },
    })

    revalidatePath(`/app/clients/${clientId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating client GA4:', error)
    return {
      error: 'Erro ao vincular propriedade GA4. Tente novamente.',
    }
  }
}
