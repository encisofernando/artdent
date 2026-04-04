import { Link } from 'react-router-dom'
import {
  FileText,
  Lock,
  Cookie,
  Shield,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Mail,
  Scale,
  Eye,
  AlertCircle,
} from 'lucide-react'
import SEOHead from '../components/SEOHead'

// ── Políticas principales ─────────────────────────────────────────────────────
const POLICIES = [
  {
    to: '/terminos',
    icon: FileText,
    title: 'Términos y Condiciones',
    badge: 'Ley 24.240 · Código Civil y Comercial',
    color: 'border-[var(--brand-primary)]/30 hover:border-[var(--brand-primary)]',
    iconColor: 'bg-[var(--brand-primary)] text-white',
    tagColor: 'bg-[var(--brand-soft)] text-[var(--brand-primary)]',
    desc: 'Condiciones de uso del sitio, proceso de compra, precios, medios de pago, envíos y responsabilidades de ambas partes.',
    highlights: [
      'Compras disponibles para mayores de 18 años',
      'Precios en ARS con IVA incluido',
      'Contrato se perfecciona al confirmar el pago',
      'Jurisdicción: Tribunales de Formosa',
    ],
    updated: 'Marzo 2026',
  },
  {
    to: '/privacidad',
    icon: Lock,
    title: 'Política de Privacidad',
    badge: 'Ley 25.326 — Habeas Data',
    color: 'border-blue-300 hover:border-blue-500',
    iconColor: 'bg-blue-600 text-white',
    tagColor: 'bg-blue-50 text-blue-700',
    desc: 'Cómo recolectamos, utilizamos y protegemos tus datos personales, y cuáles son tus derechos ARCO.',
    highlights: [
      'No vendemos datos a terceros',
      'Datos cifrados con HTTPS/TLS',
      'Podés solicitar eliminación en cualquier momento',
      'Cumple con la Ley 25.326 y Decreto 1558/2001',
    ],
    updated: 'Marzo 2026',
  },
  {
    to: '/cookies',
    icon: Cookie,
    title: 'Política de Cookies',
    badge: 'Ley 25.326 — Datos Personales',
    color: 'border-purple-300 hover:border-purple-500',
    iconColor: 'bg-purple-600 text-white',
    tagColor: 'bg-purple-50 text-purple-700',
    desc: 'Qué cookies utilizamos (necesarias, analíticas y de marketing), cuánto duran y cómo podés deshabilitarlas.',
    highlights: [
      '3 cookies necesarias (sesión, carrito, CSRF)',
      'Google Analytics opcional (deshabilitables)',
      'Meta Pixel opcional (deshabilitables)',
      'Podés gestionar cookies desde tu navegador',
    ],
    updated: 'Marzo 2026',
  },
  {
    to: '/defensa-consumidor',
    icon: Shield,
    title: 'Defensa del Consumidor',
    badge: 'Ley 24.240 · Res. SC 424/2020',
    color: 'border-green-300 hover:border-green-500',
    iconColor: 'bg-green-600 text-white',
    tagColor: 'bg-green-50 text-green-700',
    desc: 'Datos del proveedor, botón de arrepentimiento, garantía legal, cómo hacer reclamos y organismos oficiales.',
    highlights: [
      '10 días hábiles para arrepentirse sin causa',
      '6 meses de garantía legal en productos nuevos',
      'Botón de arrepentimiento habilitado (Res. 424/2020)',
      'Reclamos ante DNDC y COPREC',
    ],
    updated: 'Marzo 2026',
  },
  {
    to: '/devoluciones',
    icon: RotateCcw,
    title: 'Política de Devoluciones',
    badge: 'Art. 34 Ley 24.240',
    color: 'border-amber-300 hover:border-amber-500',
    iconColor: 'bg-amber-500 text-white',
    tagColor: 'bg-amber-50 text-amber-700',
    desc: 'Condiciones, plazos y proceso para devolver productos o solicitar un cambio. Incluye formulario de solicitud.',
    highlights: [
      'Arrepentimiento: 10 días hábiles desde recepción',
      'Defecto/garantía: hasta 6 meses',
      'Error en envío o daño: 48 hs desde recepción',
      'Reembolso en 10 días hábiles tras aprobación',
    ],
    updated: 'Marzo 2026',
  },
]

// ── Marco legal ───────────────────────────────────────────────────────────────
const LEGAL_FRAMEWORK = [
  { ley: 'Ley 24.240', desc: 'Defensa del Consumidor y modificatorias', url: null },
  { ley: 'Ley 27.250', desc: 'Garantía legal mínima de 6 meses', url: null },
  { ley: 'Ley 26.993', desc: 'COPREC — Conciliación Previa', url: null },
  { ley: 'Ley 25.326', desc: 'Protección de Datos Personales (Habeas Data)', url: null },
  { ley: 'Decreto 1558/2001', desc: 'Reglamentación Ley 25.326', url: null },
  { ley: 'Res. SC 424/2020', desc: 'Botón de arrepentimiento en e-commerce', url: null },
  { ley: 'Ley 11.723', desc: 'Propiedad Intelectual', url: null },
  { ley: 'Cód. Civil y Comercial', desc: 'Arts. 1097–1116 — Contratos de consumo', url: null },
]

// ── Organismos ────────────────────────────────────────────────────────────────
const ORGANISMOS = [
  {
    name: 'DNDC — Defensa del Consumidor',
    desc: 'Presentá tu reclamo en línea ante la Dirección Nacional.',
    url: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario',
  },
  {
    name: 'COPREC — Conciliación',
    desc: 'Trámite gratuito previo a la acción judicial.',
    url: 'https://www.argentina.gob.ar/produccion/coprec',
  },
  {
    name: 'AAIP — Datos Personales',
    desc: 'Para denuncias sobre tratamiento indebido de datos.',
    url: 'https://www.argentina.gob.ar/aaip/datospersonales',
  },
  {
    name: 'AFIP / ARCA — Datos fiscales',
    desc: 'Verificá los datos fiscales del proveedor.',
    url: 'http://qr.afip.gob.ar/?qr=4b0zvHAv83kn37jtFeGVKg,,',
  },
]

// ── Resumen de compromisos ────────────────────────────────────────────────────
const COMMITMENTS = [
  { icon: Shield, text: 'No vendemos ni cedemos tus datos a terceros con fines comerciales' },
  { icon: Lock, text: 'Pagos procesados por MercadoPago con certificación PCI DSS nivel 1' },
  { icon: RotateCcw, text: 'Derecho de arrepentimiento garantizado por 10 días hábiles' },
  { icon: CheckCircle2, text: 'Garantía legal mínima de 6 meses en todos los productos nuevos' },
  { icon: FileText, text: 'Comprobante fiscal (factura A o B) por cada transacción' },
  { icon: Eye, text: 'Transparencia total: todas nuestras políticas están publicadas aquí' },
]

export default function Politicas() {
  return (
    <>
      <SEOHead
        title="Políticas legales, privacidad y devoluciones"
        description="Consultá en un solo lugar las políticas de ArtDent sobre términos, privacidad, cookies, defensa del consumidor y devoluciones para comprar con más confianza."
        keywords={[
          'políticas artdent',
          'devoluciones artdent',
          'privacidad artdent',
          'defensa del consumidor',
          'términos tienda odontológica',
        ]}
        url="/politicas"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Políticas', url: '/politicas' },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">

      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <Scale size={14} className="shrink-0" />
              Información legal y normativa
            </div>
            <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight">
              Políticas de ArtDent
            </h1>
            <p className="mt-3 text-white/85 text-base max-w-xl mx-auto">
              Toda la información legal, de privacidad y de uso del sitio en un solo lugar. Cumplimos con la normativa argentina vigente.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">

        {/* Nuestros compromisos */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nuestros compromisos</h2>
          <div className="card p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COMMITMENTS.map(item => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon size={16} className="shrink-0 mt-0.5 text-[var(--brand-primary)]" />
                  <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Políticas individuales */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos legales</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {POLICIES.map(policy => (
              <div
                key={policy.to}
                className={`card flex flex-col p-6 border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${policy.color}`}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${policy.iconColor}`}>
                    <policy.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${policy.tagColor}`}>
                      {policy.badge}
                    </span>
                    <h3 className="font-bold text-gray-900 leading-snug">{policy.title}</h3>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{policy.desc}</p>

                {/* Highlights */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {policy.highlights.map(h => (
                    <li key={h} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-green-500" />
                      <span className="text-xs text-gray-600 leading-snug">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400">Actualizado: {policy.updated}</span>
                  <Link
                    to={policy.to}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-primary)] hover:underline"
                  >
                    Leer completo <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Marco legal + Organismos */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Marco legal */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Marco normativo aplicable</h2>
            <div className="card overflow-hidden divide-y divide-gray-100">
              {LEGAL_FRAMEWORK.map(item => (
                <div key={item.ley} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition">
                  <Scale size={14} className="shrink-0 mt-0.5 text-[var(--brand-primary)]" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm text-[var(--brand-primary)]">{item.ley}</span>
                    <span className="text-sm text-gray-600 ml-2">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Organismos */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Organismos oficiales</h2>
            <div className="space-y-3">
              {ORGANISMOS.map(org => (
                <a
                  key={org.url}
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex items-start gap-4 p-4 hover:border-[var(--brand-primary)]/40 border-2 border-transparent hover:-translate-y-0.5 hover:shadow-sm transition-all group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 group-hover:bg-[var(--brand-primary)]/20 transition">
                    <ExternalLink size={16} className="text-[var(--brand-primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 leading-snug">{org.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{org.desc}</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-gray-300 group-hover:text-[var(--brand-primary)] mt-0.5 transition" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Datos del proveedor */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Datos del proveedor</h2>
          <div className="card p-6">
            <div className="grid gap-0 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="pb-4 sm:pb-0 sm:pr-6 space-y-3">
                {[
                  { label: 'Razón social', value: 'Centurion Roxana Paola' },
                  { label: 'CUIT / CUIL', value: '23-29070589-4' },
                  { label: 'Domicilio', value: 'B° Sagrado Corazón Mz 40 Casa 2, Formosa Capital, Formosa' },
                  { label: 'Horario de atención', value: 'Lunes a Viernes de 8:00 a 14:00 hs' },
                ].map(row => (
                  <div key={row.label} className="flex flex-col sm:flex-row sm:gap-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-400 sm:w-36 shrink-0">{row.label}</span>
                    <span className="text-sm text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-3">
                {[
                  { label: 'Email', value: 'ventas@artdent.com.ar', href: 'mailto:ventas@artdent.com.ar' },
                  { label: 'Teléfono / WA', value: '+54 3704-995406', href: 'https://wa.me/5493704995406' },
                ].map(row => (
                  <div key={row.label} className="flex flex-col sm:flex-row sm:gap-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-400 sm:w-36 shrink-0">{row.label}</span>
                    <a href={row.href} className="text-sm text-[var(--brand-primary)] hover:underline">{row.value}</a>
                  </div>
                ))}
                <div className="pt-3 mt-1 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">
                    Para ejercer derechos ARCO (acceso, rectificación, supresión u oposición sobre tus datos personales):
                  </p>
                  <a
                    href="mailto:ventas@artdent.com.ar?subject=Ejercicio%20derechos%20ARCO%20%E2%80%93%20Datos%20Personales"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition"
                  >
                    <Mail size={14} />
                    Ejercer derechos ARCO
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Aviso importante */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-4">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-bold text-amber-900 mb-1">Aviso de actualización</p>
            <p>
              ArtDent puede modificar estas políticas en cualquier momento. Los cambios entrarán en vigencia desde su publicación en este sitio.
              Se notificarán cambios sustanciales por correo electrónico con al menos{' '}
              <strong>15 días hábiles</strong> de anticipación. El uso continuado del sitio implica la aceptación de las condiciones vigentes.
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t bg-white py-6 mt-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500 space-y-1">
          <p>
            Todas las políticas cumplen con la legislación argentina vigente.
            Última actualización general: <strong>marzo de 2026</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {POLICIES.map(p => (
              <Link key={p.to} to={p.to} className="hover:text-[var(--brand-primary)] transition">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
