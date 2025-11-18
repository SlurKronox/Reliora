import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { revokeToken } from '@/lib/google/oauth'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true }
    })

    if (!member) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const connection = await prisma.googleConnection.findUnique({
      where: { workspaceId: member.workspaceId },
      select: { accessToken: true }
    })

    if (connection?.accessToken) {
      try {
        await revokeToken(connection.accessToken)
      } catch (error) {
        console.warn('Failed to revoke Google token:', error)
      }
    }

    await prisma.googleConnection.delete({
      where: { workspaceId: member.workspaceId }
    })

    console.log(`[Google OAuth] Disconnected workspace ${member.workspaceId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google Analytics' },
      { status: 500 }
    )
  }
}
