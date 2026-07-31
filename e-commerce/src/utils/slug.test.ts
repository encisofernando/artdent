import { describe, it, expect } from 'vitest'
import { slugify, productPath, idFromSlug } from './slug'

describe('slugify', () => {
  it('pasa a minúsculas y reemplaza espacios por guiones', () => {
    expect(slugify('Acrilico Polimero Autocurable')).toBe('acrilico-polimero-autocurable')
  })

  it('saca acentos', () => {
    expect(slugify('Algodón Odontológico')).toBe('algodon-odontologico')
  })

  it('saca caracteres especiales pero conserva números', () => {
    expect(slugify('Jeringa 10ml (x1 Kg)')).toBe('jeringa-10ml-x1-kg')
  })

  it('colapsa guiones múltiples', () => {
    expect(slugify('Producto   con    espacios')).toBe('producto-con-espacios')
  })
})

describe('productPath', () => {
  it('arma la URL real usada en toda la app: /productos/{id}-{slug}', () => {
    expect(productPath(42, 'Acrilico Polimero Autocurable x 1Kg')).toBe(
      '/productos/42-acrilico-polimero-autocurable-x-1kg'
    )
  })
})

describe('idFromSlug', () => {
  it('extrae el ID numérico del inicio del slug', () => {
    expect(idFromSlug('42-acrilico-polimero-autocurable-x-1kg')).toBe(42)
  })

  it('funciona con un slug que es solo el ID', () => {
    expect(idFromSlug('7')).toBe(7)
  })

  it('da NaN con un slug sin número al inicio (caso a validar en la página)', () => {
    expect(idFromSlug('sin-numero')).toBeNaN()
  })
})
