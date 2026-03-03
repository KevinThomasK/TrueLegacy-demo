import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: leadId } = await params

    const leadResult = await pool.query('SELECT * FROM leads WHERE id = $1', [leadId])
    const lead = leadResult.rows[0]

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const [detailResult, activitiesResult, opportunitiesResult, documentsResult] = await Promise.all([
      pool.query('SELECT * FROM lead_details WHERE lead_id = $1', [leadId]),
      pool.query(
        'SELECT * FROM lead_activities WHERE lead_id = $1 ORDER BY timestamp DESC',
        [leadId]
      ),
      pool.query(
        'SELECT * FROM lead_opportunities WHERE lead_id = $1 ORDER BY created_at DESC',
        [leadId]
      ),
      pool.query('SELECT * FROM lead_documents WHERE lead_id = $1', [leadId])
    ])

    return NextResponse.json({
      lead,
      detail: detailResult.rows[0] || null,
      activities: activitiesResult.rows || [],
      opportunities: opportunitiesResult.rows || [],
      documents: documentsResult.rows || []
    })
  } catch (error: unknown) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: leadId } = await params
    const body = await request.json()
    const { status, details, assigned_to } = body

    if (status) {
      await pool.query(
        'UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, leadId]
      )
      await pool.query(
        `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
         VALUES ($1, $2, 'status_change', $3, NOW())`,
        [leadId, session.id, `Status changed to ${status}`]
      )
    }

    if (assigned_to) {
      await pool.query(
        'UPDATE leads SET assigned_to = $1, updated_at = NOW() WHERE id = $2',
        [assigned_to, leadId]
      )
      await pool.query(
        `INSERT INTO lead_assignment_history (lead_id, assigned_to, assigned_by, assignment_date)
         VALUES ($1, $2, $3, NOW())`,
        [leadId, assigned_to, session.id]
      )
      await pool.query(
        `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
         VALUES ($1, $2, 'assigned', 'Lead assigned to sales user', NOW())`,
        [leadId, session.id]
      )
    }

    if (details && Object.keys(details).length > 0) {
      const keys = Object.keys(details).filter(k => k !== 'id' && k !== 'lead_id' && k !== 'created_at')
      if (keys.length > 0) {
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
        await pool.query(
          `UPDATE lead_details SET ${setClause}, updated_at = NOW() WHERE lead_id = $1`,
          [leadId, ...keys.map(k => details[k])]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update lead' },
      { status: 500 }
    )
  }
}
