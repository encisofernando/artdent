import { http } from './http'

export type Category = {
  id: number
  company_id: number
  name: string
  parent_id?: number | null
}

export async function listCategories(params: { company_id?: number } = {}): Promise<Category[]> {
  const { data } = await http.get('/catalog/categories', { params })
  return data
}
