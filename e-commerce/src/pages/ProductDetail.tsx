import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Share2, ShoppingCart, ChevronLeft, ChevronRight, X, Search } from 'lucide-react'
import { getProduct, type ProductVariant } from '../api/products'
import { productPath, idFromSlug } from '../utils/slug'
import { useCart } from '../store/cart'
import ProductReviews from '../components/ProductReviews'
import WishlistButton from '../components/WishlistButton'
import SEOHead from '../components/SEOHead'
import CountdownTimer from '../components/CountdownTimer'
import { analytics } from '../api/analytics'
import { getPaymentOptions } from '../api/paymentOptions'
import NaveInstallmentsModal from '../components/NaveInstallmentsModal'
import { sanitizeHtml } from '../lib/sanitizeHtml'

const LOW_STOCK_THRESHOLD = 5

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const productId = idFromSlug(slug ?? '')
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
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isInstallmentsModalOpen, setIsInstallmentsModalOpen] = useState(false)

  const { data: paymentOptions = [] } = useQuery({
    queryKey: ['payment_options'],
    queryFn: getPaymentOptions,
    staleTime: 5 * 60_000,
  })
  const naveEnabled = paymentOptions.some((o) => o.type === 'nave')

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

  const currentImage = images[activeImageIndex]?.url || '/placeholder-product.png'

  const price = selectedVariant != null
    ? Number(selectedVariant.price_final ?? selectedVariant.price ?? 0)
    : Number(product?.price_final ?? product?.price ?? 0)

  const originalPrice = selectedVariant != null
    ? (selectedVariant.price_final != null && selectedVariant.price != null && selectedVariant.price_final < selectedVariant.price
        ? Number(selectedVariant.price)
        : null)
    : (product?.price_final != null && product.price_final < product.price ? Number(product.price) : null)

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
      const variantPrice = selectedVariant
        ? (selectedVariant.price_final ?? selectedVariant.price)
        : undefined
      add(product, quantity, selectedVariant?.id, selectedVariant?.sku, variantPrice, variantLabel)
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
      const variantPrice = selectedVariant
        ? (selectedVariant.price_final ?? selectedVariant.price)
        : undefined
      add(product, quantity, selectedVariant?.id, selectedVariant?.sku, variantPrice, variantLabel)
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

  const handleImageMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
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
      if (isImageViewerOpen && e.key === 'Escape') {
        setIsImageViewerOpen(false)
      }

      if (e.key === 'ArrowLeft' && activeImageIndex > 0) {
        setActiveImageIndex(prev => prev - 1)
      }
      if (e.key === 'ArrowRight' && activeImageIndex < images.length - 1) {
        setActiveImageIndex(prev => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeImageIndex, images.length, isImageViewerOpen])

  useEffect(() => {
    if (!isImageViewerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isImageViewerOpen])

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
        url={productPath(product.id, product.name)}
        type="product"
        productData={{
          name: product.name,
          price,
          currency: 'ARS',
          availability: hasStock ? 'InStock' : 'OutOfStock',
          brand: product.brand ?? 'ArtDent',
          sku: selectedVariant?.sku ?? product.sku ?? undefined,
          image: currentImage,
        }}
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Productos', url: '/productos' },
          ...(product.category ? [{ name: product.category.name, url: `/productos?cat=${product.category.id}` }] : []),
          { name: product.name, url: productPath(product.id, product.name) },
        ]}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Contenedor principal centrado y con ancho máximo */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 product-detail-container">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-[var(--brand-primary)] transition-colors">Inicio</Link>
            <ChevronRight size={14} className="text-gray-500 shrink-0" />
            <Link to="/productos" className="hover:text-[var(--brand-primary)] transition-colors">Productos</Link>
            {product.category && (
              <>
                <ChevronRight size={14} className="text-gray-500 shrink-0" />
                <Link
                  to={`/productos?cat=${product.category.id}`}
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="text-gray-500 shrink-0" />
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
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => {
                  setIsImageHovered(false)
                  setZoomPosition({ x: 50, y: 50 })
                }}
                onMouseMove={handleImageMouseMove}
                onClick={() => setIsImageViewerOpen(true)}
                style={{ maxHeight: '500px' }}
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className={`max-h-full max-w-full object-contain transition-transform duration-200 ease-out ${
                    isImageHovered ? 'md:scale-[1.6]' : 'md:scale-100'
                  }`}
                  style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
                />

                <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-gray-700 shadow-md">
                    <Search size={14} />
                    Ampliar imagen
                  </span>
                </div>

                {/* Flechas de navegación (desktop/tablet) + indicador de swipe */}
                {images.length > 1 && (
                  <>
                    {/* Flechas (solo desktop) */}
                    <div className="hidden md:flex absolute inset-0 pointer-events-none items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeImageIndex > 0 && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            setActiveImageIndex(prev => prev - 1)
                          }}
                          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-900/10 bg-white/95 text-slate-800 shadow-xl transition hover:bg-white"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft size={22} className="text-slate-800" />
                        </button>
                      )}
                      <div className="flex-1" />
                      {activeImageIndex < images.length - 1 && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            setActiveImageIndex(prev => prev + 1)
                          }}
                          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-900/10 bg-white/95 text-slate-800 shadow-xl transition hover:bg-white"
                          aria-label="Siguiente imagen"
                        >
                          <ChevronRight size={22} className="text-slate-800" />
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
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-soft)] transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Precio */}
              <div className="space-y-1">
                {originalPrice && (
                  <p className="text-sm text-gray-500 line-through">${originalPrice.toLocaleString('es-AR')}</p>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                    ${price.toLocaleString('es-AR')}
                  </span>
                  {originalPrice && (
                    <span className="badge badge-success text-xs">
                      {Math.round((1 - price / originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">IVA {Number(product.tax_rate || 0)}% incluido</p>
                {product.offer?.ends_at && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-gray-600">Oferta termina en:</span>
                    <CountdownTimer endsAt={product.offer.ends_at} className="text-sm" />
                  </div>
                )}
                {naveEnabled && (
                  <button
                    type="button"
                    onClick={() => setIsInstallmentsModalOpen(true)}
                    className="text-sm font-semibold text-purple-700 hover:text-purple-800 underline underline-offset-2"
                  >
                    Ver cuotas Nave
                  </button>
                )}
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
                  <span className="text-gray-500">Seleccioná una opción para ver stock</span>
                ) : hasStock ? (
                  stockCount > 0 && stockCount <= LOW_STOCK_THRESHOLD ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600">
                      <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-current" aria-hidden="true">
                        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM7.5 5a.5.5 0 0 1 1 0v3.5a.5.5 0 0 1-1 0V5zm.5 6.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
                      </svg>
                      ¡Últimas {stockCount} unidades!
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      En stock
                      {stockCount > 0 && <span className="text-gray-500 font-normal"> · {stockCount} unidades</span>}
                    </span>
                  )
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
                {hasStock && stockCount > LOW_STOCK_THRESHOLD && stockCount <= 10 && (
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
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
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

        {isImageViewerOpen && (
          <div
            className="fixed inset-0 z-[60] bg-slate-950/92 backdrop-blur-sm"
            onClick={() => setIsImageViewerOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsImageViewerOpen(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Cerrar visor de imagen"
            >
              <X size={22} />
            </button>

            <div
              className="absolute inset-0 px-4 py-6 sm:px-8"
            >
              <div
                className="mx-auto flex h-full w-full max-w-6xl flex-col"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex w-full items-center justify-between gap-4 text-white">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/75">{product.name}</p>
                    {images.length > 1 && (
                      <p className="mt-1 text-xs text-white/55">
                        Imagen {activeImageIndex + 1} de {images.length}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative flex w-full flex-1 min-h-0 items-center justify-center">
                  {images.length > 1 && activeImageIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(prev => prev - 1)}
                      className="absolute left-0 z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-slate-950/55 text-white shadow-2xl backdrop-blur transition hover:bg-slate-950/75"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={28} />
                    </button>
                  )}

                  <div className="flex h-full w-full items-center justify-center px-10 md:px-16">
                    <div className="flex max-h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-white/5 p-3 sm:p-4">
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="max-h-[calc(100vh-12rem)] max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {images.length > 1 && activeImageIndex < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(prev => prev + 1)}
                      className="absolute right-0 z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-slate-950/55 text-white shadow-2xl backdrop-blur transition hover:bg-slate-950/75"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight size={28} />
                    </button>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-6 flex w-full max-w-5xl gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={`viewer-${img.id}`}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                          idx === activeImageIndex
                            ? 'border-white shadow-[0_0_0_3px_rgba(255,255,255,0.15)]'
                            : 'border-white/15 hover:border-white/35'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${product.name} ampliada ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <NaveInstallmentsModal
        isOpen={isInstallmentsModalOpen}
        onClose={() => setIsInstallmentsModalOpen(false)}
        amount={price * quantity}
      />
    </>
  )
}
