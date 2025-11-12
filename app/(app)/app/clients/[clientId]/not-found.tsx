import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function ClientNotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Cliente não encontrado</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            O cliente que você está procurando não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button asChild className="w-full">
            <Link href="/app/clients">Voltar para clientes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
