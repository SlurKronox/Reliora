'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createReportAction } from './actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function ReportForm({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Default: last 30 days
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('clientId', clientId)

    try {
      const result = await createReportAction(formData)

      if (result?.error) {
        toast.error(result.error)
        setLoading(false)
      }
      // Success case redirects automatically
    } catch (error) {
      toast.error('Erro ao gerar relatório')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="periodStart">
            Data inicial <span className="text-red-500">*</span>
          </Label>
          <Input
            id="periodStart"
            name="periodStart"
            type="date"
            required
            defaultValue={formatDate(thirtyDaysAgo)}
            max={formatDate(today)}
          />
          <p className="text-sm text-gray-500">Início do período de análise</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodEnd">
            Data final <span className="text-red-500">*</span>
          </Label>
          <Input
            id="periodEnd"
            name="periodEnd"
            type="date"
            required
            defaultValue={formatDate(today)}
            max={formatDate(today)}
          />
          <p className="text-sm text-gray-500">Fim do período de análise</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#14B8A6] hover:bg-[#14B8A6]/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando relatório...
            </>
          ) : (
            'Gerar relatório'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
