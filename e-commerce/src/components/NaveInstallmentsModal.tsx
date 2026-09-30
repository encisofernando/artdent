import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import Modal from './Modal'
import { getNaveInstallmentRates } from '../api/nave'
import {
  computeInstallment,
  groupRates,
  sortRates,
  formatArs,
  BANK_LABELS,
  CARD_BRAND_LABELS,
  CARD_TYPE_LABELS,
} from '../lib/naveInstallments'

interface NaveInstallmentsModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
}

export default function NaveInstallmentsModal({ isOpen, onClose, amount }: NaveInstallmentsModalProps) {
  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['nave_installment_rates'],
    queryFn: getNaveInstallmentRates,
    staleTime: 5 * 60_000,
    enabled: isOpen,
  })

  const grouped = groupRates(rates)
  const banks = Object.keys(grouped)
  const [activeBank, setActiveBank] = useState<string | null>(null)
  const bank = activeBank && grouped[activeBank] ? activeBank : banks[0]
  const maxInstallments = rates.reduce((max, r) => Math.max(max, r.installments), 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cuotas con Nave" size="2xl">
      {isLoading ? (
        <p className="text-sm text-gray-500 py-6 text-center">Cargando cuotas...</p>
      ) : rates.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No hay planes de cuotas disponibles.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-4 py-3">
            <div>
              <p className="text-xs font-medium text-[var(--brand-muted)]">Precio de contado</p>
              <p className="text-lg font-bold text-[var(--brand-primary)] tabular-nums">{formatArs(amount)}</p>
            </div>
            {maxInstallments > 1 && (
              <p className="text-sm font-semibold text-[var(--brand-primary)]">
                Hasta {maxInstallments} cuotas
              </p>
            )}
          </div>

          {banks.length > 1 && (
            <div role="tablist" aria-label="Banco" className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
              {banks.map((b) => (
                <button
                  key={b}
                  type="button"
                  role="tab"
                  aria-selected={b === bank}
                  onClick={() => setActiveBank(b)}
                  className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    b === bank
                      ? 'bg-white text-[var(--brand-primary)] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {BANK_LABELS[b] ?? b}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4" role="tabpanel">
            {Object.entries(grouped[bank] ?? {}).map(([cardKey, cardRates]) => {
              const first = cardRates[0]
              return (
                <section key={cardKey} className="overflow-hidden rounded-xl border border-gray-200">
                  <header className="flex items-center gap-2.5 border-b border-gray-200 bg-gray-50 px-3 sm:px-4 py-3">
                    <CreditCard size={18} className="shrink-0 text-[var(--brand-primary)]" aria-hidden />
                    <h3 className="text-sm font-bold text-gray-900">
                      {CARD_BRAND_LABELS[first.card_brand] ?? first.card_brand}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                      {CARD_TYPE_LABELS[first.card_type] ?? first.card_type}
                    </span>
                  </header>
                  <table className="w-full table-fixed text-[13px] sm:text-sm">
                    <colgroup>
                      <col className="w-[34%] sm:w-[44%]" />
                      <col className="w-[33%] sm:w-[28%]" />
                      <col className="w-[33%] sm:w-[28%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th scope="col" className="px-3 sm:px-4 pt-3 pb-2 font-semibold">Cuotas</th>
                        <th scope="col" className="px-2 pt-3 pb-2 text-right font-semibold">Cuota</th>
                        <th scope="col" className="px-3 sm:px-4 pt-3 pb-2 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortRates(cardRates).map((r, i) => {
                        const { cuota, ptf } = computeInstallment(amount, r.rate_pct, r.installments)
                        const interestFree = r.rate_pct === 0 && r.installments > 1
                        return (
                          <tr key={i} className={r.tier_label ? 'bg-[var(--brand-soft)]' : undefined}>
                            <td className="px-3 sm:px-4 py-2.5 align-middle">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-gray-900 tabular-nums">
                                  {r.installments} {r.installments > 1 ? 'cuotas' : 'pago'}
                                </span>
                                {interestFree && (
                                  <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                    Sin interés
                                  </span>
                                )}
                                {r.tier_label && (
                                  <span className="whitespace-nowrap rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white">
                                    {r.tier_label}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2.5 text-right align-middle font-bold text-gray-900 tabular-nums whitespace-nowrap">
                              {formatArs(cuota)}
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 text-right align-middle text-gray-600 tabular-nums whitespace-nowrap">
                              {formatArs(ptf)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </section>
              )
            })}
          </div>

          <p className="text-xs leading-relaxed text-gray-500">
            Total = precio total financiado (PTF). Valores de referencia calculados sobre el precio actual; el
            monto final lo confirma Nave al momento del pago.
          </p>
        </div>
      )}
    </Modal>
  )
}
