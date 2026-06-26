import { http } from './http'

export type NavePaymentIntent = {
  payment_request_id: string
  checkout_url: string
  qr_data: string | null
}

export async function createNavePayment(order_code: string): Promise<NavePaymentIntent> {
  const { data } = await http.post('/payment/nave/create', { order_code })
  return data
}
