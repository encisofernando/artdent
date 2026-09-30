import { Heart } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addToWishlist, removeFromWishlist, getWishlist, type WishlistItem } from '../api/wishlist'
import { useAuth } from '../store/auth'
import { useState } from 'react'

interface WishlistButtonProps {
  productId: number
  className?: string
  showLabel?: boolean
}

export default function WishlistButton({ productId, className = '', showLabel = false }: WishlistButtonProps) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [isHovered, setIsHovered] = useState(false)

  // Una sola consulta compartida (la misma del Header) en vez de un
  // /wishlist/check/{id} por tarjeta: con el scroll infinito del catálogo
  // eso eran decenas de requests por minuto y el rate limit devolvía 429.
  // Sin refetch al montar: cada tarjeta nueva no vuelve a pedir la lista;
  // las mutaciones de abajo la invalidan cuando cambia de verdad.
  const wishlistQuery = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    enabled: isAuthenticated,
    staleTime: 60_000,
    refetchOnMount: false,
  })

  const addMutation = useMutation({
    mutationFn: () => addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (wishlistId: number) => removeFromWishlist(wishlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })

  if (!isAuthenticated) {
    return null
  }

  const wishlistId = wishlistQuery.data?.find((item) => item.product_id === productId)?.id
  const inWishlist = wishlistId !== undefined

  const handleClick = () => {
    if (inWishlist && wishlistId) {
      removeMutation.mutate(wishlistId)
    } else {
      addMutation.mutate()
    }
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={addMutation.isPending || removeMutation.isPending}
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 transition ${
        inWishlist
          ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-gray-300 bg-white text-gray-700 hover:border-red-500 hover:text-red-600'
      } ${className}`}
      title={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart
        size={20}
        className={`transition ${
          inWishlist || isHovered ? 'fill-current' : ''
        }`}
      />
      {showLabel && (
        <span className="text-sm font-semibold">
          {inWishlist ? 'En favoritos' : 'Agregar a favoritos'}
        </span>
      )}
    </button>
  )
}
