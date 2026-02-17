import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, ChevronDown, Menu } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import logoAzul from '../assets/logo-azul.png'
import AdvancedSearch from '../components/AdvancedSearch'
import MobileMenu from '../components/MobileMenu'
import { listCategories, type Category } from '../api/categories'

type MegaMenuColumn = {
  title: string
  items: { label: string; href: string; id: number }[]
}

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const count = cart.items.reduce((acc, it) => acc + (it.qty || 0), 0)

  const [menuOpen, setMenuOpen] = useState<null | 'productos' | 'marcas'>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // Cargar categorías desde el backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const data = await listCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Organizar categorías en columnas para el mega menú
  const megaMenuData = useMemo(() => {
    const mainCategories = categories.filter((cat) => !cat.parent_id)
    const columns: MegaMenuColumn[] = []
    const itemsPerColumn = Math.ceil(mainCategories.length / 3)
    
    for (let i = 0; i < 3; i++) {
      const start = i * itemsPerColumn
      const end = start + itemsPerColumn
      const columnCategories = mainCategories.slice(start, end)
      
      if (columnCategories.length > 0) {
        columns.push({
          title: i === 0 ? 'Categorías principales' : i === 1 ? 'Más categorías' : 'Otras categorías',
          items: columnCategories.map((cat) => ({
            id: cat.id,
            label: cat.name,
            href: `/productos?cat=${cat.id}`,
          })),
        })
      }
    }

    return columns
  }, [categories])

  const marcasMegaMenu = useMemo(
    () => [
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
    ],
    []
  )

  return (
    <>
      <header className="sticky top-0 z-50 safe-top">
        {/* Barra superior (anuncio) */}
        <div className="bg-[var(--brand-primary)] text-white">
          <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-semibold">
            3 cuotas sin interés · Envíos a todo el país · Soporte especializado
          </div>
        </div>

        {/* Header principal */}
        <div className="border-b bg-white/85 backdrop-blur header-main">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid grid-cols-[auto,1fr,auto] md:grid-cols-[1fr,auto,1fr] items-center gap-4">
              {/* Menú hamburguesa (solo mobile) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition active:bg-gray-200"
                aria-label="Abrir menú"
              >
                <Menu size={20} className="text-gray-700" />
              </button>

              {/* Search (desktop) */}
              <div className="hidden md:block">
                <div className="max-w-md">
                  <AdvancedSearch onSearch={(query) => navigate(`/productos?q=${encodeURIComponent(query)}`)} />
                </div>
              </div>

              {/* Logo */}
              <Link to="/" className="flex items-center justify-center gap-3">
                <img src={logoAzul} alt="ARTDENT" className="h-10 w-auto" />
              </Link>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <Link to="/carrito" className="btn btn-outline relative">
                  <ShoppingCart size={18} />
                  <span className="hidden sm:inline">Carrito</span>
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 md:relative md:top-0 md:right-0 md:ml-2 rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-xs font-bold text-white min-w-[20px] text-center">
                      {Math.round(count)}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => signOut()}
                    title={user ? `Salir (${user.email})` : 'Salir'}
                  >
                    <User size={18} />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                ) : (
                  <Link to="/iniciar-sesion" className="btn btn-primary">
                    <User size={18} />
                    <span className="hidden sm:inline">Iniciar sesión</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Search (mobile) */}
            <div className="mt-3 md:hidden">
              <AdvancedSearch onSearch={(query) => navigate(`/productos?q=${encodeURIComponent(query)}`)} />
            </div>
          </div>
        </div>

        {/* Barra de navegación (solo desktop/tablet) */}
        <div
          className="border-b hidden md:block"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 92%, black)' }}
          onMouseLeave={() => setMenuOpen(null)}
        >
          <div className="mx-auto max-w-7xl px-4">
            <nav className="relative flex items-center justify-center gap-6 py-2 text-sm font-semibold">
              <NavLink to="/" className={() => 'text-white/90 hover:text-white transition'}>
                Inicio
              </NavLink>

              <Link
                to="/productos"
                className="flex items-center gap-1 text-white/90 hover:text-white transition"
                onMouseEnter={() => setMenuOpen('productos')}
                onFocus={() => setMenuOpen('productos')}
                aria-haspopup="true"
                aria-expanded={menuOpen === 'productos'}
              >
                Productos
                <ChevronDown size={14} className={`transition-transform ${menuOpen === 'productos' ? 'rotate-180' : ''}`} />
              </Link>

              <Link
                to="/productos"
                className="flex items-center gap-1 text-white/90 hover:text-white transition"
                onMouseEnter={() => setMenuOpen('marcas')}
                onFocus={() => setMenuOpen('marcas')}
                aria-haspopup="true"
                aria-expanded={menuOpen === 'marcas'}
              >
                Marcas
                <ChevronDown size={14} className={`transition-transform ${menuOpen === 'marcas' ? 'rotate-180' : ''}`} />
              </Link>

              <NavLink to="/comparar" className={() => 'text-white/90 hover:text-white transition'}>
                Comparar
              </NavLink>
              <NavLink to="/contacto" className={() => 'text-white/90 hover:text-white transition'}>
                Contacto
              </NavLink>
            </nav>

            {/* Mega menu */}
            {menuOpen && (
              <div className="absolute left-0 right-0 z-50">
                <div className="mx-auto max-w-7xl px-4">
                  <div
                    className="mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl"
                    onMouseEnter={() => setMenuOpen(menuOpen)}
                  >
                    {menuOpen === 'productos' ? (
                      <>
                        <div className="grid gap-6 p-6 md:grid-cols-3">
                          {isLoadingCategories ? (
                            <div className="col-span-3 py-8 text-center">
                              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-primary)] border-r-transparent"></div>
                              <p className="mt-2 text-sm text-gray-600">Cargando categorías...</p>
                            </div>
                          ) : megaMenuData.length > 0 ? (
                            megaMenuData.map((col) => (
                              <div key={col.title}>
                                <p className="text-xs font-semibold tracking-wide text-[var(--brand-primary)]">
                                  {col.title}
                                </p>
                                <ul className="mt-3 space-y-2 text-sm">
                                  {col.items.map((it) => (
                                    <li key={it.id}>
                                      <Link
                                        to={it.href}
                                        className="text-gray-700 hover:text-[var(--brand-primary)] transition"
                                        onClick={() => setMenuOpen(null)}
                                      >
                                        {it.label}
                                      </Link>
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
                        <div className="flex items-center justify-between gap-3 border-t bg-[rgba(57,123,156,0.06)] px-6 py-3">
                          <p className="text-xs text-gray-600">
                            Paleta ARTDENT: #397B9C · #5AAD9C · #ACD6CE
                          </p>
                          <Link
                            to="/productos"
                            className="text-xs font-semibold text-[var(--brand-primary)] hover:opacity-90"
                            onClick={() => setMenuOpen(null)}
                          >
                            Ver todo →
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-6 p-6 md:grid-cols-3">
                          {marcasMegaMenu.map((col) => (
                            <div key={col.title}>
                              <p className="text-xs font-semibold tracking-wide text-[var(--brand-primary)]">
                                {col.title}
                              </p>
                              <ul className="mt-3 space-y-2 text-sm">
                                {col.items.map((it) => (
                                  <li key={it.id}>
                                    <Link
                                      to={it.href}
                                      className="text-gray-700 hover:text-[var(--brand-primary)] transition"
                                      onClick={() => setMenuOpen(null)}
                                    >
                                      {it.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t bg-[rgba(57,123,156,0.06)] px-6 py-3">
                          <p className="text-xs text-gray-600">
                            Marcas de confianza para profesionales
                          </p>
                          <Link
                            to="/productos"
                            className="text-xs font-semibold text-[var(--brand-primary)] hover:opacity-90"
                            onClick={() => setMenuOpen(null)}
                          >
                            Ver todo →
                          </Link>
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

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}