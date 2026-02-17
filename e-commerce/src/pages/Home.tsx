import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import isotipoAzul from '../assets/isotipo-azul.png'

import bottles1 from '../assets/hero/bottles-1.png'
import bottles2 from '../assets/hero/bottles-2.png'
import bottles3 from '../assets/hero/bottles-3.png'

type Slide = {
  eyebrow: string
  title: string
  subtitle: string
  ctaHref: string
  ctaLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  bgClassName: string
  imageSrc: string
  imageAlt: string
}

export default function Home() {
  const slides: Slide[] = useMemo(
    () => [
      {
        eyebrow: 'ARTDENT · E-commerce',
        title: 'Materiales y tecnología para el laboratorio odontológico.',
        subtitle:
          'Catálogo profesional con stock y precios actualizados. Compras simples, rápidas y con trazabilidad.',
        ctaHref: '/productos',
        ctaLabel: 'Ver productos',
        secondaryHref: '/novedades',
        secondaryLabel: 'Novedades',
        bgClassName:
          'bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(218,238,227,0.95),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(218,230,240,0.95),transparent_50%),linear-gradient(135deg,rgba(57,123,156,0.92),rgba(90,173,156,0.92))]',
        imageSrc: bottles1,
        imageAlt: 'Productos destacados ARTDENT',
      },
      {
        eyebrow: 'Impresión 3D',
        title: 'Resinas, consumibles y repuestos listos para producir.',
        subtitle:
          'Estandarizá tus insumos: modelos, férulas, temporales y guías. Todo en un solo lugar.',
        ctaHref: '/productos?cat=impresion-3d',
        ctaLabel: 'Explorar impresión 3D',
        secondaryHref: '/contacto',
        secondaryLabel: 'Asesoramiento',
        bgClassName:
          'bg-[radial-gradient(900px_circle_at_30%_25%,rgba(124,165,195,0.75),transparent_55%),radial-gradient(900px_circle_at_80%_70%,rgba(172,214,206,0.9),transparent_55%),linear-gradient(135deg,rgba(73,148,156,0.92),rgba(57,123,156,0.92))]',
        imageSrc: bottles2,
        imageAlt: 'Impresión 3D: resinas y consumibles',
      },
      {
        eyebrow: 'Confianza y soporte',
        title: 'Comprá con respaldo: facturación y seguimiento de pedidos.',
        subtitle:
          'Cuenta, historial y estados del pedido. Experiencia consistente con la identidad ARTDENT.',
        ctaHref: '/mi-cuenta',
        ctaLabel: 'Ir a mi cuenta',
        secondaryHref: '/ayuda',
        secondaryLabel: 'Centro de ayuda',
        bgClassName:
          'bg-[radial-gradient(900px_circle_at_20%_70%,rgba(218,230,240,0.95),transparent_55%),radial-gradient(900px_circle_at_75%_25%,rgba(218,238,227,0.95),transparent_55%),linear-gradient(135deg,rgba(57,123,156,0.92),rgba(73,148,156,0.92))]',
        imageSrc: bottles3,
        imageAlt: 'Soporte, facturación y seguimiento de pedidos',
      },
    ],
    []
  )

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleNext = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActive((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, slides.length])

  const handlePrev = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActive((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, slides.length])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === active) return
    setIsTransitioning(true)
    setActive(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, active])

  // Auto-play
  useEffect(() => {
    if (paused || isTransitioning) return
    const id = window.setInterval(() => {
      handleNext()
    }, 6500)
    return () => window.clearInterval(id)
  }, [paused, isTransitioning, active, handleNext])

  // Gestos táctiles para el carrusel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) handleNext()
    if (isRightSwipe) handlePrev()

    setTouchStart(0)
    setTouchEnd(0)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  const current = slides[active]

  return (
    <div>
      {/* Hero + Carrusel */}
      <section
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Carrusel principal"
        role="region"
      >
        {/* Background con transición */}
        <div className="absolute inset-0" aria-hidden="true">
          <div 
            className={`h-full w-full transition-all duration-700 ease-in-out ${current.bgClassName}`}
            key={active}
          />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:56px_56px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr,0.8fr]">
            {/* Contenido izquierdo */}
            <div 
              className="animate-fade-in"
              key={`content-${active}`}
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-white/90 animate-slide-down">
                {current.eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl animate-slide-up">
                {current.title}
              </h1>
              <p className="mt-4 max-w-prose text-sm/7 text-white/90 md:text-base/7 animate-fade-in-delayed">
                {current.subtitle}
              </p>

              {/* Botones - en columna para mobile */}
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 animate-fade-in-delayed">
                <Link
                  to={current.ctaHref}
                  className="btn bg-white text-[var(--brand-primary)] hover:bg-white/90 hover:scale-105 transition-all text-center"
                >
                  {current.ctaLabel}
                </Link>

                {current.secondaryHref && current.secondaryLabel && (
                  <Link
                    to={current.secondaryHref}
                    className="btn btn-outline border-white/70 text-white hover:bg-white/10 hover:scale-105 transition-all text-center"
                  >
                    {current.secondaryLabel}
                  </Link>
                )}
              </div>

              {/* Controles del carrusel */}
              <div className="mt-8 flex items-center gap-4">
                {/* Dots */}
                <div
                  className="flex items-center gap-2"
                  role="tablist"
                  aria-label="Seleccionar slide"
                >
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={[
                        'h-2.5 rounded-full transition-all duration-300',
                        idx === active 
                          ? 'w-8 bg-white' 
                          : 'w-2.5 bg-white/40 hover:bg-white/70',
                      ].join(' ')}
                      aria-label={`Ir al slide ${idx + 1}`}
                      aria-selected={idx === active}
                      role="tab"
                      onClick={() => goToSlide(idx)}
                    />
                  ))}
                </div>

                {/* Play/Pause */}
                <button
                  type="button"
                  onClick={() => setPaused(!paused)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30"
                  aria-label={paused ? 'Reproducir' : 'Pausar'}
                >
                  {paused ? <Play size={16} className="text-white" /> : <Pause size={16} className="text-white" />}
                </button>
              </div>
            </div>

            {/* Imagen derecha */}
            <div
              className="relative"
              key={`image-${active}`}
            >
              <div className="relative animate-fade-in">
                <img
                  src={current.imageSrc}
                  alt={current.imageAlt}
                  className="mx-auto max-h-[320px] md:max-h-[400px] w-auto object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)] animate-float"
                  loading="eager"
                />
              </div>

              {/* Info inferior */}
              <div className="mt-6 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <img src={isotipoAzul} alt="ARTDENT" className="h-10 w-auto opacity-90" />
                </div>
                <div>
                  <p className="text-sm font-semibold">ARTDENT</p>
                  <p className="text-xs text-white/80">Identidad consistente · Montserrat</p>
                </div>
              </div>

              <div
                className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-3xl bg-white/15 ring-1 ring-white/20 hidden md:block"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Flechas de navegación (solo desktop/tablet) */}
          <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 items-center justify-between px-2 md:px-0 pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isTransitioning}
              className="pointer-events-auto -ml-4 md:-ml-6 flex items-center justify-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              aria-label="Slide anterior"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isTransitioning}
              className="pointer-events-auto -mr-4 md:-mr-6 flex items-center justify-center h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              aria-label="Siguiente slide"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Indicador de progreso */}
        {!paused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-[6500ms] ease-linear"
              style={{ width: isTransitioning ? '0%' : '100%' }}
              key={active}
            />
          </div>
        )}
      </section>

      {/* Sección de acceso rápido */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-bold">Acceso rápido</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Catálogo</p>
              <p className="mt-2 text-sm text-gray-600">Búsqueda por SKU, nombre y paginación desde API.</p>
              <Link
                to="/productos"
                className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:opacity-80 transition"
              >
                Abrir →
              </Link>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Cuenta</p>
              <p className="mt-2 text-sm text-gray-600">Sesión con Sanctum (Bearer) y permisos por token.</p>
              <Link
                to="/mi-cuenta"
                className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:opacity-80 transition"
              >
                Abrir →
              </Link>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Carrito</p>
              <p className="mt-2 text-sm text-gray-600">Estructura lista para cerrar pedido contra ventas.</p>
              <Link
                to="/carrito"
                className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:opacity-80 transition"
              >
                Abrir →
              </Link>
            </div>
          </div>

          {/* Categorías destacadas */}
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold">Impresión 3D</p>
              <p className="mt-2 text-sm text-gray-600">Resinas, consumibles y repuestos para tu flujo digital.</p>
              <Link
                to="/productos?cat=impresion-3d"
                className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:opacity-80 transition"
              >
                Ver categoría →
              </Link>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold">Cerámicas</p>
              <p className="mt-2 text-sm text-gray-600">Materiales para estratificación y acabados con calidad.</p>
              <Link
                to="/productos?cat=ceramicas"
                className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:opacity-80 transition"
              >
                Ver categoría →
              </Link>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold">Equipamiento</p>
              <p className="mt-2 text-sm text-gray-600">Herramientas y equipos para producción y control.</p>
              <Link
                to="/productos?cat=equipamiento"
                className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:opacity-80 transition"
              >
                Ver categoría →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in 0.6s ease-in-out 0.2s both;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}