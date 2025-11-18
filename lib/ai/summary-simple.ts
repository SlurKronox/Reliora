import { generateWithFallback } from './providers'

export async function generateReportSummary(
  metrics: any,
  periodStart: Date,
  periodEnd: Date,
  clientName?: string
): Promise<{ summary: string; provider: string; cost: number }> {
  return await generateWithFallback(metrics, periodStart, periodEnd)
}
