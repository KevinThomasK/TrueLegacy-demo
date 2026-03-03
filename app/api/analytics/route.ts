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
    const type = searchParams.get('type')
    const days = parseInt(searchParams.get('days') || '30')

    if (type === 'conversion') {
      const result = await pool.query('SELECT status FROM leads')
      const leads = result.rows || []
      const totalLeads = leads.length
      const convertedLeads = leads.filter((l: { status: string }) => l.status === 'converted').length
      const lostLeads = leads.filter((l: { status: string }) => l.status === 'lost').length
      const contactedLeads = leads.filter((l: { status: string }) => l.status === 'contacted').length
      const qualifiedLeads = leads.filter((l: { status: string }) => l.status === 'qualified').length

      return NextResponse.json({
        totalLeads,
        convertedLeads,
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
        lostLeads,
        contactedLeads,
        qualifiedLeads
      })
    }

    if (type === 'by_source') {
      const result = await pool.query(
        `SELECT l.status, ld.lead_source FROM leads l
         LEFT JOIN lead_details ld ON ld.lead_id = l.id`
      )
      const leads = result.rows || []
      const sourceMap = new Map<string, { total: number; converted: number }>()
      leads.forEach((lead: { status: string; lead_source: string }) => {
        const source = lead.lead_source || 'unknown'
        const current = sourceMap.get(source) || { total: 0, converted: 0 }
        current.total++
        if (lead.status === 'converted') current.converted++
        sourceMap.set(source, current)
      })
      const data = Array.from(sourceMap.entries()).map(([source, m]) => ({
        source,
        totalLeads: m.total,
        convertedLeads: m.converted,
        conversionRate: m.total > 0 ? (m.converted / m.total) * 100 : 0
      }))
      return NextResponse.json(data)
    }

    if (type === 'activity') {
      const result = await pool.query('SELECT activity_type FROM lead_activities')
      const activities = result.rows || []
      const totalActivities = activities.length
      const callsLogged = activities.filter((a: { activity_type: string }) => a.activity_type === 'called').length
      const emailsLogged = activities.filter((a: { activity_type: string }) => a.activity_type === 'emailed').length
      const meetingsLogged = activities.filter((a: { activity_type: string }) => a.activity_type === 'meeting').length
      const notesLogged = activities.filter((a: { activity_type: string }) => a.activity_type === 'note').length

      return NextResponse.json({
        totalActivities,
        callsLogged,
        emailsLogged,
        meetingsLogged,
        notesLogged
      })
    }

    if (type === 'sales_performance') {
      const leadsResult = await pool.query(
        `SELECT id, assigned_to, status FROM leads WHERE assigned_to IS NOT NULL`
      )
      const profilesResult = await pool.query('SELECT id, full_name FROM users')
      const userMap = new Map(profilesResult.rows.map((p: { id: string; full_name: string }) => [p.id, p.full_name]))
      const metrics = new Map<string, { total: number; converted: number; qualified: number }>()

     ;(leadsResult.rows || []).forEach((lead: { assigned_to: string; status: string }) => {
        const uid = lead.assigned_to
        if (!uid) return
        const current = metrics.get(uid) || { total: 0, converted: 0, qualified: 0 }
        current.total++
        if (lead.status === 'converted') current.converted++
        if (lead.status === 'qualified') current.qualified++
        metrics.set(uid, current)
      })

      const data = Array.from(metrics.entries())
        .map(([userId, m]) => ({
          userId,
          fullName: userMap.get(userId) || 'Unknown',
          totalAssignedLeads: m.total,
          convertedLeads: m.converted,
          conversionRate: m.total > 0 ? (m.converted / m.total) * 100 : 0,
          qualifiedLeads: m.qualified
        }))
        .sort((a, b) => b.conversionRate - a.conversionRate)

      return NextResponse.json(data)
    }

    if (type === 'leads_over_time') {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const result = await pool.query(
        `SELECT created_at, status FROM leads WHERE created_at >= $1`,
        [startDate.toISOString()]
      )
      const leads = result.rows || []
      const timelineMap = new Map<string, { total: number; converted: number }>()
      leads.forEach((lead: { created_at: string; status: string }) => {
        const date = new Date(lead.created_at).toLocaleDateString()
        const current = timelineMap.get(date) || { total: 0, converted: 0 }
        current.total++
        if (lead.status === 'converted') current.converted++
        timelineMap.set(date, current)
      })
      const data = Array.from(timelineMap.entries())
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([date, m]) => ({ date, total: m.total, converted: m.converted }))
      return NextResponse.json(data)
    }

    if (type === 'opportunity_pipeline') {
      const result = await pool.query('SELECT stage, value FROM lead_opportunities')
      const opportunities = result.rows || []
      const pipeline = {
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        won: { count: 0, value: 0 },
        lost: { count: 0, value: 0 }
      }
      opportunities.forEach((opp: { stage: string; value: number }) => {
        const key = opp.stage as keyof typeof pipeline
        if (pipeline[key]) {
          pipeline[key].count++
          pipeline[key].value += Number(opp.value) || 0
        }
      })
      return NextResponse.json(pipeline)
    }

    return NextResponse.json(
      { error: 'Invalid analytics type. Use: conversion, by_source, activity, sales_performance, leads_over_time, opportunity_pipeline' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analytics failed' },
      { status: 500 }
    )
  }
}
