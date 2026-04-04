import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  Heart,
  MoreHorizontal,
  User,
  HelpCircle,
  Phone,
  ChevronRight,
  X,
  Tag,
  Download,
} from 'lucide-react'
import { useCart } from '../store/cart'
import { usePwaInstall } from '../hooks/usePwaInstall'

function useIsActive() {
  const location = useLocation()
  return (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path)
}

export default function BottomNav() {
  const isActive = useIsActive()
  const { canInstall, promptInstall } = usePwaInstall()
  const cart = useCart()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const totalItems = cart.items.reduce((acc, it) => acc + it.qty, 0)

  const TAB = (active: boolean) =>
    `flex-1 flex flex-col items-center justify-end gap-0.5 pb-2 pt-2 transition-colors ${
      active ? 'text-white' : 'text-white/60'
    }`

  const cartActive = isActive('/carrito')

  return (
    <>
      {/* ── Bottom bar ─────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/20"
        style={{ backgroundColor: 'var(--brand-primary)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Carrito central elevado — absoluto relativo al nav */}
        <Link
          to="/carrito"
          className="absolute left-1/2 -translate-x-1/2 -top-3 flex flex-col items-center gap-0.5"
        >
          <div
            className={`w-14 h-14 rounded-full border-4 shadow-md flex items-center justify-center transition-colors ${
              cartActive ? 'bg-white border-white' : 'bg-white/20 border-white/40'
            }`}
          >
            <div className="relative">
              <ShoppingCart
                size={24}
                strokeWidth={2}
                className={cartActive ? 'text-[var(--brand-primary)]' : 'text-white'}
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>
          </div>
          <span className={`text-[10px] font-medium ${cartActive ? 'text-white' : 'text-white/60'}`}>
            Carrito
          </span>
        </Link>

        <div className="flex items-end h-16">

          {/* Inicio */}
          <Link to="/" className={TAB(isActive('/', true))}>
            <Home size={22} strokeWidth={isActive('/', true) ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>

          {/* Productos */}
          <Link to="/productos" className={TAB(isActive('/productos'))}>
            <LayoutGrid size={22} strokeWidth={isActive('/productos') ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">Productos</span>
          </Link>

          {/* Espacio central para el carrito elevado */}
          <div className="flex-1" />

          {/* Favoritos */}
          <Link to="/favoritos" className={TAB(isActive('/favoritos'))}>
            <Heart
              size={22}
              strokeWidth={isActive('/favoritos') ? 2.5 : 1.8}
              fill={isActive('/favoritos') ? 'currentColor' : 'none'}
            />
            <span className="text-[10px] font-medium">Favoritos</span>
          </Link>

          {/* Más */}
          <button onClick={() => setMoreOpen(true)} className={TAB(moreOpen)}>
            <MoreHorizontal size={22} strokeWidth={moreOpen ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">Más</span>
          </button>

        </div>
      </nav>

      {/* ── Drawer "Más" ───────────────────────────────────────────── */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl md:hidden"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="font-bold text-gray-900">Menú</p>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={16} />
              </button>
            </div>
            <ul className="px-4 py-2">
              {[
                { icon: User,       label: 'Mi cuenta',       to: '/mi-cuenta' },
                { icon: Tag,        label: 'Promociones',      to: '/promociones' },
                { icon: HelpCircle, label: 'Centro de ayuda',  to: '/ayuda' },
                { icon: Phone,      label: 'Contacto',         to: '/contacto' },
              ].map(({ icon: Icon, label, to }) => (
                <li key={to}>
                  <button
                    onClick={() => { setMoreOpen(false); navigate(to) }}
                    className="w-full flex items-center gap-3 px-1 py-3.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-soft)] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[var(--brand-primary)]" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-800 text-left">{label}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                </li>
              ))}
              {canInstall && (
                <li>
                  <button
                    onClick={async () => {
                      setMoreOpen(false)
                      await promptInstall()
                    }}
                    className="w-full flex items-center gap-3 px-1 py-3.5 border-t border-gray-100"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-soft)] flex items-center justify-center shrink-0">
                      <Download size={18} className="text-[var(--brand-primary)]" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-800 text-left">Instalar app</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </>
  )
}
