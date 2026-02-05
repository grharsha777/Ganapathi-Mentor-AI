'use client'

import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@supabase/supabase-js'
import { LogOut, Settings } from 'lucide-react'

export function DashboardNav({ user }: { user: User }) {
  return (
    <nav className="border-b bg-card px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-semibold">Analytics</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="rounded-full">
            {user.email}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await signOut()
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
