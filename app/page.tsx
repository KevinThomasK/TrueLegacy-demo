'use client'

import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BarChart3, Users, Zap, Shield, LogIn } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Navigation */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TG</span>
            </div>
            <span className="font-bold text-lg">TrueLegacy</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to App
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 text-sm font-medium">
            Professional Lead Management System
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Manage Leads Like a Pro
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            TrueLegacy's comprehensive lead management platform helps agents capture leads, manage assignments, and track conversions with powerful analytics and automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t">
            <div>
              <div className="text-3xl font-bold mb-2">10K+</div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500K+</div>
              <p className="text-muted-foreground">Leads Managed</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">98%</div>
              <p className="text-muted-foreground">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lead Management</h3>
            <p className="text-muted-foreground">
              Easily capture, organize, and track leads with comprehensive details including family information and documents.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Auto-Assignment</h3>
            <p className="text-muted-foreground">
              Automatically distribute leads to your sales team using round-robin assignment for fair and equal distribution.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Track conversion rates, source performance, and team metrics with detailed analytics and reporting.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
            <p className="text-muted-foreground">
              Manage different permission levels for agents, sales teams, and administrators with granular access control.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Activity Tracking</h3>
            <p className="text-muted-foreground">
              Log all interactions - calls, emails, meetings, and notes - with full history and timestamp tracking.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Opportunity Tracking</h3>
            <p className="text-muted-foreground">
              Track deal values, conversion stages, and close probability for better sales forecasting.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of teams using TrueLegacy to manage leads more effectively and close more deals.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TG</span>
              </div>
              <span className="font-bold">TrueLegacy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 TrueLegacy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
