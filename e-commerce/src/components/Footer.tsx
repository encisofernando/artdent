import { Link } from 'react-router-dom'
import logoBlanco from '../assets/logo-blanco.png'
import { ExternalLink } from 'lucide-react'

const FB_URL = 'https://www.facebook.com/p/ArtDent-Insumos-Odontol%C3%B3gicos-61572641473335/'
const IG_URL = 'https://www.instagram.com/artdent.insumos/'
const LI_URL = 'https://linkedin.com'

function SocialIcons() {
  return (
    <div className="flex items-center gap-3">
      <a href={FB_URL} target="_blank" rel="noopener noreferrer"
        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition" aria-label="Facebook">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a href={IG_URL} target="_blank" rel="noopener noreferrer"
        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition" aria-label="Instagram">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </a>
      <a href={LI_URL} target="_blank" rel="noopener noreferrer"
        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition" aria-label="LinkedIn">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
    </div>
  )
}

function DataFiscal() {
  return (
    <div className="rounded-lg bg-white/10 p-2 backdrop-blur w-fit">
      <a href="http://qr.afip.gob.ar/?qr=4b0zvHAv83kn37jtFeGVKg,," target="_F960AFIPInfo"
        className="block group" title="Verificar datos fiscales en AFIP">
        <div className="relative overflow-hidden rounded-md bg-white p-1.5">
          <img src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="Logo de AFIP"
            className="w-20 h-20 object-contain transition-transform group-hover:scale-105" loading="lazy" />
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-white/80 group-hover:text-white transition">
          <span>Verificar</span>
          <ExternalLink size={10} />
        </div>
      </a>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="mt-8 safe-bottom">
      <div className="text-white" style={{ background: 'color-mix(in srgb, var(--brand-primary) 92%, black)' }}>
        <div className="mx-auto max-w-7xl px-4 py-12">

          {/* ── MOBILE ────────────────────────────────────────────────── */}
          <div className="md:hidden flex flex-col items-center gap-8 text-center">

            {/* Logo + descripción + redes */}
            <div className="flex flex-col items-center gap-3">
              <img src={logoBlanco} alt="ArtDent" className="h-10 w-auto" />
              <p className="text-sm text-white/90 max-w-xs leading-relaxed">
                Tu sonrisa, es nuestra prioridad. El arte de crear para toda la vida.
              </p>
              <SocialIcons />
            </div>

            {/* 4 secciones en grid 2×2 centrado, cada columna alineada a la izquierda */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 mx-auto">
              {/* E-commerce */}
              <div className="text-left">
                <p className="text-sm font-semibold">E-commerce</p>
                <ul className="mt-3 space-y-2 text-sm text-white/90">
                  <li><Link to="/productos" className="hover:text-white transition">Catálogo</Link></li>
                  <li><Link to="/comparar" className="hover:text-white transition">Comparar productos</Link></li>
                  <li><Link to="/promociones" className="hover:text-white transition">Promociones</Link></li>
                  <li><Link to="/novedades" className="hover:text-white transition">Novedades</Link></li>
                </ul>
              </div>

              {/* Empresa */}
              <div className="text-left">
                <p className="text-sm font-semibold">Empresa</p>
                <ul className="mt-3 space-y-2 text-sm text-white/90">
                  <li><Link to="/nosotros" className="hover:text-white transition">Quiénes somos</Link></li>
                  <li><Link to="/contacto" className="hover:text-white transition">Contacto</Link></li>
                  <li><Link to="/politicas" className="hover:text-white transition">Políticas</Link></li>
                </ul>
              </div>

              {/* Soporte */}
              <div className="text-left">
                <p className="text-sm font-semibold">Soporte</p>
                <ul className="mt-3 space-y-2 text-sm text-white/90">
                  <li><Link to="/ayuda" className="hover:text-white transition">Centro de ayuda</Link></li>
                  <li><Link to="/preguntas-frecuentes" className="hover:text-white transition">Preguntas frecuentes</Link></li>
                  <li><Link to="/devoluciones" className="hover:text-white transition">Devoluciones</Link></li>
                  <li><Link to="/mi-cuenta" className="hover:text-white transition">Mi cuenta</Link></li>
                </ul>
              </div>

              {/* Data Fiscal */}
              <div className="text-left">
                <p className="text-sm font-semibold mb-3">Data Fiscal</p>
                <DataFiscal />
              </div>
            </div>
          </div>

          {/* ── DESKTOP ───────────────────────────────────────────────── */}
          <div className="hidden md:grid gap-8 md:grid-cols-5">
            {/* Logo + redes */}
            <div className="md:col-span-2 lg:col-span-1">
              <img src={logoBlanco} alt="ArtDent" className="h-10 w-auto" />
              <p className="mt-3 text-sm/6 text-white/90">
                Tu sonrisa, es nuestra prioridad. El arte de crear para toda la vida.
              </p>
              <div className="mt-4">
                <SocialIcons />
              </div>
            </div>

            {/* E-commerce */}
            <div>
              <p className="text-sm font-semibold">E-commerce</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li><Link to="/productos" className="hover:text-white transition">Catálogo</Link></li>
                <li><Link to="/comparar" className="hover:text-white transition">Comparar productos</Link></li>
                <li><Link to="/promociones" className="hover:text-white transition">Promociones</Link></li>
                <li><Link to="/novedades" className="hover:text-white transition">Novedades</Link></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <p className="text-sm font-semibold">Empresa</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li><Link to="/nosotros" className="hover:text-white transition">Quiénes somos</Link></li>
                <li><Link to="/contacto" className="hover:text-white transition">Contacto</Link></li>
                <li><Link to="/politicas" className="hover:text-white transition">Políticas</Link></li>
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <p className="text-sm font-semibold">Soporte</p>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li><Link to="/ayuda" className="hover:text-white transition">Centro de ayuda</Link></li>
                <li><Link to="/preguntas-frecuentes" className="hover:text-white transition">Preguntas frecuentes</Link></li>
                <li><Link to="/devoluciones" className="hover:text-white transition">Devoluciones</Link></li>
                <li><Link to="/mi-cuenta" className="hover:text-white transition">Mi cuenta</Link></li>
              </ul>
            </div>

            {/* Data Fiscal */}
            <div>
              <p className="text-sm font-semibold mb-3">Data Fiscal</p>
              <DataFiscal />
            </div>
          </div>

          {/* ── Footer inferior ───────────────────────────────────────── */}
          <div className="mt-10 border-t border-white/20 pt-6 flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-white/80 text-center md:text-left">
              © {new Date().getFullYear()} ArtDent - Todos los derechos reservados.
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-white/80">
              <Link to="/terminos" className="hover:text-white transition">Términos y condiciones</Link>
              <Link to="/privacidad" className="hover:text-white transition">Privacidad</Link>
              <Link to="/cookies" className="hover:text-white transition">Cookies</Link>
              <Link to="/defensa-consumidor" className="hover:text-white transition">Defensa del Consumidor</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
