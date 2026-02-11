import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../api/products'
import { useCart } from '../store/cart'

export default function ProductDetail() {
  const params = useParams()
  const id = Number(params.id)

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: Number.isFinite(id) && id > 0,
  })

  const cart = useCart()

  const p = productQuery.data

  const images = useMemo(() => {
    const list = (p?.images || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    if (list.length) return list
    if (p?.primary_image_url) return [{ id: 0, url: p.primary_image_url, alt: p.name, is_primary: true }]
    return []
  }, [p])

  const [activeUrl, setActiveUrl] = useState<string | null>(null)
  const mainUrl = activeUrl ?? images.find(i => i.is_primary)?.url ?? images[0]?.url ?? null

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
        Cargando...
      </div>
    )
  }

  if (productQuery.isError || !p) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="card p-4">
          <p className="text-sm font-semibold text-red-600">No se pudo cargar el producto.</p>
          <p className="mt-2 text-sm text-gray-600">Verificá sesión, CORS y la URL del backend.</p>
          <Link to="/productos" className="mt-4 inline-block btn btn-outline">Volver</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/productos" className="text-sm font-semibold text-[var(--brand-primary)]">← Volver al catálogo</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <div className="h-64 rounded-2xl border bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {mainUrl ? (
              <img src={mainUrl} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center">
                <span className="text-sm text-gray-500">Sin imagen</span>
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${mainUrl === img.url ? 'border-[var(--brand-primary)]' : 'border-gray-200'}`}
                  onClick={() => setActiveUrl(img.url)}
                  aria-label="Cambiar imagen"
                >
                  <img src={img.url} alt={img.alt || p.name} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="card p-8">
          <p className="text-xs font-semibold text-[var(--brand-primary)]">SKU: {p.sku || '—'}</p>
          <h1 className="mt-2 text-2xl font-bold">{p.name}</h1>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <p className="text-3xl font-bold">${Number(p.price_final ?? p.price ?? 0).toLocaleString('es-AR')}</p>
            <p className="text-sm text-gray-600">IVA {Number(p.tax_rate || 0)}%</p>
          </div>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600">Unidad</span>
              <span className="font-semibold">{p.unit || 'UN'}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600">Código de barras</span>
              <span className="font-semibold">{p.barcode || '—'}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600">Estado</span>
              <span className="font-semibold">{p.is_active ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>

          <div className="mt-6">
            <button className="btn btn-primary w-full" onClick={() => cart.add(p, 1)}>
              Agregar al carrito
            </button>
            <p className="mt-3 text-xs text-gray-500">
              Checkout real: se crea un pedido (órden + ítems) en el backend.
            </p>
          </div>
        </div>
      </div>

      {p.description ? (
        <div className="mt-8 card p-8">
          <h2 className="text-lg font-bold">Descripción</h2>
          <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{p.description}</p>
        </div>
      ) : null}
    </div>
  )
}
