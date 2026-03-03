'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, User, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!fullName) {
          toast.error('Please enter your full name')
          setLoading(false)
          return
        }

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, full_name: fullName })
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Sign up failed')
        }

        toast.success('Sign up successful! You can now sign in.')
        setEmail('')
        setPassword('')
        setFullName('')
        setMode('login')
      } else {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Sign in failed')
        }

        toast.success('Logged in successfully!')
        window.dispatchEvent(new Event('auth-update'))
        setTimeout(() => router.push('/dashboard'), 300)
      }
    } catch (error: unknown) {
      console.error('Auth error:', error)
      toast.error(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background overflow-hidden">
      
      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary dark:bg-primary/20 relative overflow-hidden">
         {/* Background Ornaments */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
         
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-12">
               <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-2xl shadow-black/20">
                  <span className="text-primary font-black text-xl">T</span>
               </div>
               <span className="text-white text-2xl font-black tracking-tighter">TrueLegacy</span>
            </div>
            
            <div className="space-y-6 max-w-md">
               <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
                  Orchestrate your <span className="underline decoration-white/30">sales universe</span> with precision.
               </h2>
               <p className="text-white/70 text-lg leading-relaxed font-medium">
                  The most sophisticated lead management ecosystem designed for agents who demand excellence.
               </p>
            </div>
         </div>

         <div className="relative z-10 grid grid-cols-2 gap-8 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="size-4" />
                  99.9% Uptime
               </div>
               <p className="text-white/50 text-xs">Enterprise reliability protocols.</p>
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-white font-bold">
                  <Zap className="size-4" />
                  Instant Sync
               </div>
               <p className="text-white/50 text-xs">Real-time lead distribution.</p>
            </div>
         </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
               <span className="text-primary-foreground font-black text-sm">T</span>
            </div>
            <span className="font-black tracking-tight">TrueLegacy</span>
        </div>

        <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
               <Sparkles className="size-3" />
               Security Gateway
            </div>
            <h1 className="text-4xl font-black tracking-tight">
               {mode === 'login' ? 'Authentical Ingress' : 'Identity Genesis'}
            </h1>
            <p className="text-muted-foreground font-medium">
               {mode === 'login' 
                 ? 'Re-establish your connection to the command center.'
                 : 'Register your unique identity with the TrueLegacy ecosystem.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-2 group">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Full Identity Name</Label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                   <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Alexander Hamilton"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-muted/30 border-none pl-10 h-12 focus-visible:ring-primary/20 font-medium"
                      required
                   />
                </div>
              </div>
            )}

            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Digital Correspondence</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@truegacy.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/30 border-none pl-10 h-12 focus-visible:ring-primary/20 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Access Protocol</Label>
                {mode === 'login' && (
                  <Link href="#" className="text-xs font-bold text-primary hover:underline">Lost access?</Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/30 border-none pl-10 h-12 focus-visible:ring-primary/20 font-medium"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 gap-2 text-md font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
            >
              {loading ? <Spinner className="size-4" /> : <ArrowRight className="size-4" />}
              {mode === 'login' ? 'Confirm Identity' : 'Commence Initialization'}
            </Button>
          </form>

          <Separator className="bg-muted/50" />

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
               {mode === 'login' ? "Doesn't possess an identity?" : 'Already registered within the system?'}
            </p>
            <Button
               type="button"
               variant="outline"
               className="w-full h-12 border-muted-foreground/20 hover:bg-muted/50 font-bold"
               onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
               disabled={loading}
            >
               {mode === 'login' ? 'Construct New Profile' : 'Access Existing Gateway'}
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest leading-relaxed">
            Adherence to security protocols is mandatory. By engaging, you consent to our <Link href="#" className="underline font-bold">Terms of Alignment</Link> and <Link href="#" className="underline font-bold">Data Sovereignty</Link> policies.
          </p>
        </div>
      </div>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />
}
