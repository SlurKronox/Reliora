/**
 * Google Analytics 4 Data API helpers
 */

import { prisma } from '@/lib/db'
import { refreshAccessToken } from './oauth'

const GA4_API_BASE = 'https://analyticsdata.googleapis.com/v1beta'
const GA4_ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com/v1beta'

export type Ga4ReportParams = {
  accessToken: string
  propertyId: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

export type Ga4DimensionValue = {
  value: string
}

export type Ga4MetricValue = {
  value: string
}

export type Ga4Row = {
  dimensionValues: Ga4DimensionValue[]
  metricValues: Ga4MetricValue[]
}

export type Ga4Response = {
  rows?: Ga4Row[]
  rowCount?: number
  metadata?: {
    currencyCode?: string
    timeZone?: string
  }
}

/**
 * Run GA4 report using Data API
 * Returns raw GA4 response
 */
export async function runGa4Report(params: Ga4ReportParams): Promise<Ga4Response> {
  const { accessToken, propertyId, startDate, endDate } = params

  const url = `${GA4_API_BASE}/properties/${propertyId}:runReport`

  const requestBody = {
    dateRanges: [
      {
        startDate,
        endDate,
      },
    ],
    dimensions: [
      {
        name: 'date',
      },
    ],
    metrics: [
      {
        name: 'sessions',
      },
      {
        name: 'totalUsers',
      },
      {
        name: 'conversions',
      },
      {
        name: 'totalRevenue',
      },
    ],
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('GA4 API error:', error)
    throw new Error(`GA4 API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data as Ga4Response
}

export type GA4Property = {
  propertyId: string
  displayName: string
  parent?: string
}

/**
 * Get valid access token for a workspace, refreshing if needed
 */
async function getValidAccessToken(workspaceId: string): Promise<string> {
  const connection = await prisma.googleConnection.findUnique({
    where: { workspaceId },
    select: {
      accessToken: true,
      refreshToken: true,
      expiresAt: true
    }
  })

  if (!connection) {
    throw new Error('Google connection not found for this workspace')
  }

  const now = new Date()
  const expiresAt = new Date(connection.expiresAt)
  const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60)

  if (minutesUntilExpiry < 5) {
    console.log(`[GA4] Token expires in ${minutesUntilExpiry.toFixed(1)} min, refreshing...`)

    const tokens = await refreshAccessToken(connection.refreshToken)

    const newExpiresAt = new Date()
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokens.expires_in)

    await prisma.googleConnection.update({
      where: { workspaceId },
      data: {
        accessToken: tokens.access_token,
        expiresAt: newExpiresAt
      }
    })

    console.log(`[GA4] Token refreshed for workspace ${workspaceId}`)
    return tokens.access_token
  }

  return connection.accessToken
}

/**
 * List GA4 properties accessible to the user (by access token)
 */
export async function listGa4Properties(accessToken: string): Promise<GA4Property[]> {
  const url = `${GA4_ADMIN_API_BASE}/accountSummaries`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('GA4 Admin API error:', error)
    throw new Error(`Failed to list GA4 properties: ${response.status}`)
  }

  const data = await response.json()

  const properties: GA4Property[] = []

  if (data.accountSummaries) {
    for (const account of data.accountSummaries) {
      if (account.propertySummaries) {
        for (const prop of account.propertySummaries) {
          properties.push({
            propertyId: prop.property?.replace('properties/', '') || '',
            displayName: prop.displayName || 'Unnamed Property',
            parent: prop.parent,
          })
        }
      }
    }
  }

  return properties
}

/**
 * List GA4 properties for a workspace (with auto-refresh)
 */
export async function listGA4PropertiesForWorkspace(workspaceId: string): Promise<GA4Property[]> {
  const accessToken = await getValidAccessToken(workspaceId)
  return listGa4Properties(accessToken)
}

/**
 * Fetch GA4 metrics and return in internal format (matching fakeMetrics)
 */
export async function fetchGA4Metrics(
  workspaceId: string,
  ga4PropertyId: string,
  periodStart: Date,
  periodEnd: Date
) {
  try {
    const accessToken = await getValidAccessToken(workspaceId)

    const startDate = periodStart.toISOString().split('T')[0]
    const endDate = periodEnd.toISOString().split('T')[0]

    const ga4Response = await runGa4Report({
      accessToken,
      propertyId: ga4PropertyId,
      startDate,
      endDate
    })

    const daily: Array<{
      date: string
      impressions: number
      clicks: number
      conversions: number
      cost: number
    }> = []

    let totalSessions = 0
    let totalUsers = 0
    let totalConversions = 0
    let totalRevenue = 0

    if (ga4Response.rows) {
      for (const row of ga4Response.rows) {
        const date = row.dimensionValues[0]?.value || ''
        const sessions = parseInt(row.metricValues[0]?.value || '0')
        const users = parseInt(row.metricValues[1]?.value || '0')
        const conversions = parseFloat(row.metricValues[2]?.value || '0')
        const revenue = parseFloat(row.metricValues[3]?.value || '0')

        daily.push({
          date,
          impressions: sessions,
          clicks: users,
          conversions: Math.round(conversions),
          cost: revenue
        })

        totalSessions += sessions
        totalUsers += users
        totalConversions += conversions
        totalRevenue += revenue
      }
    }

    const ctr = totalSessions > 0
      ? Math.round((totalUsers / totalSessions) * 10000) / 100
      : 0

    return {
      totals: {
        impressions: totalSessions,
        clicks: totalUsers,
        ctr,
        conversions: Math.round(totalConversions),
        cost: Math.round(totalRevenue * 100) / 100
      },
      daily
    }
  } catch (error) {
    console.error('[GA4] fetchGA4Metrics failed:', error)
    throw error
  }
}
