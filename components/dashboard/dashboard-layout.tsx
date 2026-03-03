'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  Bell,
  LogOut,
  Search,
  ChevronRight,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  Calendar,
  UserPlus,
  FileText,
  MessageSquare,
  DollarSign,
  Shield,
  ChevronDown,
} from 'lucide-react'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/context'
import { AppSidebar } from './app-sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Dummy notification data
const DUMMY_NOTIFICATIONS = {
  unread: [
    {
      id: '1',
      type: 'lead',
      title: 'New Lead Assigned',
      description: 'Sarah Johnson has been assigned to you',
      timestamp: '5 minutes ago',
      icon: UserPlus,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      actionable: true,
      actionLabel: 'View Lead',
      actionLink: '/agent/leads/sarah-johnson',
    },
    {
      id: '2',
      type: 'task',
      title: 'Follow-up Required',
      description: 'Follow up with Michael Chen regarding estate planning',
      timestamp: '1 hour ago',
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      actionable: true,
      actionLabel: 'Schedule',
      actionLink: '/agent/tasks',
    },
    {
      id: '3',
      type: 'document',
      title: 'Document Signed',
      description: 'Robert Miller signed the legacy agreement',
      timestamp: '2 hours ago',
      icon: FileText,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      actionable: true,
      actionLabel: 'Review',
      actionLink: '/agent/documents',
    },
    {
      id: '4',
      type: 'meeting',
      title: 'Meeting Reminder',
      description: 'Virtual consultation with Patricia Garcia in 30 minutes',
      timestamp: '30 minutes ago',
      icon: Calendar,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      actionable: true,
      actionLabel: 'Join',
      actionLink: '/agent/meetings',
    },
    {
      id: '5',
      type: 'alert',
      title: 'Profile Verification Needed',
      description: 'Additional documents required for James Wilson',
      timestamp: '3 hours ago',
      icon: AlertCircle,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      actionable: true,
      actionLabel: 'Verify',
      actionLink: '/agent/verification',
    },
  ],
  read: [
    {
      id: '6',
      type: 'system',
      title: 'System Update',
      description: 'New features available in the legacy planner',
      timestamp: 'Yesterday',
      icon: Info,
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
      read: true,
    },
    {
      id: '7',
      type: 'success',
      title: 'Lead Converted',
      description: 'Emily Davis has been converted to client',
      timestamp: 'Yesterday',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      read: true,
    },
    {
      id: '8',
      type: 'deal',
      title: 'Deal Closed',
      description: '$2.5M legacy plan finalized for Thompson family',
      timestamp: '2 days ago',
      icon: DollarSign,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      read: true,
    },
    {
      id: '9',
      type: 'message',
      title: 'New Message',
      description: 'Maria Rodriguez sent a question about trust funds',
      timestamp: '2 days ago',
      icon: MessageSquare,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      read: true,
    },
    {
      id: '10',
      type: 'security',
      title: 'Security Alert',
      description: 'New login detected from San Francisco, CA',
      timestamp: '3 days ago',
      icon: Shield,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      read: true,
    },
  ],
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const [notifications, setNotifications] = React.useState(DUMMY_NOTIFICATIONS)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('unread')

  const unreadCount = notifications.unread.length

  const handleMarkAsRead = (id: string) => {
    // Move notification from unread to read
    const notification = notifications.unread.find(n => n.id === id)
    if (notification) {
      setNotifications(prev => ({
        unread: prev.unread.filter(n => n.id !== id),
        read: [{ ...notification, read: true }, ...prev.read],
      }))
    }
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => ({
      unread: [],
      read: [...prev.unread.map(n => ({ ...n, read: true })), ...prev.read],
    }))
  }

  const handleDismiss = (id: string, fromUnread: boolean) => {
    if (fromUnread) {
      setNotifications(prev => ({
        ...prev,
        unread: prev.unread.filter(n => n.id !== id),
      }))
    } else {
      setNotifications(prev => ({
        ...prev,
        read: prev.read.filter(n => n.id !== id),
      }))
    }
  }

  const getPageTitle = () => {
    switch (pathname) {
      case '/admin': return 'Admin Dashboard'
      case '/agent': return 'Agent Portal'
      case '/sales': return 'Sales Pipeline'
      case '/analytics': return 'Performance Analytics'
      default: return 'Dashboard'
    }
  }

  const NotificationItem = ({ notification, fromUnread = false }: { notification: any; fromUnread?: boolean }) => {
    const Icon = notification.icon

    return (
      <div className={cn(
        "relative flex gap-4 p-4 transition-colors hover:bg-muted/50 group",
        !notification.read && "bg-primary/5"
      )}>
        {/* Icon */}
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          notification.bgColor
        )}>
          <Icon className={cn("h-5 w-5", notification.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold leading-none">
              {notification.title}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              {notification.timestamp}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {notification.description}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {notification.actionable && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                {notification.actionLabel}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            )}
            
            {/* Mark as read / dismiss buttons */}
            <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {fromUnread && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => handleDismiss(notification.id, fromUnread)}
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
        )}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/60 px-4 backdrop-blur-md md:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex h-12 items-center gap-2 border-l pl-4 md:gap-4">
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">TrueLegacy</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="size-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="ml-auto flex items-center gap-4 md:gap-6">
              <form className="relative hidden lg:flex">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search leads..."
                  className="w-64 rounded-full bg-muted/50 pl-8 focus-visible:bg-background"
                />
              </form>
              
              {/* Notifications Bell with Sheet */}
              <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-muted/30">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      </>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg p-0">
                  <SheetHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-lg">Notifications</SheetTitle>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="text-xs h-8"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </SheetHeader>

                  <Tabs defaultValue="unread" className="w-full" onValueChange={setActiveTab}>
                    <div className="px-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="unread" className="relative">
                          Unread
                          {unreadCount > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                      </TabsList>
                    </div>

                    <Separator className="my-2" />

                    <ScrollArea className="h-[calc(100vh-12rem)]">
                      <TabsContent value="unread" className="m-0">
                        {notifications.unread.length > 0 ? (
                          <div className="divide-y">
                            {notifications.unread.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                fromUnread
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">All caught up!</h3>
                            <p className="text-xs text-muted-foreground">
                              No unread notifications at the moment.
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="all" className="m-0">
                        {[...notifications.unread, ...notifications.read].length > 0 ? (
                          <div className="divide-y">
                            {/* Unread section in All tab */}
                            {notifications.unread.length > 0 && (
                              <>
                                <div className="px-4 py-2 bg-muted/30">
                                  <p className="text-xs font-semibold text-muted-foreground">NEW</p>
                                </div>
                                {notifications.unread.map((notification) => (
                                  <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    fromUnread
                                  />
                                ))}
                              </>
                            )}
                            
                            {/* Read section in All tab */}
                            {notifications.read.length > 0 && (
                              <>
                                {notifications.unread.length > 0 && (
                                  <div className="px-4 py-2 bg-muted/30 border-t">
                                    <p className="text-xs font-semibold text-muted-foreground">EARLIER</p>
                                  </div>
                                )}
                                {notifications.read.map((notification) => (
                                  <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    fromUnread={false}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <p className="text-sm text-muted-foreground">No notifications yet.</p>
                          </div>
                        )}
                      </TabsContent>
                    </ScrollArea>

                    {/* Footer with settings link */}
                    <div className="border-t p-4">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                        <Shield className="mr-2 h-4 w-4" />
                        Notification settings
                      </Button>
                    </div>
                  </Tabs>
                </SheetContent>
              </Sheet>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/10 transition-transform hover:scale-110">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${profile?.id || 'default'}`} alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {profile?.full_name?.split(' ').map((n) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || 'John Doe'}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {profile?.role?.replace('_', ' ') || 'Agent'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="mx-auto w-full max-w-7xl">
                {children}
             </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}