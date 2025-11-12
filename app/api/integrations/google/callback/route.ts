import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { exchangeCode } from '@/lib/google/oauth'
import { createClient } from '@/lib/db'

/**
 * GET /api/integrations/google/callback
 * Handles OAuth callback from Google
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle OAuth errors
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

    // Exchange code for tokens
    const tokens = await exchangeCode(code)

    // Calculate token expiration
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

    // Get user's workspace
    const supabase = createClient()

    const { data: member }: { data: { workspaceId: string } | null } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', session.user.id)
      .limit(1)
      .maybeSingle()

    if (!member) {
      return NextResponse.redirect(
        new URL('/app/integrations?error=no_workspace', request.url)
      )
    }

    // Save or update Google connection
    // Try to update first, if not exists, insert
    // @ts-ignore - GoogleConnection is a new table not yet in types
    const { data: existing } = await (supabase as any)
      .from('GoogleConnection')
      .select('id')
      .eq('workspaceId', member.workspaceId)
      .maybeSingle()

    if (existing) {
      // @ts-ignore - GoogleConnection is a new table not yet in types
      await (supabase as any)
        .from('GoogleConnection')
        .update({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: expiresAt.toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('workspaceId', member.workspaceId)
    } else {
      // @ts-ignore - GoogleConnection is a new table not yet in types
      const { error: saveError } = await (supabase as any)
        .from('GoogleConnection')
        .insert({
          workspaceId: member.workspaceId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: expiresAt.toISOString(),
        })

      if (saveError) {
        console.error('Failed to save Google connection:', saveError)
        return NextResponse.redirect(
          new URL('/app/integrations?error=save_failed', request.url)
        )
      }
    }

    console.log(`[Google OAuth] Successfully connected workspace ${member.workspaceId}`)

    // Redirect to integrations page with success
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
