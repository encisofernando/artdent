import { http } from './http'

export interface SearchSuggestion {
  suggestion: string
  name?: string
  count?: number
}

export interface PopularSearch {
  query: string
  search_count: number
}

export async function searchProducts(query: string, filters?: any) {
  // La API de catálogo expone la búsqueda en /catalog/products
  const response = await http.get('/catalog/products', {
    params: {
      q: query,
      ...filters,
    },
  })
  return response.data
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return []
  
  try {
    const response = await http.get('/search/suggestions', {
      params: { q: query },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return []
  }
}

export async function getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
  try {
    const response = await http.get('/search/popular', { params: { limit } })
    return response.data
  } catch (error) {
    console.error('Error fetching popular searches:', error)
    return []
  }
}

export async function trackSearch(query: string, results_count: number = 0, filters?: any) {
  try {
    await http.post('/search/track', { query, results_count, filters })
  } catch (error) {
    console.error('Error tracking search:', error)
  }
}
