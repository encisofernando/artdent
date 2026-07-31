import type { NaveInstallmentRate } from '../api/nave'

/**
 * Cálculo de cuotas Nave — PTF = monto × (1 + tasa/100), cuota = PTF / n.
 * Mismo cálculo que resources/js/lib/naveInstallments.js en artdent-crm
 * (repos separados, se duplica el archivo chico).
 */
export function computeInstallment(amount: number, ratePct: number, installments: number) {
  const ptf = amount * (1 + ratePct / 100)
  const cuota = ptf / installments
  return { ptf, cuota }
}

export const BANK_LABELS: Record<string, string> = {
  galicia: 'Galicia',
  naranja: 'Naranja',
  otros_bancos: 'Otros Bancos',
}

export const CARD_BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  naranja: 'Naranja',
}

export const CARD_TYPE_LABELS: Record<string, string> = {
  credit: 'Crédito',
  debit: 'Débito',
}

export function cardLabel(rate: NaveInstallmentRate): string {
  return `Tarjeta ${CARD_BRAND_LABELS[rate.card_brand] ?? rate.card_brand} ${CARD_TYPE_LABELS[rate.card_type] ?? rate.card_type}`
}

export type GroupedRates = Record<string, Record<string, NaveInstallmentRate[]>>

export function groupRates(rates: NaveInstallmentRate[]): GroupedRates {
  const groups: GroupedRates = {}
  for (const rate of rates) {
    const cardKey = `${rate.card_brand}__${rate.card_type}`
    groups[rate.bank] ??= {}
    groups[rate.bank][cardKey] ??= []
    groups[rate.bank][cardKey].push(rate)
  }
  return groups
}
