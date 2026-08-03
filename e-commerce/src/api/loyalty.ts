import { http } from './http'

export type LoyaltyBalance = {
  enabled: boolean
  balance: number
  accrual_percentage: number
  max_redemption_percentage: number | null
}

export async function getLoyaltyBalance(): Promise<LoyaltyBalance> {
  const { data } = await http.get('/customer/loyalty')
  return data
}
