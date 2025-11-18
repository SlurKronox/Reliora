import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, ArrowRight, CreditCard } from 'lucide-react'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { getCurrentPlan, getPaymentHistory } from '@/lib/actions/billing'
import { PLANS, CREDIT_PACKAGES } from '@/lib/billing/mercadopago'
import { format } from 'date-fns'

export default async function BillingPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const workspace = await getUserWorkspace(user.id)
  if (!workspace) {
    redirect('/login')
  }

  const [planResult, historyResult] = await Promise.all([
    getCurrentPlan(),
    getPaymentHistory(10)
  ])

  const currentPlanData = planResult.success ? planResult.data : null
  const paymentHistory = historyResult.success ? historyResult.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Planos e Pagamentos</h1>
        <p className="mt-2 text-gray-600">
          Gerencie seu plano e histórico de pagamentos
        </p>
      </div>

      {currentPlanData && (
        <Card>
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {currentPlanData.planName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {currentPlanData.planDescription}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {currentPlanData.creditUsed} / {currentPlanData.creditLimit} créditos usados
                </p>
              </div>
              {currentPlanData.plan !== 'business' && (
                <Button asChild className="bg-[#14B8A6] hover:bg-[#0F766E]">
                  <a href="#plans">
                    <Crown className="mr-2 h-4 w-4" />
                    Fazer upgrade
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div id="plans">
        <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Planos Disponíveis</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = currentPlanData?.plan === key
            const canUpgrade = key !== 'free' && currentPlanData?.plan !== 'business'

            return (
              <Card key={key} className={isCurrentPlan ? 'border-[#14B8A6] border-2' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {isCurrentPlan && (
                      <Badge className="bg-[#14B8A6]">Atual</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-[#0F172A]">
                      {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                    </p>
                    {plan.price > 0 && (
                      <p className="text-sm text-gray-600 mt-1">/mês</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{plan.credits.toLocaleString()} créditos/mês</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Relatórios ilimitados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Integração GA4</span>
                    </li>
                    {key !== 'free' && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Suporte prioritário</span>
                        </li>
                        {key === 'business' && (
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Consultoria personalizada</span>
                          </li>
                        )}
                      </>
                    )}
                  </ul>

                  {!isCurrentPlan && canUpgrade && (
                    <form action={`/api/billing/create-subscription?plan=${key}`} method="POST">
                      <Button type="submit" className="w-full bg-[#14B8A6] hover:bg-[#0F766E]">
                        <Crown className="mr-2 h-4 w-4" />
                        Assinar {plan.name}
                      </Button>
                    </form>
                  )}

                  {isCurrentPlan && (
                    <Button disabled className="w-full">
                      Plano Atual
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Créditos Avulsos</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card key={pkg.credits}>
              <CardHeader>
                <CardTitle>{pkg.credits.toLocaleString()} Créditos</CardTitle>
                <CardDescription>Compra única</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-[#0F172A]">R$ {pkg.price}</p>
                  <p className="text-sm text-gray-600 mt-1">pagamento único</p>
                </div>

                <form action={`/api/billing/buy-credits?amount=${pkg.credits}`} method="POST">
                  <Button type="submit" className="w-full" variant="outline">
                    <Zap className="mr-2 h-4 w-4" />
                    Comprar Créditos
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum pagamento registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {payment.type === 'subscription' ? `Plano ${payment.plan}` : `${payment.creditsAdded} créditos`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      R$ {payment.amount.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        payment.status === 'approved'
                          ? 'default'
                          : payment.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {payment.status === 'approved' ? 'Aprovado' :
                       payment.status === 'pending' ? 'Pendente' : 'Recusado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
