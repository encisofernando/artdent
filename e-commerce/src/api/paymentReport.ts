import { http } from './http'

export type PaymentReport = {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  image_url: string | null
  submitted_at: string | null
}

export async function submitPaymentReport(
  orderCode: string,
  image: File,
  notes?: string,
): Promise<PaymentReport> {
  const fd = new FormData()
  fd.append('image', image)
  if (notes?.trim()) fd.append('notes', notes.trim())
  const { data } = await http.post(`/customer/orders/${orderCode}/payment-report`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
