import { Card, CardContent } from '@/components/ui/card'
import { Link2, Sparkles, Send } from 'lucide-react'

export function HowItWorksSection() {
  const steps = [
    {
      icon: Link2,
      title: 'Conecte suas contas',
      description: 'Conecte suas fontes de dados de marketing (como Google Analytics, Facebook/Instagram Ads e outras). Nada de exportar CSV ou copiar e colar números.',
    },
    {
      icon: Sparkles,
      title: 'Deixe a IA trabalhar',
      description: 'A Reliora puxa os dados, organiza as métricas principais e usa IA para gerar a narrativa: o que funcionou, o que piorou, onde estão as oportunidades.',
    },
    {
      icon: Send,
      title: 'Envie o relatório em 1 clique',
      description: 'Baixe o relatório em PDF ou compartilhe o link com seu cliente/time. Você pode editar a análise se quiser, mas na maioria das vezes já sai pronto para envio.',
    },
  ]

  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            Como a Reliora funciona na prática
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="border-2 border-gray-100 transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#14B8A6]/10">
                  <step.icon className="h-6 w-6 text-[#14B8A6]" />
                </div>
                <div className="mb-2 text-sm font-semibold text-[#14B8A6]">Passo {index + 1}</div>
                <h3 className="mb-3 text-xl font-semibold text-[#0F172A]">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
