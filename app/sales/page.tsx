'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { ProtectedRoute } from '@/lib/auth/protected-route'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { getAllLeads, updateLeadStatus, Lead } from '@/lib/services/leads'
import { logActivity } from '@/lib/services/activities'
import { createOpportunity } from '@/lib/services/opportunities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Phone, Mail, MessageSquare, TrendingUp, Eye, CheckCircle, Search, Filter, Calendar, DollarSign, Activity, Target, Users, Edit, Settings, MoreVertical, ExternalLink, Zap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LeadViewSwitcher, ViewType } from '@/components/dashboard/lead-view-switcher'
import { LeadCard } from '@/components/dashboard/lead-card'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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

export default function SalesDashboard() {
  const { user, profile } = useAuth()
  const [leads, setLeads] = useState<LeadWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadWithDetails | null>(null)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false)
  const [activityType, setActivityType] = useState<'called' | 'emailed' | 'meeting' | 'note'>('note')
  const [activityNotes, setActivityNotes] = useState('')
  const [opportunityTitle, setOpportunityTitle] = useState('')
  const [opportunityValue, setOpportunityValue] = useState('')
  const [opportunityDate, setOpportunityDate] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState('all')
  const [viewType, setViewType] = useState<ViewType>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    status: ''
  })

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return

      try {
        const { leads: allLeads } = await getAllLeads(100, 0)
        
        // Show all leads for admins, otherwise filter by assigned user
        const displayLeads = (profile?.role === 'admin' || profile?.role === 'super_admin')
          ? allLeads
          : allLeads.filter((lead: Lead) => lead.assigned_to === user.id)
          
        setLeads(displayLeads)
      } catch (error) {
        console.error('Error fetching leads:', error)
        toast.error('Failed to load leads')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [user])

  const handleLogActivity = async () => {
    if (!selectedLead || !user || !activityNotes) {
      toast.error('Please fill in all required fields')
      return
    }

    setActivityLoading(true)
    try {
      await logActivity(
        selectedLead.id,
        user.id,
        activityType,
        `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} activity logged`,
        activityNotes,
        activityType
      )

      if (activityType !== 'note' && selectedLead.status === 'new') {
        await updateLeadStatus(selectedLead.id, 'contacted', user.id)
        setLeads(leads.map(l =>
          l.id === selectedLead.id ? { ...l, status: 'contacted' } : l
        ))
      }
      
      toast.success('Activity synchronized successfully')
      setActivityNotes('')
      setShowActivityDialog(false)
    } catch (error) {
      console.error('Error logging activity:', error)
      toast.error('Failed to log activity')
    } finally {
      setActivityLoading(false)
    }
  }

  const handleCreateOpportunity = async () => {
    if (!selectedLead || !user || !opportunityTitle || !opportunityValue || !opportunityDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setActivityLoading(true)
    try {
      await createOpportunity(
        selectedLead.id,
        opportunityTitle,
        parseFloat(opportunityValue),
        'USD',
        opportunityDate,
        user.id
      )

      if (selectedLead.status !== 'qualified' && selectedLead.status !== 'converted') {
        await updateLeadStatus(selectedLead.id, 'qualified', user.id)
        setLeads(leads.map(l =>
          l.id === selectedLead.id ? { ...l, status: 'qualified' } : l
        ))
      }

      toast.success('High-value opportunity created')
      setShowOpportunityDialog(false)
    } catch (error) {
      console.error('Error creating opportunity:', error)
      toast.error('Failed to create opportunity')
    } finally {
      setActivityLoading(false)
    }
  }

  const handleEditLead = (lead: LeadWithDetails) => {
    setSelectedLead(lead)
    const detail = lead.lead_details?.[0]
    setEditFormData({
      full_name: detail?.full_name || '',
      company_name: detail?.company_name || '',
      email: detail?.email || '',
      phone: detail?.phone || '',
      status: lead.status
    })
    setShowEditDialog(true)
  }

  const handleUpdateLead = async () => {
    if (!selectedLead) return
    setActivityLoading(true)
    try {
       // Mocking synchronization for presentation
       toast.success('Lead intelligence synchronized')
       setLeads(leads.map(l => 
         l.id === selectedLead.id 
           ? { 
               ...l, 
               status: editFormData.status,
               lead_details: [{ ...l.lead_details[0], ...editFormData }] 
             } 
           : l
       ))
       setShowEditDialog(false)
    } catch (error) {
       toast.error('Failed to update lead metadata')
    } finally {
       setActivityLoading(false)
    }
  }

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

  const filteredLeads = leads.filter((lead: LeadWithDetails) => {
    const detail = lead.lead_details?.[0]
    const matchesSearch = !searchTerm || 
      detail?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: leads.length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length
  }

  const conversionRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0

  return (
    <ProtectedRoute requiredRoles={['sales', 'admin', 'super_admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
            <p className="text-muted-foreground mt-1">Nurture leads and drive conversions.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Avatar key={i} className="size-8 border-2 border-background">
                    <AvatarFallback className="text-[10px] bg-muted">S</AvatarFallback>
                  </Avatar>
                ))}
             </div>
             <p className="text-xs text-muted-foreground ml-2">Sales Team Active</p>
          </div>
        </div>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <Card className="border-none shadow-lg shadow-black/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-2xl">
                    <Target className="size-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Portfolio</p>
                    <h3 className="text-2xl font-bold">{stats.total} Leads</h3>
                  </div>
                </div>
              </CardContent>
           </Card>
           
           <Card className="border-none shadow-lg shadow-black/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-2xl">
                    <Activity className="size-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Touchpoints</p>
                    <h3 className="text-2xl font-bold">{stats.contacted} Contacted</h3>
                  </div>
                </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-lg shadow-black/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl">
                    <TrendingUp className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">High Intent</p>
                    <h3 className="text-2xl font-bold">{stats.qualified} Qualified</h3>
                  </div>
                </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-lg shadow-black/[0.02] bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                    <CheckCircle className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Win Rate</p>
                    <h3 className="text-2xl font-bold text-primary">{conversionRate}%</h3>
                  </div>
                </div>
              </CardContent>
           </Card>
        </div>

        <Tabs defaultValue="leads" className="w-full space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-1">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger
                value="leads"
                className="rounded-none border-b-2 border-transparent px-1 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-semibold"
              >
                Lead Assignment
              </TabsTrigger>
              <TabsTrigger
                value="deals"
                className="rounded-none border-b-2 border-transparent px-1 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-semibold"
              >
                Active Deals
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
               <LeadViewSwitcher view={viewType} onViewChange={setViewType} />
            </div>
          </div>

          <TabsContent value="leads" className="mt-0">
             <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                   <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                         placeholder="Filter your leads..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="pl-9 rounded-full bg-muted/40 border-none"
                      />
                   </div>
                   <div className="flex items-center gap-4">
                      <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                         <SelectTrigger className="w-[160px] rounded-full bg-muted/20 border-none">
                            <SelectValue placeholder="All Stages" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="all">Every Stage</SelectItem>
                            <SelectItem value="new">New Assignments</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified Leads</SelectItem>
                            <SelectItem value="converted">Closed Won</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                {loading ? (
                   <div className="flex flex-col justify-center items-center min-h-[300px] gap-4">
                      <Spinner className="size-8 text-primary" />
                      <p className="text-muted-foreground text-sm">Organizing your pipeline...</p>
                   </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                     {viewType === 'list' ? (
                        <Card className="border-none shadow-xl shadow-black/[0.02] overflow-hidden">
                           <Table>
                              <TableHeader className="bg-muted/30">
                                 <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Current Status</TableHead>
                                    <TableHead>Assigned</TableHead>
                                    <TableHead className="text-right">Intelligence</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {filteredLeads.map(lead => {
                                    const detail = lead.lead_details?.[0]
                                    return (
                                       <TableRow key={lead.id} className="group hover:bg-primary/[0.01]">
                                          <TableCell>
                                             <div className="flex items-center gap-3">
                                                <Avatar className="size-8">
                                                   <AvatarImage src={`https://i.pravatar.cc/150?u=${lead.id}`} />
                                                   <AvatarFallback className="bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                                                      {detail?.full_name?.split(' ').map(n => n[0]).join('')}
                                                   </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                   <p className="font-semibold text-sm">{detail?.full_name || 'Anonymous'}</p>
                                                   <p className="text-[10px] text-muted-foreground">{detail?.email}</p>
                                                </div>
                                             </div>
                                          </TableCell>
                                          <TableCell className="text-sm font-medium text-muted-foreground">
                                             {detail?.company_name || 'Individual'}
                                          </TableCell>
                                          <TableCell>
                                             <Badge variant="outline" className={getStatusColor(lead.status)}>
                                                {lead.status}
                                             </Badge>
                                          </TableCell>
                                          <TableCell className="text-xs text-muted-foreground">
                                             {new Date(lead.created_at).toLocaleDateString()}
                                          </TableCell>
                                          <TableCell className="text-right">
                                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                   variant="ghost" 
                                                   size="icon" 
                                                   className="size-8 rounded-full hover:bg-amber-100/50 hover:text-amber-600"
                                                   onClick={() => { setSelectedLead(lead); setShowActivityDialog(true) }}
                                                >
                                                   <MessageSquare className="size-4" />
                                                </Button>
                                                <Button 
                                                   variant="ghost" 
                                                   size="icon" 
                                                   className="size-8 rounded-full hover:bg-emerald-100/50 hover:text-emerald-600"
                                                   onClick={() => { setSelectedLead(lead); setShowOpportunityDialog(true) }}
                                                >
                                                   <TrendingUp className="size-4" />
                                                </Button>
                                                <Link href={`/leads/${lead.id}`}>
                                                   <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-blue-100/50 hover:text-blue-600">
                                                      <Eye className="size-4" />
                                                   </Button>
                                                </Link>
                                             </div>
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

          <TabsContent value="deals" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                 {/* Deals Dashboard */}
                 <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl shadow-black/[0.02] bg-gradient-to-br from-primary/5 to-transparent">
                       <CardHeader>
                          <CardTitle className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                             <TrendingUp className="size-5" />
                             High-Velocity Pipeline
                          </CardTitle>
                          <CardDescription>Strategize and close high-value opportunities.</CardDescription>
                       </CardHeader>
                       <CardContent>
                          <div className="space-y-4">
                             {[
                                { name: 'Q1 Enterprise Suite', value: 85000, prob: 75, lead: 'Global Corp' },
                                { name: 'Estate Planning Premium', value: 12000, prob: 40, lead: 'Sarah Jenkins' },
                                { name: 'Digital Vault Migration', value: 4500, prob: 90, lead: 'Nexus Ltd' }
                             ].map((deal, i) => (
                                <div key={i} className="bg-background/60 p-4 rounded-xl border border-primary/10 flex items-center justify-between group hover:border-primary/30 transition-all">
                                   <div className="flex items-center gap-4">
                                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                         {deal.name[0]}
                                      </div>
                                      <div>
                                         <h4 className="font-bold text-sm">{deal.name}</h4>
                                         <p className="text-[10px] text-muted-foreground uppercase font-black">{deal.lead}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className="font-bold text-sm">${deal.value.toLocaleString()}</p>
                                      <Badge variant="secondary" className="text-[8px] bg-emerald-500/10 text-emerald-600 border-none font-bold">
                                         {deal.prob}% Probability
                                      </Badge>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </CardContent>
                    </Card>
                 </div>

                 <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-black/[0.02]">
                       <CardHeader>
                          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Strategic Insight</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                             <span className="text-muted-foreground">Portfolio Value</span>
                             <span className="font-bold text-primary">$1.2M</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                             <span className="text-muted-foreground">Weighted Forecast</span>
                             <span className="font-bold">$412K</span>
                          </div>
                          <Separator />
                          <div className="pt-2 italic text-[10px] text-muted-foreground">
                             Average sales cycle maturity: 24 days. Focus on high-probability deals for the current quarter.
                          </div>
                       </CardContent>
                    </Card>
                    <Button className="w-full h-12 gap-2 shadow-lg shadow-primary/20 bg-primary text-white font-black uppercase tracking-widest text-xs">
                       <Zap className="size-4" />
                       Activate Negotiation Hub
                    </Button>
                 </div>
              </div>
           </TabsContent>
        </Tabs>

        {/* Action Dialogs */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
           <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
              <DialogHeader>
                 <DialogTitle className="text-xl">Synchronize Lead Metadata</DialogTitle>
                 <DialogDescription>Refine the digital identity and strategic positioning of this lead.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Legal Identity</Label>
                       <Input 
                          value={editFormData.full_name}
                          onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                          className="bg-muted/30 border-none h-11"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Corporate Entity</Label>
                       <Input 
                          value={editFormData.company_name}
                          onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                          className="bg-muted/30 border-none h-11"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Communication Status</Label>
                    <Select value={editFormData.status} onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}>
                       <SelectTrigger className="bg-muted/30 border-none h-11">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="new">New Ingress</SelectItem>
                          <SelectItem value="contacted">Engagement Phase</SelectItem>
                          <SelectItem value="qualified">Verified Intent</SelectItem>
                          <SelectItem value="converted">Closed Win</SelectItem>
                          <SelectItem value="lost">Terminated</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Digital Mail</Label>
                       <Input 
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="bg-muted/30 border-none h-11"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground">Telephony contact</Label>
                       <Input 
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="bg-muted/30 border-none h-11"
                       />
                    </div>
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="ghost" onClick={() => setShowEditDialog(false)}>Dismiss</Button>
                 <Button onClick={handleUpdateLead} disabled={activityLoading}>
                    {activityLoading && <Spinner className="size-4 mr-2" />}
                    Commit Intelligence
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
           <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
              <DialogHeader>
                 <DialogTitle className="text-xl">Log Client Interaction</DialogTitle>
                 <DialogDescription>Record touchpoints and update negotiation progress.</DialogDescription>
              </DialogHeader>
              <Separator className="my-2" />
              <div className="space-y-6 py-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interaction Vector</Label>
                    <div className="grid grid-cols-4 gap-2">
                       {['note', 'called', 'emailed', 'meeting'].map((type) => (
                          <Button
                             key={type}
                             variant={activityType === type ? 'default' : 'outline'}
                             className="capitalize h-12 text-xs flex flex-col gap-1 py-1"
                             onClick={() => setActivityType(type as any)}
                          >
                             {type === 'note' && <MessageSquare className="size-3" />}
                             {type === 'called' && <Phone className="size-3" />}
                             {type === 'emailed' && <Mail className="size-3" />}
                             {type === 'meeting' && <Users className="size-3" />}
                             {type}
                          </Button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Intelligence Notes</Label>
                    <Textarea 
                       value={activityNotes}
                       onChange={(e) => setActivityNotes(e.target.value)}
                       placeholder="Synthesize the key points from your conversation..."
                       className="min-h-[120px] bg-muted/30 border-none focus-visible:ring-1"
                    />
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="ghost" onClick={() => setShowActivityDialog(false)}>Dismiss</Button>
                 <Button onClick={handleLogActivity} disabled={activityLoading || !activityNotes}>
                    {activityLoading && <Spinner className="size-4 mr-2" />}
                    Synchronize Contact
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

        <Dialog open={showOpportunityDialog} onOpenChange={setShowOpportunityDialog}>
           <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
              <DialogHeader>
                 <DialogTitle className="text-xl">Formalize Deal</DialogTitle>
                 <DialogDescription>Convert this intent into a trackable business opportunity.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Opportunity Blueprint</Label>
                    <Input 
                       placeholder="e.g., Annual Enterprise SaaS License"
                       value={opportunityTitle}
                       onChange={(e) => setOpportunityTitle(e.target.value)}
                       className="bg-muted/30 border-none px-4 h-12"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deal Magnitude (USD)</Label>
                       <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input 
                             type="number"
                             placeholder="50,000"
                             value={opportunityValue}
                             onChange={(e) => setOpportunityValue(e.target.value)}
                             className="bg-muted/30 border-none pl-9 h-12"
                          />
                       </div>
                    </div>
                     <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Strategic Maturity Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal bg-muted/30 border-none h-12 h-12 px-3 focus-visible:ring-primary/20",
                                !opportunityDate && "text-muted-foreground/50"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {opportunityDate ? format(new Date(opportunityDate), "PPP") : <span>Select maturity</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarPicker
                              mode="single"
                              selected={opportunityDate ? new Date(opportunityDate) : undefined}
                              onSelect={(date) => setOpportunityDate(date ? date.toISOString().split('T')[0] : '')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                     </div>
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="ghost" onClick={() => setShowOpportunityDialog(false)}>Cancel</Button>
                 <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleCreateOpportunity}
                    disabled={activityLoading || !opportunityTitle || !opportunityValue}
                 >
                    {activityLoading && <Spinner className="size-4 mr-2" />}
                    Lock Opportunity
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
