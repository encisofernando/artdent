import { http, Paginated } from './http'

export type Review = {
  id: number
  product_id: number
  user_id: number | null
  rating: number
  title?: string | null
  comment?: string | null
  images?: string[]
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  not_helpful_count: number
  vendor_response?: string | null
  vendor_response_at?: string | null
  customer_display_name: string
  created_at: string
}

export type ReviewStats = {
  total: number
  average_rating: number
  rating_breakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export type ReviewsResponse = {
  reviews: Paginated<Review>
  stats: ReviewStats
}

export async function getReviews(
  productId: number,
  params: { page?: number; rating?: number; verified_only?: boolean } = {}
): Promise<ReviewsResponse> {
  const { data } = await http.get(`/products/${productId}/reviews`, { params })
  return data
}

export async function submitReview(productId: number, formData: FormData): Promise<Review> {
  const { data } = await http.post(`/products/${productId}/reviews`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function markReviewHelpful(reviewId: number, helpful: boolean): Promise<any> {
  const endpoint = helpful ? `/reviews/${reviewId}/helpful` : `/reviews/${reviewId}/not-helpful`
  const { data } = await http.post(endpoint)
  return data
}

export async function addVendorResponse(reviewId: number, response: string): Promise<Review> {
  const { data } = await http.post(`/reviews/${reviewId}/vendor-response`, { response })
  return data
}
