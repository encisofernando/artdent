import { Heart } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addToWishlist, removeFromWishlist, checkWishlist } from '../api/wishlist'
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

  const checkQuery = useQuery({
    queryKey: ['wishlist-check', productId],
    queryFn: () => checkWishlist(productId),
    enabled: isAuthenticated,
  })

  const addMutation = useMutation({
    mutationFn: () => addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', productId] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (wishlistId: number) => removeFromWishlist(wishlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', productId] })
    },
  })

  if (!isAuthenticated) {
    return null
  }

  const inWishlist = checkQuery.data?.in_wishlist || false
  const wishlistId = checkQuery.data?.wishlist_id

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
