import { http, Paginated, storageUrl } from './http'

export type Product = {
  id: number
  company_id: number
  category_id: number | null
  sku: string | null
  barcode: string | null
  name: string
  description: string | null
  unit: string | null
  cost: number
  price: number
  tax_rate: number
  tax_id: number | null
  is_active: boolean
  track_stock: boolean
  min_stock: number
}

export type PricingInfo = {
  mode: 'b2c' | 'b2b'
  base: number
  discount_percent: number
  final: number
}

export type ProductOffer = {
  id: number
  badge_text: string | null
  badge_color: string | null
  type: 'percentage' | 'fixed' | string
  value: number
  description: string | null
  ends_at: string | null
}

export type CatalogProduct = Product & {
  pricing?: PricingInfo
  price_final?: number
  price_mode?: 'b2c' | 'b2b'
  compare_price?: number | null
  primary_image_url?: string | null
  primary_thumb_url?: string | null
  images?: Array<{ id: number; url: string; thumb_url?: string | null; alt?: string | null; sort_order?: number; is_primary?: boolean }>
  offers?: ProductOffer[]
  offer?: ProductOffer | null

  // Campos agregados para eliminar los errores de "property does not exist"
  brand?: string | null
  stock?: number
  average_rating?: number
  review_count?: number
  has_variants?: boolean
  variants?: ProductVariant[]
  category?: {
    id: number | string
    name: string
  } | null
}

export type VariantAttribute = {
  attribute_id: number
  attribute: string
  value_id: number
  value: string
}

export type ProductVariant = {
  id: number
  sku: string | null
  price: number | null
  price_final: number | null
  is_active: boolean
  stock: number
  attributes: VariantAttribute[]
}

export type StockSummary = {
  product_id: number
  warehouse_id: number
  quantity: number
}

function normalizeVariantAttributeName(value?: string | null): string {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}

function normalizeVariantAttributeValue(value?: string | null): string {
  return normalizeVariantAttributeName(value).toLocaleUpperCase('es-AR')
}

function normalizeProductUrls(p: CatalogProduct): CatalogProduct {
  return {
    ...p,
    primary_image_url: storageUrl(p.primary_image_url) ?? p.primary_image_url,
    primary_thumb_url: storageUrl(p.primary_thumb_url) ?? p.primary_thumb_url,
    images: p.images?.map(img => ({ ...img, url: storageUrl(img.url) ?? img.url, thumb_url: img.thumb_url ? (storageUrl(img.thumb_url) ?? img.thumb_url) : null })),
    variants: p.variants?.map((variant) => ({
      ...variant,
      attributes: variant.attributes.map((attribute) => ({
        ...attribute,
        attribute: normalizeVariantAttributeName(attribute.attribute),
        value: normalizeVariantAttributeValue(attribute.value),
      })),
    })),
  }
}

export async function listProducts(params: {
  q?: string
  page?: number
  category_id?: number
  per_page?: number
  company_id?: number
  sort?: string
  has_offer?: boolean
  brand?: string
  min_price?: number
  max_price?: number
} = {}): Promise<Paginated<CatalogProduct>> {
  const { data } = await http.get('/catalog/products', { params })
  return { ...data, data: data.data.map(normalizeProductUrls) }
}

export async function listBrands(params: { company_id?: number } = {}): Promise<string[]> {
  const { data } = await http.get('/catalog/brands', { params })
  return data
}

export async function getProduct(id: number, params: { company_id?: number } = {}): Promise<CatalogProduct> {
  const { data } = await http.get(`/catalog/products/${id}`, { params })
  return normalizeProductUrls(data)
}

export async function getProductStock(id: number): Promise<any> {
  const { data } = await http.get(`/products/${id}/stock`)
  return data
}
