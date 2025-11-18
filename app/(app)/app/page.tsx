import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { getCreditState } from '@/lib/actions/credits'
import { Users, FileText, Plus, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    return null
  }

  const [clientsCount, reportsCount, creditState] = await Promise.all([
    prisma.client.count({
      where: {
        workspaceId: workspace.id,
      },
    }),
    prisma.report.count({
      where: {
        client: {
          workspaceId: workspace.id,
        },
      },
    }),
    getCreditState(),
  ])

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

      {creditState && creditState.isLowCredits && (
        <div
          className={`rounded-lg p-4 ${
            creditState.remaining < 10
              ? 'bg-red-50 border border-red-200'
              : 'bg-orange-50 border border-orange-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className={`h-5 w-5 mt-0.5 ${
                creditState.remaining < 10 ? 'text-red-600' : 'text-orange-600'
              }`}
            />
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  creditState.remaining < 10 ? 'text-red-900' : 'text-orange-900'
                }`}
              >
                {creditState.remaining < 10 ? 'Créditos críticos!' : 'Créditos baixos'}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  creditState.remaining < 10 ? 'text-red-800' : 'text-orange-800'
                }`}
              >
                {creditState.remaining < 10
                  ? `Você tem apenas ${creditState.remaining} créditos disponíveis. Compre mais créditos para continuar gerando relatórios.`
                  : `Você usou ${creditState.percentageUsed.toFixed(
                      0
                    )}% dos seus créditos. Considere comprar mais para não interromper seu trabalho.`}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  asChild
                  size="sm"
                  className={
                    creditState.remaining < 10
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }
                >
                  <Link href="/app/billing">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Comprar créditos
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/app/credits">Ver detalhes</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {clientsCount === 0 && (
        <Card className="border-teal-200 bg-teal-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Comece agora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Você ainda não tem clientes cadastrados. Adicione seu primeiro cliente para começar a gerar relatórios automatizados.
            </p>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/app/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar primeiro cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
