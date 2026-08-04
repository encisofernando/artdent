import { useState } from 'react'
import { Gift, X, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getLoyaltyBalance, type LoyaltyReward } from '../api/loyalty'
import { useAuth } from '../store/auth'

interface LoyaltyRedemptionProps {
  onRedemptionApplied: (rewardId: number, discountAmount: number) => void
  onRedemptionRemoved: () => void
}

export default function LoyaltyRedemption({
  onRedemptionApplied,
  onRedemptionRemoved,
}: LoyaltyRedemptionProps) {
  const { user } = useAuth()
  const [applied, setApplied] = useState<LoyaltyReward | null>(null)

  const { data } = useQuery({
    queryKey: ['loyalty_balance'],
    queryFn: getLoyaltyBalance,
    enabled: Boolean(user),
    staleTime: 30_000,
  })

  if (!user || !data?.enabled || data.balance <= 0 || data.rewards.length === 0) {
    return null
  }

  const handleApply = (reward: LoyaltyReward) => {
    if (reward.points_cost > data.balance) return
    setApplied(reward)
    onRedemptionApplied(reward.id, reward.discount_amount)
  }

  const handleRemove = () => {
    setApplied(null)
    onRedemptionRemoved()
  }

  return (
    <div className="space-y-3">
      {applied === null ? (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">Disponible: {data.balance.toLocaleString('es-AR')} pts</p>
          <div className="space-y-1.5">
            {data.rewards.map((reward) => {
              const affordable = reward.points_cost <= data.balance
              return (
                <button
                  key={reward.id}
                  type="button"
                  disabled={!affordable}
                  onClick={() => handleApply(reward)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors
                    ${affordable ? 'border-gray-200 hover:border-amber-400 hover:bg-amber-50' : 'border-gray-100 opacity-50 cursor-not-allowed'}`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Gift size={16} className="shrink-0 text-amber-600" />
                    <span className="truncate font-medium">{reward.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-gray-500">{reward.points_cost} pts</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border-2 border-amber-500 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Check className="text-amber-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-amber-900">{applied.name}</p>
              <p className="text-xs text-amber-700">
                Descuento: ${applied.discount_amount.toLocaleString('es-AR')} · {applied.points_cost} pts
              </p>
            </div>
          </div>
          <button onClick={handleRemove} className="rounded-full p-1 hover:bg-amber-100" title="Quitar recompensa">
            <X size={18} className="text-amber-700" />
          </button>
        </div>
      )}
    </div>
  )
}
