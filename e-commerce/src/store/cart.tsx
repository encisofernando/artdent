import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CatalogProduct } from '../api/products'

export type CartItem = {
  product: CatalogProduct
  qty: number
  variant_id?: number
  variant_sku?: string | null
  variant_price?: number | null
  variant_label?: string // e.g. "Color: Rojo / Talle: M"
}

type CartCtx = {
  items: CartItem[]
  add: (product: CatalogProduct, qty?: number, variantId?: number, variantSku?: string | null, variantPrice?: number | null, variantLabel?: string) => void
  remove: (productId: number, variantId?: number) => void
  setQty: (productId: number, qty: number, variantId?: number) => void
  clear: () => void
  subtotal: number
}

const CartContext = createContext<CartCtx | null>(null)

const LS_KEY = 'artdent_cart_v1'

function itemKey(productId: number, variantId?: number): string {
  return `${productId}-${variantId ?? 0}`
}

function money(n: number) {
  return Number.isFinite(n) ? n : 0
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  }, [items])

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const price = it.variant_price ?? it.product.price_final ?? it.product.price
      return acc + money(price * it.qty)
    }, 0)
  }, [items])

  const api: CartCtx = {
    items,
    subtotal,
    add: (product, qty = 1, variantId, variantSku, variantPrice, variantLabel) => {
      const q = Math.max(1, Math.round(qty))
      const key = itemKey(product.id, variantId)
      setItems((prev) => {
        const idx = prev.findIndex((x) => itemKey(x.product.id, x.variant_id) === key)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], qty: next[idx].qty + q, product, variant_price: variantPrice }
          return next
        }
        return [...prev, { product, qty: q, variant_id: variantId, variant_sku: variantSku, variant_price: variantPrice, variant_label: variantLabel }]
      })
    },
    remove: (productId, variantId) => {
      const key = itemKey(productId, variantId)
      setItems((prev) => prev.filter((x) => itemKey(x.product.id, x.variant_id) !== key))
    },
    setQty: (productId, qty, variantId) => {
      const q = Math.max(1, Math.round(qty))
      const key = itemKey(productId, variantId)
      setItems((prev) => prev.map((x) => itemKey(x.product.id, x.variant_id) === key ? { ...x, qty: q } : x))
    },
    clear: () => setItems([]),
  }

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
