'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Eye, Mail, Phone, Building2, Calendar } from 'lucide-react'
import Link from 'next/link'

interface LeadCardProps {
  lead: {
    id: string
    status: string
    created_at: string
    lead_details: {
      full_name: string
      email: string
      phone: string
      company_name: string
    }[]
  }
}

export function LeadCard({ lead }: LeadCardProps) {
  const detail = lead.lead_details?.[0]
  
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

  return (
    <Card className="group overflow-hidden border-border/50 bg-card/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <Avatar className="size-10 border-2 border-background shadow-sm">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${lead.id}`} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {detail?.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
            </AvatarFallback>
          </Avatar>
          <Badge variant="outline" className={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {detail?.full_name || 'Anonymous'}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Building2 className="size-3 mr-1" />
            {detail?.company_name || 'Independent'}
          </div>
        </div>
        
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="size-3.5 mr-2" />
            <span className="truncate">{detail?.email || 'No email'}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="size-3.5 mr-2" />
            <span>{detail?.phone || 'No phone'}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground border-t pt-2 mt-2">
            <Calendar className="size-3.5 mr-2" />
            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Link href={`/leads/${lead.id}`} className="w-full">
          <Button variant="secondary" size="sm" className="w-full gap-2 bg-muted/50 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <Eye className="size-4" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
