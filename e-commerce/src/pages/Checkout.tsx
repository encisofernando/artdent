import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkout } from '../api/orders'
import { useCart } from '../store/cart'
import CouponInput from '../components/CouponInput'

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

const LS_LAST_EMAIL = 'artdent_last_checkout_email'

export default function Checkout() {
  const cart = useCart()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(() => localStorage.getItem(LS_LAST_EMAIL) || '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ CUPÓN STATE
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  const canSubmit = useMemo(() => {
    return cart.items.length > 0 && name.trim().length > 1 && email.includes('@')
  }, [cart.items.length, name, email])

  // Calcular totales con cupón
  const totals = useMemo(() => {
    const subtotal = cart.subtotal
    let discount = 0

    if (appliedCoupon) {
      discount = appliedCoupon.discount || 0
    }

    const total = Math.max(0, subtotal - discount)

    return {
      subtotal,
      discount,
      total,
    }
  }, [cart.subtotal, appliedCoupon])

  async function onSubmit() {
    if (!canSubmit || loading) return
    setLoading(true)
    setError(null)
    try {
      const payload = {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || undefined,
        shipping_address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        coupon_code: appliedCoupon?.code || undefined, // ✅ Enviar cupón al backend
        items: cart.items.map((it) => ({
          product_id: it.product.id,
          qty: it.qty,
        })),
      }

      const res = await checkout(payload)
      localStorage.setItem(LS_LAST_EMAIL, email.trim())
      cart.clear()
      navigate(`/pedido/${encodeURIComponent(res.code)}`)
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo generar el pedido.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="card p-8 text-center">
          <p className="text-gray-700">No hay productos en el carrito.</p>
          <Link to="/productos" className="mt-4 inline-block btn btn-primary">
            Ir al catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Link to="/carrito" className="btn btn-outline">Volver al carrito</Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del comprador */}
          <div className="card p-6">
            <h2 className="text-lg font-bold">Datos del comprador</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-600">Nombre y apellido</label>
                <input
                  className="mt-2 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@mail.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Teléfono (opcional)</label>
                <input
                  className="mt-2 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Dirección de envío (opcional)</label>
                <textarea
                  className="mt-2 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, ciudad, provincia"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Notas (opcional)</label>
                <textarea
                  className="mt-2 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Horarios, observaciones, etc."
                />
              </div>
            </div>
          </div>

          {/* ✅ CUPÓN DE DESCUENTO - INTEGRADO */}
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Cupón de descuento</h2>
            <CouponInput
              cartTotal={cart.subtotal}
              cartItems={cart.items}
              onCouponApplied={(data) => setAppliedCoupon(data)}
              onCouponRemoved={() => setAppliedCoupon(null)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* Botón de confirmación */}
          <button
            className={`btn btn-primary w-full ${(!canSubmit || loading) ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={onSubmit}
          >
            {loading ? 'Generando pedido...' : 'Confirmar pedido'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al confirmar se crea una orden en el backend (órden + ítems) y se descuenta stock (si aplica).
          </p>
        </div>

        {/* Resumen */}
        <div className="card p-6 h-fit space-y-6">
          <h2 className="text-lg font-bold">Resumen</h2>
          
          {/* Items */}
          <div className="space-y-3 text-sm">
            {cart.items.map((it) => {
              const unit = Number(it.product.price_final ?? it.product.price ?? 0)
              const line = unit * it.qty
              return (
                <div key={it.product.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold leading-tight">{it.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatMoney(unit)} × {it.qty}
                    </p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">{formatMoney(line)}</p>
                </div>
              )
            })}
          </div>

          {/* Totales */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal (sin IVA)</span>
              <span className="font-bold">{formatMoney(totals.subtotal)}</span>
            </div>

            {/* Descuento del cupón */}
            {appliedCoupon && totals.discount > 0 && (
              <div className="flex items-center justify-between text-green-600">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Descuento ({appliedCoupon.code})
                </span>
                <span className="font-bold">-{formatMoney(totals.discount)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-[var(--brand-primary)]">
                {formatMoney(totals.total)}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            El total final se calcula en el backend con IVA por producto.
          </p>
        </div>
      </div>
    </div>
  )
}
