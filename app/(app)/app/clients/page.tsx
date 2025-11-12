import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Clientes</h1>
          <p className="mt-2 text-gray-600">
            Gerencie seus clientes e projetos de marketing
          </p>
        </div>
        <Button className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0F172A]">
              Nenhum cliente cadastrado
            </h3>
            <p className="mb-6 max-w-sm text-sm text-gray-600">
              Comece adicionando seu primeiro cliente para gerar relatórios de marketing
            </p>
            <Button className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro cliente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
