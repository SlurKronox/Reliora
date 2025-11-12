import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { buildAuthUrl } from '@/lib/google/oauth'

/**
 * GET /api/integrations/google/authorize
 * Redirects to Google OAuth consent screen
 */
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build state parameter with user info for callback
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now(),
    })).toString('base64')

    const authUrl = buildAuthUrl(state)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Google OAuth authorize error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google authorization' },
      { status: 500 }
    )
  }
}
