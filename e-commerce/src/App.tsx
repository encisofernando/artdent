import { Routes, Route, useNavigate, useLocation, matchPath } from 'react-router-dom'
import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { AuthProvider } from './store/auth'
import { CartProvider } from './store/cart'
import { Helmet } from 'react-helmet-async'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LiveChat from './components/LiveChat'
import WhatsAppButton from './components/WhatsAppButton'
import LoadingSpinner from './components/LoadingSpinner'
import { analytics } from './api/analytics'

// Cada página se descarga solo cuando se visita su ruta — antes las 24
// páginas iban en un único chunk de +1.1MB aunque el visitante solo mirara
// el home (medido en el build de producción real).
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const SignIn = lazy(() => import('./pages/SignIn'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Account = lazy(() => import('./pages/Account'))
const Comparar = lazy(() => import('./pages/Comparar'))
const Contacto = lazy(() => import('./pages/Contacto'))
const DefensaConsumidor = lazy(() => import('./pages/DefensaConsumidor'))
const Privacidad = lazy(() => import('./pages/Privacidad'))
const Terminos = lazy(() => import('./pages/Terminos'))
const Cookies = lazy(() => import('./pages/Cookies'))
const Devoluciones = lazy(() => import('./pages/Devoluciones'))
const Favoritos = lazy(() => import('./pages/Favoritos'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Ayuda = lazy(() => import('./pages/Ayuda'))
const Politicas = lazy(() => import('./pages/Politicas'))
const QuienesSomos = lazy(() => import('./pages/QuienesSomos'))

declare global {
  interface Window {
    dataLayer: any[]
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function RouteAnalytics() {
  const location = useLocation()

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      analytics.pageView(
        `${location.pathname}${location.search}`,
        document.title,
      )
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, location.search])

  return null
}

type RouteMetaRule = {
  path: string
  title: string
  description: string
  end?: boolean
  noindex?: boolean
  /**
   * La página renderiza su propio <SEOHead> con datos reales (título,
   * imagen, JSON-LD). RouteMeta no debe competir con eso — se omite del
   * todo para esas rutas en vez de depender de que el orden de montaje
   * de react-helmet-async elija el correcto (ver resolveRouteMeta()).
   */
  ownSEOHead?: boolean
}

const ROUTE_META_RULES: RouteMetaRule[] = [
  {
    path: '/',
    title: 'ArtDent Insumos Odontológicos',
    description: 'Shop de ArtDent con insumos odontológicos, novedades, destacados y ofertas para profesionales.',
    end: true,
    ownSEOHead: true,
  },
  {
    path: '/productos',
    title: 'Productos',
    description: 'Catálogo de productos de ArtDent con insumos odontológicos, precios actualizados y opciones de compra online.',
    end: true,
    ownSEOHead: true,
  },
  {
    path: '/productos/:slug',
    title: 'Producto',
    description: 'Detalle del producto en el shop de ArtDent con imágenes, precio, stock y opciones de compra.',
    ownSEOHead: true,
  },
  {
    path: '/nosotros',
    title: 'Nosotros',
    description: 'Conocé ArtDent, nuestra visión, experiencia y compromiso con profesionales de la odontología.',
    ownSEOHead: true,
  },
  {
    path: '/contacto',
    title: 'Contacto',
    description: 'Contactate con ArtDent para consultas comerciales, soporte y atención del shop odontológico.',
    ownSEOHead: true,
  },
  {
    path: '/defensa-consumidor',
    title: 'Defensa del Consumidor',
    description: 'Información de defensa del consumidor, derechos y canales de contacto disponibles en ArtDent.',
  },
  {
    path: '/privacidad',
    title: 'Política de Privacidad',
    description: 'Cómo ArtDent recopila, utiliza y protege los datos personales dentro de su e-commerce.',
  },
  {
    path: '/terminos',
    title: 'Términos y Condiciones',
    description: 'Términos y condiciones de uso del e-commerce de ArtDent, compras, pagos, envíos y devoluciones.',
  },
  {
    path: '/cookies',
    title: 'Política de Cookies',
    description: 'Política de cookies y tecnologías de seguimiento utilizadas en el sitio de ArtDent.',
  },
  {
    path: '/devoluciones',
    title: 'Cambios y Devoluciones',
    description: 'Condiciones de cambios, devoluciones y gestión postventa para compras realizadas en ArtDent.',
  },
  {
    path: '/preguntas-frecuentes',
    title: 'Preguntas Frecuentes',
    description: 'Respuestas a las consultas más comunes sobre pedidos, pagos, envíos y funcionamiento del shop de ArtDent.',
    ownSEOHead: true,
  },
  {
    path: '/ayuda',
    title: 'Ayuda',
    description: 'Centro de ayuda de ArtDent con asistencia para navegar, comprar y gestionar pedidos.',
    ownSEOHead: true,
  },
  {
    path: '/politicas',
    title: 'Políticas',
    description: 'Resumen de políticas comerciales, operativas y legales del e-commerce de ArtDent.',
    ownSEOHead: true,
  },
  {
    path: '/comparar',
    title: 'Comparar Productos',
    description: 'Compará insumos odontológicos del catálogo de ArtDent para elegir la opción más adecuada.',
  },
  {
    path: '/carrito',
    title: 'Carrito',
    description: 'Resumen temporal de tu carrito de compras en ArtDent.',
    noindex: true,
  },
  {
    path: '/checkout',
    title: 'Checkout',
    description: 'Finalización segura de tu compra en el shop de ArtDent.',
    noindex: true,
  },
  {
    path: '/pedido/:code',
    title: 'Detalle del Pedido',
    description: 'Seguimiento y detalle de un pedido realizado en el shop de ArtDent.',
    noindex: true,
  },
  {
    path: '/iniciar-sesion',
    title: 'Iniciar Sesión',
    description: 'Accedé a tu cuenta de ArtDent para gestionar pedidos, favoritos y tus datos.',
    noindex: true,
  },
  {
    path: '/registrarme',
    title: 'Crear Cuenta',
    description: 'Creá tu cuenta en ArtDent para comprar más rápido y acceder a tu historial.',
    noindex: true,
  },
  {
    path: '/recuperar',
    title: 'Recuperar Contraseña',
    description: 'Recuperá el acceso a tu cuenta del shop de ArtDent.',
    noindex: true,
  },
  {
    path: '/resetear-contrasena',
    title: 'Resetear Contraseña',
    description: 'Definí una nueva contraseña para tu cuenta de ArtDent.',
    noindex: true,
  },
  {
    path: '/favoritos',
    title: 'Favoritos',
    description: 'Lista privada de productos favoritos guardados en tu cuenta de ArtDent.',
    noindex: true,
  },
  {
    path: '/mi-cuenta',
    title: 'Mi Cuenta',
    description: 'Panel privado de tu cuenta de ArtDent con pedidos, datos y preferencias.',
    noindex: true,
  },
]

function resolveRouteMeta(pathname: string) {
  const match = ROUTE_META_RULES.find((rule) =>
    matchPath({ path: rule.path, end: rule.end ?? true }, pathname)
  )

  if (!match) {
    return {
      title: 'Página no encontrada | ArtDent',
      description: 'La página solicitada no existe o fue movida dentro del e-commerce de ArtDent.',
      noindex: true,
      ownSEOHead: false,
    }
  }

  return {
    title: match.title === 'ArtDent Insumos Odontológicos'
      ? match.title
      : `${match.title} | ArtDent`,
    description: match.description,
    noindex: Boolean(match.noindex),
    ownSEOHead: Boolean(match.ownSEOHead),
  }
}

const SITE_URL = 'https://shop.artdent.com.ar'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

/**
 * Fallback de <title>/meta/OG/canonical para rutas que no renderizan su
 * propio <SEOHead> (ver components/SEOHead.tsx). Las que sí lo hacen quedan
 * marcadas con ownSEOHead en ROUTE_META_RULES y no se pisan entre sí — antes
 * ambos sistemas montaban siempre y dependían implícitamente del orden de
 * react-helmet-async para no competir.
 */
function RouteMeta() {
  const { pathname } = useLocation()
  const pageMeta = useMemo(() => resolveRouteMeta(pathname), [pathname])
  // canonical siempre sin query params para evitar duplicados por filtros
  const canonicalUrl = useMemo(() => `${SITE_URL}${pathname}`, [pathname])
  const robots = pageMeta.noindex ? 'noindex, nofollow' : 'index, follow'

  if (pageMeta.ownSEOHead) return null

  return (
    <Helmet>
      <title>{pageMeta.title}</title>
      <meta name="description" content={pageMeta.description} />
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ArtDent" />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:title" content={pageMeta.title} />
      <meta property="og:description" content={pageMeta.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageMeta.title} />
      <meta name="twitter:description" content={pageMeta.description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      {/* Indexing */}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  )
}

function NotFound() {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    if (seconds <= 0) { navigate('/'); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds, navigate])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-[var(--brand-soft)] flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🦷</span>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">¡Ups!</h1>
        <p className="text-xl font-semibold text-gray-700 mb-3">Esta página no existe</p>
        <p className="text-sm text-gray-500 mb-8">
          Puede que la dirección haya cambiado o el enlace esté roto.<br />
          No te preocupes, te llevamos al inicio.
        </p>
        <div className="mb-6">
          <div className="w-48 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - seconds) / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Redirigiendo en <strong>{seconds}s</strong>…</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary px-8 py-3 text-base"
        >
          Ir al inicio ahora
        </button>
      </div>
    </div>
  )
}

export default function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <AppLayout>
          <RouteMeta />
          <ScrollToTop />
          <RouteAnalytics />
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Catálogo público */}
            <Route path="/productos" element={<Products />} />
            <Route path="/productos/:slug" element={<ProductDetail />} />

            <Route path="/nosotros" element={<QuienesSomos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/defensa-consumidor" element={<DefensaConsumidor />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/devoluciones" element={<Devoluciones />} />
            <Route path="/preguntas-frecuentes" element={<FAQ />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/politicas" element={<Politicas />} />
            
            {/* Comparador de productos */}
            <Route path="/comparar" element={<Comparar />} />

            {/* Carrito y checkout */}
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido/:code" element={<OrderDetail />} />

            {/* Autenticación */}
            <Route path="/iniciar-sesion" element={<SignIn />} />
            <Route path="/registrarme" element={<Register />} />
            <Route path="/recuperar" element={<ForgotPassword />} />
            <Route path="/resetear-contrasena" element={<ResetPassword />} />

            {/* Favoritos (requiere auth) */}
            <Route
              path="/favoritos"
              element={
                <ProtectedRoute>
                  <Favoritos />
                </ProtectedRoute>
              }
            />

            {/* Cuenta protegida */}
            <Route
              path="/mi-cuenta"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>

          <LiveChat />
          <WhatsAppButton />
        </AppLayout>
      </CartProvider>
    </AuthProvider>
  )
}
