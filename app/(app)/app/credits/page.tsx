import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowUpRight, Coins, ShoppingCart, History } from 'lucide-react'
import { getCreditState, getCreditHistory } from '@/lib/actions/credits'
import { format } from 'date-fns'

function EmptyHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <History className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        Nenhum histórico ainda
      </h3>
      <p className="mb-6 max-w-sm text-sm text-gray-600">
        Quando você gerar relatórios, o consumo de créditos aparecerá aqui.
      </p>
      <Button asChild className="bg-teal-600 hover:bg-teal-700">
        <Link href="/app/clients">
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Gerar primeiro relatório
        </Link>
      </Button>
    </div>
  )
}

function getReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    report_generation: 'Geração de relatório',
    monthly_reset: 'Reset mensal',
    manual_adjustment: 'Ajuste manual',
    purchase: 'Compra de créditos',
  }
  return labels[reason] || reason
}

function getReasonBadgeVariant(reason: string): 'default' | 'secondary' | 'outline' {
  if (reason === 'report_generation') return 'default'
  if (reason === 'purchase') return 'secondary'
  return 'outline'
}

export default async function CreditsPage() {
  const [creditState, history] = await Promise.all([
    getCreditState(),
    getCreditHistory(100),
  ])

  if (!creditState) {
    return <div>Carregando...</div>
  }

  const isLow = creditState.isLowCredits
  const isCritical = creditState.remaining < 10

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créditos</h1>
          <p className="mt-2 text-gray-600">
            Gerencie seus créditos e veja o histórico de consumo
          </p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/app/billing">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Comprar créditos
          </Link>
        </Button>
      </div>

      {isLow && (
        <div
          className={`rounded-lg p-4 ${
            isCritical
              ? 'bg-red-50 border border-red-200'
              : 'bg-orange-50 border border-orange-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className={`h-5 w-5 mt-0.5 ${
                isCritical ? 'text-red-600' : 'text-orange-600'
              }`}
            />
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  isCritical ? 'text-red-900' : 'text-orange-900'
                }`}
              >
                {isCritical ? 'Créditos críticos!' : 'Créditos baixos'}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  isCritical ? 'text-red-800' : 'text-orange-800'
                }`}
              >
                {isCritical
                  ? 'Você tem menos de 10 créditos disponíveis. Compre mais créditos agora para continuar gerando relatórios.'
                  : `Você usou ${creditState.percentageUsed.toFixed(
                      0
                    )}% dos seus créditos. Considere comprar mais para não interromper seu trabalho.`}
              </p>
              <Button
                asChild
                size="sm"
                className={`mt-3 ${
                  isCritical
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                <Link href="/app/billing">Comprar créditos agora</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Créditos Usados
            </CardTitle>
            <Coins className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {creditState.used}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              de {creditState.limit} no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Créditos Disponíveis
            </CardTitle>
            <Coins className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                isCritical
                  ? 'text-red-600'
                  : isLow
                  ? 'text-orange-600'
                  : 'text-green-600'
              }`}
            >
              {creditState.remaining}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {creditState.percentageUsed.toFixed(1)}% usado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Próximo Reset
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900">
              {format(creditState.resetDate, 'dd/MM/yyyy')}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Início em {format(creditState.periodStart, 'dd/MM/yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uso Atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {creditState.used} / {creditState.limit} créditos
              </span>
              <span className="text-gray-500">
                {creditState.percentageUsed.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isCritical
                    ? 'bg-red-500'
                    : isLow
                    ? 'bg-orange-500'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${creditState.percentageUsed}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Seus créditos resetam automaticamente todo mês. O próximo reset
            será em{' '}
            <strong>
              {format(creditState.resetDate, 'dd/MM/yyyy')}
            </strong>
            .
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consumo</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyHistoryState />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Créditos</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Relatório
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {format(
                          new Date(entry.createdAt),
                          'dd/MM/yyyy HH:mm'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getReasonBadgeVariant(entry.reason)}>
                          {getReasonLabel(entry.reason)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          entry.delta > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {entry.delta > 0 ? '+' : ''}
                        {entry.delta}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {entry.reportId ? (
                          <Button variant="link" size="sm" asChild>
                            <Link href={`/app/reports/${entry.reportId}`}>
                              Ver relatório
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
