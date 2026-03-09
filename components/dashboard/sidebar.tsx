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
  Terminal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Learning Path', href: '/dashboard/learning', icon: Compass },
  { name: 'Code Review', href: '/dashboard/code-review', icon: Code },
  { name: 'Concepts', href: '/dashboard/concepts', icon: Brain },
  { name: 'Productivity', href: '/dashboard/tools/productivity', icon: CheckCircle },
  { name: 'Doc Gen', href: '/dashboard/tools/docs', icon: FileText },
  { name: 'GitHub', href: '/dashboard/github', icon: Github },
  { name: 'Analytics', href: '/dashboard/analytics/performance', icon: Activity },
  { name: 'Anomalies', href: '/dashboard/analytics/anomalies', icon: AlertTriangle },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: Users },
  { name: 'Research', href: '/dashboard/research', icon: Telescope },
  { name: 'Studio', href: '/dashboard/media/studio', icon: Clapperboard },
  { name: 'Last Minute', href: '/dashboard/last-minute', icon: Zap },
  { name: 'Training', href: '/dashboard/specialized', icon: GraduationCap },
  { name: 'DevOps Studio', href: '/dashboard/devops-studio', icon: Server },
  { name: 'Terminal Hub', href: '/dashboard/tools/cli', icon: Terminal },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
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
          "bg-card border-r flex flex-col transition-all duration-300 ease-in-out relative",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Logo */}
        <div className={cn(
          "p-6 flex items-center transition-all duration-300",
          isCollapsed ? "justify-center" : "space-x-2"
        )}>
          <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="Ganapathi AI Logo" className="w-10 h-10 object-contain" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg whitespace-nowrap overflow-hidden tracking-tight text-primary">
              Ganapathi AI
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/')

            const NavButton = (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full transition-all duration-200",
                  isCollapsed ? "justify-center px-2" : "justify-start px-3",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20 shadow-[0_0_12px_rgba(124,58,237,0.3)] border border-primary/30"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    !isCollapsed && "mr-2"
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
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return NavButton
          })}
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="p-4 border-t text-xs text-muted-foreground text-center">
            <p>Ganapathi Mentor AI</p>
            <p className="opacity-60">v1.0.0</p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
