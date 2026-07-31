import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { X, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { listProducts, listBrands, type CatalogProduct } from '../api/products'
import { productPath } from '../utils/slug'
import { listCategories } from '../api/categories'
import { useCart } from '../store/cart'
import WishlistButton from '../components/WishlistButton'
import SEOHead from '../components/SEOHead'
import CountdownTimer from '../components/CountdownTimer'
import { analytics } from '../api/analytics'

const LOW_STOCK_THRESHOLD = 5

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ p, onAdd }: { p: CatalogProduct; onAdd: (p: CatalogProduct) => void }) {
  const price = Number(p.price_final ?? p.price ?? 0)
  const originalPrice = p.price_final && p.price_final < p.price ? Number(p.price) : null
  const pct = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const hasVariants = !!p.has_variants
  const hasStock = hasVariants
    ? (p.variants?.length ? p.variants.some(v => v.is_active && v.stock > 0) : true)
    : (p.stock ?? 0) > 0
  const stockCount = !hasVariants ? (p.stock ?? 0) : null
  const isLowStock = !hasVariants && hasStock && stockCount !== null && stockCount > 0 && stockCount <= LOW_STOCK_THRESHOLD
  const offerEndsAt = p.offer?.ends_at ?? null

  return (
    <div className="product-card-ml flex flex-col group relative">
      <Link to={productPath(p.id, p.name)} className="block">
        <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center p-3 relative">
          {pct > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black rounded px-1.5 py-0.5 z-10">
              -{pct}%
            </span>
          )}
          {(p.primary_thumb_url || p.primary_image_url) ? (
            <img src={p.primary_thumb_url ?? p.primary_image_url!} alt={p.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy" />
          ) : (
            <img src="/placeholder-product.png" alt="Sin imagen" className="max-h-full max-w-full object-contain opacity-80" />
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
        <Link to={productPath(p.id, p.name)} title={p.name}>
          <h3 className="min-h-[3.8rem] text-[13px] font-semibold leading-[1.35] text-gray-800 transition-colors [overflow-wrap:anywhere] line-clamp-3 hover:text-[var(--brand-primary)] sm:text-sm">
            {p.name}
          </h3>
        </Link>
        <div className="mt-auto pt-1">
          {isLowStock && (
            <p className="text-[10px] font-semibold text-amber-600 mb-0.5">
              ¡Últimas {stockCount} unidades!
            </p>
          )}
          {offerEndsAt && (
            <div className="mb-0.5">
              <CountdownTimer endsAt={offerEndsAt} />
            </div>
          )}
          {originalPrice && (
            <p className="text-[10px] text-gray-500 line-through">${originalPrice.toLocaleString('es-AR')}</p>
          )}
          <p className="price-main">${price.toLocaleString('es-AR')}</p>
        </div>
        {hasVariants ? (
          <Link
            to={productPath(p.id, p.name)}
            className={`btn btn-primary w-full mt-2 py-2 text-xs text-center ${!hasStock ? 'opacity-40 pointer-events-none' : ''}`}
          >
            {hasStock ? 'Ver opciones' : 'Sin stock'}
          </Link>
        ) : (
          <button
            className={`btn btn-primary w-full mt-2 py-2 text-xs ${!hasStock ? 'opacity-40 cursor-not-allowed !transform-none !shadow-none' : ''}`}
            onClick={() => hasStock && onAdd(p)}
            disabled={!hasStock}
          >
            {hasStock ? 'Agregar al carrito' : 'Sin stock'}
          </button>
        )}
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
  const trimmedQuery = q.trim()
  const brand = searchParams.get('brand') || ''
  const minPriceParam = searchParams.get('min_price') || ''
  const maxPriceParam = searchParams.get('max_price') || ''
  const min_price = minPriceParam ? Number(minPriceParam) : undefined
  const max_price = maxPriceParam ? Number(maxPriceParam) : undefined

  const cart = useCart()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Track search events con debounce de 1.5s para no disparar en cada keystroke
  useEffect(() => {
    if (!trimmedQuery) return
    const t = setTimeout(() => analytics.search(trimmedQuery), 1500)
    return () => clearTimeout(t)
  }, [trimmedQuery])

  // Categories
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(),
  })
  const categories = categoriesQuery.data ?? []

  // Marcas
  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: () => listBrands(),
    staleTime: 5 * 60_000,
  })
  const brands = brandsQuery.data ?? []

  // Precio: inputs locales que solo tocan la URL al aplicar (evita refetch en cada tecla)
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam)
  useEffect(() => {
    setMinPriceInput(minPriceParam)
    setMaxPriceInput(maxPriceParam)
  }, [minPriceParam, maxPriceParam])

  // Infinite scroll query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['catalog_products_inf', q, category_id, brand, min_price, max_price],
    queryFn: ({ pageParam = 1 }) =>
      listProducts({ q: q || undefined, page: pageParam as number, category_id, brand: brand || undefined, min_price, max_price }),
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

  const setBrand = (b: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (b) next.set('brand', b)
      else next.delete('brand')
      next.delete('page')
      return next
    })
    setSidebarOpen(false)
  }

  const applyPriceRange = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (minPriceInput) next.set('min_price', minPriceInput)
      else next.delete('min_price')
      if (maxPriceInput) next.set('max_price', maxPriceInput)
      else next.delete('max_price')
      next.delete('page')
      return next
    })
  }

  const clearPriceRange = () => {
    setMinPriceInput('')
    setMaxPriceInput('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('min_price')
      next.delete('max_price')
      return next
    })
  }

  const clearAllFilters = () => {
    // OJO: no encadenar varios setSearchParams() sueltos acá — cada llamada
    // parte del snapshot de params del render en el que se creó la función,
    // así que si se llaman una tras otra (clearQ + setCategory + setBrand +
    // clearPriceRange) cada una pisa a la anterior y solo sobrevive la
    // última. Por eso se arma un único URLSearchParams y se aplica una vez.
    setMinPriceInput('')
    setMaxPriceInput('')
    setSearchParams(new URLSearchParams())
    setSidebarOpen(false)
  }

  const selectedCategory = categories.find((c) => c.id === category_id)
  const hasSearch = trimmedQuery.length > 0
  const hasCategory = Boolean(selectedCategory)
  const selectedCategoryName = selectedCategory?.name ?? ''
  const selectedCategoryUrl = selectedCategory ? `/productos?cat=${selectedCategory.id}` : '/productos'

  const pageTitle = hasSearch
    ? `Resultados para "${trimmedQuery}"`
    : hasCategory
      ? selectedCategoryName
      : 'Productos'

  const seoTitle = hasCategory && hasSearch
    ? `${selectedCategoryName}: resultados para "${trimmedQuery}"`
    : hasCategory
      ? `${selectedCategoryName}`
      : hasSearch
        ? `Resultados para "${trimmedQuery}"`
        : 'Productos'

  const seoDescription = hasCategory && hasSearch
    ? `Resultados para "${trimmedQuery}" dentro de ${selectedCategoryName} en el shop de ArtDent. Consultá insumos odontológicos, stock y opciones de compra online.`
    : hasCategory
      ? `Explorá ${selectedCategoryName} en el shop de ArtDent. Encontrá insumos odontológicos con stock, precios y opciones de compra online.`
      : hasSearch
        ? `Resultados de búsqueda para "${trimmedQuery}" en el e-commerce de ArtDent.`
        : 'Catálogo de productos de ArtDent. Encontrá insumos odontológicos, novedades y opciones de compra online.'

  const seoKeywords = [
    'artdent',
    'productos dentales',
    'insumos odontológicos',
    ...(selectedCategory ? [selectedCategoryName] : []),
    ...(trimmedQuery ? [trimmedQuery] : []),
  ]

  const seoUrl = (() => {
    const params = new URLSearchParams()
    if (category_id) params.set('cat', String(category_id))
    if (trimmedQuery) params.set('q', trimmedQuery)
    const query = params.toString()
    return query ? `/productos?${query}` : '/productos'
  })()

  const seoRobots = hasSearch ? 'noindex, follow' : 'index, follow'
  const seoBreadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Productos', url: '/productos' },
    ...(selectedCategory ? [{ name: selectedCategoryName, url: selectedCategoryUrl }] : []),
  ]

  const seoStructuredData = useMemo(() => {
    if (products.length === 0) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: seoTitle,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://shop.artdent.com.ar${productPath(p.id, p.name)}`,
        name: p.name,
      })),
    }
  }, [products, seoTitle])

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={seoUrl}
        robots={seoRobots}
        breadcrumbs={seoBreadcrumbs}
        structuredData={seoStructuredData}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
        <Link to="/" className="hover:text-[var(--brand-primary)] transition-colors">Inicio</Link>
        <ChevronRight size={14} className="text-gray-500 shrink-0" />
        {selectedCategory ? (
          <button onClick={() => setCategory(undefined)} className="hover:text-[var(--brand-primary)] transition-colors">
            Productos
          </button>
        ) : (
          <span className="text-gray-800 font-medium">Productos</span>
        )}
        {selectedCategory && (
          <>
            <ChevronRight size={14} className="text-gray-500 shrink-0" />
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

            {brands.length > 0 && (
              <>
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 mt-6 px-1">
                  Marca
                </h2>
                <ul className="space-y-0.5 max-h-56 overflow-y-auto">
                  <li>
                    <button
                      onClick={() => setBrand(undefined)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition
                        ${!brand ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                      Todas las marcas
                    </button>
                  </li>
                  {brands.map((b) => (
                    <li key={b}>
                      <button
                        onClick={() => setBrand(b)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition truncate
                          ${brand === b ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                      >
                        {b}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 mt-6 px-1">
              Precio
            </h2>
            <div className="px-1 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder="Mín"
                  aria-label="Precio mínimo"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[var(--brand-primary)]"
                />
                <span className="text-gray-500 text-sm">–</span>
                <input
                  type="number"
                  min={0}
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder="Máx"
                  aria-label="Precio máximo"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              <button onClick={applyPriceRange} className="btn btn-outline w-full py-1.5 text-xs">
                Aplicar
              </button>
            </div>
          </div>
        </aside>

        {/* ── Contenido principal ── */}
        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              {!isLoading && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {hasCategory && hasSearch
                    ? `${selectedCategory?.name} · búsqueda activa`
                    : selectedCategory
                      ? `Categoría ${selectedCategory.name}`
                      : hasSearch
                        ? 'Resultados del catálogo'
                        : 'Todos los productos'}
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
              Filtros
            </button>
          </div>

          {/* Chips filtros activos */}
          {(q || category_id || brand || min_price !== undefined || max_price !== undefined) && (
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
              {brand && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-primary)]/30 px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
                  {brand}
                  <button onClick={() => setBrand(undefined)} className="rounded-full hover:bg-[var(--brand-primary)]/10 p-0.5">
                    <X size={12} />
                  </button>
                </span>
              )}
              {(min_price !== undefined || max_price !== undefined) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-primary)]/30 px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
                  ${min_price?.toLocaleString('es-AR') ?? '0'} – ${max_price ? max_price.toLocaleString('es-AR') : '∞'}
                  <button onClick={clearPriceRange} className="rounded-full hover:bg-[var(--brand-primary)]/10 p-0.5">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-red-500 transition">
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
              <button onClick={clearAllFilters} className="mt-4 btn btn-outline">
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
            <p className="text-center text-sm text-gray-500 py-6">
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
              <h2 className="font-bold text-gray-800">Filtros</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1 mb-1">Categorías</p>
              <ul className="space-y-0.5 mb-5">
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

              {brands.length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1 mb-1">Marca</p>
                  <ul className="space-y-0.5 mb-5">
                    <li>
                      <button onClick={() => setBrand(undefined)}
                        className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition
                          ${!brand ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Todas las marcas
                      </button>
                    </li>
                    {brands.map((b) => (
                      <li key={b}>
                        <button onClick={() => setBrand(b)}
                          className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition truncate
                            ${brand === b ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                          {b}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1 mb-1">Precio</p>
              <div className="px-1 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    placeholder="Mín"
                    aria-label="Precio mínimo"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[var(--brand-primary)]"
                  />
                  <span className="text-gray-500 text-sm">–</span>
                  <input
                    type="number"
                    min={0}
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    placeholder="Máx"
                    aria-label="Precio máximo"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
                <button onClick={() => { applyPriceRange(); setSidebarOpen(false) }} className="btn btn-primary w-full py-2 text-sm">
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
