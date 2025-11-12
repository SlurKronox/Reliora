'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, LayoutDashboard, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Overview', href: '/app', icon: LayoutDashboard },
  { name: 'Clients', href: '/app/clients', icon: Users },
  { name: 'Account', href: '/app/account', icon: User },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/app" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-[#14B8A6]" />
          <span className="text-xl font-bold text-[#0F172A]">Reliora</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#14B8A6]/10 text-[#14B8A6]'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
