import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { pool } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { stage } = body

    if (!stage) {
      return NextResponse.json(
        { error: 'stage is required' },
        { status: 400 }
      )
    }

    const oppResult = await pool.query(
      'SELECT * FROM lead_opportunities WHERE id = $1',
      [id]
    )
    const opp = oppResult.rows[0]
    if (!opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    await pool.query(
      'UPDATE lead_opportunities SET stage = $1, updated_at = NOW() WHERE id = $2',
      [stage, id]
    )
    await pool.query(
      `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
       VALUES ($1, $2, 'note', $3, NOW())`,
      [opp.lead_id, session.id, `Opportunity stage updated to ${stage}`]
    )

    const updated = await pool.query(
      'SELECT * FROM lead_opportunities WHERE id = $1',
      [id]
    )
    return NextResponse.json(updated.rows[0])
  } catch (error: unknown) {
    console.error('Error updating opportunity:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update opportunity' },
      { status: 500 }
    )
  }
}
