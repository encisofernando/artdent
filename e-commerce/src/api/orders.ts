import { http } from './http'

export type CheckoutItem = {
  product_id: number
  qty: number
  variant_id?: number
}

export type CheckoutPayload = {
  company_id?: number
  warehouse_id?: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_province?: string
  shipping_postal?: string
  shipping_method_type?: 'home_delivery' | 'pickup_point' | 'moto'
  pickup_point_id?: number
  moto_company_id?: number
  shipping_cost?: number
  notes?: string
  coupon_code?: string
  items: CheckoutItem[]
}

export type CheckoutResponse = {
  code: string
  status: string
  pricing_mode: 'b2c' | 'b2b'
  subtotal: number
  tax_total: number
  total: number
}

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const { data } = await http.post('/catalog/checkout', payload)
  return data
}

export type CartTrackItem = {
  product_id: number
  name: string
  qty: number
  price?: number
}

export async function trackCart(email: string, items: CartTrackItem[]): Promise<void> {
  try {
    await http.post('/catalog/cart/track', { email, items })
  } catch {
    // fire-and-forget: no bloquear el flujo si falla
  }
}

export type Order = {
  id: number
  code: string
  status: string
  pricing_mode: 'b2c' | 'b2b'
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  shipping_address?: string | null
  notes?: string | null
  subtotal: number
  tax_total: number
  total: number
  currency: string
  created_at: string
  items: Array<{
    id: number
    product_id: number
    sku?: string | null
    name: string
    qty: number
    unit_price: number
    tax_rate: number
    line_subtotal: number
    line_tax: number
    line_total: number
  }>
}

export async function getOrder(code: string, params: { email?: string; company_id?: number } = {}): Promise<Order> {
  const { data } = await http.get(`/catalog/orders/${encodeURIComponent(code)}`, { params })
  return data
}
