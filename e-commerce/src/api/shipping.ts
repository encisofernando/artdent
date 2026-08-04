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

export type AndreaniBranch = {
  code: string
  name: string
  address: string
  city: string
  province: string
  postal_code: string
}

export type ShippingOptions = {
  home_delivery: {
    available: boolean
    label: string
    description: string
    /** Costo real cotizado con Andreani — null si todavía no se puede cotizar (falta CP, carrito, o algún producto sin dimensiones cargadas). */
    cost: number | null
    quote_pending: boolean
  }
  andreani_branches: {
    available: boolean
    label: string
    description: string
    cost: number | null
    branches: AndreaniBranch[]
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

export type ShippingQuoteItem = { product_id: number; qty: number }

export async function getShippingOptions(params: {
  city?: string
  province?: string
  postal_code?: string
  items?: ShippingQuoteItem[]
} = {}): Promise<ShippingOptions> {
  const { data } = await http.get('/shipping/options', { params })
  return data
}
