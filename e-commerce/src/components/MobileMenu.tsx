import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ChevronRight, Home, Package, Sparkles, Mail } from 'lucide-react'
import { useAuth } from '../store/auth'
import { listCategories, type Category } from '../api/categories'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAuthenticated, signOut } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedSection, setExpandedSection] = useState<'productos' | 'marcas' | null>(null)
  const panelRef = useRef<HTMLElement>(null)

  const loadCategories = async () => {
    try {
      const data = await listCategories()
      setCategories(data.filter((cat) => !cat.parent_id))
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      loadCategories()
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useFocusTrap(panelRef, isOpen)

  const handleLinkClick = () => {
    onClose()
    setExpandedSection(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[320px] bg-white z-[101] shadow-2xl animate-slide-in-left overflow-hidden flex flex-col outline-none"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Header del menú */}
        <div className="flex items-center justify-between p-4 border-b bg-[var(--brand-primary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Menu className="text-white" size={20} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Menú</p>
              {isAuthenticated && user && (
                <p className="text-xs text-white/80 truncate max-w-[140px]">{user.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-white/10 transition flex items-center justify-center"
            aria-label="Cerrar menú"
          >
            <X className="text-white" size={20} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <nav className="flex-1 overflow-y-auto overscroll-contain">
          <div className="py-2">
            {/* Links principales */}
            <Link
              to="/"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition active:bg-gray-100"
            >
              <Home size={18} className="text-[var(--brand-primary)]" />
              <span className="font-medium text-sm">Inicio</span>
            </Link>

            {/* Productos (expandible) */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'productos' ? null : 'productos')}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition active:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-[var(--brand-primary)]" />
                  <span className="font-medium text-sm">Productos</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    expandedSection === 'productos' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Submenu de productos */}
              {expandedSection === 'productos' && (
                <div className="bg-gray-50 border-l-2 border-[var(--brand-primary)] ml-4 animate-slide-down">
                  <Link
                    to="/productos"
                    onClick={handleLinkClick}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                  >
                    Ver todos los productos
                  </Link>
                  
                  {categories.length > 0 ? (
                    <>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Categorías
                      </div>
                      {categories.slice(0, 8).map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/productos?cat=${cat.id}`}
                          onClick={handleLinkClick}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      {categories.length > 8 && (
                        <Link
                          to="/productos"
                          onClick={handleLinkClick}
                          className="block px-4 py-2.5 text-sm text-[var(--brand-primary)] font-medium hover:bg-white transition"
                        >
                          Ver todas las categorías →
                        </Link>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--brand-primary)] border-r-transparent" />
                      <p className="mt-2 text-xs text-gray-500">Cargando categorías...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Marcas (expandible) */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'marcas' ? null : 'marcas')}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition active:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-[var(--brand-primary)]" />
                  <span className="font-medium text-sm">Marcas</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    expandedSection === 'marcas' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Submenu de marcas */}
              {expandedSection === 'marcas' && (
                <div className="bg-gray-50 border-l-2 border-[var(--brand-primary)] ml-4 animate-slide-down">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Marcas destacadas
                  </div>
                  <Link
                    to="/productos?marca=ivoclar"
                    onClick={handleLinkClick}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                  >
                    Ivoclar Vivadent
                  </Link>
                  <Link
                    to="/productos?marca=shofu"
                    onClick={handleLinkClick}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                  >
                    Shofu
                  </Link>
                  <Link
                    to="/productos?marca=renfert"
                    onClick={handleLinkClick}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                  >
                    Renfert
                  </Link>
                  <Link
                    to="/productos?marca=whipmix"
                    onClick={handleLinkClick}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                  >
                    Whip-Mix
                  </Link>
                  
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">
                    Impresión 3D
                  </div>
                  <Link
                    to="/productos?marca=phrozen"
                    onClick={handleLinkClick}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                  >
                    Phrozen
                  </Link>
                  <Link
                    to="/productos?marca=harz-labs"
                    onClick={handleLinkClick}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white transition"
                  >
                    Harz Labs
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/contacto"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition active:bg-gray-100"
            >
              <Mail size={18} className="text-[var(--brand-primary)]" />
              <span className="font-medium text-sm">Contacto</span>
            </Link>

            {/* Divider */}
            <div className="my-2 border-t" />

            {/* Links secundarios */}
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Más opciones
            </div>
            
            <Link
              to="/promociones"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-gray-50 transition"
            >
              Promociones
            </Link>
            <Link
              to="/novedades"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-gray-50 transition"
            >
              Novedades
            </Link>
            <Link
              to="/nosotros"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-gray-50 transition"
            >
              Quiénes somos
            </Link>
            <Link
              to="/ayuda"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:bg-gray-50 transition"
            >
              Centro de ayuda
            </Link>
          </div>
        </nav>

        {/* Footer del menú */}
        <div className="border-t bg-gray-50 p-4 space-y-2 safe-bottom">
          {isAuthenticated ? (
            <>
              <Link
                to="/mi-cuenta"
                onClick={handleLinkClick}
                className="block w-full py-2.5 px-4 text-center bg-white border border-gray-200 text-[var(--brand-primary)] font-medium rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Mi cuenta
              </Link>
              <button
                onClick={() => {
                  signOut()
                  handleLinkClick()
                }}
                className="block w-full py-2.5 px-4 text-center bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/iniciar-sesion"
                onClick={handleLinkClick}
                className="block w-full py-2.5 px-4 text-center bg-[var(--brand-primary)] text-white font-medium rounded-lg hover:opacity-90 transition text-sm"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registrarse"
                onClick={handleLinkClick}
                className="block w-full py-2.5 px-4 text-center bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-left {
          from { 
            transform: translateX(-100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  )
}