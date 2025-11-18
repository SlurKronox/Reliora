import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { RateLimitError } from './errors'

let redis: Redis | null = null
let reportRatelimit: Ratelimit | null = null
let clientRatelimit: Ratelimit | null = null

function initializeRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })

    reportRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true
    })

    clientRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '1 h'),
      analytics: true
    })
  }
}

export async function checkReportRateLimit(workspaceId: string): Promise<void> {
  initializeRedis()

  if (!reportRatelimit) {
    console.warn('[RateLimit] Upstash not configured, skipping rate limit check')
    return
  }

  const identifier = `report:${workspaceId}`
  const { success, limit, remaining, reset } = await reportRatelimit.limit(identifier)

  if (!success) {
    const resetDate = new Date(reset)
    const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60))

    throw new RateLimitError(
      `Limite de ${limit} relatórios por hora atingido. Tente novamente em ${minutesUntilReset} minuto(s).`
    )
  }

  console.log(`[RateLimit] Report check passed for workspace ${workspaceId}, remaining: ${remaining}/${limit}`)
}

export async function checkClientRateLimit(workspaceId: string): Promise<void> {
  initializeRedis()

  if (!clientRatelimit) {
    console.warn('[RateLimit] Upstash not configured, skipping rate limit check')
    return
  }

  const identifier = `client:${workspaceId}`
  const { success, limit, remaining, reset } = await clientRatelimit.limit(identifier)

  if (!success) {
    const resetDate = new Date(reset)
    const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60))

    throw new RateLimitError(
      `Limite de ${limit} clientes por hora atingido. Tente novamente em ${minutesUntilReset} minuto(s).`
    )
  }

  console.log(`[RateLimit] Client check passed for workspace ${workspaceId}, remaining: ${remaining}/${limit}`)
}
