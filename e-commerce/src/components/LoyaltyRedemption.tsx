import { useState } from 'react'
import { Gift, X, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getLoyaltyBalance } from '../api/loyalty'
import { useAuth } from '../store/auth'

interface LoyaltyRedemptionProps {
  cartTotal: number
  onRedemptionApplied: (amount: number) => void
  onRedemptionRemoved: () => void
}

export default function LoyaltyRedemption({
  cartTotal,
  onRedemptionApplied,
  onRedemptionRemoved,
}: LoyaltyRedemptionProps) {
  const { user } = useAuth()
  const [applied, setApplied] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['loyalty_balance'],
    queryFn: getLoyaltyBalance,
    enabled: Boolean(user),
    staleTime: 30_000,
  })

  if (!user || !data?.enabled || data.balance <= 0) {
    return null
  }

  const maxByPercentage = data.max_redemption_percentage
    ? (cartTotal * data.max_redemption_percentage) / 100
    : cartTotal
  const maxRedeemable = Math.min(data.balance, cartTotal, maxByPercentage)

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) {
      setError('Ingresá un monto válido.')
      return
    }
    if (value > maxRedeemable + 0.009) {
      setError(`Podés aplicar hasta $${maxRedeemable.toLocaleString('es-AR')}.`)
      return
    }
    setError(null)
    setApplied(value)
    onRedemptionApplied(value)
  }

  const handleRemove = () => {
    setApplied(null)
    setAmount('')
    setError(null)
    onRedemptionRemoved()
  }

  return (
    <div className="space-y-3">
      {applied === null ? (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">Disponible: ${data.balance.toLocaleString('es-AR')}</p>
          <form onSubmit={handleApply} className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="number"
                min={0.01}
                max={maxRedeemable}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Monto a usar"
                className="w-full rounded-xl border px-10 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <button type="submit" disabled={!amount} className="btn btn-outline whitespace-nowrap shrink-0">
              Aplicar
            </button>
          </form>
          <button
            type="button"
            onClick={() => setAmount(String(maxRedeemable))}
            className="text-xs font-semibold text-amber-600 hover:underline"
          >
            Usar el máximo (${maxRedeemable.toLocaleString('es-AR')})
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border-2 border-amber-500 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Check className="text-amber-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-amber-900">Puntos aplicados</p>
              <p className="text-xs text-amber-700">
                Descuento: ${applied.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <button onClick={handleRemove} className="rounded-full p-1 hover:bg-amber-100" title="Quitar puntos">
            <X size={18} className="text-amber-700" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
