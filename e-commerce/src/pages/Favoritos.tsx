import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { getWishlist, removeFromWishlist, type WishlistItem } from '../api/wishlist'
import { productPath } from '../utils/slug'
import { storageUrl } from '../api/http'

export default function Favoritos() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWishlist()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id: number) => {
    await removeFromWishlist(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={24} className="text-[var(--brand-primary)]" />
        <h1 className="text-2xl font-bold text-gray-900">Mis favoritos</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-primary)] border-r-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Heart size={48} className="text-gray-200" />
          <p className="text-gray-500 text-lg">No tenés productos guardados</p>
          <p className="text-gray-400 text-sm">Explorá el catálogo y guardá los que te interesan</p>
          <Link to="/productos" className="btn btn-primary mt-2">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const product = item.product
            if (!product) return null
            const img = storageUrl(product.primary_image_url)
            const price = product.price_final ?? product.price
            return (
              <div key={item.id} className="group card flex flex-col">
                <Link to={productPath(product.id, product.name)} className="relative overflow-hidden rounded-xl bg-gray-50 aspect-square flex items-center justify-center mb-3">
                  {img ? (
                    <img src={img} alt={product.name} className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Heart size={24} className="text-gray-300" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 flex flex-col gap-1 px-1">
                  {product.category && (
                    <p className="text-[11px] text-[var(--brand-primary)] font-medium uppercase tracking-wide">
                      {product.category.name}
                    </p>
                  )}
                  <Link to={productPath(product.id, product.name)} className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-[var(--brand-primary)] transition">
                    {product.name}
                  </Link>
                  <p className="text-base font-bold text-gray-900 mt-auto pt-2">
                    ${price.toLocaleString('es-AR')}
                  </p>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Link to={productPath(product.id, product.name)} className="btn btn-primary flex-1 text-sm">
                    Ver producto
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn btn-outline w-10 h-10 flex items-center justify-center p-0 text-red-500 border-red-200 hover:bg-red-50"
                    title="Quitar de favoritos"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
