import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import logoAzul from '../assets/logo-azul.png'

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'text-sm font-semibold transition',
    isActive ? 'text-[var(--brand-primary)]' : 'text-gray-700 hover:text-[var(--brand-primary)]'
  ].join(' ')
}

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth()
  const cart = useCart()
  const count = cart.items.reduce((acc, it) => acc + (it.qty || 0), 0)

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAzul} alt="ARTDENT" className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navClass}>Inicio</NavLink>
          <NavLink to="/productos" className={navClass}>Productos</NavLink>
          <NavLink to="/mi-cuenta" className={navClass}>Mi cuenta</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/carrito" className="btn btn-outline">
            <ShoppingCart size={18} />
            Carrito
            {count > 0 ? (
              <span className="ml-2 rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-xs font-bold text-white">
                {Math.round(count)}
              </span>
            ) : null}
          </Link>

          {isAuthenticated ? (
            <button
              className="btn btn-primary"
              onClick={() => signOut()}
              title={user ? `Salir (${user.email})` : 'Salir'}
            >
              <User size={18} />
              Salir
            </button>
          ) : (
            <Link to="/iniciar-sesion" className="btn btn-primary">
              <User size={18} />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
