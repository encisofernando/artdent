import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { X, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { listProducts, type CatalogProduct } from '../api/products'
import { listCategories } from '../api/categories'
import { useCart } from '../store/cart'
import WishlistButton from '../components/WishlistButton'

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ p, onAdd }: { p: CatalogProduct; onAdd: (p: CatalogProduct) => void }) {
  const price = Number(p.price_final ?? p.price ?? 0)
  const originalPrice = p.price_final && p.price_final < p.price ? Number(p.price) : null
  const pct = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const hasStock = p.has_variants && p.variants?.length
    ? p.variants.some(v => v.is_active && v.stock > 0)
    : (p.stock ?? 0) > 0

  return (
    <div className="product-card-ml flex flex-col group relative">
      <Link to={`/productos/${p.id}`} className="block">
        <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center p-3 relative">
          {pct > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black rounded px-1.5 py-0.5 z-10">
              -{pct}%
            </span>
          )}
          {p.primary_image_url ? (
            <img src={p.primary_image_url} alt={p.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy" />
          ) : (
            <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          {!hasStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="badge badge-danger text-xs">Sin stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <WishlistButton productId={p.id} />
      </div>

      <div className="flex flex-col flex-1 p-3 gap-1">
        {p.category && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            {p.category.name}
          </span>
        )}
        <Link to={`/productos/${p.id}`}>
          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-[var(--brand-primary)] transition-colors min-h-[2.5rem]">
            {p.name}
          </h3>
        </Link>
        <div className="mt-auto pt-1">
          {originalPrice && (
            <p className="text-[10px] text-gray-400 line-through">${originalPrice.toLocaleString('es-AR')}</p>
          )}
          <p className="price-main">${price.toLocaleString('es-AR')}</p>
        </div>
        <button
          className={`btn btn-primary w-full mt-2 py-2 text-xs ${!hasStock ? 'opacity-40 cursor-not-allowed !transform-none !shadow-none' : ''}`}
          onClick={() => hasStock && onAdd(p)}
          disabled={!hasStock}
        >
          {hasStock ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="product-card-ml animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-t-xl" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-6 bg-gray-100 rounded w-2/5 mt-3" />
            <div className="h-9 bg-gray-100 rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const categoryId = searchParams.get('cat') || searchParams.get('category_id') || ''
  const category_id = categoryId ? Number(categoryId) : undefined

  const cart = useCart()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Categories
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })
  const categories = categoriesQuery.data ?? []

  // Infinite scroll query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['catalog_products_inf', q, category_id],
    queryFn: ({ pageParam = 1 }) =>
      listProducts({ q: q || undefined, page: pageParam as number, category_id }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  })

  // Flatten all pages
  const products = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  )

  const totalProducts = data?.pages[0]?.total ?? 0

  // IntersectionObserver for infinite scroll
  const onSentinel = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onSentinel, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onSentinel])

  const setCategory = (id: number | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) next.set('cat', String(id))
      else next.delete('cat')
      next.delete('category_id')
      next.delete('page')
      return next
    })
    setSidebarOpen(false)
  }

  const clearQ = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      return next
    })
  }

  const title = q ? `Resultados para "${q}"` : 'Productos'
  const selectedCategory = categories.find((c) => c.id === category_id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
        <Link to="/" className="hover:text-[var(--brand-primary)] transition-colors">Inicio</Link>
        <ChevronRight size={14} className="text-gray-400 shrink-0" />
        {selectedCategory ? (
          <button onClick={() => setCategory(undefined)} className="hover:text-[var(--brand-primary)] transition-colors">
            Productos
          </button>
        ) : (
          <span className="text-gray-800 font-medium">Productos</span>
        )}
        {selectedCategory && (
          <>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-800 font-medium">{selectedCategory.name}</span>
          </>
        )}
      </nav>

      <div className="flex gap-6">

        {/* ── Sidebar de categorías (desktop) ── */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 px-1">
              Categorías
            </h2>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => setCategory(undefined)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition flex items-center justify-between group
                    ${!category_id
                      ? 'bg-[var(--brand-primary)] text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <span>Todas las categorías</span>
                  {!category_id && <ChevronRight size={14} />}
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCategory(c.id)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition flex items-center justify-between group
                      ${category_id === c.id
                        ? 'bg-[var(--brand-primary)] text-white font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <span className="truncate pr-1">{c.name}</span>
                    {category_id === c.id && <ChevronRight size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Contenido principal ── */}
        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {!isLoading && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedCategory ? selectedCategory.name : 'Todos los productos'}
                  {totalProducts > 0 && ` · ${totalProducts.toLocaleString('es-AR')} resultados`}
                </p>
              )}
            </div>

            {/* Mobile: botón filtros */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 btn btn-outline text-sm"
            >
              <SlidersHorizontal size={15} />
              Categorías
            </button>
          </div>

          {/* Chips filtros activos */}
          {(q || category_id) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {q && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-primary)]/30 px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
                  "{q}"
                  <button onClick={clearQ} className="rounded-full hover:bg-[var(--brand-primary)]/10 p-0.5">
                    <X size={12} />
                  </button>
                </span>
              )}
              {category_id && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-primary)]/30 px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
                  {selectedCategory?.name ?? 'Categoría'}
                  <button onClick={() => setCategory(undefined)} className="rounded-full hover:bg-[var(--brand-primary)]/10 p-0.5">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button onClick={() => { clearQ(); setCategory(undefined) }}
                className="text-xs text-gray-400 hover:text-red-500 transition">
                Limpiar todo
              </button>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <SkeletonGrid />
          ) : isError ? (
            <div className="card p-6 text-center">
              <p className="text-sm font-semibold text-red-600">No se pudo cargar el catálogo.</p>
              <p className="mt-2 text-sm text-gray-500">Verificá la conexión con el servidor.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-gray-600 font-medium">No se encontraron productos.</p>
              <button onClick={() => { clearQ(); setCategory(undefined) }} className="mt-4 btn btn-outline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} onAdd={(pr) => cart.add(pr, 1)} />
              ))}
            </div>
          )}

          {/* Sentinel + loading más */}
          <div ref={sentinelRef} className="h-4 mt-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-primary)] border-r-transparent" />
            </div>
          )}
          {!hasNextPage && products.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              · {products.length.toLocaleString('es-AR')} productos mostrados ·
            </p>
          )}
        </div>
      </div>

      {/* ── Sidebar mobile (drawer) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h2 className="font-bold text-gray-800">Categorías</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-3 space-y-0.5">
              <li>
                <button onClick={() => setCategory(undefined)}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition
                    ${!category_id ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Todas las categorías
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button onClick={() => setCategory(c.id)}
                    className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition
                      ${category_id === c.id ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
