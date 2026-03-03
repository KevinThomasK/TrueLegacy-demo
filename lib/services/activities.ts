export type ActivityType = 'created' | 'called' | 'emailed' | 'meeting' | 'note' | 'status_change' | 'assigned'

export interface Activity {
  id: string
  lead_id: string
  user_id: string
  activity_type: ActivityType
  description: string
  notes?: string
  contact_method?: string
  timestamp: string
  created_at: string
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { ...options, credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const logActivity = async (
  leadId: string,
  _userId: string,
  activityType: ActivityType,
  description: string,
  notes?: string,
  contactMethod?: string
) => {
  return apiFetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: leadId,
      activity_type: activityType,
      description,
      notes: notes || undefined,
      contact_method: contactMethod
    })
  })
}

export const getLeadActivities = async (leadId: string) => {
  const { activities } = await apiFetch(`/api/activities?lead_id=${leadId}`)
  return activities || []
}

export const getActivityByType = async (leadId: string, activityType: ActivityType) => {
  const { activities } = await apiFetch(
    `/api/activities?lead_id=${leadId}` // API doesn't filter by type; we filter client-side if needed
  )
  return (activities || []).filter((a: Activity) => a.activity_type === activityType)
}

export const getUserActivities = async (userId: string, limit = 50, offset = 0) => {
  const { activities, count } = await apiFetch(
    `/api/activities?user_id=${userId}&limit=${limit}&offset=${offset}`
  )
  return { activities: activities || [], count: count || 0 }
}
