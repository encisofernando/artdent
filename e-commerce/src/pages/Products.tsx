import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { listProducts } from '../api/products'
import { listCategories } from '../api/categories'
import { useCart } from '../store/cart'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || '1')
  const categoryId = searchParams.get('category_id')
  const category_id = categoryId ? Number(categoryId) : undefined

  const cart = useCart()

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Catálogo público. Si iniciás sesión con una cuenta B2B, los precios se ajustan automáticamente.
          </p>
        </div>

        <form
          className="flex w-full flex-col gap-2 md:w-auto md:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev)
              if (draftQ.trim()) next.set('q', draftQ.trim())
              else next.delete('q')
              next.set('page', '1')
              return next
            })
          }}
        >
          <input
            value={draftQ}
            onChange={(e) => setDraftQ(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full md:w-80 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2"
          />
          <select
            value={category_id ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                if (v) next.set('category_id', v)
                else next.delete('category_id')
                next.set('page', '1')
                return next
              })
            }}
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
        </form>
      </div>

      <div className="mt-8">
        {query.isLoading ? (
          <div className="text-sm text-gray-500">Cargando productos...</div>
        ) : query.isError ? (
          <div className="card p-4">
            <p className="text-sm font-semibold text-red-600">No se pudo cargar el catálogo.</p>
            <p className="mt-2 text-sm text-gray-600">
              Probables causas: no estás logueado, CORS, o la URL del backend en <code>VITE_API_BASE_URL</code>.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const price = Number(p.price_final ?? p.price ?? 0)
              const mode = p.price_mode
              return (
                <div key={p.id} className="card p-5 hover:border-gray-300">
                  <Link to={`/productos/${p.id}`} className="block">
                    <div className="h-40 w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: 'var(--border)' }}>
                      {p.primary_image_url ? (
                        <img src={p.primary_image_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-full w-full grid place-items-center">
                          <span className="text-xs text-gray-500">Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <Link to={`/productos/${p.id}`}>
                    <p className="text-xs font-semibold text-[var(--brand-primary)]">SKU: {p.sku || '—'}</p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold">{p.name}</p>
                  </Link>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">${price.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-gray-500">IVA {Number(p.tax_rate || 0)}%</p>
                    </div>
                    {mode === 'b2b' ? (
                      <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">B2B</span>
                    ) : null}
                  </div>

                  <button
                    className="btn btn-outline w-full mt-4"
                    onClick={() => cart.add(p, 1)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          className={`btn btn-outline ${!canPrev ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => {
            const next: Record<string, string> = { page: String(currentPage - 1) }
            if (q) next.q = q
            if (category_id) next.category_id = String(category_id)
            setSearchParams(next)
          }}
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
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
