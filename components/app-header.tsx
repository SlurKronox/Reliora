'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreditBadge } from '@/components/credit-badge'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

interface AppHeaderProps {
  user: {
    name?: string | null
    email: string
  }
  workspace: {
    name: string
  }
}

export function AppHeader({ user, workspace }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0F172A]">{workspace.name}</h2>
      </div>
      <div className="flex items-center gap-4">
        <CreditBadge />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14B8A6]/10 text-[#14B8A6]">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/' })}
            className="cursor-pointer text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  )
}
