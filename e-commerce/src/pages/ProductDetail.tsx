import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Share2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { getProduct, type ProductVariant } from '../api/products'
import { useCart } from '../store/cart'
import ProductReviews from '../components/ProductReviews'
import WishlistButton from '../components/WishlistButton'
import SEOHead from '../components/SEOHead'
import { analytics } from '../api/analytics'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })

  const { add } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showShareToast, setShowShareToast] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  // Group variant attributes for the selector UI
  const variantAttributeGroups = useMemo(() => {
    if (!product?.has_variants || !product.variants?.length) return []
    const groups: Record<string, { attributeId: number; values: { valueId: number; value: string }[] }> = {}
    for (const v of product.variants) {
      for (const attr of v.attributes) {
        if (!groups[attr.attribute]) {
          groups[attr.attribute] = { attributeId: attr.attribute_id, values: [] }
        }
        if (!groups[attr.attribute].values.find((x) => x.valueId === attr.value_id)) {
          groups[attr.attribute].values.push({ valueId: attr.value_id, value: attr.value })
        }
      }
    }
    return Object.entries(groups)
  }, [product])

  // Selected attribute values map: { attributeId -> valueId }
  const [selectedAttrs, setSelectedAttrs] = useState<Record<number, number>>({})

  // Resolve which variant matches the selected attributes
  const resolvedVariant = useMemo(() => {
    if (!product?.has_variants || !product.variants?.length) return null
    const selectedEntries = Object.entries(selectedAttrs)
    if (selectedEntries.length === 0) return null
    return product.variants.find((v) =>
      selectedEntries.every(([attrId, valueId]) =>
        v.attributes.some((a) => a.attribute_id === Number(attrId) && a.value_id === valueId)
      )
    ) ?? null
  }, [selectedAttrs, product])

  // Keep selectedVariant in sync with resolvedVariant
  useEffect(() => {
    setSelectedVariant(resolvedVariant ?? null)
  }, [resolvedVariant])

  const images = useMemo(() => {
    if (!product?.images?.length) {
      return product?.primary_image_url
        ? [{ id: 0, url: product.primary_image_url, alt: product.name }]
        : []
    }
    return [...product.images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [product])

  const currentImage = images[activeImageIndex]?.url || '/placeholder-product.jpg'

  const price = selectedVariant?.price != null
    ? Number(selectedVariant.price)
    : Number(product?.price_final ?? product?.price ?? 0)

  const hasStock = product?.has_variants
    ? (selectedVariant ? selectedVariant.stock > 0 : false)
    : (product?.stock ?? 0) > 0

  const stockCount = product?.has_variants
    ? (selectedVariant?.stock ?? 0)
    : (product?.stock ?? 0)

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, stockCount || 999)))
  }

  const handleAddToCart = () => {
    if (product) {
      const variantLabel = selectedVariant
        ? selectedVariant.attributes.map((a) => `${a.attribute}: ${a.value}`).join(' / ')
        : undefined
      add(product, quantity, selectedVariant?.id, selectedVariant?.sku, selectedVariant?.price, variantLabel)
      analytics.addToCart({
        id: product.id,
        name: product.name,
        price,
        quantity,
        category: product.category?.name,
      })
    }
  }

  const handleBuyNow = () => {
    if (product) {
      const variantLabel = selectedVariant
        ? selectedVariant.attributes.map((a) => `${a.attribute}: ${a.value}`).join(' / ')
        : undefined
      add(product, quantity, selectedVariant?.id, selectedVariant?.sku, selectedVariant?.price, variantLabel)
      navigate('/carrito')
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

  // Navegación de imágenes con gestos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && activeImageIndex < images.length - 1) {
      setActiveImageIndex(prev => prev + 1)
    }
    if (isRightSwipe && activeImageIndex > 0) {
      setActiveImageIndex(prev => prev - 1)
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  // Auto-scroll de thumbnails
  useEffect(() => {
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[activeImageIndex] as HTMLElement
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }, [activeImageIndex])

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeImageIndex > 0) {
        setActiveImageIndex(prev => prev - 1)
      }
      if (e.key === 'ArrowRight' && activeImageIndex < images.length - 1) {
        setActiveImageIndex(prev => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeImageIndex, images.length])

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
            className="btn btn-primary"
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 product-detail-container">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-[var(--brand-primary)] transition-colors">Inicio</Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <Link to="/productos" className="hover:text-[var(--brand-primary)] transition-colors">Productos</Link>
            {product.category && (
              <>
                <ChevronRight size={14} className="text-gray-400 shrink-0" />
                <Link
                  to={`/productos?cat=${product.category.id}`}
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 product-detail-grid">
            {/* Columna izquierda: Galería */}
            <div className="flex gap-3 product-gallery">

              {/* Thumbnails verticales (desktop) */}
              {images.length > 1 && (
                <div
                  ref={thumbnailsRef}
                  className="hidden lg:flex flex-col gap-2 w-[72px] xl:w-20 shrink-0 overflow-y-auto"
                  style={{ maxHeight: '500px' }}
                >
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 ${
                        activeImageIndex === idx
                          ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-soft)]'
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

              {/* Imagen principal + thumbnails horizontales (mobile) */}
              <div className="flex flex-col flex-1 gap-4 min-w-0">
              {/* Imagen principal - centrada y con proporción */}
              <div
                className="aspect-[4/3] md:aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center relative group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ maxHeight: '500px' }}
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />

                {/* Flechas de navegación (desktop/tablet) + indicador de swipe */}
                {images.length > 1 && (
                  <>
                    {/* Flechas (solo desktop) */}
                    <div className="hidden md:flex absolute inset-0 pointer-events-none items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeImageIndex > 0 && (
                        <button
                          onClick={() => setActiveImageIndex(prev => prev - 1)}
                          className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft size={20} className="text-gray-700" />
                        </button>
                      )}
                      <div className="flex-1" />
                      {activeImageIndex < images.length - 1 && (
                        <button
                          onClick={() => setActiveImageIndex(prev => prev + 1)}
                          className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition"
                          aria-label="Siguiente imagen"
                        >
                          <ChevronRight size={20} className="text-gray-700" />
                        </button>
                      )}
                    </div>

                    {/* Indicador de posición (mobile) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                      {images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === activeImageIndex
                              ? 'w-6 bg-[var(--brand-primary)]'
                              : 'w-1.5 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails horizontales (mobile/tablet) */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 lg:hidden product-thumbnails">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImageIndex === idx
                          ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-soft)]'
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
            </div>

            {/* Columna derecha: Información */}
            <div className="flex flex-col gap-5 product-info">

              {/* Título + íconos favorito / compartir */}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {product.category && (
                    <Link
                      to={`/productos?cat=${product.category.id}`}
                      className="text-sm font-medium text-[var(--brand-primary)] hover:opacity-80 transition-opacity"
                    >
                      {product.category.name}
                    </Link>
                  )}
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl leading-snug">
                    {product.name}
                  </h1>
                </div>
                <div className="flex items-center gap-1 shrink-0 mt-1">
                  <WishlistButton productId={product.id} />
                  <button
                    onClick={handleShare}
                    title="Compartir"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-soft)] transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Precio */}
              <div className="space-y-1">
                {product.price_final && product.price_final < product.price && (
                  <p className="text-sm text-gray-400 line-through">${Number(product.price).toLocaleString('es-AR')}</p>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                    ${price.toLocaleString('es-AR')}
                  </span>
                  {product.price_final && product.price_final < product.price && (
                    <span className="badge badge-success text-xs">
                      {Math.round((1 - product.price_final / product.price) * 100)}% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">IVA {Number(product.tax_rate || 0)}% incluido</p>
              </div>

              {/* Selector de variantes */}
              {product.has_variants && variantAttributeGroups.length > 0 && (
                <div className="space-y-4">
                  {variantAttributeGroups.map(([attrName, { attributeId, values }]) => (
                    <div key={attributeId}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">{attrName}</p>
                      <div className="flex flex-wrap gap-2">
                        {values.map(({ valueId, value }) => {
                          const isSelected = selectedAttrs[attributeId] === valueId
                          return (
                            <button
                              key={valueId}
                              type="button"
                              onClick={() =>
                                setSelectedAttrs((prev) => ({ ...prev, [attributeId]: valueId }))
                              }
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                isSelected
                                  ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)] text-[var(--brand-primary)]'
                                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
                              }`}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {variantAttributeGroups.length > 0 && !selectedVariant && (
                    <p className="text-sm text-amber-600">Seleccioná una opción para continuar.</p>
                  )}
                </div>
              )}

              {/* Stock */}
              <div className="text-sm text-gray-700">
                {product.has_variants && !selectedVariant ? (
                  <span className="text-gray-400">Seleccioná una opción para ver stock</span>
                ) : hasStock ? (
                  <span className="text-green-600 font-medium">
                    Stock disponible
                    <span className="text-gray-500 font-normal"> · {stockCount} unidades</span>
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Sin stock</span>
                )}
              </div>

              {/* Cantidad */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 py-2 text-lg font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition active:bg-gray-100 flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 text-center text-base font-medium border-x border-gray-300 py-2 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={!hasStock || quantity >= stockCount}
                    className="w-10 py-2 text-lg font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition active:bg-gray-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                {hasStock && stockCount <= 10 && (
                  <span className="text-xs text-amber-600">({stockCount} disponibles)</span>
                )}
              </div>

              {/* Botones CTA */}
              <div className="flex flex-col gap-3">
                {/* Comprar ahora */}
                <button
                  onClick={handleBuyNow}
                  disabled={!hasStock || (product.has_variants && !selectedVariant)}
                  className={`w-full py-3.5 rounded-xl text-base font-bold transition-all ${
                    hasStock && !(product.has_variants && !selectedVariant)
                      ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white shadow-md active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Comprar ahora
                </button>

                {/* Agregar al carrito */}
                <button
                  onClick={handleAddToCart}
                  disabled={!hasStock || (product.has_variants && !selectedVariant)}
                  className={`w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
                    hasStock && !(product.has_variants && !selectedVariant)
                      ? 'bg-[var(--brand-soft)] hover:bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/25 active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  <ShoppingCart size={18} />
                  {product.has_variants && !selectedVariant
                    ? 'Seleccioná una opción'
                    : hasStock
                    ? 'Agregar al carrito'
                    : 'Sin stock'}
                </button>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {product.description && (
            <div className="mt-12 border-t border-gray-200 pt-8 product-description">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción del producto</h2>
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Reseñas */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <ProductReviews productId={product.id} />
          </div>
        </div>

        {/* Toast centrado y elegante */}
        {showShareToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up safe-bottom">
            Enlace copiado al portapapeles
          </div>
        )}
      </div>
    </>
  )
}