'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Algo deu errado
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Ocorreu um erro inesperado. Tente novamente ou volte para o início.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <a href="/app">
              <Home className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
