'use client'

import React from 'react'
import { useAuth } from './context'
import { UserRole } from './roles'
import { Spinner } from '@/components/ui/spinner'
import { ShieldAlert, LogIn, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallback
}) => {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="relative">
           <Spinner className="size-12 text-primary/40" />
           <Sparkles className="absolute -top-1 -right-1 size-4 text-primary animate-pulse" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Authenticating...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
           <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10">
              <LogIn className="size-10 text-primary" />
           </div>
           <div>
              <h1 className="text-3xl font-bold tracking-tight">Identity Required</h1>
              <p className="text-muted-foreground mt-2">Please authenticate to access the secure command center.</p>
           </div>
           <Link href="/auth" className="block pt-4">
              <Button className="w-full h-12 gap-2 shadow-xl shadow-primary/20">
                 Go to Login Gateway
              </Button>
           </Link>
        </div>
      </div>
    )
  }

  if (requiredRoles && role && !requiredRoles.includes(role)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
           <div className="size-20 bg-rose-500/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/10">
              <ShieldAlert className="size-10 text-rose-500" />
           </div>
           <div>
              <h1 className="text-3xl font-bold tracking-tight">Insufficient Clearance</h1>
              <p className="text-muted-foreground mt-2">Your current profile does not possess the required protocols to access this module.</p>
           </div>
           <Link href="/dashboard" className="block pt-4">
              <Button variant="outline" className="w-full h-12 border-muted-foreground/20">
                 Return to Safe Zone
              </Button>
           </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
