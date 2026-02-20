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
import { LogOut, Settings } from 'lucide-react'

export function DashboardNav({ user }: { user: { email?: string; full_name?: string } }) {
  return (
    <nav className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full px-3 sm:px-5 md:px-8 py-3 sm:py-4 md:py-5 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full overflow-hidden border border-white/10 shadow-lg shadow-primary/20 flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-bold text-sm sm:text-lg md:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-sm truncate">
            Ganapathi Mentor AI
          </h1>
        </div>
        <div className="flex items-center flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full px-2 sm:px-4 py-2 sm:py-3 md:py-6 text-xs sm:text-sm md:text-lg hover:bg-white/5 transition-colors max-w-[150px] sm:max-w-none">
                <span className="font-medium text-foreground/90 truncate">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
        </div>
      </div>
    </nav>
  )
}
