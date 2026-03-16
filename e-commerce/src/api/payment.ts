import { http } from './http'

export type MpPreference = {
  preference_id: string
  init_point: string
  sandbox_init_point: string | null
}

export async function createMpPreference(order_code: string): Promise<MpPreference> {
  const { data } = await http.post('/payment/mp/create', { order_code })
  return data
}
