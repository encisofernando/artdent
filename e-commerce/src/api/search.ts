import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

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
  const response = await axios.get(`${API_URL}/catalog/products`, {
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
    const response = await axios.get(`${API_URL}/search/suggestions`, {
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
    const response = await axios.get(`${API_URL}/search/popular`, { params: { limit } })
    return response.data
  } catch (error) {
    console.error('Error fetching popular searches:', error)
    return []
  }
}

export async function trackSearch(query: string, results_count: number = 0, filters?: any) {
  try {
    await axios.post(`${API_URL}/search/track`, { query, results_count, filters })
  } catch (error) {
    console.error('Error tracking search:', error)
  }
}
