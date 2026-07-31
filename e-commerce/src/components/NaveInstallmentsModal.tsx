import { useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import { getNaveInstallmentRates } from '../api/nave'
import { computeInstallment, groupRates, cardLabel, BANK_LABELS } from '../lib/naveInstallments'

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cuotas Nave" size="2xl">
      {isLoading ? (
        <p className="text-sm text-gray-500 py-6 text-center">Cargando cuotas...</p>
      ) : rates.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No hay planes de cuotas disponibles.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([bank, cards]) => (
            <div key={bank}>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-purple-700 mb-2">
                {BANK_LABELS[bank] ?? bank}
              </h3>
              <div className="space-y-4">
                {Object.entries(cards).map(([cardKey, cardRates]) => (
                  <div key={cardKey}>
                    <p className="text-sm font-bold text-gray-800 mb-1.5">{cardLabel(cardRates[0])}</p>
                    <div className="space-y-1">
                      {cardRates.map((r, i) => {
                        const { cuota, ptf } = computeInstallment(amount, r.rate_pct, r.installments)
                        return (
                          <p key={i} className="text-sm text-gray-600">
                            {r.installments} cuota{r.installments > 1 ? 's' : ''} de{' '}
                            <strong className="text-gray-900">
                              ${cuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </strong>{' '}
                            <span className="text-xs text-gray-500">
                              (PTF: ${ptf.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                            </span>
                            {r.tier_label && <span className="text-xs text-purple-600 ml-1">· {r.tier_label}</span>}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
