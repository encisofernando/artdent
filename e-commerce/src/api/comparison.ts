import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export interface ComparisonItem {
  id: number
  product_id: number
  position: number
  product: any
  created_at: string
}

export async function getComparison(): Promise<ComparisonItem[]> {
  const response = await axios.get(`${API_URL}/comparison`)
  return response.data
}

export async function addToComparison(productId: number) {
  const response = await axios.post(`${API_URL}/comparison`, {
    product_id: productId,
  })
  return response.data
}

export async function removeFromComparison(comparisonId: number) {
  const response = await axios.delete(`${API_URL}/comparison/${comparisonId}`)
  return response.data
}

export async function clearComparison() {
  const response = await axios.delete(`${API_URL}/comparison/clear`)
  return response.data
}
