'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Coins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getCreditState, type CreditState } from '@/lib/actions/credits'

export function CreditBadge() {
  const [creditState, setCreditState] = useState<CreditState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCredits() {
      try {
        const state = await getCreditState()
        setCreditState(state)
      } catch (error) {
        console.error('[CreditBadge] Failed to load credits:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCredits()
  }, [])

  if (loading) {
    return <Skeleton className="h-8 w-24" />
  }

  if (!creditState) {
    return null
  }

  const isLow = creditState.isLowCredits
  const isCritical = creditState.remaining < 10

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${
            isCritical
              ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
              : isLow
              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {isCritical ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Coins className="h-4 w-4" />
          )}
          <span className="font-medium">
            {creditState.remaining} / {creditState.limit}
          </span>
          {isLow && (
            <Badge
              variant={isCritical ? 'destructive' : 'default'}
              className="ml-1 text-xs"
            >
              {isCritical ? 'Crítico' : 'Baixo'}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Créditos do Período</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Usados</span>
                <span className="font-medium">{creditState.used}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Disponíveis</span>
                <span
                  className={`font-medium ${
                    isCritical
                      ? 'text-red-600'
                      : isLow
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {creditState.remaining}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Limite</span>
                <span className="font-medium">{creditState.limit}</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isCritical
                    ? 'bg-red-500'
                    : isLow
                    ? 'bg-orange-500'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${creditState.percentageUsed}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {creditState.percentageUsed.toFixed(1)}% usado
            </p>
          </div>

          {isLow && (
            <div
              className={`rounded-md p-3 text-sm ${
                isCritical
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-orange-50 text-orange-800 border border-orange-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  {isCritical ? (
                    <p>
                      Créditos críticos! Compre mais créditos para continuar
                      gerando relatórios.
                    </p>
                  ) : (
                    <p>
                      Você está com poucos créditos. Considere comprar mais
                      para não interromper seu trabalho.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              Reset em{' '}
              {creditState.resetDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/app/credits">Ver histórico</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                <Link href="/app/billing">Comprar créditos</Link>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
