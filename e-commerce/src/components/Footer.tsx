import { Link } from 'react-router-dom'
import logoBlanco from '../assets/logo-blanco.png'
import NewsletterSubscribe from '../components/NewsletterSubscribe'
import { ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16">
      {/* Newsletter */}
      <div className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="card mx-auto max-w-3xl p-6 md:p-8">
            <NewsletterSubscribe variant="footer" />
          </div>
        </div>
      </div>

      {/* Footer principal */}
      <div
        className="text-white"
        style={{ background: 'color-mix(in srgb, var(--brand-primary) 92%, black)' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-5">
            {/* Columna 1: Logo y descripción */}
            <div>
              <img src={logoBlanco} alt="ARTDENT" className="h-10 w-auto" />
              <p className="mt-3 text-sm/6 text-white/90">
                Tu sonrisa, es nuestra prioridad. El arte de crear para toda la vida.
              </p>
            </div>

            {/* Columna 2: E-commerce */}
            <div>
              <p className="text-sm font-semibold">E-commerce</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li><Link to="/productos" className="hover:text-white transition">Catálogo</Link></li>
                <li><Link to="/comparar" className="hover:text-white transition">Comparar productos</Link></li>
                <li><Link to="/promociones" className="hover:text-white transition">Promociones</Link></li>
                <li><Link to="/novedades" className="hover:text-white transition">Novedades</Link></li>
              </ul>
            </div>

            {/* Columna 3: Empresa */}
            <div>
              <p className="text-sm font-semibold">Empresa</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li><Link to="/nosotros" className="hover:text-white transition">Quiénes somos</Link></li>
                <li><Link to="/contacto" className="hover:text-white transition">Contacto</Link></li>
                <li><Link to="/politicas" className="hover:text-white transition">Políticas</Link></li>
              </ul>
            </div>

            {/* Columna 4: Soporte */}
            <div>
              <p className="text-sm font-semibold">Soporte</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li><Link to="/ayuda" className="hover:text-white transition">Ayuda</Link></li>
                <li><Link to="/devoluciones" className="hover:text-white transition">Devoluciones</Link></li>
                <li><Link to="/facturacion" className="hover:text-white transition">Facturación</Link></li>
                <li><Link to="/mi-cuenta" className="hover:text-white transition">Mi cuenta</Link></li>
              </ul>
            </div>

            {/* Columna 5: QR DATA FISCAL AFIP */}
            <div>
              <p className="text-sm font-semibold mb-3">Data Fiscal</p>
              <div className="rounded-lg bg-white/10 p-2 backdrop-blur w-fit">
                <a
                  href="http://qr.afip.gob.ar/?qr=4b0zvHAv83kn37jtFeGVKg,,"
                  target="_F960AFIPInfo"
                  className="block group"
                  title="Verificar datos fiscales en AFIP"
                >
                  <div className="relative overflow-hidden rounded-md bg-white p-1.5">
                    <img
                      src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg"
                      alt="Logo de AFIP"
                      className="w-20 h-20 object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-white/80 group-hover:text-white transition">
                    <span>Verificar</span>
                    <ExternalLink size={10} />
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Información fiscal adicional */}
          <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="grid gap-3 text-xs text-white/70 md:grid-cols-3">
              <div>
                <span className="font-semibold text-white/90">Razón Social:</span> ARTDENT S.R.L.
              </div>
              <div>
                <span className="font-semibold text-white/90">CUIT:</span> XX-XXXXXXXX-X
              </div>
              <div>
                <span className="font-semibold text-white/90">Ingresos Brutos:</span> XXX-XXXXXX-X
              </div>
            </div>
          </div>

          {/* Footer inferior */}
          <div className="mt-10 border-t border-white/20 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-xs text-white/80">
              © {new Date().getFullYear()} ARTDENT. Todos los derechos reservados.
            </div>

            <div className="flex items-center gap-4 text-xs text-white/80">
              <Link to="/terminos" className="hover:text-white transition">Términos y condiciones</Link>
              <Link to="/privacidad" className="hover:text-white transition">Privacidad</Link>
              <Link to="/defensa-consumidor" className="hover:text-white transition">Defensa del Consumidor</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}