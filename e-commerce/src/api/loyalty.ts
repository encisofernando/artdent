import { http } from './http'

export type LoyaltyReward = {
  id: number
  name: string
  points_cost: number
  discount_amount: number
}

export type LoyaltyBalance = {
  enabled: boolean
  balance: number
  accrual_percentage: number
  max_redemption_percentage: number | null
  rewards: LoyaltyReward[]
}

export async function getLoyaltyBalance(): Promise<LoyaltyBalance> {
  const { data } = await http.get('/customer/loyalty')
  return data
}
