import { http } from './http'

export async function listBrands(params: { company_id?: number } = {}): Promise<string[]> {
  const { data } = await http.get('/catalog/brands', { params })
  return data
}
