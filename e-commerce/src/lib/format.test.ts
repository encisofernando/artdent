import { describe, it, expect } from 'vitest'
import { formatMoney } from './format'

describe('formatMoney', () => {
  it('formatea con separador de miles es-AR', () => {
    expect(formatMoney(1234567)).toBe('$1.234.567')
  })

  it('usa coma como separador decimal (es-AR)', () => {
    expect(formatMoney(1000.5)).toBe('$1.000,5')
  })

  it('trata null/undefined/NaN como 0 (n || 0 es falsy para los tres)', () => {
    expect(formatMoney(null as unknown as number)).toBe('$0')
    expect(formatMoney(undefined as unknown as number)).toBe('$0')
    expect(formatMoney(NaN)).toBe('$0')
  })

  it('no rompe con números negativos', () => {
    expect(formatMoney(-500)).toBe('$-500')
  })

  it('cero da $0', () => {
    expect(formatMoney(0)).toBe('$0')
  })
})
