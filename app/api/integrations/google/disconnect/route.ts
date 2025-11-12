import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { revokeToken } from '@/lib/google/oauth'
import { createClient } from '@/lib/db'

/**
 * POST /api/integrations/google/disconnect
 * Disconnects Google Analytics integration
 */
export async function POST() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    // Get user's workspace
    const { data: member }: { data: { workspaceId: string } | null } = await supabase
      .from('WorkspaceMember')
      .select('workspaceId')
      .eq('userId', session.user.id)
      .limit(1)
      .maybeSingle()

    if (!member) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    // Get Google connection
    // @ts-ignore - GoogleConnection is a new table not yet in types
    const { data: connection } = await (supabase as any)
      .from('GoogleConnection')
      .select('accessToken')
      .eq('workspaceId', member.workspaceId)
      .maybeSingle()

    // Revoke token with Google (best effort)
    if (connection?.accessToken) {
      try {
        await revokeToken(connection.accessToken)
      } catch (error) {
        console.warn('Failed to revoke Google token:', error)
        // Continue anyway - we'll still delete from our DB
      }
    }

    // Delete connection from our database
    // @ts-ignore - GoogleConnection is a new table not yet in types
    const { error: deleteError } = await (supabase as any)
      .from('GoogleConnection')
      .delete()
      .eq('workspaceId', member.workspaceId)

    if (deleteError) {
      console.error('Failed to delete Google connection:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disconnect' },
        { status: 500 }
      )
    }

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
