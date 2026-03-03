import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pool } from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth/utils'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ user: null, profile: null }, { status: 200 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ user: null, profile: null }, { status: 200 })
    }

    const result = await pool.query(
      `SELECT id, email, full_name, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [payload.userId]
    )

    const user = result.rows[0]
    if (!user) {
      return NextResponse.json({ user: null, profile: null }, { status: 200 })
    }

    const profile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile
    })
  } catch (error: any) {
    console.error('Auth me error:', error)
    return NextResponse.json({ user: null, profile: null }, { status: 200 })
  }
}
