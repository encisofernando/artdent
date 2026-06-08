import { http } from './http'

export interface ComparisonItem {
  id: number
  product_id: number
  position: number
  product: any
  created_at: string
}

export async function getComparison(): Promise<ComparisonItem[]> {
  const response = await http.get('/comparison')
  return response.data
}

export async function addToComparison(productId: number) {
  const response = await http.post('/comparison', {
    product_id: productId,
  })
  return response.data
}

export async function removeFromComparison(comparisonId: number) {
  const response = await http.delete(`/comparison/${comparisonId}`)
  return response.data
}

export async function clearComparison() {
  const response = await http.delete('/comparison/clear')
  return response.data
}
