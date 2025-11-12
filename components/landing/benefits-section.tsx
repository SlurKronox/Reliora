import { Card, CardContent } from '@/components/ui/card'
import { Clock, FileText, CheckCircle2, UserCheck } from 'lucide-react'

export function BenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: 'Tempo',
      description: 'Reduza em até 70% o tempo gasto com relatórios.',
    },
    {
      icon: FileText,
      title: 'Clareza',
      description: 'Relatórios em linguagem clara, que qualquer cliente ou gestor entende.',
    },
    {
      icon: CheckCircle2,
      title: 'Padronização',
      description: 'Todos os clientes recebem relatórios no mesmo formato e qualidade.',
    },
    {
      icon: UserCheck,
      title: 'Retenção',
      description: 'Relatórios melhores ajudam a reter clientes de longo prazo.',
    },
  ]

  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            Por que faz diferença na sua rotina
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-2 border-gray-100 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#14B8A6]/10">
                  <benefit.icon className="h-7 w-7 text-[#14B8A6]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#0F172A]">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
