import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session'
import { createClient } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, BarChart3 } from 'lucide-react'
import Link from 'next/link'

async function getGoogleConnection(workspaceId: string) {
  const prisma = createClient()

  const connection = await prisma.googleConnection.findUnique({
    where: { workspaceId },
    select: { id: true, createdAt: true, expiresAt: true }
  })

  return connection
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const prisma = createClient()

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true }
  })

  if (!member) {
    redirect('/app')
  }

  const googleConnection = await getGoogleConnection(member.workspaceId)

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A]">Integrações</h1>
        <p className="text-gray-600 mt-2">
          Conecte suas ferramentas de marketing para obter dados reais nos relatórios
        </p>
      </div>

      {searchParams.success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Google Analytics conectado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {searchParams.error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao conectar: {searchParams.error}. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Google Analytics 4 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Google Analytics 4</CardTitle>
                  <CardDescription>
                    Conecte o GA4 para obter dados reais de sessões, usuários e conversões
                  </CardDescription>
                </div>
              </div>
              {googleConnection ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Conectado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <XCircle className="h-4 w-4" />
                  <span>Não conectado</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {googleConnection ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-medium mb-1">Status: Ativo</p>
                  <p className="text-xs">
                    Conectado em {new Date(googleConnection.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex gap-3">
                  <form action="/api/integrations/google/disconnect" method="POST" className="flex-1">
                    <Button
                      variant="outline"
                      type="submit"
                      className="w-full"
                    >
                      Desconectar
                    </Button>
                  </form>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/api/integrations/google/authorize">
                      Reconectar
                    </Link>
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Após conectar, você pode vincular propriedades do GA4 a cada cliente em{' '}
                  <Link href="/app/clients" className="text-[#14B8A6] hover:underline">
                    Clientes
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Ao conectar o Google Analytics 4, você poderá:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Obter dados reais de sessões, usuários e conversões</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Vincular propriedades do GA4 a cada cliente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Gerar relatórios com dados reais (cache de 12 horas)</span>
                  </li>
                </ul>

                <Button asChild className="w-full bg-[#14B8A6] hover:bg-[#0F766E]">
                  <Link href="/api/integrations/google/authorize">
                    Conectar Google Analytics 4
                  </Link>
                </Button>

                <p className="text-xs text-gray-500">
                  Você será redirecionado para o Google para autorizar o acesso.
                  Precisamos de permissão apenas de leitura (analytics.readonly).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future integrations */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-gray-600">Meta Ads</CardTitle>
                <CardDescription>Em breve</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-gray-600">Google Ads</CardTitle>
                <CardDescription>Em breve</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
