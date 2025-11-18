import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { refreshAccessToken } from '@/lib/google/oauth'

export async function GET() {
  try {
    const oneHourFromNow = new Date()
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)

    const connectionsToRefresh = await prisma.googleConnection.findMany({
      where: {
        expiresAt: {
          lt: oneHourFromNow
        }
      },
      select: {
        id: true,
        workspaceId: true,
        refreshToken: true,
        expiresAt: true
      }
    })

    console.log(`[Cron] Found ${connectionsToRefresh.length} connections to refresh`)

    const results = {
      total: connectionsToRefresh.length,
      refreshed: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const connection of connectionsToRefresh) {
      try {
        const tokens = await refreshAccessToken(connection.refreshToken)

        const newExpiresAt = new Date()
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokens.expires_in)

        await prisma.googleConnection.update({
          where: { id: connection.id },
          data: {
            accessToken: tokens.access_token,
            expiresAt: newExpiresAt
          }
        })

        results.refreshed++
        console.log(`[Cron] Refreshed token for workspace ${connection.workspaceId}`)
      } catch (error) {
        results.failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Workspace ${connection.workspaceId}: ${errorMessage}`)
        console.error(`[Cron] Failed to refresh token for workspace ${connection.workspaceId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Refreshed ${results.refreshed} of ${results.total} connections`,
      results
    })
  } catch (error) {
    console.error('[Cron] Token refresh job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
