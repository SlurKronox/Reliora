import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 79',
      period: '/mês',
      features: [
        'Até 5 clientes/projetos',
        'Relatórios mensais ilimitados',
        'Exportação em PDF',
        'Suporte por e-mail',
      ],
    },
    {
      name: 'Pro',
      price: 'R$ 199',
      period: '/mês',
      features: [
        'Até 20 clientes/projetos',
        'Relatórios mensais e semanais',
        'Branding personalizado nos relatórios',
        'Prioridade em novas features',
      ],
      featured: true,
    },
  ]

  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            Planos simples para começar rápido
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.featured
                  ? 'border-2 border-[#14B8A6] shadow-lg'
                  : 'border-2 border-gray-100'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#14B8A6] px-4 py-1 text-sm font-semibold text-white">
                    Mais popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-[#0F172A]">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#0F172A]">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="mr-3 h-5 w-5 flex-shrink-0 text-[#14B8A6]" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full mt-6 ${
                    plan.featured
                      ? 'bg-[#14B8A6] hover:bg-[#14B8A6]/90'
                      : 'bg-[#0F172A] hover:bg-[#0F172A]/90'
                  }`}
                >
                  <Link href="/signup">Começar teste gratuito</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
