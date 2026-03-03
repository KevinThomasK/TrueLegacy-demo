import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      `SELECT * FROM auto_assignment_rules WHERE enabled = true`
    )

    const rules = (result.rows || []).map((r: { sales_team_members: string[] }) => ({
      ...r,
      sales_team_members: r.sales_team_members || []
    }))

    return NextResponse.json(rules)
  } catch (error: unknown) {
    console.error('Error fetching auto-assignment rules:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}
