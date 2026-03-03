export interface AutoAssignmentRule {
  id: string
  name: string
  enabled: boolean
  assignment_type: 'round_robin' | 'load_based' | 'manual'
  sales_team_members: string[]
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

export const createAutoAssignmentRule = async (
  name: string,
  assignmentType: string,
  salesTeamMembers: string[]
) => {
  return apiFetch('/api/auto-assignment/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      assignment_type: assignmentType,
      sales_team_members: salesTeamMembers
    })
  })
}

export const getAutoAssignmentRules = async () => {
  const data = await apiFetch('/api/auto-assignment/rules')
  return Array.isArray(data) ? data : []
}

export const autoAssignUnassignedLeads = async (_adminUserId: string) => {
  return apiFetch('/api/auto-assignment/run', { method: 'POST' })
}

export const updateAutoAssignmentRule = async (
  ruleId: string,
  enabled: boolean,
  salesTeamMembers: string[]
) => {
  return apiFetch(`/api/auto-assignment/rules/${ruleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      enabled,
      sales_team_members: salesTeamMembers
    })
  })
}
