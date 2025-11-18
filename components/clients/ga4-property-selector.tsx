'use client'

import { useState, useTransition } from 'react'
import { updateClientGA4 } from '@/lib/actions/clients'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

type GA4Property = {
  propertyId: string
  displayName: string
}

type GA4PropertySelectorProps = {
  clientId: string
  currentPropertyId?: string | null
  currentPropertyDisplay?: string | null
  properties: GA4Property[]
}

export function GA4PropertySelector({
  clientId,
  currentPropertyId,
  currentPropertyDisplay,
  properties,
}: GA4PropertySelectorProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    currentPropertyId || ''
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = () => {
    if (!selectedPropertyId) {
      setError('Selecione uma propriedade')
      return
    }

    const selectedProperty = properties.find(
      (p) => p.propertyId === selectedPropertyId
    )

    if (!selectedProperty) {
      setError('Propriedade inválida')
      return
    }

    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updateClientGA4(
        clientId,
        selectedProperty.propertyId,
        selectedProperty.displayName
      )

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const hasChanges = selectedPropertyId !== currentPropertyId

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select
          value={selectedPropertyId}
          onValueChange={(value) => {
            setSelectedPropertyId(value)
            setError(null)
            setSuccess(false)
          }}
          disabled={isPending || properties.length === 0}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione uma propriedade GA4" />
          </SelectTrigger>
          <SelectContent>
            {properties.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-gray-500">
                Nenhuma propriedade disponível
              </div>
            ) : (
              properties.map((property) => (
                <SelectItem key={property.propertyId} value={property.propertyId}>
                  {property.displayName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isPending || properties.length === 0}
          className="bg-[#14B8A6] hover:bg-[#0F766E]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="text-sm">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Propriedade GA4 vinculada com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {currentPropertyDisplay && !hasChanges && (
        <p className="text-xs text-gray-600">
          Vinculado a: <span className="font-medium">{currentPropertyDisplay}</span>
        </p>
      )}

      {properties.length === 0 && (
        <p className="text-xs text-gray-500">
          Conecte sua conta Google em Integrações para vincular propriedades GA4
        </p>
      )}
    </div>
  )
}
