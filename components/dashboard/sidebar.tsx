'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Settings,
  Users,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Alerts',
    href: '/dashboard/alerts',
    icon: Bell,
  },
  {
    label: 'Team Management',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Analytics Pro</span>
        </div>
      </div>

      <nav className="space-y-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
