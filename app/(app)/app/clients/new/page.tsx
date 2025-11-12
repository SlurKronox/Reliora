import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { redirect } from 'next/navigation'
import { ClientForm } from '@/components/clients/client-form'

export default async function NewClientPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Novo Cliente</h1>
        <p className="mt-2 text-gray-600">
          Adicione um novo cliente ao seu workspace
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm />
        </CardContent>
      </Card>
    </div>
  )
}
