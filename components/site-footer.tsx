export function SiteFooter() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-8">
        <p className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Reliora, todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
