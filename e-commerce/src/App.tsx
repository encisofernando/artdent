import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './store/auth'
import { CartProvider } from './store/cart'
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
import Account from './pages/Account'
import Comparar from './pages/Comparar'
import Contacto from './pages/Contacto'

function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-sm text-gray-600">Página no encontrada.</p>
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
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Catálogo público */}
            <Route path="/productos" element={<Products />} />
            <Route path="/productos/:id" element={<ProductDetail />} />

            <Route path="/contacto" element={<Contacto />} />
            
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