import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, Bike, Home, ChevronRight, Check, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { checkout } from '../api/orders'
import { getShippingOptions, type PickupPoint, type MotoCompany } from '../api/shipping'
import { useCart } from '../store/cart'
import { useAuth } from '../store/auth'
import { createMpPreference } from '../api/payment'
import CouponInput from '../components/CouponInput'

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

const LS_LAST_EMAIL = 'artdent_last_checkout_email'

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ['Datos', 'Envío', 'Pago']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1
        const done = step > idx
        const active = step === idx
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${done ? 'bg-[var(--brand-primary)] text-white' : active ? 'bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-primary)]/20' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <Check size={14} /> : idx}
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-[var(--brand-primary)]' : done ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? 'bg-[var(--brand-primary)]' : 'bg-gray-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Order summary sidebar ───────────────────────────────────────────────────────
function OrderSummary({
  shippingCost,
  appliedCoupon,
  onCouponApplied,
  onCouponRemoved,
  shippingLabel,
}: {
  shippingCost: number
  appliedCoupon: any
  onCouponApplied: (d: any) => void
  onCouponRemoved: () => void
  shippingLabel?: string
}) {
  const cart = useCart()

  const totals = useMemo(() => {
    const subtotal = cart.subtotal
    const discount = appliedCoupon?.discount ?? 0
    const total = Math.max(0, subtotal - discount + shippingCost)
    return { subtotal, discount, total }
  }, [cart.subtotal, appliedCoupon, shippingCost])

  return (
    <div className="card p-6 h-fit space-y-5">
      <h2 className="text-lg font-bold">Resumen</h2>

      <div className="space-y-3 text-sm">
        {cart.items.map((it) => {
          const unit = Number(it.product.price_final ?? it.product.price ?? 0)
          return (
            <div key={it.product.id} className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold leading-tight line-clamp-2">{it.product.name}</p>
                <p className="text-xs text-gray-500">{formatMoney(unit)} × {it.qty}</p>
              </div>
              <p className="font-semibold whitespace-nowrap">{formatMoney(unit * it.qty)}</p>
            </div>
          )
        })}
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-bold">{formatMoney(totals.subtotal)}</span>
        </div>

        {appliedCoupon && totals.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Cupón ({appliedCoupon.coupon?.code})
            </span>
            <span className="font-bold">-{formatMoney(totals.discount)}</span>
          </div>
        )}

        {shippingCost > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Envío {shippingLabel ? `(${shippingLabel})` : ''}</span>
            <span className="font-bold">{formatMoney(shippingCost)}</span>
          </div>
        )}

        {shippingCost === 0 && shippingLabel && (
          <div className="flex justify-between text-green-600">
            <span>Envío</span>
            <span className="font-bold text-green-600">A coordinar</span>
          </div>
        )}

        <div className="flex justify-between border-t pt-2">
          <span className="text-base font-bold">Total</span>
          <span className="text-xl font-bold text-[var(--brand-primary)]">{formatMoney(totals.total)}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-bold mb-3">Cupón de descuento</h3>
        <CouponInput
          cartTotal={cart.subtotal}
          cartItems={cart.items}
          onCouponApplied={onCouponApplied}
          onCouponRemoved={onCouponRemoved}
        />
      </div>
    </div>
  )
}

// ── Step 1: Customer data ───────────────────────────────────────────────────────
function StepCustomer({
  name, setName,
  email, setEmail,
  phone, setPhone,
  notes, setNotes,
  onNext,
}: {
  name: string; setName: (v: string) => void
  email: string; setEmail: (v: string) => void
  phone: string; setPhone: (v: string) => void
  notes: string; setNotes: (v: string) => void
  onNext: () => void
}) {
  const canContinue = name.trim().length > 1 && email.includes('@')
  const inp = 'w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]'

  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-lg font-bold">Datos del comprador</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-gray-600">Nombre y apellido *</label>
          <input className={`mt-1.5 ${inp}`} value={name} onChange={e => setName(e.target.value)} placeholder="Juan Pérez" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Email *</label>
          <input type="email" className={`mt-1.5 ${inp}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@mail.com" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Teléfono (opcional)</label>
          <input className={`mt-1.5 ${inp}`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 9 370 000-0000" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-600">Notas (opcional)</label>
          <textarea className={`mt-1.5 ${inp}`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Horarios, observaciones..." />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          className={`btn btn-primary px-8 gap-2 ${!canContinue ? 'opacity-40 pointer-events-none' : ''}`}
          onClick={onNext}
        >
          Continuar <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Shipping method ─────────────────────────────────────────────────────
type ShippingMethod = 'home_delivery' | 'pickup_point' | 'moto'

function StepShipping({
  city, setCity,
  province, setProvince,
  address, setAddress,
  postalCode, setPostalCode,
  selectedMethod, setSelectedMethod,
  selectedPickupPoint, setSelectedPickupPoint,
  selectedMotoCompany, setSelectedMotoCompany,
  onBack, onNext,
}: {
  city: string; setCity: (v: string) => void
  province: string; setProvince: (v: string) => void
  address: string; setAddress: (v: string) => void
  postalCode: string; setPostalCode: (v: string) => void
  selectedMethod: ShippingMethod | null; setSelectedMethod: (m: ShippingMethod) => void
  selectedPickupPoint: PickupPoint | null; setSelectedPickupPoint: (p: PickupPoint | null) => void
  selectedMotoCompany: MotoCompany | null; setSelectedMotoCompany: (c: MotoCompany | null) => void
  onBack: () => void; onNext: () => void
}) {
  const { data: options, isLoading } = useQuery({
    queryKey: ['shipping_options', city, province],
    queryFn: () => getShippingOptions({ city, province }),
    staleTime: 60_000,
  })

  const canContinue = (() => {
    if (!selectedMethod) return false
    if (selectedMethod === 'home_delivery') return address.trim().length > 3
    if (selectedMethod === 'pickup_point') return selectedPickupPoint !== null
    if (selectedMethod === 'moto') return selectedMotoCompany !== null && address.trim().length > 3
    return false
  })()

  const inp = 'w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]'

  const MethodCard = ({
    id, icon, title, description, available, badge,
  }: {
    id: ShippingMethod; icon: React.ReactNode; title: string; description: string; available: boolean; badge?: string
  }) => (
    <button
      onClick={() => available && setSelectedMethod(id)}
      disabled={!available}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all
        ${!available ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50' :
          selectedMethod === id ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' :
            'border-gray-200 hover:border-[var(--brand-primary)]/40 bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0
          ${selectedMethod === id ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-gray-800">{title}</p>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{badge}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center
          ${selectedMethod === id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-gray-300'}`}>
          {selectedMethod === id && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  )

  return (
    <div className="space-y-5">
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold">Método de entrega</h2>

        {/* City/province for moto availability */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-gray-600">Ciudad</label>
            <input className={`mt-1.5 ${inp}`} value={city} onChange={e => setCity(e.target.value)} placeholder="Formosa" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Provincia</label>
            <input className={`mt-1.5 ${inp}`} value={province} onChange={e => setProvince(e.target.value)} placeholder="Formosa" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-sm text-gray-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-r-transparent" />
            Cargando opciones de envío…
          </div>
        ) : (
          <div className="space-y-3">
            <MethodCard
              id="home_delivery"
              icon={<Home size={20} />}
              title={options?.home_delivery.label ?? 'Envío a domicilio'}
              description={options?.home_delivery.description ?? 'Recibí tu pedido en tu domicilio'}
              available={options?.home_delivery.available ?? true}
            />
            <MethodCard
              id="pickup_point"
              icon={<Package size={20} />}
              title={options?.pickup_points.label ?? 'Retiro en punto de entrega'}
              description={options?.pickup_points.available ? options.pickup_points.description : 'No hay puntos disponibles'}
              available={options?.pickup_points.available ?? false}
            />
            <MethodCard
              id="moto"
              icon={<Bike size={20} />}
              title={options?.moto.label ?? 'Moto Mandados'}
              description={options?.moto.available ? options.moto.description : 'Solo disponible en Formosa Capital'}
              available={options?.moto.available ?? false}
              badge={options?.moto.available ? 'Solo Formosa Capital' : undefined}
            />
          </div>
        )}
      </div>

      {/* Home delivery form */}
      {selectedMethod === 'home_delivery' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Home size={16} className="text-[var(--brand-primary)]" /> Dirección de entrega
          </h3>
          <div className="grid gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Dirección *</label>
              <input className={`mt-1.5 ${inp}`} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, piso/dpto" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-600">Código Postal</label>
                <input className={`mt-1.5 ${inp}`} value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="3600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              El costo de envío por Andreani se coordinará luego de confirmar el pedido.
            </p>
          </div>
        </div>
      )}

      {/* Pickup point selection */}
      {selectedMethod === 'pickup_point' && options?.pickup_points.points && (
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={16} className="text-[var(--brand-primary)]" /> Elegí un punto de retiro
          </h3>
          <div className="space-y-2">
            {options.pickup_points.points.map(point => (
              <button
                key={point.id}
                onClick={() => setSelectedPickupPoint(point)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all
                  ${selectedPickupPoint?.id === point.id ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[var(--brand-primary)] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{point.name}</p>
                    <p className="text-xs text-gray-500">{point.address}, {point.city}</p>
                    {point.schedule && <p className="text-xs text-gray-400 mt-0.5">{point.schedule}</p>}
                    {point.phone && <p className="text-xs text-gray-400">{point.phone}</p>}
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center
                    ${selectedPickupPoint?.id === point.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-gray-300'}`}>
                    {selectedPickupPoint?.id === point.id && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Map embed when selected */}
                {selectedPickupPoint?.id === point.id && point.latitude && point.longitude && (
                  <div className="mt-3 rounded-lg overflow-hidden border">
                    <iframe
                      title={point.name}
                      width="100%"
                      height="160"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${point.longitude - 0.003},${point.latitude - 0.003},${point.longitude + 0.003},${point.latitude + 0.003}&layer=mapnik&marker=${point.latitude},${point.longitude}`}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Moto mandados */}
      {selectedMethod === 'moto' && options?.moto.companies && (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Bike size={16} className="text-[var(--brand-primary)]" /> Elegí la empresa de moto
          </h3>
          <div className="space-y-2">
            {options.moto.companies.map(company => (
              <button
                key={company.id}
                onClick={() => setSelectedMotoCompany(company)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all
                  ${selectedMotoCompany?.id === company.id ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <Bike size={16} className="text-[var(--brand-primary)] shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{company.name}</p>
                    <p className="text-xs text-gray-500">{company.zone ?? 'Formosa Capital'}</p>
                    {company.phone && <p className="text-xs text-gray-400">{company.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--brand-primary)]">{formatMoney(company.price)}</p>
                    <p className="text-[10px] text-gray-400">costo de envío</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center
                    ${selectedMotoCompany?.id === company.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-gray-300'}`}>
                    {selectedMotoCompany?.id === company.id && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Dirección de entrega *</label>
            <input className={`mt-1.5 ${inp}`} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, piso/dpto" />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button className="btn btn-outline gap-2" onClick={onBack}>
          Volver
        </button>
        <button
          className={`btn btn-primary px-8 gap-2 ${!canContinue ? 'opacity-40 pointer-events-none' : ''}`}
          onClick={onNext}
        >
          Continuar <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Main Checkout ───────────────────────────────────────────────────────────────
export default function Checkout() {
  const cart = useCart()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState(1)

  // Step 1 fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState(() => localStorage.getItem(LS_LAST_EMAIL) || '')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  // Step 2 fields
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null)
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null)
  const [selectedMotoCompany, setSelectedMotoCompany] = useState<MotoCompany | null>(null)

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  const [mpLoading, setMpLoading] = useState(false)

  // Prefill from user
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name)
      if (user.email) setEmail(user.email)
      if (user.phone) setPhone(user.phone)
    }
  }, [user])

  const shippingCost = useMemo(() => {
    if (selectedMethod === 'moto' && selectedMotoCompany) return selectedMotoCompany.price
    return 0
  }, [selectedMethod, selectedMotoCompany])

  const shippingLabel = useMemo(() => {
    if (selectedMethod === 'home_delivery') return 'Domicilio'
    if (selectedMethod === 'pickup_point' && selectedPickupPoint) return selectedPickupPoint.name
    if (selectedMethod === 'moto' && selectedMotoCompany) return selectedMotoCompany.name
    return undefined
  }, [selectedMethod, selectedPickupPoint, selectedMotoCompany])

  async function onSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const payload = {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || undefined,
        shipping_address: address.trim() || undefined,
        shipping_city: city.trim() || undefined,
        shipping_province: province.trim() || undefined,
        shipping_postal: postalCode.trim() || undefined,
        shipping_method_type: selectedMethod ?? undefined,
        pickup_point_id: selectedPickupPoint?.id,
        moto_company_id: selectedMotoCompany?.id,
        shipping_cost: shippingCost || undefined,
        notes: notes.trim() || undefined,
        coupon_code: appliedCoupon?.coupon?.code || undefined,
        items: cart.items.map((it) => ({
          product_id: it.product.id,
          qty: it.qty,
          ...(it.variant_id ? { variant_id: it.variant_id } : {}),
        })),
      }

      const res = await checkout(payload)
      localStorage.setItem(LS_LAST_EMAIL, email.trim())
      cart.clear()
      setOrderCode(res.code)
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo generar el pedido.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function payWithMp() {
    if (!orderCode) return
    setMpLoading(true)
    try {
      const pref = await createMpPreference(orderCode)
      window.location.href = pref.init_point
    } catch {
      setError('No se pudo iniciar el pago con MercadoPago.')
      setMpLoading(false)
    }
  }

  // Post-checkout payment screen
  if (orderCode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="card p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">¡Pedido creado!</h2>
            <p className="mt-1 text-sm text-gray-500">Pedido <span className="font-mono font-semibold">#{orderCode}</span></p>
          </div>
          <p className="text-sm text-gray-600">¿Querés pagar ahora con MercadoPago o lo hacés después?</p>
          <div className="space-y-3">
            <button onClick={payWithMp} disabled={mpLoading} className="btn btn-primary w-full py-3 gap-2">
              <CreditCard size={18} />
              {mpLoading ? 'Redirigiendo a MercadoPago…' : 'Pagar ahora con MercadoPago'}
            </button>
            <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-outline w-full py-3">
              Pagar después / Ver pedido
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    )
  }

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="card p-8 text-center">
          <p className="text-gray-700">No hay productos en el carrito.</p>
          <Link to="/productos" className="mt-4 inline-block btn btn-primary">Ir al catálogo</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-3xl font-bold">Confirmar compra</h1>
        <Link to="/carrito" className="btn btn-outline text-sm">← Carrito</Link>
      </div>

      <StepBar step={step} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 order-last lg:order-first">
          {step === 1 && (
            <StepCustomer
              name={name} setName={setName}
              email={email} setEmail={setEmail}
              phone={phone} setPhone={setPhone}
              notes={notes} setNotes={setNotes}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepShipping
              city={city} setCity={setCity}
              province={province} setProvince={setProvince}
              address={address} setAddress={setAddress}
              postalCode={postalCode} setPostalCode={setPostalCode}
              selectedMethod={selectedMethod} setSelectedMethod={(m) => {
                setSelectedMethod(m)
                setSelectedPickupPoint(null)
                setSelectedMotoCompany(null)
              }}
              selectedPickupPoint={selectedPickupPoint} setSelectedPickupPoint={setSelectedPickupPoint}
              selectedMotoCompany={selectedMotoCompany} setSelectedMotoCompany={setSelectedMotoCompany}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-bold">Confirmar pedido</h2>

              {/* Summary of chosen options */}
              <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row sm:gap-2 text-gray-700">
                  <span className="font-semibold sm:w-24 sm:shrink-0 text-gray-500">Comprador:</span>
                  <span className="min-w-0 break-words">{name} — {email}</span>
                </div>
                {phone && (
                  <div className="flex flex-col sm:flex-row sm:gap-2 text-gray-700">
                    <span className="font-semibold sm:w-24 sm:shrink-0 text-gray-500">Teléfono:</span>
                    <span className="min-w-0 break-words">{phone}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:gap-2 text-gray-700">
                  <span className="font-semibold sm:w-24 sm:shrink-0 text-gray-500">Envío:</span>
                  <span className="min-w-0 break-words">
                    {selectedMethod === 'home_delivery' && `Domicilio: ${address}${city ? `, ${city}` : ''}`}
                    {selectedMethod === 'pickup_point' && `Retiro en ${selectedPickupPoint?.name} — ${selectedPickupPoint?.address}`}
                    {selectedMethod === 'moto' && `Moto Mandados (${selectedMotoCompany?.name}) — ${address}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex flex-col sm:flex-row sm:gap-2 text-gray-700">
                    <span className="font-semibold sm:w-24 sm:shrink-0 text-gray-500">Costo envío:</span>
                    <span className="text-[var(--brand-primary)] font-semibold">{formatMoney(shippingCost)}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button className="btn btn-outline gap-2" onClick={() => setStep(2)}>Volver</button>
                <button
                  className={`btn btn-primary px-8 gap-2 ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                  onClick={onSubmit}
                >
                  {loading ? 'Generando pedido…' : 'Confirmar pedido →'}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Al confirmar se genera el pedido y podrás elegir pagar con MercadoPago o después.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="order-first lg:order-last">
          <OrderSummary
            shippingCost={shippingCost}
            shippingLabel={shippingLabel}
            appliedCoupon={appliedCoupon}
            onCouponApplied={setAppliedCoupon}
            onCouponRemoved={() => setAppliedCoupon(null)}
          />
        </div>
      </div>
    </div>
  )
}
