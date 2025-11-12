import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-[#14B8A6]" />
          <span className="text-xl font-bold text-[#0F172A]">Reliora</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
            <Link href="/signup">Começar meu teste gratuito</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
