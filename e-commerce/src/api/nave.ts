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

export type NaveInstallmentRate = {
  bank: 'galicia' | 'naranja' | 'otros_bancos'
  card_brand: string
  card_type: 'credit' | 'debit'
  installments: number
  rate_pct: number
  tier_label: string | null
}

export async function getNaveInstallmentRates(): Promise<NaveInstallmentRate[]> {
  const { data } = await http.get('/nave/installment-rates')
  return data
}
