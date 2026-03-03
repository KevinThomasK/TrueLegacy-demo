import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/get-session'
import { pool } from '@/lib/db'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rulesResult = await pool.query(
      `SELECT * FROM auto_assignment_rules WHERE enabled = true LIMIT 1`
    )
    const rules = rulesResult.rows[0]

    if (!rules || rules.assignment_type !== 'round_robin') {
      return NextResponse.json(
        { error: 'No active round-robin auto-assignment rule configured' },
        { status: 400 }
      )
    }

    const salesTeamMembers = rules.sales_team_members || []
    if (salesTeamMembers.length === 0) {
      return NextResponse.json(
        { error: 'No sales team members in the rule' },
        { status: 400 }
      )
    }

    const leadsResult = await pool.query(
      `SELECT id FROM leads WHERE assigned_to IS NULL AND status = 'new'`
    )
    const unassignedLeads = leadsResult.rows || []

    const assignments: { leadId: string; assignedTo: string }[] = []

    for (const lead of unassignedLeads) {
      const historyResult = await pool.query(
        `SELECT assigned_to FROM lead_assignment_history WHERE lead_id = $1 ORDER BY assignment_date DESC LIMIT 1`,
        [lead.id]
      )
      const lastAssignment = historyResult.rows[0]
      let nextIndex = 0

      if (lastAssignment?.assigned_to) {
        const idx = salesTeamMembers.indexOf(lastAssignment.assigned_to)
        nextIndex = (idx + 1) % salesTeamMembers.length
      } else {
        const countResult = await pool.query(
          `SELECT assigned_to, COUNT(*) as c FROM lead_assignment_history 
           WHERE assigned_to = ANY($1) GROUP BY assigned_to`,
          [salesTeamMembers]
        )
        const counts: Record<string, number> = {}
        salesTeamMembers.forEach((id: string) => { counts[id] = 0 })
        countResult.rows.forEach((r: { assigned_to: string; c: string }) => {
          counts[r.assigned_to] = parseInt(r.c, 10)
        })
        const minId = Object.entries(counts).reduce((a, b) => (a[1] <= b[1] ? a : b))[0]
        nextIndex = salesTeamMembers.indexOf(minId)
      }

      const assignedTo = salesTeamMembers[nextIndex]
      await pool.query(
        'UPDATE leads SET assigned_to = $1, updated_at = NOW() WHERE id = $2',
        [assignedTo, lead.id]
      )
      await pool.query(
        `INSERT INTO lead_assignment_history (lead_id, assigned_to, assigned_by, assignment_date)
         VALUES ($1, $2, $3, NOW())`,
        [lead.id, assignedTo, session.id]
      )
      await pool.query(
        `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
         VALUES ($1, $2, 'assigned', 'Lead auto-assigned via round-robin', NOW())`,
        [lead.id, session.id]
      )
      assignments.push({ leadId: lead.id, assignedTo })
    }

    return NextResponse.json({
      success: true,
      assignedCount: assignments.length,
      assignments
    })
  } catch (error: unknown) {
    console.error('Error in auto-assignment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auto-assignment failed' },
      { status: 500 }
    )
  }
}
