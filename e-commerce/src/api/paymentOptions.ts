import { http } from './http'

export type PaymentMethodType = 'mercadopago' | 'bank_transfer' | 'qr' | 'cash' | 'nave'

export interface CashPickupPoint {
  id: number
  name: string
  address: string
  city: string
  province: string
  schedule?: string
  phone?: string
}

export interface PaymentOption {
  type: PaymentMethodType
  label: string
  instructions?: string
  // mercadopago
  public_key?: string
  // bank_transfer
  cbu?: string
  alias?: string
  account_name?: string
  // qr
  image_url?: string
  payment_url?: string
  // cash
  pickup_points?: CashPickupPoint[]
  // nave
  sandbox_mode?: boolean
}

export async function getPaymentOptions(): Promise<PaymentOption[]> {
  const res = await http.get('/payment-options')
  return res.data
}
