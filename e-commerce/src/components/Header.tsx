import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, ChevronDown, MapPin, X, Truck, LogOut, User, Heart, Bell, Package } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import { getWishlist, removeFromWishlist, type WishlistItem } from '../api/wishlist'
import { useNotifications, type AppNotification } from '../hooks/useNotifications'
import logoBlanco from '../assets/logo-blanco.png'
import AdvancedSearch from '../components/AdvancedSearch'
import MobileMenu from '../components/MobileMenu'
import { listCategories, type Category } from '../api/categories'
import { storageUrl } from '../api/http'

type MegaMenuColumn = {
  title: string
  items: { label: string; href: string; id: number }[]
}

const NOTIF_ICONS: Record<AppNotification['type'], string> = {
  order_status: '📦',
  order_payment: '💳',
  stock: '🔔',
  offer: '🏷️',
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

  // Favoritos
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const wishlistRef = useRef<HTMLDivElement>(null)

  // Notificaciones
  const { notifications, unread, markAllRead } = useNotifications(isAuthenticated)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated) { setWishlist([]); return }
    getWishlist().then(setWishlist).catch(() => {})
  }, [isAuthenticated])

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

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <>
      {showPostalModal && (
        <PostalModal onClose={() => setShowPostalModal(false)} onSave={handleSaveLocation} />
      )}

      <header className="sticky top-0 z-50 safe-top">

        {/* ── Fila 1: Logo | Buscador | Badge ──────────────────────────── */}
        <div style={{ backgroundColor: 'var(--brand-primary)' }}>
          <div className="mx-auto max-w-7xl px-4 py-3">

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-[200px,1fr,auto] items-center gap-6">
              <Link to="/">
                <img src={logoBlanco} alt="ArtDent" className="h-12 w-auto" />
              </Link>
              <AdvancedSearch onSearch={(q) => navigate(`/productos?q=${encodeURIComponent(q)}`)} />
              <div className="flex items-center gap-2 bg-white/15 border border-white/30 text-white rounded-lg px-4 py-2 select-none whitespace-nowrap">
                <Truck size={18} className="shrink-0" />
                <div className="leading-tight">
                  <p className="text-[12px] font-black tracking-wide">ENVÍOS A TODO EL PAÍS</p>
                  <p className="text-[10px] opacity-80 font-medium">a toda la Argentina</p>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-3">
              <Link to="/" className="flex-1 flex justify-center">
                <img src={logoBlanco} alt="ArtDent" className="h-8 w-auto" />
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                {isAuthenticated && (
                  <Link to="/mi-cuenta" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition">
                    <User size={19} className="text-white" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile: buscador */}
            <div className="mt-2.5 md:hidden">
              <AdvancedSearch onSearch={(q) => navigate(`/productos?q=${encodeURIComponent(q)}`)} />
            </div>
          </div>
        </div>

        {/* ── Fila 2: Nav + Acciones ────────────────────────────────────── */}
        <div className="hidden md:block border-b"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 82%, black)' }}
          onMouseLeave={() => setMenuOpen(null)}>
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative flex items-center justify-between">

              {/* Nav */}
              <nav className="flex items-center gap-6 py-2.5 text-[13px] font-semibold">
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
                <NavLink to="/comparar" className={() => 'text-white/90 hover:text-white transition'}>Comparar</NavLink>
                <NavLink to="/contacto" className={() => 'text-white/90 hover:text-white transition'}>Contacto</NavLink>
              </nav>

              {/* User actions */}
              <div className="flex items-center gap-3 text-[12px] text-white/90 py-2.5">
                {isAuthenticated ? (
                  <>
                    <span className="font-semibold truncate max-w-[100px]">Hola, {firstName}</span>
                    <span className="text-white/30">|</span>
                    <Link to="/mi-cuenta" className="hover:text-white hover:underline transition">Mi cuenta</Link>
                    <span className="text-white/30">|</span>
                    <Link to="/mi-cuenta" className="hover:text-white hover:underline transition">Mis compras</Link>
                    <span className="text-white/30">|</span>

                    {/* ── Favoritos ── */}
                    <div ref={wishlistRef} className="relative">
                      <button onClick={() => setWishlistOpen((v) => !v)}
                        className="flex items-center gap-1 hover:text-white transition font-medium relative">
                        <Heart size={17} className={wishlist.length > 0 ? 'fill-white/60' : ''} />
                        <span>Favoritos</span>
                        {wishlist.length > 0 && (
                          <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[var(--brand-primary)]">
                            {wishlist.length > 9 ? '9+' : wishlist.length}
                          </span>
                        )}
                      </button>

                      {wishlistOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-sm">Favoritos</span>
                            <button onClick={() => setWishlistOpen(false)}><X size={14} className="text-gray-400" /></button>
                          </div>
                          {wishlist.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                              <Heart size={28} className="mx-auto mb-2 text-gray-200" />
                              Agregá acá los productos que te gustaron para poder verlos más tarde.
                            </div>
                          ) : (
                            <ul className="max-h-96 overflow-y-auto divide-y">
                              {wishlist.slice(0, 5).map((item) => {
                                const p = item.product
                                if (!p) return null
                                const src = storageUrl(p.primary_image_url)
                                const base = p.price
                                const final = p.price_final ?? p.pricing?.final ?? base
                                const discountPct = p.pricing?.discount_percent
                                  ?? (base > final ? Math.round((1 - final / base) * 100) : 0)
                                const hasDiscount = discountPct > 0 && final < base
                                return (
                                  <li key={item.id} className="px-4 py-3 hover:bg-gray-50 transition">
                                    <div className="flex items-start gap-3">
                                      {/* Imagen */}
                                      <Link to={`/productos/${p.id}`} onClick={() => setWishlistOpen(false)}
                                        className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border">
                                        {src
                                          ? <img src={src} alt={p.name} className="w-full h-full object-contain p-1" />
                                          : <Package size={20} className="text-gray-300" />}
                                      </Link>
                                      {/* Info */}
                                      <div className="flex-1 min-w-0">
                                        <Link to={`/productos/${p.id}`} onClick={() => setWishlistOpen(false)}
                                          className="text-xs text-gray-700 line-clamp-2 hover:text-[var(--brand-primary)] transition leading-snug">
                                          {p.name}
                                        </Link>
                                        <div className="mt-1.5">
                                          {hasDiscount && (
                                            <p className="text-[10px] text-gray-400 line-through leading-none">
                                              ${base.toLocaleString('es-AR')}
                                            </p>
                                          )}
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-gray-900 leading-none">
                                              ${final.toLocaleString('es-AR')}
                                            </p>
                                            {hasDiscount && (
                                              <span className="text-[10px] font-semibold text-green-600">
                                                {discountPct}% OFF
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <button
                                          onClick={async () => {
                                            await removeFromWishlist(item.id)
                                            setWishlist((prev) => prev.filter((i) => i.id !== item.id))
                                          }}
                                          className="mt-1.5 text-[11px] text-[var(--brand-primary)] hover:underline">
                                          Eliminar
                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                          <div className="px-4 py-3 border-t bg-gray-50">
                            <Link to="/favoritos" onClick={() => setWishlistOpen(false)}
                              className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">
                              Ver todos los favoritos y listas →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-white/30">|</span>

                    {/* ── Notificaciones ── */}
                    <div ref={notifRef} className="relative">
                      <button
                        onClick={() => { setNotifOpen((v) => { if (!v) markAllRead(); return !v }) }}
                        className="relative flex items-center justify-center hover:text-white transition"
                        aria-label="Notificaciones">
                        <Bell size={17} />
                        {unread > 0 && (
                          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </button>

                      {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-sm">Notificaciones</span>
                            <button onClick={() => setNotifOpen(false)}><X size={14} className="text-gray-400" /></button>
                          </div>
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                              <Bell size={28} className="mx-auto mb-2 text-gray-200" />
                              No tenés notificaciones por el momento.
                            </div>
                          ) : (
                            <ul className="max-h-80 overflow-y-auto divide-y">
                              {notifications.map((n) => (
                                <li key={n.id} className={`transition ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                                  {n.orderCode ? (
                                    <Link to={`/pedido/${n.orderCode}`} onClick={() => setNotifOpen(false)}
                                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                                      <span className="text-base shrink-0 mt-0.5">{NOTIF_ICONS[n.type]}</span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                                      </div>
                                      {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0 mt-1.5" />}
                                    </Link>
                                  ) : (
                                    <div className="flex items-start gap-3 px-4 py-3">
                                      <span className="text-base shrink-0 mt-0.5">{NOTIF_ICONS[n.type]}</span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                                      </div>
                                      {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0 mt-1.5" />}
                                    </div>
                                  )}
                                </li>
                              ))}
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

                    <span className="text-white/30">|</span>

                    {/* Carrito */}
                    <Link to="/carrito" className="relative flex items-center gap-1 hover:text-white transition font-medium">
                      <ShoppingCart size={18} />
                      {count > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[var(--brand-primary)]">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </Link>

                    <button onClick={() => signOut()} title={`Cerrar sesión (${user?.email ?? ''})`}
                      className="hover:text-red-300 transition" aria-label="Cerrar sesión">
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/registrarme" className="hover:text-white hover:underline transition">Creá tu cuenta</Link>
                    <span className="text-white/30">|</span>
                    <Link to="/iniciar-sesion" className="hover:text-white hover:underline transition font-semibold">Ingresá</Link>
                    <span className="text-white/30">|</span>
                    <Link to="/iniciar-sesion" className="hover:text-white hover:underline transition">Mis compras</Link>
                    <span className="text-white/30">|</span>
                    <Link to="/carrito" className="relative flex items-center gap-1 hover:text-white transition font-medium">
                      <ShoppingCart size={18} />
                      {count > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[var(--brand-primary)]">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </div>
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
    </>
  )
}
