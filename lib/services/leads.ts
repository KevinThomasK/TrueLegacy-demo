export interface Lead {
  id: string
  agent_id: string
  assigned_to: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  created_at: string
  updated_at: string
}

export interface LeadDetail {
  id: string
  lead_id: string
  full_name: string
  email: string
  phone: string
  company_name?: string
  industry?: string
  company_size?: string
  lead_source: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  marital_status?: string
  date_of_birth?: string
  religion?: string
  spouse_name?: string
  next_of_kin_name?: string
  next_of_kin_phone?: string
  children_count?: number
  siblings_count?: number
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

export const createLead = async (
  agentId: string,
  leadDetail: Omit<LeadDetail, 'id' | 'lead_id' | 'created_at' | 'updated_at'> & { notes?: string }
) => {
  const { lead, detail } = await apiFetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadDetails: leadDetail })
  })
  return { lead, detail }
}

export const getLeadById = async (leadId: string) => {
  return apiFetch(`/api/leads/${leadId}`)
}

export const getAgentLeads = async (agentId: string, limit = 50, offset = 0) => {
  const { leads, count } = await apiFetch(
    `/api/leads?agent_id=${encodeURIComponent(agentId)}&limit=${limit}&offset=${offset}`
  )
  return { leads: leads || [], count: count || 0 }
}

export const getAllLeads = async (limit = 50, offset = 0, filters?: { status?: string; assigned_to?: string }) => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (filters?.status) params.set('status', filters.status)
  if (filters?.assigned_to) params.set('assigned_to', filters.assigned_to)
  const { leads, count } = await apiFetch(`/api/leads?${params}`)
  return { leads: leads || [], count: count || 0 }
}

export const updateLeadStatus = async (leadId: string, status: Lead['status'], _userId: string) => {
  const res = await fetch(`/api/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const assignLeadToSalesUser = async (
  leadId: string,
  salesUserId: string,
  _assignedByUserId: string
) => {
  const res = await fetch(`/api/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assigned_to: salesUserId })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}
