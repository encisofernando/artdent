import logoBlanco from '../assets/logo-blanco.png'

export default function Footer() {
  return (
    <footer className="mt-16" style={{ background: 'var(--brand-primary)' }}>
      <div className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <img src={logoBlanco} alt="ARTDENT" className="h-10 w-auto" />
            <p className="mt-3 text-sm/6 text-white/90">
              Tu sonrisa, es nuestra prioridad. El arte de crear para toda la vida.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">E-commerce</p>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>Catálogo</li>
              <li>Promociones</li>
              <li>Novedades</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Empresa</p>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>Quiénes somos</li>
              <li>Contacto</li>
              <li>Políticas</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Soporte</p>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>Ayuda</li>
              <li>Devoluciones</li>
              <li>Facturación</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-xs text-white/80">
          © {new Date().getFullYear()} ARTDENT. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
