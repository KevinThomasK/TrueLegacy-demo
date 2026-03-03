'use client'

import { LayoutGrid, List, Kanban } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ViewType = 'list' | 'grid' | 'kanban'

interface LeadViewSwitcherProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
}

export function LeadViewSwitcher({ view, onViewChange }: LeadViewSwitcherProps) {
  return (
    <Tabs value={view} onValueChange={(v) => onViewChange(v as ViewType)}>
      <TabsList className="grid w-[300px] grid-cols-3 bg-muted/50 p-1">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="size-4" />
          <span>Table</span>
        </TabsTrigger>
        <TabsTrigger value="grid" className="flex items-center gap-2">
          <LayoutGrid className="size-4" />
          <span>Cards</span>
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <Kanban className="size-4" />
          <span>Pipeline</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
