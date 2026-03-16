import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Check } from 'lucide-react'
import { listProducts, type CatalogProduct } from '../api/products'
import { listCategories } from '../api/categories'
import isotipoAzul from '../assets/isotipo-azul.png'
import bottles1 from '../assets/hero/bottles-1.png'
import bottles2 from '../assets/hero/bottles-2.png'
import bottles3 from '../assets/hero/bottles-3.png'
import { subscribeNewsletter } from '../api/newsletter'

/* ─── Category icon map ─────────────────────────────────────────────── */
const CAT_ICON: Record<string, string> = {
  resina: '🧪', fresa: '🔩', yeso: '⬜', cera: '🕯️', acrílico: '💊',
  silicona: '🫧', guante: '🧤', barbijo: '😷', impresión: '🖨️',
  instrumental: '🔧', descartable: '🗑️', composite: '🔵', adhesivo: '🔗',
  cemento: '🏗️', implante: '🦷', corona: '👑',
}
function catIcon(name: string): string {
  const l = name.toLowerCase()
  for (const [k, v] of Object.entries(CAT_ICON)) if (l.includes(k)) return v
  return '🦷'
}

/* ─── Mini product card ─────────────────────────────────────────────── */
function MiniCard({ p }: { p: CatalogProduct }) {
  const price = Number(p.price_final ?? p.price ?? 0)
  const orig = p.price_final && p.price_final < p.price ? Number(p.price) : null
  const pct = orig ? Math.round((1 - price / orig) * 100) : 0

  return (
    <Link
      to={`/productos/${p.id}`}
      className="bg-white rounded-xl border border-gray-100 hover:border-[var(--brand-primary)]/40 hover:shadow-md transition-all flex flex-col overflow-hidden group"
    >
      {p.category && (
        <div className="px-3 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] truncate">
          {p.category.name}
        </div>
      )}
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-3 relative overflow-hidden">
        {orig && pct > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-black rounded px-1.5 py-0.5">
            -{pct}%
          </span>
        )}
        {p.primary_image_url ? (
          <img
            src={p.primary_image_url}
            alt={p.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="p-3 flex flex-col gap-0.5 flex-1">
        {p.sku && <span className="text-[10px] text-gray-400">Cód: {p.sku}</span>}
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug flex-1">{p.name}</h3>
        <div className="mt-1.5">
          {orig && <span className="text-[10px] text-gray-400 line-through block">${orig.toLocaleString('es-AR')}</span>}
          <span className="text-base font-extrabold text-gray-900">${price.toLocaleString('es-AR')}</span>
          <span className="text-[10px] text-green-600 font-semibold block"></span>
        </div>
      </div>
    </Link>
  )
}

/* ─── Skeleton mini card ────────────────────────────────────────────── */
function MiniCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 animate-pulse overflow-hidden">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mt-1" />
      </div>
    </div>
  )
}

/* ─── Slide type ────────────────────────────────────────────────────── */
type Slide = {
  eyebrow: string; title: string; subtitle: string
  ctaHref: string; ctaLabel: string
  secondaryHref?: string; secondaryLabel?: string
  bgClassName: string; imageSrc: string; imageAlt: string
}

/* ─── Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState(0)
  const [nlName, setNlName] = useState('')
  const [nlEmail, setNlEmail] = useState('')
  const [nlOk, setNlOk] = useState(false)

  const nlMutation = useMutation({
    mutationFn: (d: { email: string; name?: string }) => subscribeNewsletter(d),
    onSuccess: () => { setNlOk(true); setNlName(''); setNlEmail('') },
  })

  /* Products */
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['home_products'],
    queryFn: () => listProducts({ per_page: 8, page: 1 }),
  })
  const products = productsData?.data ?? []

  /* Categories */
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })

  /* ── Slides ── */
  const slides: Slide[] = useMemo(() => [
    {
      eyebrow: 'ARTDENT · Distribuidora Dental',
      title: 'Materiales y tecnología para el laboratorio odontológico.',
      subtitle: 'Catálogo profesional con stock y precios actualizados. Compras simples, rápidas y con trazabilidad.',
      ctaHref: '/productos', ctaLabel: 'Ver catálogo completo',
      secondaryHref: '/contacto', secondaryLabel: 'Contactanos',
      bgClassName: 'bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(218,238,227,0.95),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(218,230,240,0.95),transparent_50%),linear-gradient(135deg,rgba(57,123,156,0.92),rgba(90,173,156,0.92))]',
      imageSrc: bottles1, imageAlt: 'Productos destacados ARTDENT',
    },
    {
      eyebrow: 'Impresión 3D Dental',
      title: 'Resinas, consumibles y repuestos listos para producir.',
      subtitle: 'Estandarizá tus insumos: modelos, férulas, temporales y guías. Todo en un solo lugar.',
      ctaHref: '/productos', ctaLabel: 'Explorar impresión 3D',
      secondaryHref: '/contacto', secondaryLabel: 'Asesoramiento',
      bgClassName: 'bg-[radial-gradient(900px_circle_at_30%_25%,rgba(124,165,195,0.75),transparent_55%),radial-gradient(900px_circle_at_80%_70%,rgba(172,214,206,0.9),transparent_55%),linear-gradient(135deg,rgba(73,148,156,0.92),rgba(57,123,156,0.92))]',
      imageSrc: bottles2, imageAlt: 'Impresión 3D: resinas y consumibles',
    },
    {
      eyebrow: 'Confianza y soporte',
      title: 'Comprá con respaldo: facturación y seguimiento de pedidos.',
      subtitle: 'Cuenta, historial y estados del pedido. Factura A/B. Envíos a todo el país.',
      ctaHref: '/mi-cuenta', ctaLabel: 'Ir a mi cuenta',
      secondaryHref: '/carrito', secondaryLabel: 'Ver carrito',
      bgClassName: 'bg-[radial-gradient(900px_circle_at_20%_70%,rgba(218,230,240,0.95),transparent_55%),radial-gradient(900px_circle_at_75%_25%,rgba(218,238,227,0.95),transparent_55%),linear-gradient(135deg,rgba(57,123,156,0.92),rgba(73,148,156,0.92))]',
      imageSrc: bottles3, imageAlt: 'Soporte, facturación y seguimiento de pedidos',
    },
  ], [])

  /* ── Carousel state ── */
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleNext = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActive((p) => (p + 1) % slides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, slides.length])

  const handlePrev = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActive((p) => (p - 1 + slides.length) % slides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, slides.length])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === active) return
    setIsTransitioning(true)
    setActive(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, active])

  useEffect(() => {
    if (paused || isTransitioning) return
    const id = window.setInterval(handleNext, 6500)
    return () => window.clearInterval(id)
  }, [paused, isTransitioning, active, handleNext])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleNext, handlePrev])

  const current = slides[active]

  /* ── Tabs ── */
  const TABS = ['NUEVOS', 'DESTACADOS', 'OFERTAS']

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ══════════════ HERO CAROUSEL ══════════════ */}
      <section
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
        onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
        onTouchEnd={() => {
          if (!touchStart || !touchEnd) return
          const d = touchStart - touchEnd
          if (d > 50) handleNext()
          if (d < -50) handlePrev()
          setTouchStart(0); setTouchEnd(0)
        }}
      >
        <div className="absolute inset-0" aria-hidden="true">
          <div className={`h-full w-full transition-all duration-700 ease-in-out ${current.bgClassName}`} key={active} />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-10 md:px-16 py-12 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr,0.8fr]">
            <div className="animate-fade-in" key={`content-${active}`}>
              <p className="text-xs font-bold tracking-[0.2em] text-white/80 uppercase">{current.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
                {current.title}
              </h1>
              <p className="mt-4 max-w-lg text-sm text-white/85 md:text-base leading-relaxed">{current.subtitle}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to={current.ctaHref} className="btn bg-white text-[var(--brand-primary)] hover:bg-white/90 shadow-lg px-6 py-3 text-sm font-bold">
                  {current.ctaLabel}
                </Link>
                {current.secondaryHref && (
                  <Link to={current.secondaryHref} className="btn border-white/60 text-white hover:bg-white/10 border px-6 py-3 text-sm font-semibold">
                    {current.secondaryLabel}
                  </Link>
                )}
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button key={idx} onClick={() => goToSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === active ? 'w-7 bg-white' : 'w-2 bg-white/35 hover:bg-white/60'}`} />
                  ))}
                </div>
                <button onClick={() => setPaused(!paused)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition">
                  {paused ? <Play size={14} className="text-white" /> : <Pause size={14} className="text-white" />}
                </button>
              </div>
            </div>
            <div className="relative" key={`image-${active}`}>
              <img src={current.imageSrc} alt={current.imageAlt}
                className="mx-auto max-h-[280px] md:max-h-[360px] w-auto object-contain drop-shadow-2xl"
                style={{ animation: 'float 3.5s ease-in-out infinite' }} />
            </div>
          </div>
        </div>

        {/* Flechas en los márgenes — fuera del contenedor centrado */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white hover:shadow-lg transition"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white hover:shadow-lg transition"
          aria-label="Siguiente"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
        {!paused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div className="h-full bg-white/60 transition-all duration-[6500ms] ease-linear" style={{ width: isTransitioning ? '0%' : '100%' }} key={active} />
          </div>
        )}
      </section>

      {/* ══════════════ TABBED PRODUCTS ══════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        {/* Tab header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div className="flex rounded-xl overflow-hidden border border-[var(--brand-primary)]/30 bg-white shadow-sm w-fit">
            {TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 text-sm font-bold transition-colors ${
                  activeTab === i
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-gray-600 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-soft)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link to="/productos" className="text-sm font-semibold text-[var(--brand-primary)] flex items-center gap-1 hover:opacity-80 self-end sm:self-auto">
            Ver más <ArrowRight size={14} />
          </Link>
        </div>

        {/* Content row */}
        <div className="flex gap-4">
          {/* Feature panel (desktop only) */}
          <div className="hidden lg:flex w-56 xl:w-64 flex-shrink-0">
            <div
              className="rounded-2xl w-full flex flex-col justify-between p-6 text-white overflow-hidden relative min-h-[320px]"
              style={{ background: 'linear-gradient(145deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)' }}
            >
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
              <div className="relative z-10">
                <img src={isotipoAzul} alt="ARTDENT" className="h-8 brightness-0 invert mb-5 opacity-90" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Distribuidora</p>
                <h3 className="text-xl font-extrabold leading-tight">Catálogo<br />Profesional</h3>
                <p className="mt-2 text-sm text-white/80 leading-snug">
                  Materiales e insumos para laboratorio dental
                </p>
              </div>
              <Link
                to="/productos"
                className="relative z-10 mt-6 inline-flex items-center gap-2 bg-white text-[var(--brand-primary)] rounded-xl px-4 py-2 text-sm font-bold self-start hover:shadow-md transition-shadow"
              >
                Ver catálogo <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Mini product grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {productsLoading
              ? Array.from({ length: 8 }, (_, i) => <MiniCardSkeleton key={i} />)
              : products.slice(0, 8).map((p) => <MiniCard key={p.id} p={p} />)
            }
          </div>
        </div>
      </section>

      {/* ══════════════ PROMO BANNERS ══════════════ */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Banner 1 */}
          <div
            className="rounded-2xl p-7 flex items-center gap-5 text-white overflow-hidden relative min-h-[140px]"
            style={{ background: 'var(--brand-primary)' }}
          >
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-6xl font-black text-white/15 select-none">3X</div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Financiación</p>
              <h3 className="text-lg font-extrabold leading-tight">Comprá online<br />en cuotas</h3>
              <p className="mt-1 text-xs text-white/80">Hasta 3 cuotas sin interés con tu tarjeta</p>
              <Link to="/productos"
                className="mt-3 inline-flex items-center gap-1.5 bg-white text-[var(--brand-primary)] rounded-xl px-4 py-1.5 text-xs font-bold hover:shadow-md transition-shadow">
                Ver productos <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Banner 2 */}
          <div
            className="rounded-2xl p-7 flex items-center gap-5 text-white overflow-hidden relative min-h-[140px]"
            style={{ background: 'var(--brand-secondary)' }}
          >
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-6xl font-black text-white/15 select-none">B2B</div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Para profesionales</p>
              <h3 className="text-lg font-extrabold leading-tight">Precios especiales<br />para laboratorios</h3>
              <p className="mt-1 text-xs text-white/80">Accedé a precios B2B y atención personalizada</p>
              <Link to="/registro"
                className="mt-3 inline-flex items-center gap-1.5 bg-white text-[var(--brand-secondary)] rounded-xl px-4 py-1.5 text-xs font-bold hover:shadow-md transition-shadow">
                Registrarme <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ EXPLORE CATEGORIES ══════════════ */}
      {categories.length > 0 && (
        <section style={{ background: 'var(--brand-primary)' }} className="py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Explorar Categorías</h2>
              <div className="w-14 h-0.5 bg-white/40 mx-auto mt-2 rounded-full" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.slice(0, 16).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/productos?category_id=${cat.id}`}
                  className="bg-white rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-[var(--brand-soft)] hover:shadow-lg transition-all text-center group"
                >
                  <span className="text-2xl leading-none">{catIcon(cat.name)}</span>
                  <span className="text-[10px] font-semibold text-gray-700 group-hover:text-[var(--brand-primary)] transition-colors leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/productos"
                className="inline-flex items-center gap-2 bg-white text-[var(--brand-primary)] rounded-xl px-6 py-2.5 text-sm font-bold hover:shadow-lg transition-shadow">
                Ver todas las categorías <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section className="mx-auto max-w-3xl px-4 pt-8 pb-0">
        <div
          className="rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)' }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3">Newsletter</p>
            <h2 className="text-2xl font-extrabold text-white leading-snug">
              Queremos estar más{' '}
              <span className="inline-block bg-white text-[var(--brand-primary)] px-3 py-0.5 rounded-lg mx-1">
                conectados
              </span>{' '}
              con vos
            </h2>
            <p className="mt-3 text-sm text-white/80">Recibí ofertas exclusivas y novedades en tu correo</p>

            {nlOk ? (
              <div className="mt-6 flex items-center justify-center gap-2 text-white">
                <Check size={20} />
                <span className="font-semibold">¡Gracias por suscribirte!</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!nlEmail.trim()) return
                  nlMutation.mutate({ email: nlEmail.trim(), name: nlName.trim() || undefined })
                }}
                className="mt-6 flex flex-col gap-3 max-w-sm mx-auto"
              >
                <input
                  type="text" value={nlName} onChange={(e) => setNlName(e.target.value)}
                  placeholder="Nombre"
                  className="w-full rounded-xl border-0 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none"
                />
                <input
                  type="email" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)}
                  placeholder="Email" required
                  className="w-full rounded-xl border-0 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={nlMutation.isPending}
                  className="w-full bg-white text-[var(--brand-primary)] rounded-xl px-4 py-2.5 text-sm font-bold hover:shadow-lg transition-shadow disabled:opacity-60"
                >
                  {nlMutation.isPending ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>


      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
