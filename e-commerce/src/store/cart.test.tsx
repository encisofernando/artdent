import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from './cart'
import type { CatalogProduct } from '../api/products'

function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: 1,
    company_id: 1,
    category_id: null,
    sku: 'SKU-1',
    barcode: null,
    name: 'Producto de prueba',
    description: null,
    unit: null,
    cost: 0,
    price: 1000,
    tax_rate: 0,
    tax_id: null,
    is_active: true,
    track_stock: true,
    min_stock: 0,
    ...overrides,
  }
}

function setup() {
  return renderHook(() => useCart(), { wrapper: CartProvider })
}

beforeEach(() => {
  localStorage.clear()
})

describe('useCart', () => {
  it('arranca vacío', () => {
    const { result } = setup()
    expect(result.current.items).toEqual([])
    expect(result.current.subtotal).toBe(0)
  })

  it('agregar un producto nuevo lo suma con qty 1 por defecto', () => {
    const { result } = setup()
    act(() => result.current.add(product()))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].qty).toBe(1)
    expect(result.current.subtotal).toBe(1000)
  })

  it('agregar el mismo producto otra vez suma cantidades, no duplica la línea', () => {
    const { result } = setup()
    act(() => result.current.add(product(), 2))
    act(() => result.current.add(product(), 3))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].qty).toBe(5)
    expect(result.current.subtotal).toBe(5000)
  })

  it('el mismo producto con variantes distintas son líneas separadas', () => {
    const { result } = setup()
    act(() => result.current.add(product(), 1, 10, 'SKU-1-ROJO', 1200))
    act(() => result.current.add(product(), 1, 20, 'SKU-1-AZUL', 1500))
    expect(result.current.items).toHaveLength(2)
    expect(result.current.subtotal).toBe(2700)
  })

  it('subtotal prioriza variant_price sobre price_final sobre price', () => {
    const { result } = setup()
    act(() => result.current.add(product({ price: 1000, price_final: 800 }), 1, 5, null, 600))
    // variant_price (600) gana por sobre price_final (800) y price (1000)
    expect(result.current.subtotal).toBe(600)
  })

  it('subtotal usa price_final si no hay variante', () => {
    const { result } = setup()
    act(() => result.current.add(product({ price: 1000, price_final: 800 })))
    expect(result.current.subtotal).toBe(800)
  })

  it('qty nunca baja de 1, aunque se pida 0 o negativo', () => {
    const { result } = setup()
    act(() => result.current.add(product(), 0))
    expect(result.current.items[0].qty).toBe(1)
    act(() => result.current.setQty(1, -5))
    expect(result.current.items[0].qty).toBe(1)
  })

  it('remove saca solo el ítem con esa combinación producto+variante', () => {
    const { result } = setup()
    act(() => result.current.add(product({ id: 1 }), 1, 10))
    act(() => result.current.add(product({ id: 1 }), 1, 20))
    act(() => result.current.remove(1, 10))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].variant_id).toBe(20)
  })

  it('clear vacía todo', () => {
    const { result } = setup()
    act(() => result.current.add(product()))
    act(() => result.current.clear())
    expect(result.current.items).toEqual([])
    expect(result.current.subtotal).toBe(0)
  })

  it('persiste en localStorage y lo recupera en una nueva instancia', () => {
    const { result, unmount } = setup()
    act(() => result.current.add(product(), 2))
    unmount()

    const { result: result2 } = setup()
    expect(result2.current.items).toHaveLength(1)
    expect(result2.current.items[0].qty).toBe(2)
  })
})
