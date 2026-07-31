import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  Truck,
  RotateCcw,
  CreditCard,
  User,
  FileText,
  Shield,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Star,
} from 'lucide-react'
import SEOHead from '../components/SEOHead'

// ── Acciones rápidas ──────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: 'Rastrear mi pedido',
    desc: 'Seguí el estado de tu envío en tiempo real',
    icon: Truck,
    to: '/mi-cuenta',
    color: 'border-blue-200 bg-blue-50 hover:border-blue-400',
    iconColor: 'text-blue-600 bg-blue-100',
  },
  {
    label: 'Solicitar devolución',
    desc: 'Iniciá el proceso de cambio o reembolso',
    icon: RotateCcw,
    to: '/devoluciones',
    color: 'border-amber-200 bg-amber-50 hover:border-amber-400',
    iconColor: 'text-amber-600 bg-amber-100',
  },
  {
    label: 'Preguntas frecuentes',
    desc: '35+ respuestas a las dudas más comunes',
    icon: HelpCircle,
    to: '/preguntas-frecuentes',
    color: 'border-purple-200 bg-purple-50 hover:border-purple-400',
    iconColor: 'text-purple-600 bg-purple-100',
  },
  {
    label: 'Contactar soporte',
    desc: 'Hablá con nuestro equipo por WhatsApp o email',
    icon: MessageCircle,
    to: '/contacto',
    color: 'border-green-200 bg-green-50 hover:border-green-400',
    iconColor: 'text-green-600 bg-green-100',
  },
]

// ── Categorías de ayuda ───────────────────────────────────────────────────────
const HELP_CATEGORIES = [
  {
    id: 'compras',
    icon: ShoppingCart,
    title: 'Compras y pedidos',
    color: 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10',
    articles: [
      { title: '¿Cómo realizo mi primera compra?', anchor: 'compras', popular: true },
      { title: '¿Necesito cuenta para comprar?', anchor: 'compras' },
      { title: 'Cómo modificar o cancelar un pedido', anchor: 'compras', popular: true },
      { title: 'Compras al por mayor', anchor: 'compras' },
    ],
  },
  {
    id: 'pagos',
    icon: CreditCard,
    title: 'Pagos y facturación',
    color: 'text-blue-600 bg-blue-50',
    articles: [
      { title: 'Medios de pago aceptados', anchor: 'pagos', popular: true },
      { title: 'Pago en cuotas con tarjeta', anchor: 'pagos', popular: true },
      { title: 'Por qué se rechazó mi pago', anchor: 'pagos' },
      { title: 'Cómo solicitar factura A', anchor: 'facturacion' },
    ],
  },
  {
    id: 'envios',
    icon: Truck,
    title: 'Envíos y entregas',
    color: 'text-green-600 bg-green-50',
    articles: [
      { title: 'Plazos de entrega por zona', anchor: 'envios', popular: true },
      { title: 'Costo de envío y envío gratuito', anchor: 'envios' },
      { title: 'Cómo rastrear mi pedido', anchor: 'envios', popular: true },
      { title: 'Qué pasa si no estoy al recibir', anchor: 'envios' },
    ],
  },
  {
    id: 'devoluciones',
    icon: RotateCcw,
    title: 'Devoluciones y garantía',
    color: 'text-amber-600 bg-amber-50',
    articles: [
      { title: 'Derecho de arrepentimiento — 10 días', anchor: 'devoluciones', popular: true },
      { title: 'Garantía legal de 6 meses', anchor: 'devoluciones', popular: true },
      { title: 'Cómo iniciar una devolución', anchor: 'devoluciones' },
      { title: 'Cuándo se acredita el reembolso', anchor: 'devoluciones' },
    ],
  },
  {
    id: 'productos',
    icon: Package,
    title: 'Productos',
    color: 'text-purple-600 bg-purple-50',
    articles: [
      { title: 'Originalidad y proveedores', anchor: 'productos' },
      { title: 'Stock en tiempo real', anchor: 'productos', popular: true },
      { title: 'Solicitar producto no disponible', anchor: 'productos' },
      { title: 'Normativa ANMAT y habilitaciones', anchor: 'productos' },
    ],
  },
  {
    id: 'cuenta',
    icon: User,
    title: 'Mi cuenta',
    color: 'text-indigo-600 bg-indigo-50',
    articles: [
      { title: 'Crear una cuenta nueva', anchor: 'cuenta' },
      { title: 'Recuperar contraseña olvidada', anchor: 'cuenta', popular: true },
      { title: 'Actualizar datos personales', anchor: 'cuenta' },
      { title: 'Ver historial de pedidos', anchor: 'cuenta' },
    ],
  },
]

// ── Guías paso a paso ─────────────────────────────────────────────────────────
const GUIDES = [
  {
    icon: ShoppingCart,
    title: 'Cómo hacer tu primera compra',
    steps: [
      'Navegá el catálogo y encontrá el producto',
      'Hacé clic en "Agregar al carrito"',
      'Revisá el carrito y hacé clic en "Finalizar compra"',
      'Ingresá tu dirección de envío',
      'Elegí el medio de pago y confirmá',
      'Recibirás el email de confirmación',
    ],
    cta: { label: 'Ver catálogo', to: '/productos' },
    color: 'border-[var(--brand-primary)]/20 bg-[var(--brand-soft)]',
    iconColor: 'bg-[var(--brand-primary)] text-white',
  },
  {
    icon: RotateCcw,
    title: 'Cómo solicitar una devolución',
    steps: [
      'Ingresá a artdent.com.ar/devoluciones',
      'Completá el formulario con tu número de pedido',
      'Indicá el motivo (arrepentimiento, defecto, etc.)',
      'Elegí tu preferencia: reembolso o cambio',
      'Te confirmamos en 48 hs hábiles',
      'Coordinamos el retiro o envío del producto',
    ],
    cta: { label: 'Ir al formulario', to: '/devoluciones' },
    color: 'border-amber-200 bg-amber-50',
    iconColor: 'bg-amber-500 text-white',
  },
]

// ── Estado del pedido ─────────────────────────────────────────────────────────
const ORDER_STATES = [
  { label: 'Pago confirmado', desc: 'Tu pago fue procesado correctamente.', icon: CreditCard, color: 'text-green-600' },
  { label: 'En preparación', desc: 'Estamos armando tu pedido.', icon: Package, color: 'text-blue-600' },
  { label: 'Despachado', desc: 'Tu pedido salió del depósito hacia la empresa de correo.', icon: Truck, color: 'text-[var(--brand-primary)]' },
  { label: 'En camino', desc: 'Tu pedido está en tránsito hacia tu domicilio.', icon: ArrowRight, color: 'text-amber-600' },
  { label: 'Entregado', desc: 'El pedido fue entregado en el domicilio informado.', icon: CheckCircle2, color: 'text-green-600' },
]

// ── Búsqueda simple que redirige a FAQ ────────────────────────────────────────
function HeroSearch() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/preguntas-frecuentes?q=${encodeURIComponent(q.trim())}`)
  }
  return (
    <form onSubmit={handleSearch} className="relative mt-6 max-w-lg mx-auto">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      <input
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="¿En qué podemos ayudarte?"
        className="w-full pl-11 pr-28 py-3.5 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60 shadow-lg"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white text-xs font-bold px-4 py-2 rounded-lg transition"
      >
        Buscar
      </button>
    </form>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function Ayuda() {
  return (
    <>
      <SEOHead
        title="Centro de ayuda y soporte"
        description="Accedé al centro de ayuda de ArtDent para resolver dudas sobre pedidos, envíos, pagos, devoluciones y uso del shop odontológico."
        keywords={[
          'ayuda artdent',
          'soporte e-commerce odontológico',
          'seguimiento de pedidos artdent',
          'devoluciones artdent',
          'centro de ayuda odontología',
        ]}
        url="/ayuda"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Ayuda', url: '/ayuda' },
        ]}
      />

      <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <Star size={14} className="shrink-0" />
              Centro de ayuda ArtDent
            </div>
            <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight">
              ¿Cómo podemos ayudarte?
            </h1>
            <p className="mt-3 text-white/85 text-base max-w-xl mx-auto">
              Todo lo que necesitás saber sobre tus compras, envíos, pagos y más en un solo lugar.
            </p>
            <HeroSearch />
            <p className="mt-3 text-xs text-white/60">
              Ej: "¿cómo cancelo un pedido?", "factura A", "tiempo de entrega"
            </p>
          </div>
        </div>
      </section>

      {/* Acciones rápidas */}
      <div className="mx-auto max-w-7xl px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.label}
              to={action.to}
              className={`card flex flex-col items-start gap-3 p-4 border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${action.color}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.iconColor}`}>
                <action.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-snug">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug hidden sm:block">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">

        {/* Categorías de ayuda */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Explorar por tema</h2>
            <Link to="/preguntas-frecuentes" className="text-sm text-[var(--brand-primary)] hover:underline font-medium flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_CATEGORIES.map(cat => (
              <div key={cat.id} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cat.color}`}>
                    <cat.icon size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900">{cat.title}</h3>
                </div>
                <ul className="space-y-2">
                  {cat.articles.map(art => (
                    <li key={art.title}>
                      <Link
                        to={`/preguntas-frecuentes#${art.anchor}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--brand-primary)] transition group"
                      >
                        <ChevronRight size={13} className="shrink-0 text-gray-300 group-hover:text-[var(--brand-primary)]" />
                        <span className="leading-snug">{art.title}</span>
                        {art.popular && (
                          <span className="ml-auto shrink-0 text-[10px] font-bold text-[var(--brand-primary)] bg-[var(--brand-soft)] px-1.5 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/preguntas-frecuentes#${cat.id}`}
                  className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  Ver todo sobre {cat.title.toLowerCase()} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Guías paso a paso */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Guías paso a paso</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {GUIDES.map(guide => (
              <div key={guide.title} className={`card p-6 border-2 ${guide.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${guide.iconColor}`}>
                    <guide.icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{guide.title}</h3>
                </div>
                <ol className="space-y-2.5">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 text-xs font-extrabold text-gray-600 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700 leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
                <Link
                  to={guide.cta.to}
                  className="mt-5 inline-flex items-center gap-2 btn btn-primary text-sm py-2.5"
                >
                  {guide.cta.label} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Estado de un pedido */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Dónde está mi pedido?</h2>
          <div className="card p-6">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div>
                <p className="text-sm text-gray-600 mb-5">
                  Una vez realizado el pedido, pasa por estos estados. Podés ver el estado actual en <strong>Mi cuenta → Mis pedidos</strong> o en el email de confirmación.
                </p>
                <div className="space-y-4">
                  {ORDER_STATES.map((s, i) => (
                    <div key={s.label} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 border-2 border-gray-200 ${s.color}`}>
                          <s.icon size={14} />
                        </div>
                        {i < ORDER_STATES.length - 1 && <div className="w-px h-6 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pt-1 pb-2">
                        <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
                  <Clock size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Plazos estimados de entrega</p>
                    <ul className="mt-1.5 space-y-1 text-xs text-blue-800">
                      <li><strong>Formosa Capital:</strong> 1–3 días hábiles</li>
                      <li><strong>Interior del país:</strong> 3–8 días hábiles</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">¿No recibiste el email de seguimiento?</p>
                    <p className="text-xs text-amber-800 mt-1">
                      Revisá la carpeta de spam. Si tampoco está ahí, escribinos con tu número de pedido.
                    </p>
                  </div>
                </div>
                <Link
                  to="/mi-cuenta"
                  className="flex items-center justify-center gap-2 btn btn-primary w-full py-3 text-sm"
                >
                  <Truck size={15} />
                  Ver mis pedidos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tus derechos como consumidor */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tus derechos como consumidor</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: RotateCcw,
                title: '10 días para arrepentirte',
                desc: 'Podés devolver cualquier compra sin explicar el motivo dentro de los 10 días hábiles de recibirla. Sin preguntas.',
                badge: 'Art. 34 Ley 24.240',
                color: 'border-amber-200',
                iconColor: 'text-amber-600 bg-amber-50',
              },
              {
                icon: Shield,
                title: '6 meses de garantía',
                desc: 'Todos los productos nuevos tienen garantía legal mínima de 6 meses contra defectos de fabricación.',
                badge: 'Art. 11 Ley 24.240',
                color: 'border-blue-200',
                iconColor: 'text-blue-600 bg-blue-50',
              },
              {
                icon: FileText,
                title: 'Factura por toda compra',
                desc: 'Tenés derecho a recibir comprobante fiscal por cada transacción. Podés solicitar factura A o B.',
                badge: 'Obligatorio por ley',
                color: 'border-green-200',
                iconColor: 'text-green-600 bg-green-50',
              },
            ].map(item => (
              <div key={item.title} className={`card p-5 border-l-4 ${item.color}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${item.iconColor}`}>
                  <item.icon size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.badge}</span>
                <h3 className="font-bold text-gray-900 mt-1 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link to="/defensa-consumidor" className="text-sm font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
              Ver más sobre tus derechos <ArrowRight size={13} />
            </Link>
            <Link to="/devoluciones" className="text-sm font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
              Política de devoluciones <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* Contacto */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contactar con soporte</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/5493704995406?text=Hola%2C+necesito+ayuda+con+mi+pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex flex-col items-center text-center gap-3 hover:border-green-400 border-2 border-transparent hover:-translate-y-0.5 hover:shadow-md transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 32 32" width="24" height="24" fill="white">
                  <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.627 4.64 1.813 6.667L2.667 29.333l6.88-1.786A13.28 13.28 0 0 0 16.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 2.4c6.04 0 10.929 4.889 10.929 10.933 0 6.04-4.889 10.933-10.93 10.933a10.888 10.888 0 0 1-5.546-1.52l-.4-.24-4.08 1.067 1.093-3.973-.267-.413A10.87 10.87 0 0 1 5.075 16c0-6.04 4.889-10.933 10.929-10.933zm-3.2 5.466c-.267 0-.693.107-.96.373-.267.267-1.013 1-1.013 2.453s1.04 2.84 1.187 3.04c.16.2 2.027 3.147 4.96 4.293 2.453.96 2.947.773 3.48.72.533-.053 1.707-.693 1.947-1.36.24-.667.24-1.24.16-1.36-.08-.12-.267-.2-.56-.347s-1.707-.84-1.973-.933c-.267-.107-.467-.16-.667.16-.2.32-.76.933-.933 1.12-.173.2-.347.213-.64.08-.293-.133-1.24-.453-2.36-1.453-.88-.773-1.467-1.733-1.64-2.027-.173-.293-.013-.453.133-.6.133-.133.293-.347.44-.52.147-.173.2-.293.293-.493.107-.2.053-.373-.013-.52-.067-.147-.64-1.573-.88-2.147-.24-.573-.48-.48-.667-.48l-.56-.013z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-500 mt-0.5">+54 3704-995406</p>
                <p className="text-xs text-green-600 font-semibold mt-1">Respuesta rápida</p>
              </div>
              <span className="text-xs text-gray-500">Lun–Vie · 8:00 a 14:00 hs</span>
            </a>

            {/* Email */}
            <a
              href="mailto:ventas@artdent.com.ar"
              className="card p-5 flex flex-col items-center text-center gap-3 hover:border-[var(--brand-primary)]/40 border-2 border-transparent hover:-translate-y-0.5 hover:shadow-md transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white group-hover:scale-105 transition-transform">
                <Mail size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Email</p>
                <p className="text-xs text-gray-500 mt-0.5">ventas@artdent.com.ar</p>
                <p className="text-xs text-[var(--brand-primary)] font-semibold mt-1">Respuesta en 24 hs</p>
              </div>
              <span className="text-xs text-gray-500">Para consultas detalladas</span>
            </a>

            {/* Formulario */}
            <Link
              to="/contacto"
              className="card p-5 flex flex-col items-center text-center gap-3 hover:border-gray-400 border-2 border-transparent hover:-translate-y-0.5 hover:shadow-md transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-700 text-white group-hover:scale-105 transition-transform">
                <Phone size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Formulario</p>
                <p className="text-xs text-gray-500 mt-0.5">artdent.com.ar/contacto</p>
                <p className="text-xs text-gray-500 font-semibold mt-1">Con adjunto de archivos</p>
              </div>
              <span className="text-xs text-gray-500">Para reclamos y garantías</span>
            </Link>
          </div>
        </section>

        {/* Links legales */}
        <section className="card p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Información legal y normativa</h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {[
              { to: '/defensa-consumidor', label: 'Defensa del consumidor', icon: Shield },
              { to: '/devoluciones', label: 'Devoluciones y cambios', icon: RotateCcw },
              { to: '/terminos', label: 'Términos y condiciones', icon: FileText },
              { to: '/privacidad', label: 'Política de privacidad', icon: User },
              { to: '/cookies', label: 'Política de cookies', icon: FileText },
              {
                href: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario',
                label: 'Reclamo ante DNDC',
                icon: ExternalLink,
                external: true,
              },
            ].map(link => (
              <div key={link.label}>
                {'href' in link ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-primary)] transition"
                  >
                    <link.icon size={14} className="shrink-0 text-gray-500" />
                    {link.label}
                    <ExternalLink size={11} className="ml-auto text-gray-300" />
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-primary)] transition"
                  >
                    <link.icon size={14} className="shrink-0 text-gray-500" />
                    {link.label}
                    <ChevronRight size={13} className="ml-auto text-gray-300" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="border-t bg-white py-6 mt-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500">
          <p>
            Centro de ayuda ArtDent · Lunes a Viernes de 8:00 a 14:00 hs ·{' '}
            <a href="mailto:ventas@artdent.com.ar" className="text-[var(--brand-primary)] hover:underline">
              ventas@artdent.com.ar
            </a>
          </p>
          <p className="mt-1">
            Toda la información está sujeta a la <Link to="/terminos" className="hover:underline">normativa vigente</Link> en Argentina.
          </p>
        </div>
      </div>
      </div>
    </>
  )
}
