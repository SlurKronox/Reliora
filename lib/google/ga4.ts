/**
 * Google Analytics 4 Data API helpers
 */

const GA4_API_BASE = 'https://analyticsdata.googleapis.com/v1beta'

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

/**
 * List GA4 properties accessible to the user
 * Useful for property selection UI
 */
export async function listGa4Properties(accessToken: string): Promise<any[]> {
  const url = 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries'

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

  // Extract properties from account summaries
  const properties: any[] = []

  if (data.accountSummaries) {
    for (const account of data.accountSummaries) {
      if (account.propertySummaries) {
        for (const prop of account.propertySummaries) {
          properties.push({
            propertyId: prop.property?.replace('properties/', ''),
            displayName: prop.displayName,
            parent: prop.parent,
          })
        }
      }
    }
  }

  return properties
}
