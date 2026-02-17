import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, X } from 'lucide-react'
import { listProducts } from '../api/products'
import { listCategories } from '../api/categories'
import { useCart } from '../store/cart'
import WishlistButton from '../components/WishlistButton'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || '1')
  const categoryId = searchParams.get('category_id')
  const category_id = categoryId ? Number(categoryId) : undefined

  const cart = useCart()
  const [showFilters, setShowFilters] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })

  const query = useQuery({
    queryKey: ['catalog_products', q, page, category_id],
    queryFn: () => listProducts({ q: q || undefined, page, category_id }),
  })

  const products = query.data?.data || []
  const currentPage = query.data?.current_page || 1
  const lastPage = query.data?.last_page || 1

  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const [draftQ, setDraftQ] = useState(q)

  const title = useMemo(() => {
    if (q) return `Productos · "${q}"`
    return 'Productos'
  }, [q])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (draftQ.trim()) next.set('q', draftQ.trim())
      else next.delete('q')
      next.set('page', '1')
      return next
    })
    setShowFilters(false)
  }

  const handleCategoryChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('category_id', value)
      else next.delete('category_id')
      next.set('page', '1')
      return next
    })
    setShowFilters(false)
  }

  const clearFilters = () => {
    setDraftQ('')
    setSearchParams({})
    setShowFilters(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 products-container">
      {/* Header con título y botón de filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Catálogo público. Si iniciás sesión con una cuenta B2B, los precios se ajustan automáticamente.
          </p>
        </div>

        {/* Botón de filtros (solo mobile) */}
        <button
          onClick={() => setShowFilters(true)}
          className="md:hidden btn btn-primary flex items-center justify-center gap-2"
        >
          <Filter size={18} />
          Filtros
          {(q || category_id) && (
            <span className="ml-1 rounded-full bg-white text-[var(--brand-primary)] px-2 py-0.5 text-xs font-bold">
              {[q, category_id].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Formulario de búsqueda (desktop) */}
      <form
        className="hidden md:flex w-full flex-col gap-2 md:w-auto md:flex-row mt-6"
        onSubmit={handleSearch}
      >
        <input
          value={draftQ}
          onChange={(e) => setDraftQ(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="w-full md:w-80 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2"
        />
        <select
          value={category_id ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full md:w-56 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2"
        >
          <option value="">Todas las categorías</option>
          {(categoriesQuery.data || []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit">
          Buscar
        </button>
        {(q || category_id) && (
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-outline"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Panel de filtros mobile (modal) */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[100] md:hidden"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-2xl shadow-2xl md:hidden animate-slide-up max-h-[80vh] flex flex-col">
            {/* Header del panel */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido scrollable */}
            <form onSubmit={handleSearch} className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label htmlFor="mobile-search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar producto
                </label>
                <input
                  id="mobile-search"
                  value={draftQ}
                  onChange={(e) => setDraftQ(e.target.value)}
                  placeholder="Nombre o SKU..."
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="mobile-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  id="mobile-category"
                  value={category_id ?? ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                >
                  <option value="">Todas las categorías</option>
                  {(categoriesQuery.data || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {(q || category_id) && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </form>

            {/* Footer del panel */}
            <div className="border-t p-4 safe-bottom">
              <button
                onClick={handleSearch}
                className="btn btn-primary w-full"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </>
      )}

      {/* Grilla de productos */}
      <div className="mt-8">
        {query.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 products-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5 animate-pulse product-card">
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <div className="card p-4">
            <p className="text-sm font-semibold text-red-600">No se pudo cargar el catálogo.</p>
            <p className="mt-2 text-sm text-gray-600">
              Probables causas: no estás logueado, CORS, o la URL del backend en <code>VITE_API_BASE_URL</code>.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600">No se encontraron productos.</p>
            <button
              onClick={clearFilters}
              className="mt-4 btn btn-outline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 products-grid">
            {products.map((p) => {
              const price = Number(p.price_final ?? p.price ?? 0)
              const mode = p.price_mode
              const hasStock = (p.stock ?? 0) > 0
              
              return (
                <div key={p.id} className="card p-5 hover:border-gray-300 transition relative product-card">
                  {/* Botón de Wishlist */}
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistButton productId={p.id} />
                  </div>

                  <Link to={`/productos/${p.id}`} className="block">
                    <div className="h-40 w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: 'var(--border)' }}>
                      {p.primary_image_url ? (
                        <img 
                          src={p.primary_image_url} 
                          alt={p.name} 
                          className="h-full w-full object-cover transition hover:scale-105" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center">
                          <span className="text-xs text-gray-500">Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <Link to={`/productos/${p.id}`}>
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-[var(--brand-primary)]">
                        SKU: {p.sku || '—'}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold min-h-[2.5rem]">
                        {p.name}
                      </p>
                    </div>
                  </Link>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">${price.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-gray-500">IVA {Number(p.tax_rate || 0)}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {mode === 'b2b' && (
                        <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                          B2B
                        </span>
                      )}
                      {!hasStock && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Sin stock
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className={`btn btn-outline w-full mt-4 ${!hasStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => hasStock && cart.add(p, 1)}
                    disabled={!hasStock}
                  >
                    {hasStock ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Paginación */}
      {products.length > 0 && (
        <div className="mt-10 flex items-center justify-between pagination-controls">
          <button
            className={`btn btn-outline ${!canPrev ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => {
              const next: Record<string, string> = { page: String(currentPage - 1) }
              if (q) next.q = q
              if (category_id) next.category_id = String(category_id)
              setSearchParams(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={!canPrev}
          >
            Anterior
          </button>
          <p className="text-sm text-gray-600">
            Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{lastPage}</span>
          </p>
          <button
            className={`btn btn-outline ${!canNext ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => {
              const next: Record<string, string> = { page: String(currentPage + 1) }
              if (q) next.q = q
              if (category_id) next.category_id = String(category_id)
              setSearchParams(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={!canNext}
          >
            Siguiente
          </button>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}