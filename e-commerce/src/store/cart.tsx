import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CatalogProduct } from '../api/products'

export type CartItem = {
  product: CatalogProduct
  qty: number
}

type CartCtx = {
  items: CartItem[]
  add: (product: CatalogProduct, qty?: number) => void
  remove: (productId: number) => void
  setQty: (productId: number, qty: number) => void
  clear: () => void
  subtotal: number
}

const CartContext = createContext<CartCtx | null>(null)

const LS_KEY = 'artdent_cart_v1'

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
    return items.reduce((acc, it) => acc + money((it.product.price_final ?? it.product.price) * it.qty), 0)
  }, [items])

  const api: CartCtx = {
    items,
    subtotal,
    add: (product, qty = 1) => {
      const q = Math.max(0.001, qty)
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.product.id === product.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], qty: next[idx].qty + q, product }
          return next
        }
        return [...prev, { product, qty: q }]
      })
    },
    remove: (productId) => setItems((prev) => prev.filter((x) => x.product.id !== productId)),
    setQty: (productId, qty) => {
      const q = Math.max(0.001, qty)
      setItems((prev) => prev.map((x) => (x.product.id === productId ? { ...x, qty: q } : x)))
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
