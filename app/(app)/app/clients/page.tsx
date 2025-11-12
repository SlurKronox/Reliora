import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, ExternalLink } from 'lucide-react'
import { getCurrentUser, getUserWorkspace } from '@/lib/session'
import { prisma } from '@/lib/db'
import { format } from 'date-fns'

export default async function ClientsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const workspace = await getUserWorkspace(user.id)

  if (!workspace) {
    return null
  }

  const clients = await prisma.client.findMany({
    where: {
      workspaceId: workspace.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Clientes</h1>
          <p className="mt-2 text-gray-600">
            Gerencie seus clientes e projetos de marketing
          </p>
        </div>
        <Button asChild className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
          <Link href="/app/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo cliente
          </Link>
        </Button>
      </div>

      {clients.length === 0 ? (
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
                Nenhum cliente ainda.
              </h3>
              <p className="mb-6 max-w-sm text-sm text-gray-600">
                Comece adicionando seu primeiro cliente para gerar relatórios de marketing
              </p>
              <Button asChild className="bg-[#14B8A6] hover:bg-[#14B8A6]/90">
                <Link href="/app/clients/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeiro cliente
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Seus clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-600">
                        {format(new Date(client.createdAt), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/clients/${client.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
