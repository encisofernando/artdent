import { http } from './http'

export type PickupPoint = {
  id: number
  name: string
  address: string
  city: string
  province: string
  postal_code: string | null
  phone: string | null
  schedule: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  accepts_cash_payment: boolean
}

export type MotoCompany = {
  id: number
  name: string
  phone: string | null
  price: number
  zone: string | null
  notes: string | null
}

export type ShippingOptions = {
  home_delivery: {
    available: boolean
    label: string
    description: string
  }
  pickup_points: {
    available: boolean
    label: string
    description: string
    points: PickupPoint[]
  }
  moto: {
    available: boolean
    label: string
    description: string
    companies: MotoCompany[]
  }
}

export async function getShippingOptions(params: { city?: string; province?: string } = {}): Promise<ShippingOptions> {
  const { data } = await http.get('/shipping/options', { params })
  return data
}
