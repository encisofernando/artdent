import { Link } from 'react-router-dom'
import {
  Cookie,
  Shield,
  BarChart2,
  Megaphone,
  Settings,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Info,
  Lock,
} from 'lucide-react'

type SectionProps = {
  id: string
  icon: React.ElementType
  title: string
  num: string
  children: React.ReactNode
}

function Section({ id, icon: Icon, title, num, children }: SectionProps) {
  return (
    <section id={id} className="card p-5 md:p-7 scroll-mt-24">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
          <Icon size={20} className="text-[var(--brand-primary)]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-widest mb-0.5">
            Sección {num}
          </p>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

type CookieRowProps = {
  nombre: string
  proveedor: string
  finalidad: string
  duracion: string
  tipo: 'necesaria' | 'analitica' | 'marketing'
}

function CookieBadge({ tipo }: { tipo: CookieRowProps['tipo'] }) {
  const map = {
    necesaria: 'bg-gray-100 text-gray-700',
    analitica: 'bg-blue-100 text-blue-700',
    marketing: 'bg-purple-100 text-purple-700',
  }
  const label = { necesaria: 'Necesaria', analitica: 'Analítica', marketing: 'Marketing' }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tipo]}`}>
      {label[tipo]}
    </span>
  )
}

const COOKIES: CookieRowProps[] = [
  {
    nombre: 'artdent_session',
    proveedor: 'ARTDENT',
    finalidad: 'Mantiene la sesión autenticada del usuario.',
    duracion: 'Sesión',
    tipo: 'necesaria',
  },
  {
    nombre: 'artdent_cart',
    proveedor: 'ARTDENT',
    finalidad: 'Conserva los productos en el carrito de compras.',
    duracion: '30 días',
    tipo: 'necesaria',
  },
  {
    nombre: 'XSRF-TOKEN',
    proveedor: 'ARTDENT',
    finalidad: 'Protección contra ataques CSRF (falsificación de solicitudes entre sitios).',
    duracion: 'Sesión',
    tipo: 'necesaria',
  },
  {
    nombre: '_ga, _ga_*',
    proveedor: 'Google Analytics',
    finalidad: 'Distingue usuarios únicos y registra sesiones para análisis de tráfico.',
    duracion: '2 años / 13 meses',
    tipo: 'analitica',
  },
  {
    nombre: '_gid',
    proveedor: 'Google Analytics',
    finalidad: 'Distingue usuarios para análisis de navegación.',
    duracion: '24 horas',
    tipo: 'analitica',
  },
  {
    nombre: '_gat',
    proveedor: 'Google Analytics',
    finalidad: 'Limita la tasa de solicitudes enviadas a Google Analytics.',
    duracion: '1 minuto',
    tipo: 'analitica',
  },
  {
    nombre: '_fbp',
    proveedor: 'Meta (Facebook)',
    finalidad: 'Identifica navegadores para medir la efectividad de anuncios en Facebook/Instagram.',
    duracion: '90 días',
    tipo: 'marketing',
  },
  {
    nombre: '_fbc',
    proveedor: 'Meta (Facebook)',
    finalidad: 'Almacena el último parámetro fbclid de un enlace de anuncio de Facebook.',
    duracion: '90 días',
    tipo: 'marketing',
  },
]

const TOC = [
  { href: '#que-son', label: '¿Qué son las cookies?' },
  { href: '#tipos', label: 'Tipos de cookies' },
  { href: '#listado', label: 'Cookies que utilizamos' },
  { href: '#terceros', label: 'Cookies de terceros' },
  { href: '#gestion', label: 'Cómo gestionar cookies' },
  { href: '#no-cookie', label: 'Tecnologías similares' },
  { href: '#cambios', label: 'Cambios en esta política' },
]

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <Cookie size={15} />
              Ley 25.326 — Protección de Datos Personales
            </div>
            <h1 className="text-2xl font-bold md:text-4xl">Política de Cookies</h1>
            <p className="mt-3 text-base text-white/90 max-w-xl mx-auto">
              Explicamos qué cookies usamos, para qué sirven y cómo podés gestionarlas o deshabilitarlas.
            </p>
            <p className="mt-2 text-xs text-white/70">Última actualización: marzo de 2026</p>
          </div>
        </div>
      </section>

      {/* Índice */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 overflow-x-auto">
          <nav className="flex items-center gap-1 text-xs font-medium text-gray-600 whitespace-nowrap">
            {TOC.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition"
              >
                <ChevronRight size={12} />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">

            <Section id="que-son" icon={Info} title="¿Qué son las cookies?" num="1">
              <p>
                Las cookies son pequeños archivos de texto que los sitios web depositan en tu dispositivo (computadora, teléfono o tablet) cuando los visitás. Permiten que el sitio recuerde información sobre tu visita: el idioma preferido, si iniciaste sesión, qué productos agregaste al carrito, entre otros.
              </p>
              <p>
                Su uso está regulado en Argentina por la <strong>Ley 25.326 de Protección de Datos Personales</strong> y su decreto reglamentario <strong>1558/2001</strong>, que establecen los principios de finalidad, proporcionalidad y consentimiento informado para el tratamiento de datos personales, incluyendo los recolectados mediante cookies.
              </p>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-blue-800">
                  Las cookies <strong>necesarias</strong> para el funcionamiento del sitio (sesión, carrito, seguridad) no requieren tu consentimiento previo. Las cookies <strong>analíticas y de marketing</strong> son opcionales: podés deshabilitarlas siguiendo las instrucciones de la sección <a href="#gestion" className="underline font-semibold">Gestión de cookies</a>.
                </p>
              </div>
            </Section>

            <Section id="tipos" icon={Cookie} title="Tipos de cookies que utilizamos" num="2">
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: Lock,
                    tipo: 'Necesarias',
                    color: 'border-gray-200 bg-gray-50',
                    iconColor: 'text-gray-600',
                    badge: 'bg-gray-100 text-gray-700',
                    desc: 'Imprescindibles para el funcionamiento del sitio. Sin ellas no podrías iniciar sesión, usar el carrito ni completar una compra. No pueden deshabilitarse.',
                  },
                  {
                    icon: BarChart2,
                    tipo: 'Analíticas',
                    color: 'border-blue-100 bg-blue-50',
                    iconColor: 'text-blue-600',
                    badge: 'bg-blue-100 text-blue-700',
                    desc: 'Nos permiten medir el tráfico y entender cómo los usuarios interactúan con el sitio para mejorarlo. Los datos son anonimizados o seudonimizados.',
                  },
                  {
                    icon: Megaphone,
                    tipo: 'Marketing',
                    color: 'border-purple-100 bg-purple-50',
                    iconColor: 'text-purple-600',
                    badge: 'bg-purple-100 text-purple-700',
                    desc: 'Utilizadas por plataformas publicitarias (Meta/Facebook) para medir la efectividad de campañas. Son opcionales y podés rechazarlas.',
                  },
                ].map((item) => (
                  <div key={item.tipo} className={`rounded-xl border p-4 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon size={16} className={item.iconColor} />
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${item.badge}`}>
                        {item.tipo}
                      </span>
                    </div>
                    <p className="text-gray-700">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="listado" icon={Settings} title="Listado completo de cookies" num="3">
              <p>A continuación detallamos todas las cookies que puede depositar este sitio en tu dispositivo:</p>
              <div className="overflow-x-auto mt-2 rounded-xl border border-gray-200">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">Cookie</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">Proveedor</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200 min-w-[200px]">Finalidad</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">Duración</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-gray-700 border-b border-gray-200">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIES.map((row, i) => (
                      <tr key={row.nombre} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2.5 border-b border-gray-100 font-mono font-medium text-gray-900 whitespace-nowrap">{row.nombre}</td>
                        <td className="px-3 py-2.5 border-b border-gray-100 text-gray-600 whitespace-nowrap">{row.proveedor}</td>
                        <td className="px-3 py-2.5 border-b border-gray-100 text-gray-600">{row.finalidad}</td>
                        <td className="px-3 py-2.5 border-b border-gray-100 text-gray-600 whitespace-nowrap">{row.duracion}</td>
                        <td className="px-3 py-2.5 border-b border-gray-100">
                          <CookieBadge tipo={row.tipo} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="terceros" icon={Shield} title="Cookies de terceros" num="4">
              <p>
                Algunas cookies son depositadas por servicios de terceros que utilizamos. Estos proveedores tienen sus propias políticas de privacidad:
              </p>
              <div className="space-y-3">
                {[
                  {
                    nombre: 'Google Analytics',
                    desc: 'Servicio de análisis web de Google LLC. Procesa datos de navegación para generar estadísticas agregadas de uso del sitio. Los datos se anonomizan antes de ser enviados.',
                    url: 'https://policies.google.com/privacy',
                    optOut: 'https://tools.google.com/dlpage/gaoptout',
                    optOutLabel: 'Complemento de inhabilitación',
                  },
                  {
                    nombre: 'Meta Pixel (Facebook / Instagram)',
                    desc: 'Herramienta de medición de Meta Platforms Inc. que permite evaluar la efectividad de la publicidad en Facebook e Instagram.',
                    url: 'https://www.facebook.com/privacy/policy/',
                    optOut: 'https://www.facebook.com/ads/preferences',
                    optOutLabel: 'Configuración de anuncios de Facebook',
                  },
                  {
                    nombre: 'MercadoPago',
                    desc: 'Plataforma de pagos de MercadoLibre S.R.L. Puede depositar cookies durante el proceso de checkout para el correcto funcionamiento del pago seguro.',
                    url: 'https://www.mercadopago.com.ar/privacidad',
                    optOut: null,
                    optOutLabel: null,
                  },
                ].map((item) => (
                  <div key={item.nombre} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900 mb-1">{item.nombre}</p>
                    <p className="text-gray-600 mb-2">{item.desc}</p>
                    <div className="flex flex-wrap gap-3">
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline">
                        Política de privacidad <ExternalLink size={11} />
                      </a>
                      {item.optOut && (
                        <a href={item.optOut} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[var(--brand-primary)] hover:underline">
                          {item.optOutLabel} <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="gestion" icon={Settings} title="Cómo gestionar o deshabilitar cookies" num="5">
              <p>
                Podés controlar y/o eliminar las cookies como desees. Tenés la opción de eliminar todas las cookies que ya están en tu dispositivo y configurar la mayoría de los navegadores para que no las acepten. Sin embargo, si deshabilitás las cookies <strong>necesarias</strong>, es posible que algunas funciones del sitio (como el carrito o la sesión) no funcionen correctamente.
              </p>

              <p className="font-semibold text-gray-900 mt-2">Instrucciones por navegador:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { nombre: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                  { nombre: 'Mozilla Firefox', url: 'https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en' },
                  { nombre: 'Microsoft Edge', url: 'https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
                  { nombre: 'Apple Safari', url: 'https://support.apple.com/es-ar/guide/safari/sfri11471/mac' },
                  { nombre: 'Safari iOS (iPhone / iPad)', url: 'https://support.apple.com/es-ar/HT201265' },
                  { nombre: 'Android (Chrome)', url: 'https://support.google.com/chrome/answer/95647?co=GENIE.Platform%3DAndroid' },
                ].map((browser) => (
                  <a
                    key={browser.nombre}
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
                  >
                    <span className="font-medium text-gray-900">{browser.nombre}</span>
                    <ExternalLink size={14} className="text-gray-400 shrink-0" />
                  </a>
                ))}
              </div>

              <p className="font-semibold text-gray-900 mt-2">Inhabilitación específica por servicio:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-1">
                <li>
                  <strong>Google Analytics:</strong> instalá el{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
                    className="text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1">
                    complemento oficial de inhabilitación <ExternalLink size={11} />
                  </a>.
                </li>
                <li>
                  <strong>Meta Pixel:</strong> configurá tus preferencias de anuncios en{' '}
                  <a href="https://www.facebook.com/ads/preferences" target="_blank" rel="noopener noreferrer"
                    className="text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1">
                    Facebook Ad Preferences <ExternalLink size={11} />
                  </a>.
                </li>
                <li>
                  <strong>Publicidad basada en intereses:</strong> podés optar por no participar a través de{' '}
                  <a href="http://www.youronlinechoices.com/ar/" target="_blank" rel="noopener noreferrer"
                    className="text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1">
                    Your Online Choices <ExternalLink size={11} />
                  </a>.
                </li>
              </ul>
            </Section>

            <Section id="no-cookie" icon={Info} title="Tecnologías similares" num="6">
              <p>
                Además de cookies, podemos utilizar tecnologías similares para almacenar información en tu dispositivo:
              </p>
              <div className="space-y-3">
                {[
                  {
                    nombre: 'localStorage / sessionStorage',
                    desc: 'Almacenamiento local del navegador utilizado para guardar el estado del carrito y preferencias de la sesión actual. Los datos no se envían al servidor en cada solicitud y se eliminan al cerrar la pestaña (sessionStorage) o pueden persistir (localStorage). No están sujetos a las mismas restricciones que las cookies de terceros.',
                  },
                  {
                    nombre: 'Píxeles de seguimiento (web beacons)',
                    desc: 'Imágenes de 1×1 píxel transparentes que pueden estar incorporadas en páginas web o emails para medir si fueron visualizados. El Meta Pixel puede utilizar esta técnica de forma complementaria.',
                  },
                ].map((item) => (
                  <div key={item.nombre} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900 mb-1">{item.nombre}</p>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="cambios" icon={RefreshCw} title="Cambios en esta política" num="7">
              <p>
                Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en los servicios que utilizamos o en la normativa aplicable. La versión actualizada estará siempre disponible en{' '}
                <Link to="/cookies" className="text-[var(--brand-primary)] hover:underline">artdent.com.ar/cookies</Link>{' '}
                con la fecha de última actualización indicada al inicio.
              </p>
              <p>
                Para consultas sobre el uso de cookies o el tratamiento de tus datos personales, escribinos a{' '}
                <a href="mailto:ventas@artdent.com.ar?subject=Consulta%20sobre%20cookies"
                  className="text-[var(--brand-primary)] hover:underline">
                  ventas@artdent.com.ar
                </a>.
              </p>
            </Section>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Resumen de cookies</h3>
              <div className="space-y-2">
                {[
                  { label: 'Necesarias', count: COOKIES.filter(c => c.tipo === 'necesaria').length, badge: 'bg-gray-100 text-gray-700' },
                  { label: 'Analíticas', count: COOKIES.filter(c => c.tipo === 'analitica').length, badge: 'bg-blue-100 text-blue-700' },
                  { label: 'Marketing', count: COOKIES.filter(c => c.tipo === 'marketing').length, badge: 'bg-purple-100 text-purple-700' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.badge}`}>{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count} cookie{item.count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Gestión rápida</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Google Analytics opt-out', url: 'https://tools.google.com/dlpage/gaoptout' },
                  { label: 'Facebook Ad Preferences', url: 'https://www.facebook.com/ads/preferences' },
                  { label: 'Your Online Choices', url: 'http://www.youronlinechoices.com/ar/' },
                ].map((item) => (
                  <li key={item.url}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-[var(--brand-primary)] hover:opacity-80 font-medium transition">
                      <span>{item.label}</span>
                      <ExternalLink size={13} className="shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Marco normativo</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                {[
                  { ley: 'Ley 25.326', desc: 'Protección de Datos Personales' },
                  { ley: 'Decreto 1558/2001', desc: 'Reglamentación Ley 25.326' },
                  { ley: 'Res. 47/2018 AAIP', desc: 'Disposiciones complementarias' },
                ].map((item) => (
                  <li key={item.ley} className="flex justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-[var(--brand-primary)] whitespace-nowrap">{item.ley}</span>
                    <span className="text-gray-600 text-right">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Ver también</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { to: '/privacidad', label: 'Política de privacidad' },
                  { to: '/terminos', label: 'Términos y condiciones' },
                  { to: '/defensa-consumidor', label: 'Defensa del consumidor' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="flex items-center gap-1.5 text-gray-700 hover:text-[var(--brand-primary)] transition">
                      <ChevronRight size={14} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500">
          <p>
            Esta Política de Cookies cumple con lo dispuesto por la <strong>Ley 25.326</strong> de Protección de los Datos Personales de la República Argentina.
          </p>
          <p className="mt-1">Última actualización: marzo de 2026</p>
        </div>
      </div>
    </div>
  )
}
