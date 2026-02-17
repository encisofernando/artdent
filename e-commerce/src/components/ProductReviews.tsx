import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, ThumbsUp, ThumbsDown, Upload, X } from 'lucide-react'
import { getReviews, submitReview, markReviewHelpful, Review, ReviewsResponse } from '../api/reviews' // ← importa tipos reales de la API
import { useAuth } from '../store/auth'

interface ProductReviewsProps {
  productId: number
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [page, setPage] = useState(1)
  const [rating, setRating] = useState<number | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Review form state
  const [newRating, setNewRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])

  const reviewsQuery = useQuery<ReviewsResponse>({
    queryKey: ['reviews', productId, page, rating, verifiedOnly],
    queryFn: () => getReviews(productId, { 
      page, 
      rating: rating ?? undefined, 
      verified_only: verifiedOnly 
    }),
  })

  const submitMutation = useMutation({
    mutationFn: (data: FormData) => submitReview(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      setShowForm(false)
      setTitle('')
      setComment('')
      setImages([])
      setNewRating(5)
    },
  })

  const helpfulMutation = useMutation({
    mutationFn: ({ reviewId, helpful }: { reviewId: number; helpful: boolean }) =>
      markReviewHelpful(reviewId, helpful),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('rating', String(newRating))
    if (title) formData.append('title', title)
    if (comment) formData.append('comment', comment)
    
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image)
    })
    
    submitMutation.mutate(formData)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages([...images, ...files].slice(0, 3)) // Max 3 images
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // Datos con fallback seguro
  const reviewsPaginated = reviewsQuery.data?.reviews ?? { data: [], last_page: 1 }
  const stats = reviewsQuery.data?.stats ?? { average_rating: 0, total: 0, rating_breakdown: {} }
  const reviewItems = reviewsPaginated.data

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onRate?.(star)}
            className={interactive ? 'hover:scale-110 transition' : ''}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 24 : 16}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold">{stats.average_rating}</div>
                <div>
                  {renderStars(Math.round(stats.average_rating))}
                  <p className="text-sm text-gray-600 mt-1">{stats.total} valoraciones</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = (stats.rating_breakdown as Record<number, number>)[r] ?? 0
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                return (
                  <button
                    key={r}
                    onClick={() => setRating(rating === r ? null : r)}
                    className={`flex items-center gap-2 w-full text-sm ${rating === r ? 'font-semibold' : ''}`}
                  >
                    <span>{r}</span>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-12 text-right">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`btn ${verifiedOnly ? 'btn-primary' : 'btn-outline'}`}
            >
              Solo compras verificadas
            </button>
            
            {user && (
              <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                Escribir valoración
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h3 className="text-lg font-bold">Escribe tu valoración</h3>
          
          <div>
            <label className="text-sm font-semibold">Calificación</label>
            <div className="mt-2">{renderStars(newRating, true, setNewRating)}</div>
          </div>

          <div>
            <label className="text-sm font-semibold">Título (opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
              placeholder="Resumen de tu experiencia"
              maxLength={191}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Comentario (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
              rows={4}
              placeholder="Cuéntanos sobre tu experiencia con este producto..."
              maxLength={2000}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Imágenes (máx. 3)</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${i + 1}`}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400">
                  <Upload size={20} className="text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="btn btn-primary"
            >
              {submitMutation.isPending ? 'Enviando...' : 'Publicar valoración'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewItems.map((review: Review) => (
          <div key={review.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  {review.is_verified_purchase && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Compra verificada
                    </span>
                  )}
                </div>
                {review.title && (
                  <h4 className="mt-2 font-semibold">{review.title}</h4>
                )}
                <p className="mt-1 text-sm text-gray-700">{review.comment}</p>
                
                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {review.images.map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Review ${i + 1}`}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>{review.customer_display_name}</span>
                  <span>{new Date(review.created_at).toLocaleDateString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Helpful buttons */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => helpfulMutation.mutate({ reviewId: review.id, helpful: true })}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ThumbsUp size={16} />
                Útil ({review.helpful_count})
              </button>
              <button
                onClick={() => helpfulMutation.mutate({ reviewId: review.id, helpful: false })}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ThumbsDown size={16} />
                ({review.not_helpful_count})
              </button>
            </div>

            {/* Vendor response */}
            {review.vendor_response && (
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold text-[var(--brand-primary)]">Respuesta del vendedor</p>
                <p className="mt-2 text-sm text-gray-700">{review.vendor_response}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {reviewsPaginated.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn btn-outline"
          >
            Anterior
          </button>
          <span className="flex items-center px-4 text-sm">
            Página {page} de {reviewsPaginated.last_page}
          </span>
          <button
            onClick={() => setPage(Math.min(reviewsPaginated.last_page, page + 1))}
            disabled={page === reviewsPaginated.last_page}
            className="btn btn-outline"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}