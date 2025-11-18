import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { getCreditState } from '@/lib/actions/credits'
import {
  Users,
  FileText,
  Plus,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
  AlertTriangle,
  XCircle,
  Calendar,
  BarChart3
} from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    redirect('/login')
  }

  const googleConnection = await prisma.googleConnection.findUnique({
    where: { workspaceId: workspace.id },
    select: { id: true }
  })

  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30))

  const [clientsCount, reportsCount, creditState, recentReports, creditHistory] = await Promise.all([
    prisma.client.count({
      where: { workspaceId: workspace.id }
    }),
    prisma.report.count({
      where: {
        client: { workspaceId: workspace.id }
      }
    }),
    getCreditState(),
    prisma.report.findMany({
      where: {
        client: { workspaceId: workspace.id }
      },
      include: {
        client: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.creditLedger.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        delta: true
      }
    })
  ])

  const creditsByDay = new Map<string, number>()
  let runningTotal = creditState ? creditState.used : 0

  creditHistory.forEach(entry => {
    const day = format(entry.createdAt, 'dd/MM')
    const current = creditsByDay.get(day) || 0
    creditsByDay.set(day, current + entry.delta)
  })

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const day = format(date, 'dd/MM')
    return {
      day,
      credits: creditsByDay.get(day) || 0
    }
  })

  const maxCredits = Math.max(...last7Days.map(d => d.credits), 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">
          Bem-vindo, {user.name || 'Usuário'}
        </h1>
        <p className="mt-2 text-gray-600">
          Visão geral do seu workspace
        </p>
      </div>

      {creditState && creditState.percentageUsed >= 80 && (
        <Alert
          variant={creditState.remaining < 100 ? 'destructive' : 'default'}
          className={creditState.remaining < 100 ? '' : 'border-orange-500 bg-orange-50'}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {creditState.remaining < 100 ? (
              <>
                <strong>Créditos críticos!</strong> Você tem apenas {creditState.remaining} créditos disponíveis.{' '}
                <Link href="/app/billing" className="underline font-medium">
                  Compre mais créditos
                </Link>{' '}
                para continuar gerando relatórios.
              </>
            ) : (
              <>
                <strong>Créditos baixos.</strong> Você usou {creditState.percentageUsed.toFixed(0)}% dos seus créditos.{' '}
                <Link href="/app/credits" className="underline font-medium">
                  Ver detalhes
                </Link>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!googleConnection && (
        <Alert className="border-blue-500 bg-blue-50">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Google Analytics não conectado.</strong> Conecte o GA4 para obter dados reais nos relatórios.{' '}
            <Link href="/app/integrations" className="underline font-medium">
              Conectar agora
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {clientsCount === 0 && (
        <Alert className="border-teal-500 bg-teal-50">
          <TrendingUp className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-teal-900">
            <strong>Nenhum cliente cadastrado.</strong> Adicione seu primeiro cliente para começar a gerar relatórios.{' '}
            <Link href="/app/clients/new" className="underline font-medium">
              Adicionar cliente
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              Total cadastrados
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
              Total gerados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Créditos usados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0F172A]">
              {creditState?.used || 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              de {creditState?.limit || 0} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Último relatório
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-[#0F172A]">
              {recentReports.length > 0
                ? format(new Date(recentReports[0].createdAt), 'dd/MM/yyyy')
                : 'N/A'}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {recentReports.length > 0 ? recentReports[0].client.name : 'Nenhum relatório ainda'}
            </p>
          </CardContent>
        </Card>
      </div>

      {creditState && (
        <Card>
          <CardHeader>
            <CardTitle>Consumo de Créditos (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
              {last7Days.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-32">
                    <div
                      className="w-full bg-[#14B8A6] rounded-t transition-all"
                      style={{
                        height: `${(item.credits / maxCredits) * 100}%`,
                        minHeight: item.credits > 0 ? '8px' : '0'
                      }}
                      title={`${item.credits} créditos`}
                    />
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{item.day}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Total nos últimos 7 dias: <span className="font-semibold text-gray-700">
                {last7Days.reduce((sum, d) => sum + d.credits, 0)} créditos
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Relatórios Recentes</CardTitle>
            {clientsCount > 0 && (
              <Button asChild size="sm" className="bg-[#14B8A6] hover:bg-[#0F766E]">
                <Link href="/app/clients">
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar novo
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum relatório ainda
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {clientsCount === 0
                    ? 'Adicione um cliente para gerar seu primeiro relatório'
                    : 'Gere relatórios automatizados com análise de IA'}
                </p>
                {clientsCount === 0 ? (
                  <Button asChild className="bg-[#14B8A6] hover:bg-[#0F766E]">
                    <Link href="/app/clients/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar cliente
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="bg-[#14B8A6] hover:bg-[#0F766E]">
                    <Link href="/app/clients">
                      <Plus className="mr-2 h-4 w-4" />
                      Gerar relatório
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/app/reports/${report.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {report.client.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(report.periodStart), 'dd/MM/yyyy')} -{' '}
                        {format(new Date(report.periodEnd), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {format(new Date(report.createdAt), 'dd/MM')}
                    </div>
                  </Link>
                ))}
                {reportsCount > 5 && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/app/clients">Ver todos os relatórios</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/app/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar novo cliente
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/app/integrations">
                <BarChart3 className="mr-2 h-4 w-4" />
                Conectar Google Analytics
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/app/credits">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver uso de créditos
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/app/billing">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Comprar créditos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
