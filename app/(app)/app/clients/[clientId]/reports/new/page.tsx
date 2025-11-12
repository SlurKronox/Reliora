import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportForm } from './report-form'

export default async function NewReportPage({
  params,
}: {
  params: { clientId: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    redirect('/login')
  }

  const client = await prisma.client.findFirst({
    where: {
      id: params.clientId,
      workspaceId: workspace.id,
    },
  }) as any

  if (!client) {
    redirect('/app/clients')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/app/clients/${params.clientId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para {client.name}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo Relatório</CardTitle>
          <CardDescription>
            Defina o período para análise das métricas de marketing de {client.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm clientId={params.clientId} />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-medium text-blue-900">Como funciona</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• Selecione um período de até 90 dias</li>
          <li>• O sistema gerará métricas e análise automática com IA</li>
          <li>• O relatório ficará disponível para consulta posterior</li>
        </ul>
      </div>
    </div>
  )
}
