import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, ChevronDown, MapPin, X, LogOut, User, Heart, Bell, Package, ShoppingBag, CreditCard } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import { getWishlist, type WishlistItem } from '../api/wishlist'
import { useNotifications, type AppNotification } from '../hooks/useNotifications'
import logoBlanco from '../assets/logo-blanco.png'
import AdvancedSearch from '../components/AdvancedSearch'
import MobileMenu from '../components/MobileMenu'
import { listCategories, type Category } from '../api/categories'

type MegaMenuColumn = {
  title: string
  items: { label: string; href: string; id: number }[]
}

const NOTIF_ICON_COMPONENTS: Record<AppNotification['type'], React.ElementType> = {
  order_status: ShoppingBag,
  order_payment: CreditCard,
  stock: Bell,
  offer: Bell,
}

const NOTIF_COLORS: Record<AppNotification['type'], string> = {
  order_status: 'text-[var(--brand-primary)]',
  order_payment: 'text-green-600',
  stock: 'text-amber-500',
  offer: 'text-purple-500',
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

// ── Postal Code Modal ─────────────────────────────────────────────────────────
function PostalModal({ onClose, onSave }: { onClose: () => void; onSave: (cp: string, name: string) => void }) {
  const [value, setValue] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSave = () => {
    const cp = value.trim()
    if (!/^\d{4}$/.test(cp)) { setError('Ingresá un código postal válido (4 dígitos)'); return }
    onSave(cp, `CP ${cp}`); onClose()
  }

  const handleDetect = () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización'); return }
    setDetecting(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
          )
          const data = await res.json()
          const addr = data.address ?? {}
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || ''
          const postcode = (addr.postcode ?? '').replace(/\s/g, '').slice(0, 4)
          if (postcode) setValue(postcode)
          if (city) onSave(postcode || value.trim(), city)
          else if (postcode) onSave(postcode, `CP ${postcode}`)
          if (city || postcode) onClose()
          else setError('No pudimos detectar tu ubicación exacta. Ingresala manualmente.')
        } catch { setError('Error al detectar la ubicación. Intentá manualmente.') }
        finally { setDetecting(false) }
      },
      () => { setError('Permiso de ubicación denegado. Ingresá el código manualmente.'); setDetecting(false) },
      { timeout: 8000 }
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">¿A dónde enviamos?</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Ingresá tu código postal para ver tiempos y costos de envío.</p>
        <div className="flex gap-2 mb-3">
          <input ref={inputRef} type="text" inputMode="numeric" maxLength={4} placeholder="Ej: 3600" value={value}
            onChange={(e) => { setValue(e.target.value.replace(/\D/g, '')); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="input flex-1" />
          <button onClick={handleSave} className="btn btn-primary px-5 font-bold">Usar</button>
        </div>
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <div className="flex flex-col gap-2">
          <button onClick={handleDetect} disabled={detecting}
            className="flex items-center justify-center gap-2 text-sm text-[var(--brand-primary)] hover:opacity-80 transition font-medium">
            <MapPin size={14} />
            {detecting ? 'Detectando...' : 'Detectar mi ubicación automáticamente'}
          </button>
          <a href="https://www.oca.com.ar/Busquedas/CodigosPostales" target="_blank" rel="noopener noreferrer"
            className="text-center text-sm text-[var(--brand-primary)] hover:underline">No sé mi código</a>
        </div>
      </div>
    </div>
  )
}

// ── Main Header ───────────────────────────────────────────────────────────────
export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const count = cart.items.reduce((acc, it) => acc + (it.qty || 0), 0)

  const [menuOpen, setMenuOpen] = useState<null | 'productos' | 'marcas'>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [showPostalModal, setShowPostalModal] = useState(false)

  // Favoritos — React Query para sincronizarse con WishlistButton automáticamente
  useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const wishlistRef = useRef<HTMLDivElement>(null)

  // Notificaciones
  const { notifications, unread, markOneRead, markAllRead, toastNotif, dismissToast } = useNotifications(isAuthenticated)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wishlistRef.current && !wishlistRef.current.contains(e.target as Node)) setWishlistOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSaveLocation = (cp: string, name: string) => {
    localStorage.setItem('artdent_postal_code', cp)
    localStorage.setItem('artdent_location_name', name)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingCategories(true)
        setCategories(await listCategories())
      } catch (e) { console.error('Error al cargar categorías:', e) }
      finally { setIsLoadingCategories(false) }
    }
    load()
  }, [])

  const megaMenuData = useMemo(() => {
    const main = categories.filter((c) => !c.parent_id)
    const cols: MegaMenuColumn[] = []
    const per = Math.ceil(main.length / 3)
    for (let i = 0; i < 3; i++) {
      const slice = main.slice(i * per, i * per + per)
      if (slice.length > 0)
        cols.push({
          title: i === 0 ? 'Categorías principales' : i === 1 ? 'Más categorías' : 'Otras categorías',
          items: slice.map((c) => ({ id: c.id, label: c.name, href: `/productos?cat=${c.id}` })),
        })
    }
    return cols
  }, [categories])

  const marcasMegaMenu = useMemo(() => [
    {
      title: 'Marcas destacadas',
      items: [
        { id: 1, label: 'Ivoclar Vivadent', href: '/productos?marca=ivoclar' },
        { id: 2, label: 'Shofu', href: '/productos?marca=shofu' },
        { id: 3, label: 'Renfert', href: '/productos?marca=renfert' },
        { id: 4, label: 'Whip-Mix', href: '/productos?marca=whipmix' },
      ],
    },
    {
      title: 'Impresión 3D',
      items: [
        { id: 5, label: 'Phrozen', href: '/productos?marca=phrozen' },
        { id: 6, label: 'Harz Labs', href: '/productos?marca=harz-labs' },
      ],
    },
  ], [])

  const initials = (user?.name ?? '').split(' ').filter(Boolean).slice(0, 3).map(w => w[0].toUpperCase()).join('')

  return (
    <>
      {showPostalModal && (
        <PostalModal onClose={() => setShowPostalModal(false)} onSave={handleSaveLocation} />
      )}

      <header className="sticky top-0 z-50 safe-top">

        {/* ── Fila 1: Logo | Buscador | Acciones ───────────────────────── */}
        <div style={{ backgroundColor: 'var(--brand-primary)' }}>
          <div className="mx-auto max-w-7xl px-4 py-3">

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-[180px,1fr,auto] items-center gap-6">
              <Link to="/">
                <img src={logoBlanco} alt="ArtDent" className="h-12 w-auto" />
              </Link>
              <AdvancedSearch onSearch={(q) => navigate(`/productos?q=${encodeURIComponent(q)}`)} />

              {/* Acciones desktop */}
              <div className="flex items-center gap-4 text-white self-center">

                {/* Login / cuenta */}
                {isAuthenticated ? (
                  <div ref={wishlistRef} className="relative">
                    <button onClick={() => setWishlistOpen((v) => !v)}
                      className="flex items-center gap-2 hover:opacity-90 transition">
                      {/* Avatar con iniciales */}
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow">
                        <span className="text-[var(--brand-primary)] text-[11px] font-extrabold tracking-tight leading-none">
                          {initials}
                        </span>
                      </div>
                      <div className="leading-tight text-left">
                        <p className="text-[13px] font-bold text-white uppercase leading-tight">{user?.name}</p>
                        <p className="text-[11px] text-white/70">Mi cuenta ▾</p>
                      </div>
                    </button>
                    {wishlistOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden text-gray-800 text-sm">
                        {/* Cabecera del dropdown */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--brand-primary)' }}>
                            <span className="text-white text-[11px] font-extrabold">{initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs leading-tight truncate uppercase">{user?.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <Link to="/mi-cuenta" onClick={() => setWishlistOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 border-b">
                          <User size={15} className="text-[var(--brand-primary)]" /> Mi perfil
                        </Link>
                        <Link to="/mi-cuenta" onClick={() => setWishlistOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 border-b">
                          <Package size={15} className="text-[var(--brand-primary)]" /> Mis compras
                        </Link>
                        <Link to="/favoritos" onClick={() => setWishlistOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 border-b">
                          <Heart size={15} className="text-[var(--brand-primary)]" /> Favoritos
                        </Link>
                        <button onClick={async () => { setWishlistOpen(false); await signOut(); window.location.replace('/') }}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600">
                          <LogOut size={15} /> Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/iniciar-sesion" className="flex items-center gap-2 hover:opacity-80 transition">
                    <User size={26} strokeWidth={1.5} />
                    <div className="leading-tight text-left">
                      <p className="text-[13px] font-bold">¡Hola! Iniciá sesión</p>
                      <p className="text-[11px] opacity-70">O podés registrarte</p>
                    </div>
                  </Link>
                )}

                {/* Notificaciones (solo autenticado) */}
                {isAuthenticated && (
                  <div ref={notifRef} className="relative flex items-center">
                    <button onClick={() => setNotifOpen((v) => !v)}
                      className="relative flex items-center justify-center hover:opacity-80 transition" aria-label="Notificaciones">
                      <Bell size={24} strokeWidth={1.5} />
                      {unread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </button>
                    {notifOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                          <span className="font-semibold text-gray-800 text-sm">
                            Notificaciones
                            {unread > 0 && (
                              <span className="ml-2 text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                                {unread} nuevas
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            {unread > 0 && (
                              <button onClick={markAllRead} className="text-[11px] text-[var(--brand-primary)] hover:underline font-medium">Todo leído</button>
                            )}
                            <button onClick={() => setNotifOpen(false)}><X size={14} className="text-gray-400" /></button>
                          </div>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            <Bell size={28} className="mx-auto mb-2 text-gray-200" />
                            No tenés notificaciones por el momento.
                          </div>
                        ) : (
                          <ul className="max-h-80 overflow-y-auto divide-y">
                            {notifications.map((n) => {
                              const Icon = NOTIF_ICON_COMPONENTS[n.type] ?? Bell
                              const color = NOTIF_COLORS[n.type]
                              const handleClick = () => { markOneRead(n.id); setNotifOpen(false) }
                              return (
                                <li key={n.id} className="bg-blue-50 hover:bg-blue-100/60 transition cursor-pointer">
                                  {n.orderCode ? (
                                    <Link to={`/pedido/${n.orderCode}`} onClick={handleClick} className="flex items-start gap-3 px-4 py-3">
                                      <Icon size={15} className={`${color} shrink-0 mt-0.5`} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                                      </div>
                                      <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0 mt-1.5" />
                                    </Link>
                                  ) : (
                                    <div onClick={handleClick} className="flex items-start gap-3 px-4 py-3">
                                      <Icon size={15} className={`${color} shrink-0 mt-0.5`} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                                      </div>
                                      <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0 mt-1.5" />
                                    </div>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                        <div className="px-4 py-3 border-t bg-gray-50">
                          <Link to="/mi-cuenta" onClick={() => setNotifOpen(false)}
                            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">
                            Ver todos mis pedidos →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Carrito */}
                <Link to="/carrito" className="relative flex items-center justify-center hover:opacity-80 transition" aria-label="Carrito">
                  <ShoppingCart size={24} strokeWidth={1.5} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </Link>

              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center justify-center">
              <Link to="/">
                <img src={logoBlanco} alt="ArtDent" className="h-11 w-auto" />
              </Link>
            </div>

            {/* Mobile: buscador */}
            <div className="mt-2.5 md:hidden">
              <AdvancedSearch onSearch={(q) => navigate(`/productos?q=${encodeURIComponent(q)}`)} />
            </div>
          </div>
        </div>

        {/* ── Fila 2: Nav centrado ──────────────────────────────────────── */}
        <div className="hidden md:block border-b"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 82%, black)' }}
          onMouseLeave={() => setMenuOpen(null)}>
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative flex items-center justify-center">

              {/* Nav */}
              <nav className="flex items-center gap-8 py-2.5 text-[15px] font-semibold">
                <NavLink to="/" className={() => 'text-white/90 hover:text-white transition'}>Inicio</NavLink>
                <Link to="/productos" className="flex items-center gap-1 text-white/90 hover:text-white transition"
                  onMouseEnter={() => setMenuOpen('productos')} onFocus={() => setMenuOpen('productos')}
                  aria-haspopup="true" aria-expanded={menuOpen === 'productos'}>
                  Productos
                  <ChevronDown size={16} className={`transition-transform ${menuOpen === 'productos' ? 'rotate-180' : ''}`} />
                </Link>
                <Link to="/productos" className="flex items-center gap-1 text-white/90 hover:text-white transition"
                  onMouseEnter={() => setMenuOpen('marcas')} onFocus={() => setMenuOpen('marcas')}
                  aria-haspopup="true" aria-expanded={menuOpen === 'marcas'}>
                  Marcas
                  <ChevronDown size={16} className={`transition-transform ${menuOpen === 'marcas' ? 'rotate-180' : ''}`} />
                </Link>
                <NavLink to="/contacto" className={() => 'text-white/90 hover:text-white transition'}>Contacto</NavLink>
              </nav>

            </div>

            {/* Mega menu */}
            {menuOpen && (
              <div className="absolute left-0 right-0 z-50">
                <div className="mx-auto max-w-7xl px-4">
                  <div className="mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl"
                    onMouseEnter={() => setMenuOpen(menuOpen)}>
                    {menuOpen === 'productos' ? (
                      <>
                        <div className="grid gap-6 p-6 md:grid-cols-3">
                          {isLoadingCategories ? (
                            <div className="col-span-3 py-8 text-center">
                              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-primary)] border-r-transparent" />
                              <p className="mt-2 text-sm text-gray-600">Cargando categorías...</p>
                            </div>
                          ) : megaMenuData.length > 0 ? (
                            megaMenuData.map((col) => (
                              <div key={col.title}>
                                <p className="text-xs font-semibold tracking-wide text-[var(--brand-primary)]">{col.title}</p>
                                <ul className="mt-3 space-y-2 text-sm">
                                  {col.items.map((it) => (
                                    <li key={it.id}>
                                      <Link to={it.href} className="text-gray-700 hover:text-[var(--brand-primary)] transition"
                                        onClick={() => setMenuOpen(null)}>{it.label}</Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 py-8 text-center">
                              <p className="text-sm text-gray-600">No hay categorías disponibles</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 border-t bg-[rgba(57,123,156,0.06)] px-6 py-3">
                          <Link to="/productos" className="text-xs font-semibold text-[var(--brand-primary)] hover:opacity-90"
                            onClick={() => setMenuOpen(null)}>Ver todo →</Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-6 p-6 md:grid-cols-3">
                          {marcasMegaMenu.map((col) => (
                            <div key={col.title}>
                              <p className="text-xs font-semibold tracking-wide text-[var(--brand-primary)]">{col.title}</p>
                              <ul className="mt-3 space-y-2 text-sm">
                                {col.items.map((it) => (
                                  <li key={it.id}>
                                    <Link to={it.href} className="text-gray-700 hover:text-[var(--brand-primary)] transition"
                                      onClick={() => setMenuOpen(null)}>{it.label}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t bg-[rgba(57,123,156,0.06)] px-6 py-3">
                          <p className="text-xs text-gray-600">Marcas de confianza para profesionales</p>
                          <Link to="/productos" className="text-xs font-semibold text-[var(--brand-primary)] hover:opacity-90"
                            onClick={() => setMenuOpen(null)}>Ver todo →</Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Toast — bottom right */}
      {toastNotif && (
        <div className="fixed bottom-6 right-6 z-[9999] w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ animation: 'slideInUp 0.3s ease' }}>
          <div className="flex items-start gap-3 px-4 py-3.5">
            {(() => {
              const Icon = NOTIF_ICON_COMPONENTS[toastNotif.type] ?? Bell
              const color = NOTIF_COLORS[toastNotif.type]
              return <Icon size={18} className={`${color} shrink-0 mt-0.5`} />
            })()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{toastNotif.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{toastNotif.body}</p>
              {toastNotif.orderCode && (
                <Link
                  to={`/pedido/${toastNotif.orderCode}`}
                  onClick={() => { markOneRead(toastNotif.id); dismissToast() }}
                  className="mt-1.5 inline-block text-xs text-[var(--brand-primary)] hover:underline font-semibold"
                >
                  Ver pedido →
                </Link>
              )}
            </div>
            <button onClick={dismissToast} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={14} />
            </button>
          </div>
          <div className="h-1 bg-[var(--brand-primary)]" style={{ animation: 'shrinkBar 5s linear forwards' }} />
        </div>
      )}
    </>
  )
}
