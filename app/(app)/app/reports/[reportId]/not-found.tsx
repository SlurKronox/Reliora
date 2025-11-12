import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReportNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FileText className="h-10 w-10 text-gray-400" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Relatório não encontrado</h1>
      <p className="mb-6 max-w-md text-gray-600">
        O relatório que você está procurando não existe ou você não tem permissão para acessá-lo.
      </p>
      <Button asChild className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
        <Link href="/app/clients">Ver todos os clientes</Link>
      </Button>
    </div>
  )
}
