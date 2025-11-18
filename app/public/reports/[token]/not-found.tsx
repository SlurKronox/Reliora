import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicReportNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gray-100 p-6">
            <FileQuestion className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Relatório não encontrado
        </h1>

        <p className="text-gray-600 mb-8">
          Este relatório não existe ou o link foi revogado.
        </p>

        <Button asChild className="bg-[#14B8A6] hover:bg-[#0F766E]">
          <Link href="/">
            Voltar para o início
          </Link>
        </Button>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <span className="font-semibold text-[#14B8A6]">
              Reliora
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
