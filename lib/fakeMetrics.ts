export type Daily = {
  date: string
  impressions: number
  clicks: number
  conversions: number
  cost: number
}

export type Metrics = {
  totals: {
    impressions: number
    clicks: number
    ctr: number
    conversions: number
    cost: number
  }
  daily: Daily[]
}

export function generateFakeMetrics(periodStart: Date, periodEnd: Date): Metrics {
  const days: Daily[] = []
  const dayCount = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Total campaign targets
  const totalImpressions = Math.floor(Math.random() * 90000) + 10000 // 10k-100k
  const avgCTR = (Math.random() * 6 + 2) / 100 // 2%-8%
  const totalClicks = Math.floor(totalImpressions * avgCTR)
  const conversionRate = (Math.random() * 15 + 5) / 100 // 5%-20%
  const totalConversions = Math.floor(totalClicks * conversionRate)
  const totalCost = Math.floor(Math.random() * 9000) + 1000 // R$ 1k-10k

  // Distribute across days with noise
  let remainingImpressions = totalImpressions
  let remainingClicks = totalClicks
  let remainingConversions = totalConversions
  let remainingCost = totalCost

  for (let i = 0; i < dayCount; i++) {
    const currentDate = new Date(periodStart)
    currentDate.setDate(currentDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]

    const isLastDay = i === dayCount - 1

    // Add noise: ±30% from average
    const avgPerDay = 1 / (dayCount - i)
    const noise = isLastDay ? 1 : (Math.random() * 0.6 + 0.7) // 0.7-1.3x
    const dayFraction = Math.min(avgPerDay * noise, 1)

    const dayImpressions = isLastDay
      ? remainingImpressions
      : Math.floor(remainingImpressions * dayFraction)

    const dayClicks = isLastDay
      ? remainingClicks
      : Math.floor(remainingClicks * dayFraction)

    const dayConversions = isLastDay
      ? remainingConversions
      : Math.floor(remainingConversions * dayFraction)

    const dayCost = isLastDay
      ? remainingCost
      : Math.round(remainingCost * dayFraction * 100) / 100

    days.push({
      date: dateStr,
      impressions: dayImpressions,
      clicks: dayClicks,
      conversions: dayConversions,
      cost: dayCost,
    })

    remainingImpressions -= dayImpressions
    remainingClicks -= dayClicks
    remainingConversions -= dayConversions
    remainingCost -= dayCost
  }

  // Calculate actual totals
  const actualTotals = days.reduce(
    (acc, day) => ({
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      conversions: acc.conversions + day.conversions,
      cost: acc.cost + day.cost,
    }),
    { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
  )

  const ctr = actualTotals.impressions > 0
    ? Math.round((actualTotals.clicks / actualTotals.impressions) * 10000) / 100
    : 0

  return {
    totals: {
      ...actualTotals,
      cost: Math.round(actualTotals.cost * 100) / 100,
      ctr,
    },
    daily: days,
  }
}
