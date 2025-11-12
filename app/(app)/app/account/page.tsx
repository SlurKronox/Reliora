import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/session'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Conta</h1>
        <p className="mt-2 text-gray-600">
          Gerencie suas informações pessoais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome</label>
            <p className="mt-1 text-[#0F172A]">{user.name || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="mt-1 text-[#0F172A]">{user.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
