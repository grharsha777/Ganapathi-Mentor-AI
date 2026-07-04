'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Settings,
  Users,
  Zap,
  LayoutDashboard,
  Compass,
  Code,
  Brain,
  CheckCircle,
  FileText,
  Activity,
  GraduationCap,
  AlertTriangle,
  Github,
  ChevronLeft,
  ChevronRight,
  Telescope,
  Clapperboard,
  Server,
  Terminal,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { signOut } from '@/app/auth/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Learning Path', href: '/dashboard/learning', icon: Compass },
  { name: 'Code Review', href: '/dashboard/code-review', icon: Code },
  { name: 'Concepts', href: '/dashboard/concepts', icon: Brain },
  { name: 'Productivity', href: '/dashboard/tools/productivity', icon: CheckCircle },
  { name: 'Doc Gen', href: '/dashboard/tools/docs', icon: FileText },
  { name: 'GitHub', href: '/dashboard/github', icon: Github },

  { name: 'Research', href: '/dashboard/research', icon: Telescope },
  { name: 'Studio', href: '/dashboard/media/studio', icon: Clapperboard },
  { name: 'Last Minute', href: '/dashboard/last-minute', icon: Zap },
  { name: 'Training', href: '/dashboard/specialized', icon: GraduationCap },
  { name: 'DevOps Studio', href: '/dashboard/devops-studio', icon: Server },
  { name: 'Terminal Hub', href: '/dashboard/tools/cli', icon: Terminal },
  { name: 'Hive Mind', href: '/dashboard/tools/hive-mind', icon: Activity },
]

export function DashboardSidebar({ user }: { user?: { email?: string; full_name?: string } }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      const isTrue = saved === 'true';
      setTimeout(() => setIsCollapsed(isTrue), 0);
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-card border-r flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0 z-50",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Logo */}
        <div className={cn(
          "p-4 flex items-center transition-all duration-300 h-16 border-b border-border/50",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-8 w-8 flex items-center justify-center flex-shrink-0 rounded-md overflow-hidden bg-white/5 border border-white/10">
            <img src="/logo.png" alt="Ganapathi AI Logo" className="w-6 h-6 object-contain" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg whitespace-nowrap overflow-hidden tracking-tight text-white/90">
              Ganapathi AI
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3 flex-1 overflow-y-auto w-full custom-scrollbar">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/')

            const NavButton = (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full transition-all duration-200 group h-10",
                  isCollapsed ? "justify-center px-0" : "justify-start px-3",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15 font-medium shadow-[inset_2px_0_0_0_rgba(124,58,237,1)]"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn(
                    "h-[18px] w-[18px] flex-shrink-0",
                    !isCollapsed && "mr-3",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              </Button>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {NavButton}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium bg-popover text-popover-foreground border-border/50 shadow-xl">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return NavButton
          })}
        </nav>

        {/* Bottom Section - User Profile / Settings */}
        <div className="p-3 border-t border-border/50">
          <div className="space-y-1">
            {/* Settings Link */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="w-full justify-center px-0 h-10 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="h-[18px] w-[18px]" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" className="w-full justify-start px-3 h-10 text-muted-foreground hover:text-foreground" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-[18px] w-[18px] mr-3" />
                  <span>Settings</span>
                </Link>
              </Button>
            )}

            {/* Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn(
                    "w-full h-12 mt-1 hover:bg-white/5",
                    isCollapsed ? "justify-center px-0" : "justify-start px-2"
                  )}>
                    <div className="flex items-center w-full min-w-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-medium text-xs">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {!isCollapsed && (
                        <div className="ml-3 flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.full_name || 'My Account'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isCollapsed ? "end" : "center"} side={isCollapsed ? "right" : "top"} className="w-56 mb-2 ml-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut() }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
