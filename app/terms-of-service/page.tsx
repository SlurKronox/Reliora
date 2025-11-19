import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-4xl font-bold text-[#0F172A] mb-8">Termos de Serviço</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Última atualização: Novembro de 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Reliora, você concorda em cumprir estes Termos de Serviço.
              Se você não concordar com qualquer parte destes termos, não use nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">2. Descrição do Serviço</h2>
            <p>
              O Reliora é uma plataforma SaaS que permite a geração automatizada de relatórios
              de marketing através da integração com Google Analytics 4 e processamento com
              inteligência artificial.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">3. Conta de Usuário</h2>
            <p>
              Você é responsável por manter a confidencialidade de sua conta e senha.
              Você concorda em aceitar a responsabilidade por todas as atividades que
              ocorrem sob sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">4. Planos e Pagamentos</h2>
            <p>
              Os planos de assinatura são cobrados mensalmente. Você pode cancelar sua
              assinatura a qualquer momento. Os créditos não utilizados expiram ao final
              de cada período de cobrança.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">5. Uso Aceitável</h2>
            <p>
              Você concorda em não usar o serviço para qualquer propósito ilegal ou não
              autorizado. Você não deve violar quaisquer leis em sua jurisdição.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">6. Propriedade Intelectual</h2>
            <p>
              O conteúdo, recursos e funcionalidades do Reliora são de propriedade da empresa
              e são protegidos por leis de direitos autorais e outras leis de propriedade intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              O Reliora é fornecido "como está". Não garantimos que o serviço será
              ininterrupto, seguro ou livre de erros. Em nenhum caso seremos responsáveis
              por quaisquer danos indiretos, incidentais ou consequentes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">8. Modificações</h2>
            <p>
              Reservamo-nos o direito de modificar ou substituir estes termos a qualquer momento.
              Notificaremos você sobre quaisquer alterações materiais por e-mail ou aviso em nosso site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">9. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco
              através do e-mail: contato@reliora.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
