import { pool } from '@/lib/db'

export type UserRole = 'admin' | 'agent' | 'sales' | 'super_admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    )
    return result.rows[0]?.role || null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

export const getCurrentUser = async () => {
  try {
    const { getSession } = await import('./get-session')
    const session = await getSession()
    if (!session) return null

    const result = await pool.query(
      'SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = $1',
      [session.id]
    )
    const profile = result.rows[0]
    if (!profile) return null

    return {
      user: { id: profile.id, email: profile.email, created_at: profile.created_at },
      profile: profile as UserProfile
    }
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export const hasRole = async (userId: string, requiredRoles: UserRole[]): Promise<boolean> => {
  const role = await getUserRole(userId)
  return role ? requiredRoles.includes(role) : false
}

export const getRolePermissions = (role: UserRole): string[] => {
  const permissions: Record<UserRole, string[]> = {
    super_admin: [
      'manage_users',
      'view_all_leads',
      'assign_leads',
      'manage_auto_assignment',
      'create_leads',
      'update_leads',
      'view_analytics',
      'manage_settings'
    ],
    admin: [
      'view_all_leads',
      'assign_leads',
      'manage_auto_assignment',
      'view_analytics',
      'manage_settings'
    ],
    agent: [
      'create_leads',
      'view_own_leads'
    ],
    sales: [
      'view_assigned_leads',
      'update_lead_status',
      'log_activity',
      'convert_lead'
    ]
  }

  return permissions[role] || []
}

export const canPerformAction = async (userId: string, action: string): Promise<boolean> => {
  const role = await getUserRole(userId)
  if (!role) return false

  const permissions = getRolePermissions(role)
  return permissions.includes(action)
}
