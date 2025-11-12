'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { BarChart3, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      })

      if (result?.ok) {
        toast.success('Login realizado com sucesso!')
        router.push('/app')
      } else {
        toast.error('Email ou senha incorretos. Tente novamente.')
      }
    } catch (error) {
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#14B8A6] to-[#0F766E] p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <BarChart3 className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">Reliora</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Bem-vindo de volta à<br />sua plataforma de BI
          </h2>
          <p className="text-xl text-white/90">
            Continue gerando insights valiosos para seus clientes
          </p>

          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Relatórios em Segundos</h3>
                <p className="text-white/80">IA analisa seus dados automaticamente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">100% Seguro</h3>
                <p className="text-white/80">Seus dados protegidos com criptografia</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Sempre Disponível</h3>
                <p className="text-white/80">Acesse de qualquer lugar, a qualquer hora</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © 2025 Reliora. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#14B8A6]">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#0F172A]">Reliora</span>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-3xl font-bold text-[#0F172A]">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-base">
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    required
                    className="h-11"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <Link
                      href="#"
                      className="text-xs font-medium text-[#14B8A6] hover:text-[#0F766E] hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="h-11 pr-10"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#14B8A6] hover:bg-[#0F766E] text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-[#14B8A6] hover:text-[#0F766E] hover:underline"
                  >
                    Criar conta grátis
                  </Link>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Conexão segura e criptografada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-gray-500">
            Ao entrar, você concorda com nossos{' '}
            <Link href="#" className="text-[#14B8A6] hover:underline">
              Termos de Uso
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
