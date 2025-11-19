import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-4xl font-bold text-[#0F172A] mb-8">Política de Privacidade</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Última atualização: Novembro de 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">1. Informações que Coletamos</h2>
            <p className="mb-3">Coletamos as seguintes informações quando você usa o Reliora:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Informações de conta: nome, e-mail e senha criptografada</li>
              <li>Dados de uso: interações com a plataforma, relatórios gerados</li>
              <li>Dados do Google Analytics 4: métricas e dimensões dos seus projetos</li>
              <li>Informações de pagamento: processadas através do Mercado Pago</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">2. Como Usamos Suas Informações</h2>
            <p className="mb-3">Usamos suas informações para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Gerar relatórios de marketing com IA</li>
              <li>Processar pagamentos e gerenciar sua assinatura</li>
              <li>Enviar comunicações relacionadas ao serviço</li>
              <li>Detectar e prevenir fraudes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">3. Compartilhamento de Dados</h2>
            <p>
              Não vendemos suas informações pessoais. Compartilhamos dados apenas com:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Google (para acessar dados do GA4 com sua autorização)</li>
              <li>Mercado Pago (para processar pagamentos)</li>
              <li>Provedores de IA (OpenAI, Anthropic, Google) para gerar análises</li>
              <li>Prestadores de serviços que nos ajudam a operar a plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">4. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança para proteger suas informações, incluindo
              criptografia de senhas, conexões HTTPS e armazenamento seguro de tokens de acesso.
              No entanto, nenhum método de transmissão pela internet é 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">5. Seus Direitos (LGPD)</h2>
            <p className="mb-3">De acordo com a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar seu consentimento a qualquer momento</li>
              <li>Exportar seus dados em formato estruturado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">6. Cookies e Tecnologias</h2>
            <p>
              Usamos cookies e tecnologias semelhantes para melhorar sua experiência,
              manter sua sessão ativa e analisar o uso da plataforma. Você pode
              desabilitar cookies nas configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">7. Retenção de Dados</h2>
            <p>
              Mantemos suas informações enquanto sua conta estiver ativa. Após o cancelamento,
              mantemos dados por até 90 dias para fins de backup e conformidade legal,
              após os quais são permanentemente excluídos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">8. Alterações na Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos
              você sobre alterações significativas por e-mail ou aviso na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">9. Contato</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política,
              entre em contato através do e-mail: privacidade@reliora.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
