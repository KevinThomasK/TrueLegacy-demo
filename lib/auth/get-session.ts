import { cookies } from 'next/headers'
import { pool } from '@/lib/db'
import { verifyToken, COOKIE_NAME } from './utils'

export interface SessionUser {
  id: string
  email: string
  full_name: string
  role: string
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const result = await pool.query(
    `SELECT id, email, full_name, role FROM users WHERE id = $1`,
    [payload.userId]
  )

  const user = result.rows[0]
  return user ? { id: user.id, email: user.email, full_name: user.full_name, role: user.role } : null
}
