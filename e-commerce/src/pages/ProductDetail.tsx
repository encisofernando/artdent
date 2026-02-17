import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Share2, ShoppingCart } from 'lucide-react'
import { getProduct } from '../api/products'
import { useCart } from '../store/cart'
import ProductReviews from '../components/ProductReviews'
import WishlistButton from '../components/WishlistButton'
import SEOHead from '../components/SEOHead'
import { analytics } from '../api/analytics'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })

  const { add } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showShareToast, setShowShareToast] = useState(false)

  const images = useMemo(() => {
    if (!product?.images?.length) {
      return product?.primary_image_url
        ? [{ id: 0, url: product.primary_image_url, alt: product.name }]
        : []
    }
    return [...product.images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [product])

  const currentImage = images[activeImageIndex]?.url || '/placeholder-product.jpg'

  const price = Number(product?.price_final ?? product?.price ?? 0)
  const hasStock = (product?.stock ?? 0) > 0

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.stock ?? 999)))
  }

  const handleAddToCart = () => {
    if (product) {
      add(product, quantity)
      analytics.addToCart({
        id: product.id,
        name: product.name,
        price,
        quantity,
        category: product.category?.name,
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = `${product?.name} - ArtDent`

    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 2200)
      }
    } catch (err) {
      console.error('Error al compartir:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-8 pt-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-full" />
                <div className="h-6 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Lo sentimos, el producto que buscas no está disponible o no existe.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            Ver catálogo completo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.description ?? `${product.name} – ArtDent`}
        keywords={[product.category?.name, 'dental', product.name, 'ArtDent'].filter(Boolean) as string[]}
        image={currentImage}
        url={`/productos/${product.id}`}
        type="product"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Productos', url: '/productos' },
          ...(product.category ? [{ name: product.category.name, url: `/categoria/${product.category.id}` }] : []),
          { name: product.name, url: `/productos/${product.id}` },
        ]}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Contenedor principal centrado y con ancho máximo */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
            {/* Columna izquierda: Galería */}
            <div className="flex flex-col gap-6">
              {/* Imagen principal - centrada y con proporción */}
              <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Thumbnails - solo si hay más de 1 imagen */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImageIndex === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} vista ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha: Información */}
            <div className="flex flex-col gap-8">
              {/* Título y categoría */}
              <div>
                {product.category && (
                  <Link
                    to={`/categoria/${product.category.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {product.name}
                </h1>
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                  ${price.toLocaleString('es-AR')}
                </span>
                {product.price_final && product.price_final < product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${Number(product.price).toLocaleString('es-AR')}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600">
                IVA {Number(product.tax_rate || 0)}% incluido
              </p>

              {/* Stock */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Disponibilidad:</span>
                <span
                  className={`font-medium ${
                    hasStock ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {hasStock ? `${product.stock ?? 0} unidades` : 'Sin stock'}
                </span>
              </div>

              {/* Cantidad + Agregar al carrito */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                  <div className="flex-1 min-w-[180px]">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="px-5 py-3 text-lg font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                      >
                        −
                      </button>
                      <input
                        id="quantity"
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-20 text-center text-lg font-medium border-x border-gray-300 py-3 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={!hasStock || quantity >= (product?.stock ?? 0)}
                        className="px-5 py-3 text-lg font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!hasStock}
                    className={`flex-1 py-4 px-8 text-lg font-semibold rounded-xl transition shadow-sm ${
                      hasStock
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <ShoppingCart size={20} />
                      {hasStock ? 'Agregar al carrito' : 'Sin stock'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Acciones secundarias */}
              <div className="flex flex-wrap gap-4">
                <WishlistButton productId={product.id} />
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <Share2 size={18} />
                  Compartir
                </button>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {product.description && (
            <div className="mt-16 border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Descripción del producto</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {product.description}
              </div>
            </div>
          )}

          {/* Reseñas */}
          <div className="mt-16 border-t border-gray-200 pt-12">
            <ProductReviews productId={product.id} />
          </div>
        </div>

        {/* Toast centrado y elegante */}
        {showShareToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
            Enlace copiado al portapapeles
          </div>
        )}
      </div>
    </>
  )
}