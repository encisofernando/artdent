import { useState } from 'react'
import { Tag, X, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { validateCoupon } from '../api/coupons'

interface CouponInputProps {
  cartTotal: number
  cartItems?: any[]
  email?: string
  onCouponApplied: (couponData: any) => void
  onCouponRemoved: () => void
}

export default function CouponInput({
  cartTotal,
  cartItems = [],
  email,
  onCouponApplied,
  onCouponRemoved,
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const validateMutation = useMutation({
    mutationFn: (couponCode: string) =>
      validateCoupon({
        code: couponCode,
        cart_total: cartTotal,
        cart_items: cartItems,
        email: email || undefined,
      }),
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedCoupon(data)
        onCouponApplied(data)
        setError(null)
        setCode('')
      } else {
        setError(data?.message ?? 'Error desconocido')   // ← o null si tu state es string | null
      }
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Error al validar el cupón')
    },
  })

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    
    setError(null)
    validateMutation.mutate(code.trim().toUpperCase())
  }

  const handleRemove = () => {
    setAppliedCoupon(null)
    setCode('')
    setError(null)
    onCouponRemoved()
  }

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <form onSubmit={handleApply} className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Código de cupón"
              className="w-full rounded-xl border px-10 py-2 text-sm uppercase outline-none focus:ring-2"
              maxLength={50}
            />
          </div>
          <button
            type="submit"
            disabled={!code.trim() || validateMutation.isPending}
            className="btn btn-outline whitespace-nowrap"
          >
            {validateMutation.isPending ? 'Validando...' : 'Aplicar'}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between rounded-xl border-2 border-green-500 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-green-900">
                {appliedCoupon.coupon?.code}
              </p>
              <p className="text-xs text-green-700">
                Descuento: ${Number(appliedCoupon.discount || 0).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="rounded-full p-1 hover:bg-green-100"
            title="Quitar cupón"
          >
            <X size={18} className="text-green-700" />
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
