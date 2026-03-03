import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')

    let query = 'SELECT id, email, full_name, role FROM users WHERE 1=1'
    const params: unknown[] = []
    if (role) {
      query += ' AND role = $1'
      params.push(role)
    }
    query += ' ORDER BY full_name'

    const result = await pool.query(query, params)
    return NextResponse.json({ users: result.rows || [] })
  } catch (error: unknown) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
