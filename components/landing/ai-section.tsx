import { Brain } from 'lucide-react'

export function AISection() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14B8A6]/10">
              <Brain className="h-8 w-8 text-[#14B8A6]" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl mb-8">
            IA de verdade, aplicada a marketing
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-gray-600">
            <p>
              A Reliora usa modelos avançados de inteligência artificial, como o GPT-4, para transformar dados brutos em narrativas claras e acionáveis. A IA analisa as métricas do seu período selecionado e identifica padrões, tendências e oportunidades que você pode ter perdido em meio aos números.
            </p>
            <p>
              Mas você continua no controle. Cada relatório gerado pode ser editado e ajustado antes de enviar ao cliente ou gestor. A IA acelera o trabalho, mas a decisão final sobre o que comunicar é sempre sua.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
