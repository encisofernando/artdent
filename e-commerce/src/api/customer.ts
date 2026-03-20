import { http } from './http'
import type { PaymentReport } from './paymentReport'

export type CustomerProfile = {
  id: number
  name: string
  email: string
  phone: string | null
  dni: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  accepts_marketing: boolean | null
  created_at: string | null
}

export type CustomerAddress = {
  id: number
  label: string | null
  recipient: string
  address: string
  city: string
  province: string
  postal_code: string | null
  phone: string | null
  is_default: boolean
}

export type OrderTracking = {
  carrier: string | null
  tracking_code: string | null
  tracking_url: string | null
  status: 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned' | null
  shipped_at: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  notes: string | null
}

export type CustomerOrderItem = {
  id: number
  product_id: number
  name: string
  sku: string | null
  qty: number
  unit_price: number
  tax_rate: number
  total: number
}

export type CustomerOrder = {
  id: number
  code: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal: number
  discount_amount: number
  shipping_cost: number
  tax_amount: number
  total: number
  shipping_name: string | null
  shipping_address: string | null
  shipping_city: string | null
  shipping_province: string | null
  shipping_postal: string | null
  shipping_phone: string | null
  customer_notes: string | null
  shipping_method_type: 'home_delivery' | 'pickup_point' | 'moto' | null
  selected_payment_method: 'mercadopago' | 'bank_transfer' | 'qr' | 'cash' | null
  can_cancel: boolean
  created_at: string
  items: CustomerOrderItem[]
  tracking: OrderTracking | null
  payment_report: PaymentReport | null
}

export async function getProfile(): Promise<CustomerProfile> {
  const { data } = await http.get('/customer/profile')
  return data
}

export async function updateProfile(payload: Partial<Omit<CustomerProfile, 'id' | 'email' | 'created_at'>>): Promise<CustomerProfile> {
  const { data } = await http.put('/customer/profile', payload)
  return data
}

export async function changePassword(payload: {
  current_password: string
  password: string
  password_confirmation: string
}): Promise<void> {
  await http.post('/customer/password', payload)
}

export async function getOrders(): Promise<CustomerOrder[]> {
  const { data } = await http.get('/customer/orders')
  return data
}

export async function getCustomerOrder(code: string): Promise<CustomerOrder> {
  const { data } = await http.get(`/customer/orders/${code}`)
  return data
}

export async function cancelOrder(code: string): Promise<CustomerOrder> {
  const { data } = await http.post(`/customer/orders/${code}/cancel`)
  return data
}

export async function changePaymentMethod(code: string, method: string): Promise<CustomerOrder> {
  const { data } = await http.post(`/customer/orders/${code}/payment-method`, { selected_payment_method: method })
  return data
}

export async function getAddresses(): Promise<CustomerAddress[]> {
  const { data } = await http.get('/customer/addresses')
  return data
}

export async function createAddress(payload: Omit<CustomerAddress, 'id'>): Promise<CustomerAddress> {
  const { data } = await http.post('/customer/addresses', payload)
  return data
}

export async function updateAddress(id: number, payload: Omit<CustomerAddress, 'id'>): Promise<CustomerAddress> {
  const { data } = await http.put(`/customer/addresses/${id}`, payload)
  return data
}

export async function deleteAddress(id: number): Promise<void> {
  await http.delete(`/customer/addresses/${id}`)
}
