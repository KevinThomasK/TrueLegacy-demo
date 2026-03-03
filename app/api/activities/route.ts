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
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = 'SELECT * FROM lead_activities WHERE 1=1'
    const params: unknown[] = []
    let i = 1
    if (leadId) { query += ` AND lead_id = $${i++}`; params.push(leadId) }
    if (userId) { query += ` AND user_id = $${i++}`; params.push(userId) }
    query += ` ORDER BY timestamp DESC LIMIT $${i++} OFFSET $${i}`
    params.push(limit, offset)

    const countParams: unknown[] = []
    let countQuery = 'SELECT COUNT(*) FROM lead_activities WHERE 1=1'
    if (leadId) { countQuery += ` AND lead_id = $${countParams.length + 1}`; countParams.push(leadId) }
    if (userId) { countQuery += ` AND user_id = $${countParams.length + 1}`; countParams.push(userId) }
    const countResult = await pool.query(countQuery, countParams)
    const count = parseInt(countResult.rows[0]?.count || '0')

    const result = await pool.query(query, params)

    return NextResponse.json({
      activities: result.rows || [],
      count,
      limit,
      offset
    })
  } catch (error: unknown) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch activities' },
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
    const { lead_id, activity_type, description, notes } = body

    if (!lead_id || !activity_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, notes, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [lead_id, session.id, activity_type, description || null, notes || null]
    )
    const activity = result.rows[0]

    return NextResponse.json(activity, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create activity' },
      { status: 500 }
    )
  }
}
