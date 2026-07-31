import { describe, it, expect } from 'vitest'
import { computeInstallment, groupRates, cardLabel, BANK_LABELS } from './naveInstallments'
import type { NaveInstallmentRate } from '../api/nave'

describe('computeInstallment', () => {
  it('coincide con el ejemplo real verificado contra el simulador de RyR', () => {
    // $109.000 a 3 cuotas Nave al 7,64% → PTF $117.327,60 / cuota $39.109,20
    const { ptf, cuota } = computeInstallment(109_000, 7.64, 3)
    expect(ptf).toBeCloseTo(117_327.6, 2)
    expect(cuota).toBeCloseTo(39_109.2, 2)
  })

  it('1 cuota sin interés: PTF = cuota = monto', () => {
    const { ptf, cuota } = computeInstallment(50_000, 0, 1)
    expect(ptf).toBe(50_000)
    expect(cuota).toBe(50_000)
  })
})

function rate(overrides: Partial<NaveInstallmentRate>): NaveInstallmentRate {
  return {
    bank: 'galicia',
    card_brand: 'visa',
    card_type: 'credit',
    installments: 3,
    rate_pct: 10,
    tier_label: null,
    ...overrides,
  }
}

describe('groupRates', () => {
  it('agrupa por banco y luego por marca+tipo de tarjeta', () => {
    const rates = [
      rate({ bank: 'galicia', card_brand: 'visa', card_type: 'credit', installments: 3 }),
      rate({ bank: 'galicia', card_brand: 'visa', card_type: 'credit', installments: 6 }),
      rate({ bank: 'galicia', card_brand: 'amex', card_type: 'credit', installments: 3 }),
      rate({ bank: 'naranja', card_brand: 'visa', card_type: 'debit', installments: 1 }),
    ]
    const grouped = groupRates(rates)

    expect(Object.keys(grouped)).toEqual(['galicia', 'naranja'])
    expect(grouped.galicia['visa__credit']).toHaveLength(2)
    expect(grouped.galicia['amex__credit']).toHaveLength(1)
    expect(grouped.naranja['visa__debit']).toHaveLength(1)
  })

  it('lista vacía da objeto vacío', () => {
    expect(groupRates([])).toEqual({})
  })
})

describe('cardLabel', () => {
  it('arma "Tarjeta <marca> <tipo>" con las etiquetas en español', () => {
    expect(cardLabel(rate({ card_brand: 'mastercard', card_type: 'debit' }))).toBe(
      'Tarjeta Mastercard Débito'
    )
  })

  it('si no conoce la marca, usa el valor crudo tal cual', () => {
    expect(cardLabel(rate({ card_brand: 'cabal' }))).toBe('Tarjeta cabal Crédito')
  })
})

describe('BANK_LABELS', () => {
  it('tiene las tres entidades reales que carga el simulador', () => {
    expect(BANK_LABELS).toEqual({
      galicia: 'Galicia',
      naranja: 'Naranja',
      otros_bancos: 'Otros Bancos',
    })
  })
})
