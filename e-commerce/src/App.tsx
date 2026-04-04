import { Routes, Route, useNavigate, useLocation, matchPath } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { AuthProvider } from './store/auth'
import { CartProvider } from './store/cart'
import { Helmet } from 'react-helmet-async'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LiveChat from './components/LiveChat'
import { analytics } from './api/analytics'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderDetail from './pages/OrderDetail'
import SignIn from './pages/SignIn'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Account from './pages/Account'
import Comparar from './pages/Comparar'
import Contacto from './pages/Contacto'
import DefensaConsumidor from './pages/DefensaConsumidor'
import Privacidad from './pages/Privacidad'
import Terminos from './pages/Terminos'
import Cookies from './pages/Cookies'
import Devoluciones from './pages/Devoluciones'
import Favoritos from './pages/Favoritos'
import FAQ from './pages/FAQ'
import Ayuda from './pages/Ayuda'
import Politicas from './pages/Politicas'
import QuienesSomos from './pages/QuienesSomos'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

type RouteTitleRule = {
  path: string
  title: string
  end?: boolean
}

const ROUTE_TITLE_RULES: RouteTitleRule[] = [
  { path: '/', title: 'ArtDent Insumos Odontológicos', end: true },
  { path: '/productos', title: 'Productos', end: true },
  { path: '/productos/:slug', title: 'Producto' },
  { path: '/nosotros', title: 'Nosotros' },
  { path: '/contacto', title: 'Contacto' },
  { path: '/defensa-consumidor', title: 'Defensa del Consumidor' },
  { path: '/privacidad', title: 'Política de Privacidad' },
  { path: '/terminos', title: 'Términos y Condiciones' },
  { path: '/cookies', title: 'Política de Cookies' },
  { path: '/devoluciones', title: 'Cambios y Devoluciones' },
  { path: '/preguntas-frecuentes', title: 'Preguntas Frecuentes' },
  { path: '/ayuda', title: 'Ayuda' },
  { path: '/politicas', title: 'Políticas' },
  { path: '/comparar', title: 'Comparar Productos' },
  { path: '/carrito', title: 'Carrito' },
  { path: '/checkout', title: 'Checkout' },
  { path: '/pedido/:code', title: 'Detalle del Pedido' },
  { path: '/iniciar-sesion', title: 'Iniciar Sesión' },
  { path: '/registrarme', title: 'Crear Cuenta' },
  { path: '/recuperar', title: 'Recuperar Contraseña' },
  { path: '/resetear-contrasena', title: 'Resetear Contraseña' },
  { path: '/favoritos', title: 'Favoritos' },
  { path: '/mi-cuenta', title: 'Mi Cuenta' },
]

function resolveRouteTitle(pathname: string) {
  const match = ROUTE_TITLE_RULES.find((rule) =>
    matchPath({ path: rule.path, end: rule.end ?? true }, pathname)
  )

  if (!match) return 'Página no encontrada | ArtDent'
  if (match.title === 'ArtDent Insumos Odontológicos') return match.title

  return `${match.title} | ArtDent`
}

function RouteMeta() {
  const { pathname } = useLocation()
  const pageTitle = useMemo(() => resolveRouteTitle(pathname), [pathname])

  return (
    <Helmet>
      <title>{pageTitle}</title>
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
  // Inicializar analytics al cargar la app
  useEffect(() => {
    analytics.init()
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <AppLayout>
          <RouteMeta />
          <ScrollToTop />
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

          {/* Chat en vivo - sin props, ya que el componente usa env vars directamente */}
          <LiveChat />
        </AppLayout>
      </CartProvider>
    </AuthProvider>
  )
}
