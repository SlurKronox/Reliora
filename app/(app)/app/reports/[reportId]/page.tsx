import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ReportPage({
  params,
}: {
  params: { reportId: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    redirect('/login')
  }

  const report = await prisma.report.findFirst({
    where: {
      id: params.reportId,
    },
  }) as any

  if (!report) {
    notFound()
  }

  // Verify client belongs to workspace
  const client = await prisma.client.findFirst({
    where: {
      id: report.clientId,
      workspaceId: workspace.id,
    },
  }) as any

  if (!client) {
    notFound()
  }

  const metrics = report.rawDataJson as {
    totals: {
      impressions: number
      clicks: number
      ctr: number
      conversions: number
      cost: number
    }
    daily: Array<{
      date: string
      impressions: number
      clicks: number
      conversions: number
      cost: number
    }>
  }

  const maxClicks = Math.max(...metrics.daily.map((d) => d.clicks))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/clients/${client.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para {client.name}
            </Link>
          </Button>
        </div>
        <Button asChild className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
          <Link href={`/app/clients/${client.id}/reports/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Novo relatório
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#14B8A6]/10">
            <FileText className="h-5 w-5 text-[#14B8A6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">
              Relatório de Marketing
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {format(new Date(report.periodStart), 'dd/MM/yyyy')} a{' '}
              {format(new Date(report.periodEnd), 'dd/MM/yyyy')} • Gerado em{' '}
              {format(new Date(report.createdAt), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Impressões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              {metrics.totals.impressions.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cliques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              {metrics.totals.clicks.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CTR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              {metrics.totals.ctr.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              {metrics.totals.conversions.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Custo Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              R$ {metrics.totals.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho Diário - Cliques</CardTitle>
          <CardDescription>
            Distribuição de cliques ao longo do período analisado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.daily.map((day) => {
              const percentage = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0
              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {format(new Date(day.date), 'dd/MM')}
                    </span>
                    <span className="font-medium text-[#0F172A]">
                      {day.clicks.toLocaleString('pt-BR')} cliques
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#14B8A6] transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Automático (IA)</CardTitle>
          <CardDescription>
            Análise gerada automaticamente com base nas métricas do período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {report.aiSummaryText}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
