'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { LeadForm } from './lead-form'
import { UserPlus, Sparkles } from 'lucide-react'

export function CreateLeadSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <UserPlus className="size-4" />
          Capture New Lead
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-4xl overflow-y-auto border-l-0 p-0 bg-background/95 backdrop-blur-xl">
        <div className="h-full flex flex-col">
          <div className="pt-12 pb-8 px-8 bg-primary/5 border-b border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <UserPlus className="size-48 -rotate-12 translate-x-12 -translate-y-12" />
            </div>
            <div className="relative z-10 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 mb-2">
                 <div className="bg-primary/20 p-2 rounded-lg shadow-sm">
                    <Sparkles className="size-4 text-primary" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Hub</span>
              </div>
              <SheetTitle className="text-4xl font-black tracking-tight text-foreground">Lead Capture</SheetTitle>
              <SheetDescription className="text-muted-foreground font-medium leading-relaxed max-w-sm mt-2">
                Initiate the ingestion protocol to securely archive new legal identities into the ecosystem.
              </SheetDescription>
            </div>
          </div>
          
          <div className="flex-1 p-8">
            <LeadForm />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
