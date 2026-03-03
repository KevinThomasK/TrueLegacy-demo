export type OpportunityStage = 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Opportunity {
  id: string
  lead_id: string
  title: string
  value: number
  currency: string
  stage: OpportunityStage
  probability: number
  expected_close_date: string
  created_at: string
  updated_at: string
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { ...options, credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const createOpportunity = async (
  leadId: string,
  title: string,
  value: number,
  currency: string = 'USD',
  expectedCloseDate: string,
  _userId: string
) => {
  return apiFetch('/api/opportunities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: leadId,
      title,
      value,
      currency,
      expected_close_date: expectedCloseDate
    })
  })
}

export const updateOpportunityStage = async (
  opportunityId: string,
  stage: OpportunityStage,
  _userId: string
) => {
  const res = await fetch(`/api/opportunities/${opportunityId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ stage })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const getLeadOpportunities = async (leadId: string) => {
  const { opportunities } = await apiFetch(`/api/opportunities?lead_id=${leadId}`)
  return opportunities || []
}

export const getOpportunitiesBySalesUser = async (userId: string) => {
  const { opportunities } = await apiFetch(`/api/opportunities?assigned_to=${userId}`)
  return opportunities || []
}
