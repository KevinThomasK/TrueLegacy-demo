export interface ConversionMetrics {
  totalLeads: number
  convertedLeads: number
  conversionRate: number
  lostLeads: number
  contactedLeads: number
  qualifiedLeads: number
}

export interface SourceMetrics {
  source: string
  totalLeads: number
  convertedLeads: number
  conversionRate: number
}

export interface SalesPersonMetrics {
  userId: string
  fullName: string
  totalAssignedLeads: number
  convertedLeads: number
  conversionRate: number
  qualifiedLeads: number
}

export interface ActivityMetrics {
  totalActivities: number
  callsLogged: number
  emailsLogged: number
  meetingsLogged: number
  notesLogged: number
}

async function apiFetch(url: string) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const getConversionMetrics = async (): Promise<ConversionMetrics> => {
  return apiFetch('/api/analytics?type=conversion')
}

export const getMetricsBySource = async (): Promise<SourceMetrics[]> => {
  return apiFetch('/api/analytics?type=by_source')
}

export const getActivityMetrics = async (): Promise<ActivityMetrics> => {
  return apiFetch('/api/analytics?type=activity')
}

export const getTopSalesPerformance = async (): Promise<SalesPersonMetrics[]> => {
  return apiFetch('/api/analytics?type=sales_performance')
}

export const getLeadsOverTime = async (days: number = 30) => {
  return apiFetch(`/api/analytics?type=leads_over_time&days=${days}`)
}

export const getOpportunityPipeline = async () => {
  return apiFetch('/api/analytics?type=opportunity_pipeline')
}
