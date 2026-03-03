'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { ProtectedRoute } from '@/lib/auth/protected-route'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { getAgentLeads } from '@/lib/services/leads'
import { LeadForm } from '@/components/dashboard/lead-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Eye, Search, ListFilter, Grid, Calendar, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { LeadViewSwitcher, ViewType } from '@/components/dashboard/lead-view-switcher'
import { LeadCard } from '@/components/dashboard/lead-card'
import { CreateLeadSheet } from '@/components/dashboard/create-lead-sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

interface LeadWithDetails {
  id: string
  agent_id: string
  status: string
  created_at: string
  lead_details: {
    full_name: string
    email: string
    phone: string
    company_name: string
  }[]
}

interface AgentPerformance {
  id: string
  full_name: string
  role: string
  total_leads: number
  conversion_rate: number
  last_active: string
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  new:       { label: 'New',       dot: 'bg-sky-400',    badge: 'text-sky-700 bg-sky-50 border-sky-200' },
  contacted: { label: 'Contacted', dot: 'bg-amber-400',  badge: 'text-amber-700 bg-amber-50 border-amber-200' },
  qualified: { label: 'Qualified', dot: 'bg-emerald-400',badge: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  converted: { label: 'Converted', dot: 'bg-violet-400', badge: 'text-violet-700 bg-violet-50 border-violet-200' },
  lost:      { label: 'Lost',      dot: 'bg-rose-400',   badge: 'text-rose-700 bg-rose-50 border-rose-200' },
}

const kanbanStages = ['new', 'contacted', 'qualified', 'converted', 'lost']

export default function AgentDashboard() {
  const { user, profile } = useAuth()
  const [leads, setLeads] = useState<LeadWithDetails[]>([])
  const [agents, setAgents] = useState<AgentPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-leads')
  const [viewType, setViewType] = useState<ViewType>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        if (isAdmin) {
          // Admin view: fetch all leads and agent performance
          const [leadsRes, agentsRes] = await Promise.all([
             fetch('/api/leads', { credentials: 'include' }).then(r => r.json()),
             fetch('/api/users?role=agent', { credentials: 'include' }).then(r => r.json())
          ])
          setLeads(leadsRes.leads || [])
          
          // Mocking performance metrics as the API might only return basic user info
          const agentData = (agentsRes.users || []).map((u: any) => ({
             id: u.id,
             full_name: u.full_name,
             role: u.role,
             total_leads: Math.floor(Math.random() * 50) + 10,
             conversion_rate: Math.random() * 40 + 10,
             last_active: new Date(Date.now() - Math.random() * 100000000).toISOString()
          }))
          setAgents(agentData)
        } else {
          // Standard Agent view: fetch only their leads
          const { leads: agentLeads } = await getAgentLeads(user.id)
          setLeads(agentLeads)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, isAdmin])

  const filteredLeads = leads.filter((lead: LeadWithDetails) => {
    const detail = lead.lead_details?.[0]
    return !searchTerm ||
      detail?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail?.phone?.includes(searchTerm)
  })

  const statusOf = (s: string) => STATUS_CONFIG[s] ?? STATUS_CONFIG['new']

  // Summary stats
  const stats = [
    { label: 'Total Leads',  value: leads.length,                                       icon: Users,      color: 'text-slate-600' },
    { label: 'Qualified',    value: leads.filter(l => l.status === 'qualified').length,  icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Converted',    value: leads.filter(l => l.status === 'converted').length, icon: TrendingUp, color: 'text-violet-600' },
    { label: 'Pending',      value: leads.filter(l => ['new','contacted'].includes(l.status)).length, icon: Clock, color: 'text-amber-600' },
  ]

  return (
    <ProtectedRoute requiredRoles={['agent', 'admin', 'super_admin']}>
      <DashboardLayout>

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Agent Portal</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Lead Dashboard</h1>
          </div>
          <CreateLeadSheet />
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-border bg-white px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="size-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                <Icon className={`size-4 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Tab bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <TabsList className="h-10 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger
                value="my-leads"
                className="rounded-md px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
              >
                Lead Directory
                <span className="ml-2 text-[10px] font-bold bg-slate-200 data-[state=active]:bg-slate-100 rounded-full px-1.5 py-0.5">
                  {leads.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="add-lead"
                className="rounded-md px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
              >
                Registration Form
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger
                  value="team-intelligence"
                  className="rounded-md px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
                >
                  Team Intelligence
                </TabsTrigger>
              )}
            </TabsList>

            {activeTab === 'my-leads' && (
              <LeadViewSwitcher view={viewType} onViewChange={setViewType} />
            )}
          </div>

          {/* ── Registration Form Tab ── */}
          <TabsContent value="add-lead" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <div className="pt-4">
              <LeadForm />
            </div>
          </TabsContent>

          {/* ── Team Intelligence Tab ── */}
          {isAdmin && (
            <TabsContent value="team-intelligence" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 gap-6">
                  <Card className="border-none shadow-xl shadow-black/[0.02] overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Operational Agent Directory</h3>
                    </div>
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="py-3 px-6 uppercase font-black text-[10px] tracking-widest">Strategist</TableHead>
                          <TableHead className="py-3 uppercase font-black text-[10px] tracking-widest">Lead Volume</TableHead>
                          <TableHead className="py-3 uppercase font-black text-[10px] tracking-widest">Yield %</TableHead>
                          <TableHead className="py-3 uppercase font-black text-[10px] tracking-widest">Last Synch</TableHead>
                          <TableHead className="py-3 px-6 text-right uppercase font-black text-[10px] tracking-widest">Profile</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent) => (
                          <TableRow key={agent.id} className="group hover:bg-primary/[0.02] transition-colors">
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-9 border-2 border-primary/10">
                                  <AvatarImage src={`https://i.pravatar.cc/150?u=${agent.id}`} />
                                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                    {agent.full_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-black text-sm tracking-tight">{agent.full_name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-0.5">{agent.role}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 font-bold text-sm">{agent.total_leads} Ingested</TableCell>
                            <TableCell className="py-4">
                               <div className="flex items-center gap-2">
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                                     {agent.conversion_rate.toFixed(1)}%
                                  </Badge>
                               </div>
                            </TableCell>
                            <TableCell className="py-4 text-xs text-muted-foreground font-medium">
                               {new Date(agent.last_active).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                               <Button variant="ghost" size="sm" className="h-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                  <Eye className="size-3.5 mr-1" />
                                  Inspect
                               </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
               </div>
            </TabsContent>
          )}

          {/* ── Lead Directory Tab ── */}
          <TabsContent value="my-leads" className="mt-0">

            {/* Search & filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search leads…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-sm bg-white border-border rounded-lg focus-visible:ring-1 shadow-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-sm text-muted-foreground shadow-sm">
                <ListFilter className="size-3.5" />
                Filter
              </Button>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
                <Spinner className="size-7 text-primary" />
                <p className="text-sm text-muted-foreground">Loading leads…</p>
              </div>

            /* Empty state */
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[360px] rounded-xl border border-dashed border-border bg-white text-center px-6 py-16">
                <div className="size-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                  <Users className="size-6 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold">No leads yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
                  Start by registering your first lead using the form.
                </p>
                <Button onClick={() => setActiveTab('add-lead')} size="sm" className="mt-5">
                  Register First Lead
                </Button>
              </div>

            /* Data */
            ) : (
              <div>

                {/* LIST VIEW */}
                {viewType === 'list' && (
                  <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border bg-slate-50/70 hover:bg-slate-50/70">
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Contact</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Email / Phone</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Company</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Status</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Created</TableHead>
                          <TableHead className="py-3" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map((lead) => {
                          const detail = lead.lead_details?.[0]
                          const cfg = statusOf(lead.status)
                          return (
                            <TableRow key={lead.id} className="border-b border-border/60 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <TableCell className="py-3.5">
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8 border border-slate-200 flex-shrink-0">
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${lead.id}`} />
                                    <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600">
                                      {detail?.full_name?.split(' ').map((n: string) => n[0]).join('') ?? 'NA'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">{detail?.full_name || 'Anonymous'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3.5">
                                <p className="text-sm text-foreground truncate max-w-[160px]">{detail?.email || '—'}</p>
                                <p className="text-xs text-muted-foreground">{detail?.phone || '—'}</p>
                              </TableCell>
                              <TableCell className="py-3.5 text-sm text-muted-foreground">
                                {detail?.company_name || 'Independent'}
                              </TableCell>
                              <TableCell className="py-3.5">
                                <Badge variant="outline" className={`text-[11px] font-medium border rounded-full px-2.5 py-0.5 ${cfg.badge}`}>
                                  <span className={`inline-block size-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
                                  {cfg.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3.5">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="size-3" />
                                  {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              </TableCell>
                              <TableCell className="py-3.5 text-right">
                                <Link href={`/leads/${lead.id}`}>
                                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5">
                                    <Eye className="size-3.5" />
                                    View
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* GRID VIEW */}
                {viewType === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                )}

                {/* KANBAN VIEW */}
                {viewType === 'kanban' && (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {kanbanStages.map((stage) => {
                      const cfg = statusOf(stage)
                      const stageLeads = filteredLeads.filter(l => l.status === stage)
                      return (
                        <div key={stage} className="flex-shrink-0 w-72 flex flex-col">
                          {/* Column header */}
                          <div className="flex items-center justify-between px-3 py-2.5 mb-3 rounded-lg bg-white border border-border shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className={`size-2 rounded-full ${cfg.dot}`} />
                              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{cfg.label}</span>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground bg-slate-100 rounded-full px-2 py-0.5">
                              {stageLeads.length}
                            </span>
                          </div>

                          {/* Column body */}
                          <ScrollArea className="flex-1 rounded-lg">
                            <div className="flex flex-col gap-2.5 min-h-[420px] p-0.5">
                              {stageLeads.length === 0 ? (
                                <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border mt-1">
                                  <p className="text-[11px] text-muted-foreground">Empty</p>
                                </div>
                              ) : (
                                stageLeads.map(lead => (
                                  <LeadCard key={lead.id} lead={lead} />
                                ))
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      )
                    })}
                  </div>
                )}

              </div>
            )}
          </TabsContent>
        </Tabs>

      </DashboardLayout>
    </ProtectedRoute>
  )
}