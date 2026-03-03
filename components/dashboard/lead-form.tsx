'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { createLead } from '@/lib/services/leads'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Mail, Phone, Building2, MapPin, Users, FileText, User, Briefcase, Globe, Info, Save, RotateCcw, Calendar as CalendarIcon, Paperclip } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export const LeadForm: React.FC = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
    company_name: '',
    industry: '',
    company_size: '',
    lead_source: 'direct',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    marital_status: '',
    date_of_birth: '',
    religion: '',
    spouse_name: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    children_count: 0,
    siblings_count: 0,
    country_code: '+1'
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleReset = () => {
    setErrors({})
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      notes: '',
      company_name: '',
      industry: '',
      company_size: '',
      lead_source: 'direct',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      marital_status: '',
      date_of_birth: '',
      religion: '',
      spouse_name: '',
      next_of_kin_name: '',
      next_of_kin_phone: '',
      children_count: 0,
      siblings_count: 0,
      country_code: '+1'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile) {
      toast.error('Please sign in to create a lead')
      return
    }

    const validationErrors: Record<string, string> = {}
    if (!formData.full_name) validationErrors.full_name = 'Legal identity is required'
    if (!formData.email) validationErrors.email = 'Digital mail is required'
    if (!formData.phone) validationErrors.phone = 'Telephony contact is required'

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Validation protocol failed: Missing required fields')
      return
    }

    setLoading(true)
    try {
      await createLead(user.id, formData)
      toast.success('Lead captured successfully!')
      handleReset()
    } catch (error) {
      console.error('Error creating lead:', error)
      toast.error('Failed to create lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full mx-auto pb-4">
      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-8">
          
          {/* Section 1: Personal Details */}
          <Card className="border-none shadow-xl shadow-black/[0.03] overflow-hidden">
             <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center gap-2">
               <User className="size-4 text-primary" />
               <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Personal Details</h3>
             </div>
             <CardContent className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-xs font-bold text-muted-foreground uppercase">Full Name *</Label>
                    <Input
                      id="full_name"
                      placeholder="e.g. Alexander Hamilton"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      className={`bg-muted/30 border-none h-11 focus-visible:ring-primary/20 ${errors.full_name ? 'ring-2 ring-destructive/50' : ''}`}
                    />
                    {errors.full_name && <p className="text-[10px] font-bold text-destructive uppercase mt-1 animate-in fade-in slide-in-from-top-1">{errors.full_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_source" className="text-xs font-bold text-muted-foreground uppercase">Lead Source</Label>
                    <Select value={formData.lead_source} onValueChange={(value) => handleChange('lead_source', value)}>
                      <SelectTrigger className="bg-muted/30 border-none h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct Organic</SelectItem>
                        <SelectItem value="referral">Referral Program</SelectItem>
                        <SelectItem value="advertisement">Paid Campaigns</SelectItem>
                        <SelectItem value="website">Platform Website</SelectItem>
                        <SelectItem value="social_media">Social Ecosystem</SelectItem>
                        <SelectItem value="other">Fragmented Sources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase">Email Address *</Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 z-10" />
                         <Input
                           id="email"
                           type="email"
                           placeholder="alex@nexus.com"
                           value={formData.email}
                           onChange={(e) => handleChange('email', e.target.value)}
                           className={`bg-muted/30 border-none pl-10 h-11 focus-visible:ring-primary/20 ${errors.email ? 'ring-2 ring-destructive/50' : ''}`}
                         />
                      </div>
                      {errors.email && <p className="text-[10px] font-bold text-destructive uppercase mt-1 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-xs font-bold text-muted-foreground uppercase">Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            type="button"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-muted/30 border-none h-11 h-11 px-3 focus-visible:ring-primary/20",
                              !formData.date_of_birth && "text-muted-foreground/50"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date_of_birth ? format(new Date(formData.date_of_birth), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                            onSelect={(date) => handleChange('date_of_birth', date ? date.toISOString().split('T')[0] : '')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase">Telephony Contact *</Label>
                      <div className="phone-input-container">
                        <PhoneInput
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={(v) => handleChange('phone', v || '')}
                          defaultCountry="US"
                          className={cn(
                            "flex h-11 w-full rounded-md bg-muted/30 border-none px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            errors.phone && "ring-2 ring-destructive/50"
                          )}
                        />
                      </div>
                      {errors.phone && <p className="text-[10px] font-bold text-destructive uppercase mt-1 animate-in fade-in slide-in-from-top-1">{errors.phone}</p>}
                   </div>
               </div>
             </CardContent>
          </Card>

          {/* Section 2: Company Info */}
          <Card className="border-none shadow-xl shadow-black/[0.03] overflow-hidden">
             <div className="bg-amber-500/5 px-6 py-4 border-b border-amber-500/10 flex items-center gap-2">
               <Briefcase className="size-4 text-amber-600" />
               <h3 className="font-bold text-sm uppercase tracking-wider text-amber-600">Company Information</h3>
             </div>
             <CardContent className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label htmlFor="company_name" className="text-xs font-bold text-muted-foreground uppercase">Company Name</Label>
                   <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 z-10" />
                      <Input
                        id="company_name"
                        placeholder="Acme Global Inc"
                        value={formData.company_name}
                        onChange={(e) => handleChange('company_name', e.target.value)}
                        className="bg-muted/30 border-none pl-10 h-11"
                      />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="industry" className="text-xs font-bold text-muted-foreground uppercase">Industry</Label>
                   <Input
                     id="industry"
                     placeholder="e.g. Quantum Computing"
                     value={formData.industry}
                     onChange={(e) => handleChange('industry', e.target.value)}
                     className="bg-muted/30 border-none h-11"
                   />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                   <Label htmlFor="company_size" className="text-xs font-bold text-muted-foreground uppercase">Company Size</Label>
                   <Select value={formData.company_size} onValueChange={(value) => handleChange('company_size', value)}>
                      <SelectTrigger className="bg-muted/30 border-none h-11 text-xs">
                        <SelectValue placeholder="Select Scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">Agile (1-10)</SelectItem>
                        <SelectItem value="11-50">Expanding (11-50)</SelectItem>
                        <SelectItem value="51-200">Established (51-200)</SelectItem>
                        <SelectItem value="201-500">Scalable (201-500)</SelectItem>
                        <SelectItem value="500+">Enterprise (500+)</SelectItem>
                      </SelectContent>
                   </Select>
                 </div>
               </div>
             </CardContent>
          </Card>

          {/* Section 3: Address Info */}
          <Card className="border-none shadow-xl shadow-black/[0.03] overflow-hidden">
             <div className="bg-emerald-500/5 px-6 py-4 border-b border-emerald-500/10 flex items-center gap-2">
               <Globe className="size-4 text-emerald-600" />
               <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-600">Geospatial Intelligence</h3>
             </div>
             <CardContent className="p-6 space-y-4">
               <div className="space-y-2">
                 <Label className="text-[10px] font-bold text-muted-foreground uppercase">Street Address</Label>
                 <Input 
                    placeholder="Physical location..." 
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="bg-muted/30 border-none text-xs"
                 />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">City</Label>
                    <Input placeholder="City" className="bg-muted/30 border-none text-xs" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">State / Territory</Label>
                    <Input placeholder="State" className="bg-muted/30 border-none text-xs" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Postal Vector</Label>
                    <Input placeholder="Zip" className="bg-muted/30 border-none text-xs" value={formData.postal_code} onChange={(e) => handleChange('postal_code', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Country</Label>
                    <Input placeholder="Country" className="bg-muted/30 border-none text-xs" value={formData.country} onChange={(e) => handleChange('country', e.target.value)} />
                  </div>
               </div>
             </CardContent>
          </Card>

          {/* Section 4: Family & Next of Kin */}
          <Card className="border-none shadow-xl shadow-black/[0.03] overflow-hidden">
             <div className="bg-violet-500/5 px-6 py-4 border-b border-violet-500/10 flex items-center gap-2">
               <Users className="size-4 text-violet-600" />
               <h3 className="font-bold text-sm uppercase tracking-wider text-violet-600">Estate & Lineage</h3>
             </div>
             <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Marital Status</Label>
                    <Select value={formData.marital_status} onValueChange={(v) => handleChange('marital_status', v)}>
                      <SelectTrigger className="bg-muted/30 border-none h-9 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Religion/Comm.</Label>
                    <Input placeholder="e.g. Christian" value={formData.religion} onChange={(e) => handleChange('religion', e.target.value)} className="bg-muted/30 border-none h-9 text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground">Spouse Legal Entity</Label>
                  <Input placeholder="Full Legal Name" value={formData.spouse_name} onChange={(e) => handleChange('spouse_name', e.target.value)} className="bg-muted/30 border-none h-9 text-xs" />
                </div>

                <Separator className="bg-violet-100" />

                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase text-violet-600 tracking-[0.2em]">Legacy Beneficiary Contact</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Contact Name" value={formData.next_of_kin_name} onChange={(e) => handleChange('next_of_kin_name', e.target.value)} className="bg-muted/30 border-none h-11 text-xs" />
                      <Input placeholder="Contact Phone" value={formData.next_of_kin_phone} onChange={(e) => handleChange('next_of_kin_phone', e.target.value)} className="bg-muted/30 border-none h-11 text-xs" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                   <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground">Children Magnitude</Label>
                      <Input type="number" min="0" value={formData.children_count} onChange={(e) => handleChange('children_count', parseInt(e.target.value))} className="bg-muted/30 border-none h-11 text-xs" />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground">Siblings Magnitude</Label>
                      <Input type="number" min="0" value={formData.siblings_count} onChange={(e) => handleChange('siblings_count', parseInt(e.target.value))} className="bg-muted/30 border-none h-11 text-xs" />
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Section 5: Additional Notes */}
          <Card className="border-none shadow-xl shadow-black/[0.03] overflow-hidden">
             <div className="bg-indigo-500/5 px-6 py-4 border-b border-indigo-500/10 flex items-center gap-2">
               <FileText className="size-4 text-indigo-600" />
               <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-600">Intelligence Synthesis</h3>
             </div>
             <CardContent className="p-6">
                <Textarea
                  id="notes"
                  placeholder="Capture nuances, intent signals, and specific requirements..."
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="min-h-[150px] bg-muted/30 border-none focus-visible:ring-indigo-500/20"
                />
             </CardContent>
          </Card>

          {/* Section 6: Supporting Documents (UI only) */}
          <Card className="border-none shadow-xl shadow-black/[0.03] overflow-hidden">
             <div className="bg-slate-500/5 px-6 py-4 border-b border-slate-500/10 flex items-center gap-2">
               <Paperclip className="size-4 text-slate-600" />
               <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">Supporting Documents</h3>
             </div>
             <CardContent className="p-6">
               <div className="space-y-2">
                 <Label htmlFor="supporting_documents" className="text-xs font-bold text-muted-foreground uppercase">
                   Upload Documents
                 </Label>
                 <Input
                   id="supporting_documents"
                   type="file"
                   multiple
                   className="bg-muted/30 border-none h-11 cursor-pointer text-xs"
                 />
                 <p className="text-[11px] text-muted-foreground">
                   Attach identity proofs, contracts, or any relevant files. This is a visual-only field; documents are not yet stored.
                 </p>
               </div>
             </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-8">
             <Button 
               type="submit" 
               disabled={loading}
               className="flex-1 h-14 gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
             >
               {loading ? <Spinner className="size-4" /> : <Save className="size-4" />}
               Finalized Registration
             </Button>
             <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                className="h-14 gap-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 px-8 text-xs font-bold uppercase tracking-widest"
             >
               <RotateCcw className="size-4" />
               Reset
             </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
