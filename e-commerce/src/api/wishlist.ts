import { http } from './http'
import type { CatalogProduct } from './products'

export type WishlistItem = {
  id: number
  company_id: number
  user_id: number
  product_id: number
  notes?: string | null
  price_alert?: number | null
  notify_back_in_stock: boolean
  created_at: string
  product: CatalogProduct
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const { data } = await http.get('/wishlist')
  return data
}

export async function addToWishlist(productId: number, options?: {
  notes?: string
  price_alert?: number
  notify_back_in_stock?: boolean
}): Promise<WishlistItem> {
  const { data } = await http.post('/wishlist', {
    product_id: productId,
    ...options,
  })
  return data
}

export async function removeFromWishlist(wishlistId: number): Promise<void> {
  await http.delete(`/wishlist/${wishlistId}`)
}

export async function updateWishlistItem(wishlistId: number, options: {
  notes?: string
  price_alert?: number
  notify_back_in_stock?: boolean
}): Promise<WishlistItem> {
  const { data } = await http.put(`/wishlist/${wishlistId}`, options)
  return data
}

export async function checkWishlist(productId: number): Promise<{ in_wishlist: boolean; wishlist_id?: number }> {
  const { data } = await http.get(`/wishlist/check/${productId}`)
  return data
}
