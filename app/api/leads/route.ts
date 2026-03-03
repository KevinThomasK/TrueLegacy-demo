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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assigned_to')
    const agentId = searchParams.get('agent_id')

    let query = `
      SELECT l.*, 
        json_agg(json_build_object(
          'id', ld.id, 'lead_id', ld.lead_id, 'full_name', ld.full_name, 'email', ld.email,
          'phone', ld.phone, 'company_name', ld.company_name, 'industry', ld.industry,
          'company_size', ld.company_size, 'lead_source', ld.lead_source, 'address', ld.address,
          'city', ld.city, 'state', ld.state, 'postal_code', ld.postal_code, 'country', ld.country,
          'marital_status', ld.marital_status, 'date_of_birth', ld.date_of_birth,
          'religion', ld.religion, 'spouse_name', ld.spouse_name,
          'next_of_kin_name', ld.next_of_kin_name, 'next_of_kin_phone', ld.next_of_kin_phone,
          'children_count', ld.children_count, 'siblings_count', ld.siblings_count, 
          'created_at', ld.created_at, 'updated_at', ld.updated_at
        )) FILTER (WHERE ld.id IS NOT NULL) as lead_details
      FROM leads l
      LEFT JOIN lead_details ld ON ld.lead_id = l.id
      WHERE 1=1
    `
    const params: unknown[] = []
    let paramIndex = 1

    if (status) {
      query += ` AND l.status = $${paramIndex++}`
      params.push(status)
    }
    if (assignedTo) {
      query += ` AND l.assigned_to = $${paramIndex++}`
      params.push(assignedTo)
    }
    if (agentId) {
      query += ` AND l.agent_id = $${paramIndex++}`
      params.push(agentId)
    }

    query += ` GROUP BY l.id ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const countParams: unknown[] = []
    let countQuery = 'SELECT COUNT(*) FROM leads WHERE 1=1'
    if (status) { countQuery += ` AND status = $${countParams.length + 1}`; countParams.push(status) }
    if (assignedTo) { countQuery += ` AND assigned_to = $${countParams.length + 1}`; countParams.push(assignedTo) }
    if (agentId) { countQuery += ` AND agent_id = $${countParams.length + 1}`; countParams.push(agentId) }
    const countResult = await pool.query(countQuery, countParams)
    const count = parseInt(countResult.rows[0]?.count || '0')

    const result = await pool.query(query, params)
    const leads = result.rows.map((r: { lead_details: unknown }) => ({
      ...r,
      lead_details: r.lead_details && Array.isArray(r.lead_details) ? r.lead_details.filter(Boolean) : []
    }))

    return NextResponse.json({
      leads,
      count,
      limit,
      offset
    })
  } catch (error: unknown) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leads' },
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
    const { leadDetails } = body

    if (!leadDetails || !leadDetails.full_name || !leadDetails.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const leadResult = await pool.query(
      `INSERT INTO leads (agent_id, status) VALUES ($1, 'new') RETURNING *`,
      [session.id]
    )
    const lead = leadResult.rows[0]
    if (!lead) throw new Error('Failed to create lead')

    await pool.query(
      `INSERT INTO lead_details (
        lead_id, full_name, email, phone, company_name, industry, company_size, 
        lead_source, address, city, state, postal_code, country, 
        marital_status, date_of_birth, religion, spouse_name, next_of_kin_name, next_of_kin_phone,
        children_count, siblings_count
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        lead.id,
        leadDetails.full_name,
        leadDetails.email,
        leadDetails.phone || null,
        leadDetails.company_name || null,
        leadDetails.industry || null,
        leadDetails.company_size || null,
        leadDetails.lead_source || 'other',
        leadDetails.address || null,
        leadDetails.city || null,
        leadDetails.state || null,
        leadDetails.postal_code || null,
        leadDetails.country || null,
        leadDetails.marital_status || null,
        leadDetails.date_of_birth || null,
        leadDetails.religion || null,
        leadDetails.spouse_name || null,
        leadDetails.next_of_kin_name || null,
        leadDetails.next_of_kin_phone || null,
        leadDetails.children_count ?? null,
        leadDetails.siblings_count ?? null
      ]
    )

    const detailResult = await pool.query(
      'SELECT * FROM lead_details WHERE lead_id = $1',
      [lead.id]
    )
    const detail = detailResult.rows[0]

    const activityDesc = leadDetails.notes 
      ? `Lead created via API. Notes: ${leadDetails.notes}` 
      : 'Lead created via API'
    await pool.query(
      `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
       VALUES ($1, $2, 'created', $3, NOW())`,
      [lead.id, session.id, activityDesc]
    )

    return NextResponse.json({ lead, detail }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lead' },
      { status: 500 }
    )
  }
}
