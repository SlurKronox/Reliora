import type { Ga4Response } from './ga4'

export type DailyMetrics = {
  date: string
  impressions: number
  clicks: number
  conversions: number
  cost: number
  revenue: number | null
}

export type AggregatedMetrics = {
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  cost: number
  revenue: number | null
  cpc: number | null
  cpa: number | null
  roas: number | null
}

export type MappedGa4Data = {
  daily: DailyMetrics[]
  totals: AggregatedMetrics
}

/**
 * Map GA4 response to our internal metrics format
 *
 * GA4 provides: sessions, totalUsers, conversions, totalRevenue
 * We map: sessions -> clicks, totalUsers -> impressions
 *
 * Note: GA4 doesn't provide ad cost data, so cost remains 0 unless
 * we integrate with Google Ads API separately
 */
export function mapGa4Response(ga4Data: Ga4Response): MappedGa4Data {
  const daily: DailyMetrics[] = []
  let totalSessions = 0
  let totalUsers = 0
  let totalConversions = 0
  let totalRevenue = 0

  // Process each row (one per day)
  if (ga4Data.rows && ga4Data.rows.length > 0) {
    for (const row of ga4Data.rows) {
      const date = row.dimensionValues[0]?.value || ''
      const sessions = parseFloat(row.metricValues[0]?.value || '0')
      const users = parseFloat(row.metricValues[1]?.value || '0')
      const conversions = parseFloat(row.metricValues[2]?.value || '0')
      const revenue = parseFloat(row.metricValues[3]?.value || '0')

      // Format date from YYYYMMDD to YYYY-MM-DD
      const formattedDate = date.length === 8
        ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
        : date

      daily.push({
        date: formattedDate,
        impressions: Math.round(users), // Total users as proxy for impressions
        clicks: Math.round(sessions), // Sessions as proxy for clicks
        conversions: Math.round(conversions),
        cost: 0, // GA4 doesn't provide cost - would need Google Ads API
        revenue: revenue > 0 ? revenue : null,
      })

      totalSessions += sessions
      totalUsers += users
      totalConversions += conversions
      totalRevenue += revenue
    }
  }

  // Calculate aggregated metrics
  const totalImpressions = Math.round(totalUsers)
  const totalClicks = Math.round(totalSessions)
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const cpc = null // Would need cost data from Google Ads
  const cpa = null // Would need cost data from Google Ads
  const roas = null // Can't calculate without cost data

  const totals: AggregatedMetrics = {
    impressions: totalImpressions,
    clicks: totalClicks,
    ctr: parseFloat(ctr.toFixed(2)),
    conversions: Math.round(totalConversions),
    cost: 0,
    revenue: totalRevenue > 0 ? totalRevenue : null,
    cpc,
    cpa,
    roas,
  }

  return {
    daily,
    totals,
  }
}

/**
 * Generate fake metrics for demo/testing
 * Used when GA4 is not connected or useRealData is false
 */
export function generateFakeMetrics(periodStart: Date, periodEnd: Date): MappedGa4Data {
  const daily: DailyMetrics[] = []
  const days = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

  let totalImpressions = 0
  let totalClicks = 0
  let totalConversions = 0
  let totalCost = 0
  let totalRevenue = 0

  for (let i = 0; i < days; i++) {
    const date = new Date(periodStart)
    date.setDate(date.getDate() + i)

    const impressions = Math.floor(Math.random() * (5000 - 1000) + 1000)
    const clicks = Math.floor(impressions * (Math.random() * (0.08 - 0.02) + 0.02))
    const conversions = Math.floor(clicks * (Math.random() * (0.2 - 0.05) + 0.05))
    const cost = parseFloat((clicks * (Math.random() * (5 - 1) + 1)).toFixed(2))
    const revenue = parseFloat((conversions * (Math.random() * (200 - 50) + 50)).toFixed(2))

    daily.push({
      date: date.toISOString().split('T')[0],
      impressions,
      clicks,
      conversions,
      cost,
      revenue: revenue > 0 ? revenue : null,
    })

    totalImpressions += impressions
    totalClicks += clicks
    totalConversions += conversions
    totalCost += cost
    totalRevenue += revenue
  }

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const cpc = totalClicks > 0 ? totalCost / totalClicks : null
  const cpa = totalConversions > 0 ? totalCost / totalConversions : null
  const roas = totalCost > 0 ? totalRevenue / totalCost : null

  return {
    daily,
    totals: {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: parseFloat(ctr.toFixed(2)),
      conversions: totalConversions,
      cost: parseFloat(totalCost.toFixed(2)),
      revenue: totalRevenue > 0 ? totalRevenue : null,
      cpc: cpc ? parseFloat(cpc.toFixed(2)) : null,
      cpa: cpa ? parseFloat(cpa.toFixed(2)) : null,
      roas: roas ? parseFloat(roas.toFixed(2)) : null,
    },
  }
}
