/**
 * Run with: npx tsx scripts/seed-dummy-data.ts
 * Adds dummy data for dashboard preview.
 * Requires: schema applied and at least one admin user (run seed-admin.ts first).
 */
import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env.local' })
import bcrypt from 'bcryptjs'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:yourpassword@localhost:5432/truegacy'

const SAMPLE_LEADS = [
  { full_name: 'John Smith', email: 'john.smith@acmecorp.com', phone: '+1-555-0101', company: 'Acme Corp', industry: 'Technology', source: 'website' },
  { full_name: 'Sarah Johnson', email: 'sarah.j@techstart.io', phone: '+1-555-0102', company: 'TechStart', industry: 'Software', source: 'referral' },
  { full_name: 'Michael Chen', email: 'm.chen@globalindustries.com', phone: '+1-555-0103', company: 'Global Industries', industry: 'Manufacturing', source: 'direct' },
  { full_name: 'Emily Davis', email: 'emily.d@innovate.co', phone: '+1-555-0104', company: 'Innovate Solutions', industry: 'Consulting', source: 'advertisement' },
  { full_name: 'David Wilson', email: 'dwilson@retailplus.com', phone: '+1-555-0105', company: 'Retail Plus', industry: 'Retail', source: 'social_media' },
  { full_name: 'Lisa Anderson', email: 'lisa.a@healthfirst.org', phone: '+1-555-0106', company: 'Health First', industry: 'Healthcare', source: 'referral' },
  { full_name: 'Robert Brown', email: 'rbrown@financehub.com', phone: '+1-555-0107', company: 'Finance Hub', industry: 'Finance', source: 'website' },
  { full_name: 'Jennifer Lee', email: 'jlee@marketingpro.com', phone: '+1-555-0108', company: 'Marketing Pro', industry: 'Marketing', source: 'direct' },
  { full_name: 'James Taylor', email: 'jtaylor@logistics.co', phone: '+1-555-0109', company: 'Swift Logistics', industry: 'Logistics', source: 'other' },
  { full_name: 'Amanda Martinez', email: 'a.martinez@design.studio', phone: '+1-555-0110', company: 'Creative Design Studio', industry: 'Creative', source: 'website' },
  // Extra leads for sales3
  { full_name: 'Chris Thompson', email: 'cthompson@cloudops.io', phone: '+1-555-0111', company: 'CloudOps', industry: 'Technology', source: 'website' },
  { full_name: 'Maria Garcia', email: 'mgarcia@fooddelivery.com', phone: '+1-555-0112', company: 'FoodDelivery Pro', industry: 'Food & Beverage', source: 'referral' },
  { full_name: 'Kevin Nguyen', email: 'k.nguyen@cybersec.com', phone: '+1-555-0113', company: 'CyberSec Solutions', industry: 'Security', source: 'direct' },
  { full_name: 'Rachel Green', email: 'rgreen@fashionforward.com', phone: '+1-555-0114', company: 'Fashion Forward', industry: 'Retail', source: 'social_media' },
  // Extra leads for agent3
  { full_name: 'Tom Anderson', email: 'tanderson@medtech.com', phone: '+1-555-0115', company: 'MedTech Inc', industry: 'Healthcare', source: 'website' },
  { full_name: 'Sofia Rodriguez', email: 'srodriguez@eduplatform.org', phone: '+1-555-0116', company: 'EduPlatform', industry: 'Education', source: 'referral' },
  { full_name: 'Daniel Kim', email: 'dkim@autosoft.com', phone: '+1-555-0117', company: 'AutoSoft', industry: 'Automotive', source: 'direct' },
  { full_name: 'Emma Watson', email: 'ewatson@greenenergy.co', phone: '+1-555-0118', company: 'Green Energy Solutions', industry: 'Energy', source: 'advertisement' },
]

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL })
  const hash = await bcrypt.hash('password123', 10)

  // 1. Create users (admin, agents, sales)
  const usersToInsert = [
    ['admin@truegacy.com', hash, 'Admin User', 'super_admin'],
    ['agent1@truegacy.com', hash, 'Alex Agent', 'agent'],
    ['agent2@truegacy.com', hash, 'Jordan Agent', 'agent'],
    ['agent3@truegacy.com', hash, 'Casey Agent', 'agent'],
    ['sales1@truegacy.com', hash, 'Sam Sales', 'sales'],
    ['sales2@truegacy.com', hash, 'Riley Sales', 'sales'],
    ['sales3@truegacy.com', hash, 'Morgan Sales', 'sales'],
  ]

  for (const [email, passwordHash, fullName, role] of usersToInsert) {
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [email, passwordHash, fullName, role]
    )
  }

  const usersResult = await pool.query(
    `SELECT id, email FROM users WHERE email = ANY($1)`,
    [usersToInsert.map(([email]) => email)]
  )
  const users = Object.fromEntries(
    usersResult.rows.map((r: { email: string; id: string }) => [r.email, r.id])
  )
  const adminId = users['admin@truegacy.com']
  const agent1Id = users['agent1@truegacy.com']
  const agent2Id = users['agent2@truegacy.com']
  const agent3Id = users['agent3@truegacy.com']
  const sales1Id = users['sales1@truegacy.com']
  const sales2Id = users['sales2@truegacy.com']
  const sales3Id = users['sales3@truegacy.com']

  // 2. Clear existing data (optional - comment out to append)
  await pool.query('DELETE FROM lead_opportunities')
  await pool.query('DELETE FROM lead_activities')
  await pool.query('DELETE FROM lead_assignment_history')
  await pool.query('DELETE FROM lead_documents')
  await pool.query('DELETE FROM lead_details')
  await pool.query('DELETE FROM leads')
  await pool.query('DELETE FROM auto_assignment_rules')

  // 3. Insert leads with various statuses
  const statuses: ('new' | 'contacted' | 'qualified' | 'converted' | 'lost')[] = [
    'new', 'new', 'contacted', 'contacted', 'qualified', 'qualified', 'converted', 'converted', 'lost', 'new',
    'contacted', 'qualified', 'converted', 'new',  // sales3's leads
    'new', 'new', 'contacted', 'qualified'  // agent3's leads
  ]
  const agentIds = [
    agent1Id, agent2Id, agent1Id, agent2Id, agent1Id, agent2Id, agent1Id, agent2Id, agent1Id, agent2Id,
    agent1Id, agent2Id, agent1Id, agent2Id,
    agent3Id, agent3Id, agent3Id, agent3Id  // all created by agent3
  ]
  const assignedTo: (string | null)[] = [
    null, null, sales1Id, sales2Id, sales1Id, sales2Id, sales1Id, sales2Id, null, null,
    sales3Id, sales3Id, sales3Id, sales3Id,
    null, null, sales1Id, sales2Id  // agent3's leads: 2 unassigned, 2 assigned
  ]

  for (let i = 0; i < SAMPLE_LEADS.length; i++) {
    const lead = SAMPLE_LEADS[i]
    const leadResult = await pool.query(
      `INSERT INTO leads (agent_id, assigned_to, status) VALUES ($1, $2, $3) RETURNING id`,
      [agentIds[i], assignedTo[i], statuses[i]]
    )
    const leadId = leadResult.rows[0].id

    await pool.query(
      `INSERT INTO lead_details (lead_id, full_name, email, phone, company_name, industry, lead_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [leadId, lead.full_name, lead.email, lead.phone, lead.company, lead.industry, lead.source]
    )

    // Activities
    await pool.query(
      `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
       VALUES ($1, $2, 'created', 'Lead created', NOW() - INTERVAL '${i + 1} days')`,
      [leadId, agentIds[i]]
    )
    if (['contacted', 'qualified', 'converted'].includes(statuses[i])) {
      await pool.query(
        `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
         VALUES ($1, $2, 'called', 'Initial discovery call completed', NOW() - INTERVAL '${i} days')`,
        [leadId, assignedTo[i] || agentIds[i]]
      )
    }
    if (['qualified', 'converted'].includes(statuses[i])) {
      await pool.query(
        `INSERT INTO lead_activities (lead_id, user_id, activity_type, description, timestamp)
         VALUES ($1, $2, 'meeting', 'Demo meeting scheduled', NOW() - INTERVAL '${i} days' + INTERVAL '4 hours')`,
        [leadId, assignedTo[i] || agentIds[i]]
      )
    }

    // Assignment history for assigned leads
    if (assignedTo[i]) {
      await pool.query(
        `INSERT INTO lead_assignment_history (lead_id, assigned_to, assigned_by, assignment_date)
         VALUES ($1, $2, $3, NOW() - INTERVAL '${i + 1} days')`,
        [leadId, assignedTo[i], adminId]
      )
    }

    // Opportunities for qualified/converted
    if (['qualified', 'converted'].includes(statuses[i])) {
      const value = 5000 + (i * 2500)
      const stage = statuses[i] === 'converted' ? 'won' : (i % 2 === 0 ? 'proposal' : 'negotiation')
      await pool.query(
        `INSERT INTO lead_opportunities (lead_id, title, value, stage, expected_close_date, created_by)
         VALUES ($1, $2, $3, $4, CURRENT_DATE + INTERVAL '${30 - i} days', $5)`,
        [leadId, `${lead.company} - Enterprise Package`, value, stage, assignedTo[i] || adminId]
      )
    }
  }

  // 4. Auto-assignment rule
  await pool.query(
    `INSERT INTO auto_assignment_rules (name, enabled, assignment_type, sales_team_members)
     VALUES ('Default Round Robin', true, 'round_robin', $1)`,
    [`{${sales1Id},${sales2Id},${sales3Id}}`]
  )

  console.log('✅ Dummy data seeded successfully!')
  console.log('')
  console.log('Login credentials (password: password123):')
  console.log('  - admin@truegacy.com (super_admin)')
  console.log('  - agent1@truegacy.com (agent)')
  console.log('  - agent2@truegacy.com (agent)')
  console.log('  - agent3@truegacy.com (agent) - Casey Agent, has 4 created leads')
  console.log('  - sales1@truegacy.com (sales)')
  console.log('  - sales2@truegacy.com (sales)')
  console.log('  - sales3@truegacy.com (sales) - Morgan Sales, has 4 assigned leads')
  console.log('')
  console.log('Created: 18 leads, activities, opportunities, auto-assignment rule')

  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
