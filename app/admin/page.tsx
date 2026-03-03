"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/context"
import { ProtectedRoute } from "@/lib/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getAllLeads, assignLeadToSalesUser } from "@/lib/services/leads"
import { autoAssignUnassignedLeads, getAutoAssignmentRules } from "@/lib/services/auto-assignment"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Users, Zap, BarChart3, Settings, Search, ChevronDown, Filter, UserCog, UserPlus, RefreshCw } from "lucide-react"
import { LeadViewSwitcher, ViewType } from "@/components/dashboard/lead-view-switcher"
import { LeadCard } from "@/components/dashboard/lead-card"
import { Separator } from "@/components/ui/separator"

interface LeadWithDetails {
  id: string
  agent_id: string
  assigned_to: string | null
  status: string
  created_at: string
  lead_details: {
    full_name: string
    email: string
    phone: string
    company_name: string
  }[]
}

interface UserOption {
  id: string
  email: string
  full_name: string
  role: string
}

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const [leads, setLeads] = useState<LeadWithDetails[]>([])
  const [salesUsers, setSalesUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assignmentFilter, setAssignmentFilter] = useState('all')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedSalesUser, setSelectedSalesUser] = useState<string>('')
  const [autoAssignmentRules, setAutoAssignmentRules] = useState<any[]>([])
  const [activeMode, setActiveMode] = useState<'round_robin' | 'load_balanced' | 'manual'>('round_robin')
  const [viewType, setViewType] = useState<ViewType>('list')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isReassign, setIsReassign] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, rulesRes, usersRes] = await Promise.all([
          getAllLeads(100, 0),
          getAutoAssignmentRules(),
          fetch('/api/users?role=sales', { credentials: 'include' }).then(r => r.json())
        ])
        setLeads(leadsRes.leads)
        setAutoAssignmentRules(rulesRes)
        setSalesUsers(usersRes.users || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAutoAssign = async () => {
    if (!user) return
    setAutoAssigning(true)
    try {
      await autoAssignUnassignedLeads(user.id)
      toast.success('Leads assigned successfully')
      // Refresh leads
      const leadsRes = await getAllLeads(100, 0)
      setLeads(leadsRes.leads)
    } catch (error) {
      console.error('Error auto-assigning leads:', error)
      toast.error('Failed to auto-assign leads')
    } finally {
      setAutoAssigning(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const detail = lead.lead_details?.[0]
    const matchesSearch = !searchTerm || 
      detail?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail?.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesAssignment = assignmentFilter === 'all' || 
      (assignmentFilter === 'assigned' && lead.assigned_to) ||
      (assignmentFilter === 'unassigned' && !lead.assigned_to)

    return matchesSearch && matchesStatus && matchesAssignment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'contacted': return 'bg-amber-500/10 text-amber-600 border-amber-200'
      case 'qualified': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
      case 'converted': return 'bg-violet-500/10 text-violet-600 border-violet-200'
      case 'lost': return 'bg-rose-500/10 text-rose-600 border-rose-200'
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200'
    }
  }

  const unassignedCount = leads.filter(l => !l.assigned_to).length
  const totalLeads = leads.length
  const assignmentRate = totalLeads > 0 ? Math.round(((totalLeads - unassignedCount) / totalLeads) * 100) : 0

  const selectedLead = selectedLeadId ? leads.find(l => l.id === selectedLeadId) : null

  const handleManualAssign = async () => {
    if (!user) {
      toast.error("You must be signed in to assign leads")
      return
    }

    if (!selectedLeadId || !selectedSalesUser) {
      toast.error("Select a sales person to assign this lead")
      return
    }

    setAssigning(true)
    try {
      await assignLeadToSalesUser(selectedLeadId, selectedSalesUser, user.id)
      toast.success(isReassign ? "Lead reassigned successfully" : "Lead assigned successfully")
      const leadsRes = await getAllLeads(100, 0)
      setLeads(leadsRes.leads)
      setIsAssignDialogOpen(false)
      setSelectedLeadId(null)
      setSelectedSalesUser("")
    } catch (error) {
      console.error("Error assigning lead:", error)
      toast.error("Failed to assign lead")
    } finally {
      setAssigning(false)
    }
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
            <p className="text-muted-foreground mt-1">Global lead orchestration and assignment management.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                onClick={async () => {
                  setLoading(true)
                  const leadsRes = await getAllLeads(100, 0)
                  setLeads(leadsRes.leads)
                  setLoading(false)
                  toast.success('Data refreshed')
                }} 
                variant="outline"
                className="gap-2 rounded-full"
             >
                <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary/[0.02] border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <h3 className="text-3xl font-bold mt-1">{totalLeads}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Users className="size-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium mr-1">+12%</span>
                since last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/[0.02] border-amber-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
                  <h3 className="text-3xl font-bold mt-1 text-amber-600">{unassignedCount}</h3>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-2xl">
                  <Zap className="size-6 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                 <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 rounded-full border-amber-200 text-amber-600 hover:bg-amber-50" onClick={handleAutoAssign}>
                   Quick Assign
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cyan-500/[0.02] border-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                  <h3 className="text-3xl font-bold mt-1">{assignmentRate}%</h3>
                </div>
                <div className="bg-cyan-500/10 p-3 rounded-2xl">
                  <BarChart3 className="size-6 text-cyan-500" />
                </div>
              </div>
              <div className="mt-4 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                 <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${assignmentRate}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary shadow-xl shadow-primary/20 border-none text-primary-foreground">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Automation</p>
                <h3 className="text-xl font-bold mt-1">Auto-Assignment</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAutoAssign}
                disabled={autoAssigning || unassignedCount === 0}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 border-none text-white backdrop-blur-sm"
              >
                {autoAssigning ? <Spinner className="size-4 mr-2" /> : <Zap className="size-4 mr-2" />}
                Run Engine
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="w-full space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-muted/20 p-2 rounded-2xl border border-border/50 shadow-sm">
            <TabsList className="bg-transparent h-auto p-0 gap-1 justify-start">
              <TabsTrigger
                value="leads"
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-muted-foreground font-bold text-sm transition-all"
              >
                Lead Management
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-muted-foreground font-bold text-sm transition-all"
              >
                Assignment Rules
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 px-2">
               <div className="h-8 w-px bg-border hidden lg:block mx-2" />
               <LeadViewSwitcher view={viewType} onViewChange={setViewType} />
            </div>
          </div>

          <TabsContent value="leads" className="mt-0">
             <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search global leads database..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 rounded-xl bg-background border-border/50 shadow-sm font-medium text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[160px] h-10 rounded-xl bg-background border-border/50 shadow-sm font-bold text-xs uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                           <Filter className="size-3 text-muted-foreground" />
                           <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider">Any Status</SelectItem>
                        <SelectItem value="new" className="text-xs font-bold uppercase tracking-wider">New</SelectItem>
                        <SelectItem value="contacted" className="text-xs font-bold uppercase tracking-wider">Contacted</SelectItem>
                        <SelectItem value="qualified" className="text-xs font-bold uppercase tracking-wider">Qualified</SelectItem>
                        <SelectItem value="converted" className="text-xs font-bold uppercase tracking-wider">Converted</SelectItem>
                        <SelectItem value="lost" className="text-xs font-bold uppercase tracking-wider">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                      <SelectTrigger className="w-[160px] h-10 rounded-xl bg-background border-border/50 shadow-sm font-bold text-xs uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                           <UserPlus className="size-3 text-muted-foreground" />
                           <SelectValue placeholder="Assignment" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider">All Leads</SelectItem>
                        <SelectItem value="assigned" className="text-xs font-bold uppercase tracking-wider">Assigned Only</SelectItem>
                        <SelectItem value="unassigned" className="text-xs font-bold uppercase tracking-wider">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading ? (
                   <div className="flex flex-col justify-center items-center min-h-[300px] gap-4">
                     <Spinner className="size-8 text-primary" />
                     <p className="text-muted-foreground text-sm">Loading database...</p>
                   </div>
                ) : (
                  <div className="animate-in fade-in duration-500">
                     {viewType === 'list' ? (
                        <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow>
                                <TableHead className="w-[280px]">Lead Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredLeads.map((lead) => {
                                const detail = lead.lead_details?.[0]
                                const assignedUser = salesUsers.find(u => u.id === lead.assigned_to)
                                return (
                                  <TableRow key={lead.id} className="group hover:bg-muted/10 transition-colors">
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="size-8 border-2 border-background">
                                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                            {detail?.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-semibold text-sm">{detail?.full_name || 'Anonymous'}</p>
                                          <p className="text-[10px] text-muted-foreground">{detail?.email}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={getStatusColor(lead.status)}>
                                        {lead.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {lead.assigned_to ? (
                                        <div className="flex items-center gap-2">
                                           <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                           <span className="text-sm font-medium">{assignedUser?.full_name || 'Sales Agent'}</span>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground text-xs italic">Awaiting Assignment</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                      {new Date(lead.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                      <Link href={`/leads/${lead.id}`}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="rounded-full h-8 text-xs px-3"
                                        >
                                          View Lead
                                        </Button>
                                      </Link>
                                      {!lead.assigned_to ? (
                                        <Button
                                          size="sm"
                                          className="rounded-full h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground group-hover:scale-105 transition-all"
                                          onClick={() => {
                                            setSelectedLeadId(lead.id)
                                            setSelectedSalesUser("")
                                            setIsReassign(false)
                                            setIsAssignDialogOpen(true)
                                          }}
                                        >
                                          Assign Agent
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="rounded-full h-8 text-xs text-muted-foreground"
                                          onClick={() => {
                                            setSelectedLeadId(lead.id)
                                            setSelectedSalesUser(lead.assigned_to || "")
                                            setIsReassign(true)
                                            setIsAssignDialogOpen(true)
                                          }}
                                        >
                                          Reassign
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </Card>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                           {filteredLeads.map(lead => (
                             <LeadCard key={lead.id} lead={lead} />
                           ))}
                        </div>
                     )}
                  </div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                           <Settings className="size-6 text-primary" />
                           Assignment Protocols
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium">Select the primary logic engine for lead distribution.</p>
                      </div>
                      
                      <ButtonGroup className="bg-muted/30 p-1 rounded-xl border-none shadow-inner">
                         {[
                            { id: 'round_robin', label: 'Round Robin', icon: RefreshCw },
                            { id: 'load_balanced', label: 'Load Balanced', icon: BarChart3 },
                            { id: 'manual', label: 'Manual', icon: Settings }
                         ].map((mode) => (
                            <Button
                               key={mode.id}
                               variant={activeMode === mode.id ? 'default' : 'ghost'}
                               size="sm"
                               onClick={() => setActiveMode(mode.id as any)}
                               className={cn(
                                  "h-9 px-4 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                                  activeMode === mode.id 
                                     ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                     : "text-muted-foreground hover:text-foreground"
                               )}
                            >
                               <mode.icon className="size-3.5 mr-2" />
                               {mode.label}
                            </Button>
                         ))}
                      </ButtonGroup>
                   </div>

                   <Separator className="bg-primary/10" />

                   {autoAssignmentRules.length === 0 ? (
                      <Card className="p-16 text-center border-dashed border-2 bg-muted/5 group hover:bg-primary/[0.02] transition-colors">
                         <div className="size-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                         </div>
                         <h3 className="font-bold text-lg">No Custom Rules Defined</h3>
                         <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto italic">Platform is currently operating on baseline {activeMode.replace('_', ' ')} logic.</p>
                         <Button variant="outline" className="mt-6 rounded-full border-primary/20 text-primary">
                            <UserPlus className="size-4 mr-2" />
                            Initialize Rule Set
                         </Button>
                      </Card>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {autoAssignmentRules.map((rule) => (
                            <Card key={rule.id} className="group border-none shadow-xl shadow-black/[0.02] overflow-hidden hover:-translate-y-1 transition-all duration-300">
                              <div className={cn(
                                 "h-1.5 w-full",
                                 rule.enabled ? "bg-emerald-500" : "bg-muted"
                              )} />
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                   <div className="space-y-3">
                                      <div>
                                         <h4 className="font-black text-sm uppercase tracking-wider">{rule.name}</h4>
                                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Status: {rule.enabled ? 'Live Operations' : 'On Standby'}</p>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                         <Badge variant="secondary" className="bg-primary/5 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 border-none">
                                            {rule.assignment_type.replace('_', ' ')}
                                         </Badge>
                                         <Badge variant="secondary" className="bg-amber-500/5 text-amber-600 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 border-none">
                                            {rule.sales_team_members?.length || 0} Strategists
                                         </Badge>
                                      </div>
                                   </div>
                                   <div className={cn(
                                      "p-3 rounded-2xl shadow-sm transition-all",
                                      rule.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                                   )}>
                                      <Zap className={cn("size-5", rule.enabled && "animate-pulse")} />
                                   </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                   <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary p-0">
                                      Configure Logic
                                   </Button>
                                   <div className="flex items-center gap-2">
                                      <div className={cn("size-2 rounded-full", rule.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                                      <span className="text-[10px] font-black uppercase text-muted-foreground">Pulse</span>
                                   </div>
                                </div>
                              </CardContent>
                            </Card>
                         ))}
                      </div>
                   )}
                </div>
                
                <div className="space-y-6">
                   <Card className="bg-muted/30 border-none">
                      <CardHeader>
                         <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">System Health</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="flex items-center justify-between text-sm">
                            <span>Database Sync</span>
                            <span className="text-emerald-500 font-bold">Stable</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span>API Latency</span>
                            <span className="text-emerald-500 font-bold">42ms</span>
                         </div>
                         <Separator />
                         <div className="pt-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Server Uptime</p>
                            <div className="flex gap-0.5 h-6">
                               {[...Array(20)].map((_, i) => (
                                 <div key={i} className="flex-1 bg-emerald-500/80 rounded-[1px]" />
                               ))}
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </TabsContent>
        </Tabs>

        <Dialog
          open={isAssignDialogOpen}
          onOpenChange={(open) => {
            setIsAssignDialogOpen(open)
            if (!open) {
              setSelectedLeadId(null)
              setSelectedSalesUser("")
              setIsReassign(false)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Lead</DialogTitle>
              <DialogDescription>
                Choose a sales person to own this lead.
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="mb-4 rounded-md bg-muted/40 p-3 text-sm">
                <p className="font-semibold">
                  {selectedLead.lead_details?.[0]?.full_name || "Anonymous lead"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedLead.lead_details?.[0]?.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Current status: <span className="font-medium">{selectedLead.status}</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">
                Sales Person
              </Label>
              <Select value={selectedSalesUser} onValueChange={setSelectedSalesUser}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-background border-border/60 shadow-sm text-sm">
                  <SelectValue placeholder="Select sales person" />
                </SelectTrigger>
                <SelectContent>
                  {salesUsers.map((su) => (
                    <SelectItem key={su.id} value={su.id}>
                      {su.full_name || su.email}{" "}
                      {su.email ? `(${su.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualAssign}
                disabled={assigning || !selectedSalesUser}
                className="gap-2"
              >
                {assigning && <Spinner className="size-4" />}
                Assign Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
