import { notFound } from 'next/navigation'
import { getPublicReport } from '@/lib/actions/reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface PublicReportPageProps {
  params: {
    token: string
  }
}

export default async function PublicReportPage({ params }: PublicReportPageProps) {
  const data = await getPublicReport(params.token)

  if (!data) {
    notFound()
  }

  const { report, workspace } = data

  let metrics: any = {}
  try {
    metrics = typeof report.rawDataJson === 'string'
      ? JSON.parse(report.rawDataJson)
      : report.rawDataJson
  } catch (e) {
    console.error('Failed to parse metrics:', e)
  }

  const brandPrimary = workspace.brandPrimary || '#14B8A6'
  const brandAccent = workspace.brandAccent || '#0F766E'

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="border-b bg-white"
        style={{ borderBottomColor: brandPrimary }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              {workspace.brandLogoUrl ? (
                <img
                  src={workspace.brandLogoUrl}
                  alt={workspace.name}
                  className="h-10 object-contain"
                />
              ) : (
                <h1 className="text-2xl font-bold" style={{ color: brandPrimary }}>
                  {workspace.name}
                </h1>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Relatório de Marketing</p>
              <p className="text-xs text-gray-500">
                {format(new Date(report.periodStart), 'dd/MM/yyyy')} -{' '}
                {format(new Date(report.periodEnd), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {report.clientName}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Período: {format(new Date(report.periodStart), 'dd/MM/yyyy')} a{' '}
              {format(new Date(report.periodEnd), 'dd/MM/yyyy')}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sessões
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: brandPrimary }}>
                {metrics.sessions?.toLocaleString() || 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total de visitas ao site
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: brandPrimary }}>
                {metrics.users?.toLocaleString() || 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Visitantes únicos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversões
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: brandPrimary }}>
                {metrics.conversions?.toLocaleString() || 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ações concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: brandPrimary }}>
                {metrics.revenue ? `R$ ${metrics.revenue.toLocaleString()}` : 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total no período
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Análise e Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {report.aiSummaryText}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8 border-t">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <span className="font-semibold" style={{ color: brandPrimary }}>
              Reliora
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Relatórios inteligentes de marketing com IA
          </p>
        </div>
      </main>
    </div>
  )
}
