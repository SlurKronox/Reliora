'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/actions/clients'
import { useToast } from '@/hooks/use-toast'

export function ClientForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createClient(formData)

      if (result?.error) {
        toast({
          title: 'Erro',
          description: result.error,
          variant: 'destructive',
        })
        setLoading(false)
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar cliente',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome do cliente <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ex: Empresa XYZ"
          required
          maxLength={100}
        />
        <p className="text-sm text-gray-500">
          Nome da empresa ou projeto de marketing
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Informações adicionais sobre o cliente (opcional)"
          rows={4}
          maxLength={1000}
        />
        <p className="text-sm text-gray-500">
          Detalhes relevantes, contatos, ou observações sobre o cliente
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#14B8A6] hover:bg-[#14B8A6]/90"
        >
          {loading ? 'Criando...' : 'Criar cliente'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
