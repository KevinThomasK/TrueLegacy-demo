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
    const leadId = searchParams.get('lead_id')
    const stage = searchParams.get('stage')
    const assignedTo = searchParams.get('assigned_to')

    let query: string
    const params: unknown[] = []
    let i = 1

    if (assignedTo) {
      query = `SELECT o.* FROM lead_opportunities o
        JOIN leads l ON l.id = o.lead_id
        WHERE l.assigned_to = $${i++}`
      params.push(assignedTo)
    } else {
      query = 'SELECT * FROM lead_opportunities WHERE 1=1'
    }
    const prefix = assignedTo ? 'o.' : ''
    if (leadId) { query += ` AND ${prefix}lead_id = $${i++}`; params.push(leadId) }
    if (stage) { query += ` AND ${prefix}stage = $${i++}`; params.push(stage) }
    query += ` ORDER BY ${prefix}created_at DESC`

    const result = await pool.query(query, params)
    return NextResponse.json({ opportunities: result.rows || [] })
  } catch (error: unknown) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lead_id, title, value, currency, expected_close_date } = body

    if (!lead_id || !title || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO lead_opportunities (lead_id, title, value, currency, stage, probability, expected_close_date, created_by)
       VALUES ($1, $2, $3, $4, 'proposal', 50, $5, $6)
       RETURNING *`,
      [lead_id, title, value, currency || 'USD', expected_close_date || null, session.id]
    )
    const opportunity = result.rows[0]

    await pool.query(
      `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
       VALUES ($1, $2, 'note', $3, NOW())`,
      [lead_id, session.id, `Opportunity created: ${title} for $${value}`]
    )

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating opportunity:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create opportunity' },
      { status: 500 }
    )
  }
}
