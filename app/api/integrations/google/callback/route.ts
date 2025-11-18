import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { exchangeCode } from '@/lib/google/oauth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/app/integrations?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/app/integrations?error=missing_code', request.url)
      )
    }

    const tokens = await exchangeCode(code)

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true }
    })

    if (!member) {
      return NextResponse.redirect(
        new URL('/app/integrations?error=no_workspace', request.url)
      )
    }

    await prisma.googleConnection.upsert({
      where: { workspaceId: member.workspaceId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt,
      },
      create: {
        workspaceId: member.workspaceId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt,
      }
    })

    console.log(`[Google OAuth] Successfully connected workspace ${member.workspaceId}`)

    return NextResponse.redirect(
      new URL('/app/integrations?success=true', request.url)
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/app/integrations?error=unknown', request.url)
    )
  }
}
