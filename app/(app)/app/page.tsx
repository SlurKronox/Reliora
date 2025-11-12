import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { Users, FileText } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    return null
  }

  const clientsCount = await prisma.client.count({
    where: {
      workspaceId: workspace.id,
    },
  })

  const reportsCount = await prisma.report.count({
    where: {
      client: {
        workspaceId: workspace.id,
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">
          Bem-vindo, {user.name || 'Usuário'}
        </h1>
        <p className="mt-2 text-gray-600">
          Aqui está uma visão geral da sua conta
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0F172A]">{clientsCount}</div>
            <p className="mt-1 text-xs text-gray-500">
              {clientsCount === 0 ? 'Crie seu primeiro cliente' : 'Total de clientes cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Relatórios
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0F172A]">{reportsCount}</div>
            <p className="mt-1 text-xs text-gray-500">
              {reportsCount === 0 ? 'Nenhum relatório gerado ainda' : 'Total de relatórios gerados'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-[#0F172A]">1. Adicione seus clientes</h3>
            <p className="mt-1 text-sm text-gray-600">
              Cadastre os clientes para os quais você precisa gerar relatórios de marketing
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-[#0F172A]">2. Gere seu primeiro relatório</h3>
            <p className="mt-1 text-sm text-gray-600">
              Após adicionar um cliente, você poderá gerar relatórios com análises automatizadas
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-[#0F172A]">3. Em breve: conecte suas fontes</h3>
            <p className="mt-1 text-sm text-gray-600">
              Logo você poderá conectar Google Analytics, Facebook Ads e outras fontes para dados reais
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
