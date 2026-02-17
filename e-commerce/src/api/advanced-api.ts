import { http } from './http'

// ========================================
// NEWSLETTER API
// ========================================

export type NewsletterSubscriber = {
  id: number
  email: string
  name?: string
  is_active: boolean
  subscribed_at: string
}

export async function subscribeNewsletter(data: {
  email: string
  name?: string
  preferences?: any
}): Promise<NewsletterSubscriber> {
  const { data: response } = await http.post('/newsletter/subscribe', data)
  return response.subscriber
}

export async function unsubscribeNewsletter(emailOrToken: string): Promise<void> {
  await http.post('/newsletter/unsubscribe', {
    email: emailOrToken.includes('@') ? emailOrToken : undefined,
    token: !emailOrToken.includes('@') ? emailOrToken : undefined,
  })
}

// ========================================
// PRODUCT COMPARISON API
// ========================================

export type ProductComparison = {
  id: number
  product_id: number
  position: number
  product: any
  created_at: string
}

export async function getComparison(): Promise<ProductComparison[]> {
  const { data } = await http.get('/comparison')
  return data
}

export async function addToComparison(productId: number): Promise<ProductComparison> {
  const { data } = await http.post('/comparison', { product_id: productId })
  return data
}

export async function removeFromComparison(comparisonId: number): Promise<void> {
  await http.delete(`/comparison/${comparisonId}`)
}

export async function clearComparison(): Promise<void> {
  await http.delete('/comparison/clear')
}

// ========================================
// SEARCH API
// ========================================

export type SearchSuggestion = {
  suggestion: string
  count?: number
  type: 'product' | 'category' | 'query'
}

export type PopularSearch = {
  query: string
  search_count: number
  conversion_rate: number
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return []
  
  const { data } = await http.get('/search/suggestions', {
    params: { q: query },
  })
  return data
}

export async function getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
  const { data } = await http.get('/search/popular', {
    params: { limit },
  })
  return data
}

export async function trackSearch(query: string, results_count: number): Promise<void> {
  await http.post('/search/track', {
    query,
    results_count,
  })
}

export async function searchProducts(query: string, filters?: any): Promise<any> {
  const { data } = await http.get('/catalog/products', {
    params: {
      q: query,
      ...filters,
    },
  })
  return data
}

// ========================================
// ANALYTICS TRACKING API
// ========================================

export async function trackProductView(productId: number, source?: string): Promise<void> {
  await http.post('/analytics/product-view', {
    product_id: productId,
    source,
  })
}

export async function trackProductClick(productId: number, source?: string): Promise<void> {
  await http.post('/analytics/product-click', {
    product_id: productId,
    source,
  })
}

export async function trackAddToCart(productId: number, quantity: number): Promise<void> {
  await http.post('/analytics/add-to-cart', {
    product_id: productId,
    quantity,
  })
}

export async function trackPurchase(orderId: number): Promise<void> {
  await http.post('/analytics/purchase', {
    order_id: orderId,
  })
}
