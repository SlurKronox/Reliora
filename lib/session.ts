import { getServerSession as nextAuthGetServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './db'
import { redirect } from 'next/navigation'

export async function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return null
  }

  return session.user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function getUserWorkspace(userId: string) {
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: {
      userId,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  }) as any

  return workspaceMember?.workspace || null
}
