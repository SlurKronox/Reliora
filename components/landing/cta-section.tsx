'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export function CTASection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Você entrou na lista de lançamento da Reliora.',
        })
        setEmail('')
      } else {
        const data = await response.json()
        toast({
          title: 'Erro',
          description: data.error || 'Ocorreu um erro. Tente novamente.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Quer parar de fechar mês montando relatório no braço?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Entre na lista de lançamento da Reliora e seja um dos primeiros a testar relatórios de marketing com IA no seu fluxo real de clientes.
          </p>
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full sm:w-80 bg-white"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#14B8A6] hover:bg-[#14B8A6]/90"
            >
              {loading ? 'Enviando...' : 'Quero entrar no lançamento'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
