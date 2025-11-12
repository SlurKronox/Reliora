import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Plus, Trash2 } from 'lucide-react'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { format } from 'date-fns'
import { DeleteClientButton } from '@/components/clients/delete-client-button'

interface ClientDetailPageProps {
  params: {
    clientId: string
  }
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
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
    include: {
      reports: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">{client.name}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Cliente desde {format(new Date(client.createdAt), 'dd/MM/yyyy')}
          </p>
        </div>
        <DeleteClientButton clientId={client.id} clientName={client.name} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nome</label>
              <p className="mt-1 text-[#0F172A]">{client.name}</p>
            </div>
            {client.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notas</label>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Criado em</label>
              <p className="mt-1 text-gray-700">
                {format(new Date(client.createdAt), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de relatórios</p>
                <p className="mt-1 text-2xl font-bold text-[#0F172A]">{client.reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            {client.reports.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600">Último relatório</p>
                <p className="mt-1 text-gray-700">
                  {format(new Date(client.reports[0].createdAt), 'dd/MM/yyyy')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Relatórios</CardTitle>
          <Button disabled className="bg-[#14B8A6] hover:bg-[#14B8A6]/90" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Gerar relatório
          </Button>
        </CardHeader>
        <CardContent>
          {client.reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#0F172A]">
                Nenhum relatório ainda.
              </h3>
              <p className="mb-6 max-w-sm text-sm text-gray-600">
                Em breve: geração de relatórios com dados e IA.
              </p>
              <Badge variant="secondary" className="text-xs">
                Funcionalidade em desenvolvimento
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              {client.reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium text-[#0F172A]">
                      Relatório de {format(new Date(report.periodStart), 'dd/MM/yyyy')} a{' '}
                      {format(new Date(report.periodEnd), 'dd/MM/yyyy')}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Criado em {format(new Date(report.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Ver relatório
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
