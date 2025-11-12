/**
 * Google OAuth helpers for GA4 integration
 */

const GOOGLE_OAUTH_AUTH = process.env.GOOGLE_OAUTH_AUTH || 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_OAUTH_TOKEN = process.env.GOOGLE_OAUTH_TOKEN || 'https://oauth2.googleapis.com/token'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!
const GOOGLE_SCOPES = process.env.GOOGLE_SCOPES || 'https://www.googleapis.com/auth/analytics.readonly'

export type TokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/**
 * Build Google OAuth authorization URL
 */
export function buildAuthUrl(state?: string): string {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    throw new Error('Google OAuth not configured. Missing CLIENT_ID or REDIRECT_URI')
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  })

  return `${GOOGLE_OAUTH_AUTH}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCode(code: string): Promise<TokenResponse> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Google OAuth not configured')
  }

  const response = await fetch(GOOGLE_OAUTH_TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Google OAuth token exchange failed:', error)
    throw new Error(`Failed to exchange code: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data as TokenResponse
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth not configured')
  }

  const response = await fetch(GOOGLE_OAUTH_TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Google OAuth token refresh failed:', error)
    throw new Error(`Failed to refresh token: ${response.status} - ${error}`)
  }

  const data = await response.json()

  // Refresh token response doesn't include a new refresh token, so we keep the old one
  return {
    ...data,
    refresh_token: refreshToken,
  } as TokenResponse
}

/**
 * Revoke Google OAuth token
 */
export async function revokeToken(token: string): Promise<void> {
  const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    console.error('Failed to revoke Google token:', response.status)
    // Don't throw - revocation can fail silently
  }
}
