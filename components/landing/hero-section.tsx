import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-6xl">
            Relatórios de marketing automatizados com IA
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            Conecte seu Google Analytics 4, gere relatórios completos com análise de IA em minutos. Economize horas todo mês e entregue insights profissionais para seus clientes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
              <Link href="/signup">
                Começar agora grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#pricing">Ver planos</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            Perfeito para agências, freelancers e profissionais de marketing. Sem cartão de crédito necessário.
          </p>
        </div>
      </div>
    </section>
  )
}
