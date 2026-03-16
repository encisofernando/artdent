import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  HelpCircle,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Package,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
  Phone,
  Mail,
  MessageCircle,
  X,
} from 'lucide-react'

// ── Tipos ─────────────────────────────────────────────────────────────────────
type FAQItem = {
  q: string
  a: string | React.ReactNode
}

type FAQCategory = {
  id: string
  label: string
  icon: React.ElementType
  color: string
  items: FAQItem[]
}

// ── Datos ─────────────────────────────────────────────────────────────────────
const CATEGORIES: FAQCategory[] = [
  {
    id: 'compras',
    label: 'Compras y pedidos',
    icon: ShoppingCart,
    color: 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10',
    items: [
      {
        q: '¿Cómo realizo una compra?',
        a: 'Navegá el catálogo, agregá los productos al carrito, luego completá tu dirección de envío y elegí el medio de pago. Recibirás un email de confirmación una vez que el pago sea procesado.',
      },
      {
        q: '¿Necesito crear una cuenta para comprar?',
        a: 'No es obligatorio. Podés comprar como invitado ingresando tus datos en el checkout. Sin embargo, si creás una cuenta podrás revisar el historial de pedidos, guardar favoritos y agilizar tus próximas compras.',
      },
      {
        q: '¿Cómo sé si mi pedido fue confirmado?',
        a: 'Recibirás un email de confirmación al domicilio que registraste. El pedido también aparece en la sección "Mi cuenta → Mis pedidos". Si no recibís el email en 15 minutos, revisá la carpeta de spam o escribinos.',
      },
      {
        q: '¿Puedo modificar o cancelar un pedido ya realizado?',
        a: 'Podés solicitar cambios o cancelación dentro de las 2 horas de realizado el pedido, siempre que no haya sido despachado aún. Comunicáte de inmediato por WhatsApp o email indicando el número de pedido.',
      },
      {
        q: '¿Puedo comprar al por mayor?',
        a: 'Sí. Para pedidos en grandes cantidades o para clientes institucionales (clínicas, hospitales, escuelas odontológicas), contactanos por email o WhatsApp para que podamos ofrecerte una cotización personalizada.',
      },
      {
        q: '¿Los precios del sitio incluyen IVA?',
        a: 'Sí. Todos los precios publicados en el sitio están expresados en pesos argentinos (ARS) e incluyen IVA según la alícuota correspondiente a cada producto. El detalle impositivo se muestra en la factura.',
      },
    ],
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: CreditCard,
    color: 'text-blue-600 bg-blue-50',
    items: [
      {
        q: '¿Qué medios de pago aceptan?',
        a: 'Aceptamos pagos a través de MercadoPago: tarjetas de crédito (Visa, Mastercard, American Express), tarjetas de débito (Visa Débito, Maestro), saldo en cuenta MercadoPago y efectivo en puntos de pago habilitados (Rapipago, Pago Fácil, etc.).',
      },
      {
        q: '¿Puedo pagar en cuotas?',
        a: 'Sí. Las cuotas disponibles dependen de tu tarjeta de crédito y banco emisor. En períodos promocionales podemos ofrecer cuotas sin interés. Al momento del pago verás las opciones disponibles para tu tarjeta.',
      },
      {
        q: '¿Es seguro pagar en el sitio?',
        a: 'Absolutamente. Las transacciones son procesadas íntegramente por MercadoPago, que cuenta con certificación PCI DSS nivel 1. ARTDENT no almacena ni tiene acceso a los datos de tu tarjeta. La conexión está cifrada con HTTPS/TLS.',
      },
      {
        q: '¿Por qué puede rechazarse mi pago?',
        a: 'Los rechazos son gestionados por MercadoPago o tu banco. Las causas más frecuentes son: fondos insuficientes, límite de compras online superado, datos de la tarjeta incorrectos o bloqueo por seguridad del banco. Te recomendamos contactar a tu banco o intentar con otro medio de pago.',
      },
      {
        q: '¿Puedo pagar con transferencia bancaria o depósito?',
        a: 'Por el momento todos los pagos se procesan a través de MercadoPago para garantizar la seguridad de las transacciones. Para pedidos mayoristas o institucionales podemos acordar otras modalidades. Consultanos.',
      },
    ],
  },
  {
    id: 'envios',
    label: 'Envíos y entregas',
    icon: Truck,
    color: 'text-green-600 bg-green-50',
    items: [
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: (
          <span>
            Los plazos estimados son:<br />
            • <strong>Formosa Capital:</strong> 1 a 3 días hábiles.<br />
            • <strong>Interior del país:</strong> 3 a 8 días hábiles según destino.<br />
            Estos plazos son estimativos y pueden verse afectados por feriados o situaciones externas al control de ARTDENT.
          </span>
        ),
      },
      {
        q: '¿Cuánto cuesta el envío?',
        a: 'El costo de envío se calcula automáticamente en el checkout según el peso del pedido y el destino. En algunas promociones puede ofrecerse envío gratuito a partir de cierto monto. El valor exacto lo verás antes de confirmar tu compra.',
      },
      {
        q: '¿Hacen envíos a todo el país?',
        a: 'Sí, enviamos a todo el territorio de la República Argentina a través de empresas de correo y mensajería habilitadas.',
      },
      {
        q: '¿Cómo hago seguimiento de mi pedido?',
        a: 'Una vez despachado el pedido recibirás un email con el número de seguimiento y el enlace al sitio de la empresa de correo. También podés consultarlo desde "Mi cuenta → Mis pedidos".',
      },
      {
        q: '¿Qué pasa si no estoy en casa cuando llega el pedido?',
        a: 'El correo dejará un aviso de visita. Generalmente realizan un segundo intento de entrega o podés retirar el paquete en la sucursal más cercana con el aviso y tu DNI. Consultá directamente con la empresa de correo indicada en tu seguimiento.',
      },
      {
        q: '¿Qué hago si el paquete llegó dañado?',
        a: 'Si el embalaje presenta daños visibles, documentalos con fotos antes de abrir el paquete. Contactanos dentro de las 48 horas de recibido el pedido enviando las imágenes a ventas@artdent.com.ar con el número de pedido. Gestionaremos el reclamo con la empresa de correo.',
      },
    ],
  },
  {
    id: 'devoluciones',
    label: 'Devoluciones y garantía',
    icon: RotateCcw,
    color: 'text-amber-600 bg-amber-50',
    items: [
      {
        q: '¿Puedo devolver un producto?',
        a: 'Sí. Aceptamos devoluciones por arrepentimiento (hasta 10 días hábiles desde la recepción), por defecto de fabricación (garantía legal), por error en el envío y por producto dañado en el transporte.',
      },
      {
        q: '¿Cuánto tiempo tengo para solicitar una devolución?',
        a: (
          <span>
            • <strong>Arrepentimiento:</strong> 10 días hábiles desde la recepción (Art. 34 Ley 24.240).<br />
            • <strong>Defecto / garantía:</strong> 6 meses para productos nuevos, 3 meses para usados.<br />
            • <strong>Error en envío o daño en transporte:</strong> 48 hs desde la recepción.
          </span>
        ),
      },
      {
        q: '¿Cómo inicio una solicitud de devolución?',
        a: (
          <span>
            Completá el formulario en{' '}
            <Link to="/devoluciones" className="text-[var(--brand-primary)] hover:underline font-semibold">
              artdent.com.ar/devoluciones
            </Link>{' '}
            o escribinos por WhatsApp / email indicando el número de pedido, el producto y el motivo. Te responderemos en 48 hs hábiles.
          </span>
        ),
      },
      {
        q: '¿Cómo funciona la garantía legal?',
        a: 'Todos los productos nuevos tienen 6 meses de garantía legal mínima (Art. 11 Ley 24.240). Durante ese período podés exigir reparación gratuita, reemplazo del producto o devolución del importe a tu elección.',
      },
      {
        q: '¿Cuándo se acredita el reembolso?',
        a: 'Una vez aprobada la devolución y recibido el producto, el reembolso se procesa en un plazo de 10 días hábiles por el mismo medio de pago utilizado. Para tarjetas de crédito el tiempo depende del ciclo de facturación del banco emisor.',
      },
      {
        q: '¿Puedo cambiar un producto por otro?',
        a: 'Sí. Al completar el formulario de devolución podés indicar tu preferencia: reembolso del importe o cambio por otro producto. En caso de cambio, si hay diferencia de precio se acuerda entre las partes.',
      },
    ],
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: Package,
    color: 'text-purple-600 bg-purple-50',
    items: [
      {
        q: '¿Los productos son originales?',
        a: 'Sí. ARTDENT comercializa únicamente productos originales adquiridos directamente de distribuidores y fabricantes autorizados. Cada producto cuenta con su embalaje y documentación original.',
      },
      {
        q: '¿Cómo sé si el stock mostrado es en tiempo real?',
        a: 'El stock se actualiza en tiempo real. Sin embargo, en momentos de alta demanda pueden existir pequeñas diferencias. Si un producto se agota después de que realizaste tu pedido te contactaremos dentro de las 24 hs para ofrecerte una alternativa o proceder con el reembolso.',
      },
      {
        q: '¿Los productos requieren habilitación o registro en ANMAT?',
        a: 'Los productos odontológicos disponibles en el catálogo cumplen con la normativa argentina vigente. Ante dudas sobre habilitaciones específicas para uso profesional, consultanos antes de realizar tu compra.',
      },
      {
        q: '¿Puedo solicitar un producto que no está en el catálogo?',
        a: 'Podés consultarnos por productos específicos que no encuentres en el catálogo. Escribinos a ventas@artdent.com.ar o por WhatsApp con la descripción o referencia del producto y te informaremos sobre disponibilidad y tiempos de entrega.',
      },
      {
        q: '¿Las imágenes de los productos son exactas?',
        a: 'Las imágenes son representativas del producto. El color real puede variar levemente según la pantalla. En caso de dudas sobre especificaciones técnicas, consultá la descripción del producto o escribinos.',
      },
    ],
  },
  {
    id: 'cuenta',
    label: 'Cuenta de usuario',
    icon: User,
    color: 'text-indigo-600 bg-indigo-50',
    items: [
      {
        q: '¿Cómo creo mi cuenta?',
        a: (
          <span>
            Hacé clic en "Registrarme" en la parte superior del sitio, completá tus datos (nombre, email y contraseña) y confirmá tu dirección de correo electrónico. ¡Listo, ya podés empezar a comprar!
          </span>
        ),
      },
      {
        q: '¿Cómo recupero mi contraseña?',
        a: (
          <span>
            En la pantalla de inicio de sesión, hacé clic en "¿Olvidaste tu contraseña?" e ingresá tu email. Recibirás un enlace para restablecerla. Si no llega en minutos, revisá la carpeta de spam.
          </span>
        ),
      },
      {
        q: '¿Puedo cambiar mi email o datos personales?',
        a: 'Sí. Desde "Mi cuenta → Configuración" podés actualizar tu nombre, teléfono y dirección de entrega. Para cambiar el email de acceso escribinos a ventas@artdent.com.ar.',
      },
      {
        q: '¿Cómo elimino mi cuenta?',
        a: 'Podés solicitar la eliminación de tu cuenta en cualquier momento escribiendo a ventas@artdent.com.ar con el asunto "Eliminar cuenta". Tus datos serán suprimidos conforme a la Ley 25.326 de Protección de Datos Personales.',
      },
    ],
  },
  {
    id: 'facturacion',
    label: 'Facturación',
    icon: FileText,
    color: 'text-teal-600 bg-teal-50',
    items: [
      {
        q: '¿ARTDENT emite facturas?',
        a: 'Sí. Emitimos comprobante fiscal (factura A o B) por todas las transacciones realizadas en el sitio.',
      },
      {
        q: '¿Cómo recibo mi factura?',
        a: 'La factura se envía por correo electrónico al domicilio registrado dentro de las 24 hs hábiles de confirmado el pago. También podés encontrarla en "Mi cuenta → Mis pedidos".',
      },
      {
        q: '¿Cómo solicito factura A (responsable inscripto)?',
        a: 'Antes o al momento de la compra, escribinos a ventas@artdent.com.ar indicando: razón social, CUIT y condición frente al IVA. También podés indicarlo en el campo de observaciones del checkout.',
      },
      {
        q: '¿Puedo pedir la factura después de haber comprado?',
        a: 'Sí, siempre que la factura del período impositivo no haya sido cerrada. Contactanos lo antes posible enviando el número de pedido y tus datos fiscales a ventas@artdent.com.ar.',
      },
      {
        q: '¿Qué hago si los datos de la factura son incorrectos?',
        a: 'Escribinos a ventas@artdent.com.ar con el número de pedido, el error detectado y los datos correctos. Emitiremos una nota de crédito y una nueva factura a la brevedad.',
      },
    ],
  },
]

// ── Componente Accordion Item ─────────────────────────────────────────────────
function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className={`border-b border-gray-100 last:border-0 transition-colors ${isOpen ? 'bg-[var(--brand-soft)]' : 'hover:bg-gray-50'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className={`text-sm font-semibold leading-snug ${isOpen ? 'text-[var(--brand-primary)]' : 'text-gray-800'}`}>
          {item.q}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--brand-primary)]' : 'text-gray-400'}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function FAQ() {
  const [searchParams] = useSearchParams()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  // Sincronizar cuando cambia el param externo (ej: navegación desde Ayuda)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setSearch(q); setActiveCategory(null) }
  }, [searchParams])

  const toggle = (key: string) => setOpenKey(prev => (prev === key ? null : key))

  // Filtrado por búsqueda y categoría
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return CATEGORIES
      .filter(cat => !activeCategory || cat.id === activeCategory)
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          !q || item.q.toLowerCase().includes(q) || (typeof item.a === 'string' && item.a.toLowerCase().includes(q))
        ),
      }))
      .filter(cat => cat.items.length > 0)
  }, [search, activeCategory])

  const totalResults = filtered.reduce((n, c) => n + c.items.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">

      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <HelpCircle size={15} className="shrink-0" />
              Centro de ayuda
            </div>
            <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight">
              Preguntas frecuentes
            </h1>
            <p className="mt-3 text-base text-white/90 max-w-xl mx-auto">
              Encontrá respuestas a las dudas más comunes sobre compras, envíos, pagos y más.
            </p>

            {/* Buscador */}
            <div className="relative mt-6 max-w-lg mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveCategory(null) }}
                placeholder="Buscá tu pregunta…"
                className="w-full pl-11 pr-10 py-3 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60 shadow-lg"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Limpiar"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtros por categoría */}
      <div className="border-b bg-white sticky top-16 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button
              onClick={() => { setActiveCategory(null); setSearch('') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                !activeCategory && !search
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearch('') }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeCategory === cat.id
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <cat.icon size={12} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6 order-last lg:order-first">

            {/* Resultado de búsqueda */}
            {search && (
              <p className="text-sm text-gray-500">
                {totalResults === 0
                  ? 'No se encontraron resultados para tu búsqueda.'
                  : `${totalResults} resultado${totalResults !== 1 ? 's' : ''} para "${search}"`}
              </p>
            )}

            {/* Sin resultados */}
            {filtered.length === 0 && (
              <div className="card p-10 text-center">
                <HelpCircle size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="font-semibold text-gray-700">No encontramos respuesta a tu búsqueda</p>
                <p className="text-sm text-gray-500 mt-1">
                  Intentá con otras palabras o contactanos directamente.
                </p>
                <a
                  href="https://wa.me/5493704995406?text=Hola%2C+tengo+una+consulta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 btn btn-primary"
                >
                  <MessageCircle size={16} />
                  Consultar por WhatsApp
                </a>
              </div>
            )}

            {/* Acordeones por categoría */}
            {filtered.map(cat => (
              <section key={cat.id} id={cat.id} className="card overflow-hidden scroll-mt-32">
                {/* Cabecera de categoría */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cat.color}`}>
                    <cat.icon size={18} />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">{cat.label}</h2>
                  <span className="ml-auto text-xs font-semibold text-gray-400">
                    {cat.items.length} pregunta{cat.items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Preguntas */}
                {cat.items.map((item, idx) => {
                  const key = `${cat.id}-${idx}`
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  )
                })}
              </section>
            ))}

            {/* Nota al pie */}
            {filtered.length > 0 && (
              <p className="text-xs text-center text-gray-400 pb-2">
                ¿No encontraste lo que buscabas?{' '}
                <Link to="/contacto" className="text-[var(--brand-primary)] hover:underline font-medium">
                  Contactanos
                </Link>{' '}
                y te respondemos a la brevedad.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 order-first lg:order-last">

            {/* Contacto rápido */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-1">¿No encontrás tu respuesta?</h3>
              <p className="text-sm text-gray-500 mb-4">Nuestro equipo te responde en el día.</p>
              <div className="space-y-2">
                <a
                  href="https://wa.me/5493704995406?text=Hola%2C+tengo+una+consulta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-3 text-sm font-semibold transition"
                >
                  <svg viewBox="0 0 32 32" width="18" height="18" fill="white" className="shrink-0">
                    <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.627 4.64 1.813 6.667L2.667 29.333l6.88-1.786A13.28 13.28 0 0 0 16.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 2.4c6.04 0 10.929 4.889 10.929 10.933 0 6.04-4.889 10.933-10.93 10.933a10.888 10.888 0 0 1-5.546-1.52l-.4-.24-4.08 1.067 1.093-3.973-.267-.413A10.87 10.87 0 0 1 5.075 16c0-6.04 4.889-10.933 10.929-10.933zm-3.2 5.466c-.267 0-.693.107-.96.373-.267.267-1.013 1-1.013 2.453s1.04 2.84 1.187 3.04c.16.2 2.027 3.147 4.96 4.293 2.453.96 2.947.773 3.48.72.533-.053 1.707-.693 1.947-1.36.24-.667.24-1.24.16-1.36-.08-.12-.267-.2-.56-.347s-1.707-.84-1.973-.933c-.267-.107-.467-.16-.667.16-.2.32-.76.933-.933 1.12-.173.2-.347.213-.64.08-.293-.133-1.24-.453-2.36-1.453-.88-.773-1.467-1.733-1.64-2.027-.173-.293-.013-.453.133-.6.133-.133.293-.347.44-.52.147-.173.2-.293.293-.493.107-.2.053-.373-.013-.52-.067-.147-.64-1.573-.88-2.147-.24-.573-.48-.48-.667-.48l-.56-.013z" />
                  </svg>
                  WhatsApp · +54 3704-995406
                </a>
                <a
                  href="mailto:ventas@artdent.com.ar"
                  className="flex items-center gap-3 rounded-xl border border-gray-200 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)] px-4 py-3 text-sm font-semibold text-gray-700 transition group"
                >
                  <Mail size={16} className="text-gray-400 group-hover:text-[var(--brand-primary)] shrink-0" />
                  ventas@artdent.com.ar
                </a>
                <Link
                  to="/contacto"
                  className="flex items-center gap-3 rounded-xl border border-gray-200 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)] px-4 py-3 text-sm font-semibold text-gray-700 transition group"
                >
                  <Phone size={16} className="text-gray-400 group-hover:text-[var(--brand-primary)] shrink-0" />
                  Formulario de contacto
                </Link>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Lun–Vie · 8:00 a 14:00 hs
              </p>
            </div>

            {/* Categorías rápidas */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Ir a sección</h3>
              <ul className="space-y-1">
                {CATEGORIES.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setActiveCategory(cat.id)
                        setSearch('')
                        document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-primary)] transition text-left"
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${cat.color}`}>
                        <cat.icon size={13} />
                      </div>
                      {cat.label}
                      <ChevronRight size={13} className="ml-auto text-gray-300" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links relacionados */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Páginas de ayuda</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { to: '/devoluciones', label: 'Solicitar devolución o cambio' },
                  { to: '/defensa-consumidor', label: 'Defensa del consumidor' },
                  { to: '/terminos', label: 'Términos y condiciones' },
                  { to: '/privacidad', label: 'Política de privacidad' },
                  { to: '/contacto', label: 'Contacto general' },
                ].map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-[var(--brand-primary)] transition"
                    >
                      <ChevronRight size={14} className="shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500">
          <p>
            Las respuestas provistas son de carácter informativo y orientativo.{' '}
            Ante dudas específicas sobre normativa de consumo, consultá{' '}
            <Link to="/defensa-consumidor" className="text-[var(--brand-primary)] hover:underline">
              Defensa del Consumidor
            </Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
