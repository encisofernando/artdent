import { http } from './http'

export type Offer = {
  id: number
  name: string
  type: string
  value: number | null
  badge_text: string | null
  badge_color: string
  description: string | null
  ends_at: string | null
  products_count: number
}

export async function listOffers(params: { company_id?: number } = {}): Promise<Offer[]> {
  const { data } = await http.get('/catalog/offers', { params })
  return data
}
