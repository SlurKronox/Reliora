import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-6 text-sm">
            <Link href="/terms-of-service" className="text-gray-600 hover:text-[#14B8A6] transition-colors">
              Termos de Serviço
            </Link>
            <Link href="/privacy-policy" className="text-gray-600 hover:text-[#14B8A6] transition-colors">
              Política de Privacidade
            </Link>
          </div>
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Reliora. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
