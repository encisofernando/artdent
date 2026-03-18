import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ArrowRight, Check } from 'lucide-react'
import { listProducts, type CatalogProduct } from '../api/products'
import { productPath } from '../utils/slug'
import { listCategories } from '../api/categories'
import { listSidebarBanners, type SidebarBanner } from '../api/banners'
import { listHeroSlides, type HeroSlide as ApiHeroSlide } from '../api/slides'
import { storageUrl } from '../api/http'
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
      to={productPath(p.id, p.name)}
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

/* ─── Tab empty states ──────────────────────────────────────────────── */
const TAB_EMPTY = [
  {
    emoji: '✨',
    title: '¡Próximamente nuevos productos!',
    desc: 'Estamos incorporando nuevos insumos odontológicos. Volvé pronto o suscribite al newsletter para ser el primero en enterarte.',
  },
  {
    emoji: '⭐',
    title: '¡Próximamente productos destacados!',
    desc: 'Estamos preparando nuestra selección de los mejores productos. Mientras tanto, explorá el catálogo completo.',
  },
  {
    emoji: '🏷️',
    title: '¡Próximamente grandes ofertas!',
    desc: 'Estamos preparando descuentos y promociones exclusivas para vos. Volvé pronto o suscribite al newsletter para ser el primero en enterarte.',
  },
]

function TabEmptyState({ tab }: { tab: number }) {
  const e = TAB_EMPTY[tab] ?? TAB_EMPTY[0]
  return (
    <div className="flex items-center justify-center py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-10 py-10 text-center max-w-md w-full">
        <span className="text-5xl mb-4 block">{e.emoji}</span>
        <h3 className="text-lg font-extrabold text-gray-900 mb-2">{e.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{e.desc}</p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 bg-[var(--brand-primary)] text-white rounded-xl px-6 py-2.5 text-sm font-bold hover:opacity-90 transition"
        >
          Ver catálogo completo <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

/* ─── Slide type ────────────────────────────────────────────────────── */
type Slide = {
  imageSrc: string
  clickUrl: string | null
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

  /* ── Tab params ── */
  const TAB_PARAMS = [
    { sort: 'nuevos' },
    { sort: 'relevantes' },
    { has_offer: true as const },
  ]

  /* Products — refetch when tab changes */
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['home_products', activeTab],
    queryFn: () => listProducts({ per_page: 8, page: 1, ...TAB_PARAMS[activeTab] }),
  })
  const products = productsData?.data ?? []

  /* Categories */
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })

  /* Sidebar banners */
  const { data: sidebarBanners = [] } = useQuery({
    queryKey: ['sidebar_banners'],
    queryFn: () => listSidebarBanners(),
    staleTime: 5 * 60 * 1000,
  })
  const activeBanner: SidebarBanner | null = sidebarBanners[0] ?? null

  /* Hero slides dinámicos */
  const { data: apiSlides = [] } = useQuery({
    queryKey: ['hero_slides'],
    queryFn: () => listHeroSlides(),
    staleTime: 5 * 60 * 1000,
  })

  const slides: Slide[] = useMemo(() =>
    apiSlides.map((s: ApiHeroSlide) => ({
      imageSrc: storageUrl(s.image_url) ?? '',
      clickUrl: s.click_url,
    }))
  , [apiSlides])

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
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleNext, handlePrev])

  /* ── Tabs ── */
  const TABS = ['NUEVOS', 'DESTACADOS', 'OFERTAS']

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ══════════════ HERO CAROUSEL ══════════════ */}
      <section
        className="relative w-full overflow-hidden bg-gray-100"
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
        {/* Track de imágenes — grid superpuesto, altura natural de la imagen */}
        <div className="w-full overflow-hidden group" style={{ display: 'grid' }}>
          {slides.map((slide, idx) => {
            const isActive = idx === active
            const img = (
              <img
                src={slide.imageSrc}
                alt=""
                className="w-full h-auto block select-none transition-transform duration-700 ease-in-out group-hover:scale-105"
                draggable={false}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            )
            return (
              <div
                key={idx}
                style={{ gridArea: '1 / 1' }}
                className={`transition-opacity duration-500 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                {slide.clickUrl ? (
                  <Link to={slide.clickUrl} className="block w-full" tabIndex={isActive ? 0 : -1}>
                    {img}
                  </Link>
                ) : img}
              </div>
            )
          })}
        </div>

        {/* Flechas */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-full transition-all duration-300 ${idx === active ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        )}

        {/* Barra de progreso */}
        {!paused && slides.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 z-20">
            <div className="h-full bg-white/70 transition-all duration-[6500ms] ease-linear" style={{ width: isTransitioning ? '0%' : '100%' }} key={active} />
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
          <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0 rounded-2xl overflow-hidden group self-stretch min-h-[320px] relative">
            {activeBanner?.image_url ? (
              <Link
                to={activeBanner.cta_url ?? '/productos'}
                className="block w-full h-full absolute inset-0"
              >
                <img
                  src={storageUrl(activeBanner.image_url) ?? ''}
                  alt={activeBanner.title ?? 'Banner'}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 block"
                />
                {/* Overlay degradado inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                {(activeBanner.title || activeBanner.cta_label) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    {activeBanner.title && (
                      <p className="text-white font-extrabold text-sm leading-tight drop-shadow">{activeBanner.title}</p>
                    )}
                    {activeBanner.subtitle && (
                      <p className="text-white/80 text-xs mt-1 leading-snug">{activeBanner.subtitle}</p>
                    )}
                    {activeBanner.cta_label && (
                      <span className="mt-3 inline-flex items-center gap-1.5 bg-white text-[var(--brand-primary)] rounded-lg px-3 py-1.5 text-xs font-bold">
                        {activeBanner.cta_label} <ArrowRight size={11} />
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ) : null}
          </div>

          {/* Mini product grid */}
          <div className={`flex-1 transition-opacity duration-200 ${productsLoading ? 'opacity-50' : 'opacity-100'}`}>
            {productsLoading && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }, (_, i) => <MiniCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <TabEmptyState tab={activeTab} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.slice(0, 8).map((p) => <MiniCard key={p.id} p={p} />)}
              </div>
            )}
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
