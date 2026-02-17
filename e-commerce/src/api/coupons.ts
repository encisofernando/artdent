import { http } from './http'

export type Coupon = {
  id: number
  code: string
  name: string
  description?: string | null
  type: 'percentage' | 'fixed' | 'free_shipping'
  discount_value: number
  valid_until?: string | null
}

export type CouponValidation = {
  valid: boolean
  message?: string
  coupon?: Coupon
  discount?: number
  final_total?: number
}

export async function validateCoupon(params: {
  code: string
  cart_total: number
  cart_items?: any[]
}): Promise<CouponValidation> {
  const { data } = await http.post('/coupons/validate', params)
  return data
}

export async function getAvailableCoupons(): Promise<Coupon[]> {
  const { data } = await http.get('/coupons/available')
  return data
}

export async function getCoupons(): Promise<any> {
  const { data } = await http.get('/coupons')
  return data
}

export async function createCoupon(payload: any): Promise<Coupon> {
  const { data } = await http.post('/coupons', payload)
  return data
}

export async function updateCoupon(couponId: number, payload: any): Promise<Coupon> {
  const { data } = await http.put(`/coupons/${couponId}`, payload)
  return data
}
