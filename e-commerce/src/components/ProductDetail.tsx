import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Share2, ShoppingCart } from 'lucide-react'
import { getProduct } from '../api/products'
import { productPath, idFromSlug } from '../utils/slug'
import { useCart } from '../store/cart'
import ProductReviews from '../components/ProductReviews'
import WishlistButton from '../components/WishlistButton'
import SEOHead from '../components/SEOHead'
import { analytics } from '../api/analytics'
export default function ProductDetail() {
  const params = useParams()
  const id = idFromSlug(params.slug ?? params.id ?? '')

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
  const [quantity, setQuantity] = useState(1)
  const [showShareToast, setShowShareToast] = useState(false)
  
  const mainUrl = activeUrl ?? images.find(i => i.is_primary)?.url ?? images[0]?.url ?? null

  // Track product view when data loads
  useMemo(() => {
    if (p) {
      analytics.viewProduct({
        id: p.id,
        name: p.name,
        price: Number(p.price_final ?? p.price ?? 0),
        category: p.category?.name,
        brand: 'ArtDent',
      })
    }
  }, [p])

  const handleAddToCart = () => {
    if (p) {
      cart.add(p, quantity)
      
      // Track add to cart
      analytics.addToCart({
        id: p.id,
        name: p.name,
        price: Number(p.price_final ?? p.price ?? 0),
        quantity: quantity,
        category: p.category?.name,
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = `${p?.name} - ArtDent`

    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch (err) {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 2000)
  }

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (productQuery.isError || !p) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold text-red-600">No se pudo cargar el producto.</p>
          <p className="mt-2 text-sm text-gray-600">Verifica sesión, CORS y la URL del backend.</p>
          <Link to="/productos" className="mt-6 inline-block btn btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const price = Number(p.price_final ?? p.price ?? 0)
  const hasStock = (p.stock ?? 0) > 0

  return (
    <>
      <SEOHead
        title={p.name}
        description={p.description ?? `${p.name} - Productos dentales profesionales en ArtDent`}
        keywords={[p.category?.name, 'dental', p.name, 'ArtDent'].filter(Boolean) as string[]}
        image={mainUrl ?? undefined}
        url={productPath(p.id, p.name)}
        type="product"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Productos', url: '/productos' },
          ...(p.category ? [{ name: p.category.name, url: `/categoria/${p.category.id}` }] : []),
          { name: p.name, url: productPath(p.id, p.name) },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Imágenes */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border bg-white">
              <img
                src={mainUrl || '/placeholder-product.jpg'}
                alt={p.name}
                className="h-[500px] w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveUrl(img.url)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 ${
                      activeUrl === img.url ? 'border-[var(--brand-primary)]' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || p.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info principal */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{p.name}</h1>
              {p.category && (
                <Link
                  to={`/categoria/${p.category.id}`}
                  className="mt-2 inline-block text-sm text-[var(--brand-primary)] hover:underline"
                >
                  {p.category.name}
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                ${price.toLocaleString('es-AR')}
              </div>
              {p.price_final && p.price_final < p.price && (
                <div className="text-xl text-gray-500 line-through">
                  ${Number(p.price).toLocaleString('es-AR')}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">IVA {Number(p.tax_rate || 0)}% incluido</p>
              <div className="text-right">
                <p className="text-sm text-gray-600">Stock</p>
                <p className={`text-lg font-bold ${hasStock ? 'text-green-600' : 'text-red-600'}`}>
                  {hasStock ? `${p.stock ?? 0} disponibles` : 'Sin stock'}
                </p>
              </div>
            </div>

            {/* Cantidad y Agregar al carrito */}
            <div className="card p-6">
              <div className="flex items-center gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Cantidad</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-xl border-2 px-4 py-2 font-bold hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-xl border-2 px-4 py-2 font-bold hover:bg-gray-50"
                      disabled={!hasStock || quantity >= (p.stock ?? 0)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <button
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                    onClick={handleAddToCart}
                    disabled={!hasStock}
                  >
                    <ShoppingCart size={20} />
                    {hasStock ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                </div>
              </div>
            </div>

            {/* Wishlist y Compartir */}
            <div className="flex gap-4">
              <WishlistButton productId={p.id} />
              <button
                onClick={handleShare}
                className="btn btn-outline flex-1 flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Compartir
              </button>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {p.description && (
          <div className="mt-12 card p-8">
            <h2 className="text-2xl font-bold mb-4">Descripción</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {p.description}
            </p>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-12">
          <ProductReviews productId={p.id} />
        </div>

        {/* Toast de compartir */}
        {showShareToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-green-600 px-6 py-3 text-white shadow-2xl">
            ¡Enlace copiado al portapapeles!
          </div>
        )}
      </div>
    </>
  )
}