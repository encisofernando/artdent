import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, Bike, Home, ChevronRight, Check, Package, Landmark, QrCode, Banknote } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { checkout, trackCart } from '../api/orders'
import { getShippingOptions, type PickupPoint, type MotoCompany } from '../api/shipping'
import { useDebounce } from '../hooks/useDebounce'
import { getPaymentOptions, type PaymentOption } from '../api/paymentOptions'
import { getAddresses, type CustomerAddress } from '../api/customer'
import { useCart } from '../store/cart'
import { useAuth } from '../store/auth'
import { useConfig } from '../contexts/ConfigContext'
import { createMpPreference, getMpCheckoutUrl } from '../api/payment'
import { createNavePayment } from '../api/nave'
import { analytics } from '../api/analytics'
import CouponInput from '../components/CouponInput'
import LoyaltyRedemption from '../components/LoyaltyRedemption'
import { formatMoney } from '../lib/format'
import { getApiErrorMessage } from '../lib/apiError'

const LS_LAST_EMAIL = 'artdent_last_checkout_email'
const SS_CHECKOUT = 'artdent_checkout_draft'

type CheckoutDraft = {
  step: number
  name: string
  email: string
  phone: string
  dni: string
  notes: string
  city: string
  province: string
  address: string
  postalCode: string
}

function loadDraft(): Partial<CheckoutDraft> {
  try {
    const raw = sessionStorage.getItem(SS_CHECKOUT)
    return raw ? (JSON.parse(raw) as Partial<CheckoutDraft>) : {}
  } catch { return {} }
}

function saveDraft(draft: CheckoutDraft): void {
  try { sessionStorage.setItem(SS_CHECKOUT, JSON.stringify(draft)) } catch { /* noop */ }
}

function clearDraft(): void {
  try { sessionStorage.removeItem(SS_CHECKOUT) } catch { /* noop */ }
}

// El teléfono del CRM llega como un solo string sin separador (ej.
// "3704211436"), sin forma confiable de saber dónde termina el código de
// área (varía 2-4 dígitos según provincia). Si no viene con espacio, todo
// va al campo "número" y se deja "área" en blanco para que el cliente lo
// complete — nunca se adivina un corte que puede quedar mal.
function splitPhone(raw: string): [area: string, number: string] {
  if (!raw) return ['', '']
  const [area, ...rest] = raw.split(' ')
  return rest.length ? [area, rest.join(' ')] : ['', area]
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ['Datos', 'Envío', 'Pago', 'Confirmar']
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
                ${done ? 'bg-[var(--brand-primary)] text-white' : active ? 'bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-primary)]/20' : 'bg-gray-100 text-gray-500'}`}>
                {done ? <Check size={14} /> : idx}
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-[var(--brand-primary)]' : done ? 'text-[var(--brand-primary)]' : 'text-gray-500'}`}>{label}</span>
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
  appliedLoyaltyRedemption,
  onLoyaltyRedemptionApplied,
  onLoyaltyRedemptionRemoved,
  shippingLabel,
  freeShipping,
}: {
  shippingCost: number
  appliedCoupon: any
  onCouponApplied: (d: any) => void
  onCouponRemoved: () => void
  appliedLoyaltyRedemption: number
  onLoyaltyRedemptionApplied: (rewardId: number, discountAmount: number) => void
  onLoyaltyRedemptionRemoved: () => void
  shippingLabel?: string
  freeShipping?: boolean
}) {
  const cart = useCart()

  const totals = useMemo(() => {
    const subtotal = cart.subtotal
    const discount = appliedCoupon?.discount ?? 0
    const total = Math.max(0, subtotal - discount - appliedLoyaltyRedemption + shippingCost)
    return { subtotal, discount, total }
  }, [cart.subtotal, appliedCoupon, appliedLoyaltyRedemption, shippingCost])

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

        {appliedLoyaltyRedemption > 0 && (
          <div className="flex justify-between text-amber-600">
            <span className="flex items-center gap-1">Puntos aplicados</span>
            <span className="font-bold">-{formatMoney(appliedLoyaltyRedemption)}</span>
          </div>
        )}

        {shippingCost > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Envío {shippingLabel ? `(${shippingLabel})` : ''}</span>
            <span className="font-bold">{formatMoney(shippingCost)}</span>
          </div>
        )}

        {shippingCost === 0 && freeShipping && (
          <div className="flex justify-between text-green-600">
            <span>Envío {shippingLabel ? `(${shippingLabel})` : ''}</span>
            <span className="font-bold">¡Gratis!</span>
          </div>
        )}

        {shippingCost === 0 && shippingLabel && !freeShipping && (
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

      <div className="border-t pt-4">
        <h3 className="text-sm font-bold mb-3">Tus puntos</h3>
        <LoyaltyRedemption
          onRedemptionApplied={onLoyaltyRedemptionApplied}
          onRedemptionRemoved={onLoyaltyRedemptionRemoved}
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
  dni, setDni,
  notes, setNotes,
  onNext,
}: {
  name: string; setName: (v: string) => void
  email: string; setEmail: (v: string) => void
  phone: string; setPhone: (v: string) => void
  dni: string; setDni: (v: string) => void
  notes: string; setNotes: (v: string) => void
  onNext: () => void
}) {
  const [phoneArea, setPhoneArea] = useState(() => splitPhone(phone)[0])
  const [phoneNumber, setPhoneNumber] = useState(() => splitPhone(phone)[1])

  // El prefill del usuario logueado (CRM) llega de forma asíncrona, después de
  // que este componente ya montó con `phone` vacío — sin este efecto, el valor
  // nunca se refleja en los inputs de área/número aunque `phone` cambie arriba.
  useEffect(() => {
    if (phone && !phoneArea && !phoneNumber) {
      const [area, number] = splitPhone(phone)
      setPhoneArea(area)
      setPhoneNumber(number)
    }
  }, [phone]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPhone(`${phoneArea} ${phoneNumber}`.trim())
  }, [phoneArea, phoneNumber, setPhone])

  const canContinue = 
    name.trim().length > 1 && 
    email.includes('@') && 
    phoneArea.length >= 2 && 
    phoneNumber.length >= 6 &&
    dni.trim().length >= 7

  const inp = 'w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]'

  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-lg font-bold">Datos del comprador</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="checkout-name" className="text-xs font-semibold text-gray-600">Nombre y apellido *</label>
          <input id="checkout-name" className={`mt-1.5 ${inp}`} value={name} onChange={e => setName(e.target.value)} placeholder="Juan Pérez" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="checkout-email" className="text-xs font-semibold text-gray-600">Email *</label>
          <input id="checkout-email" type="email" className={`mt-1.5 ${inp}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@mail.com" />
        </div>

        <div>
          <label htmlFor="checkout-dni" className="text-xs font-semibold text-gray-600">DNI o CUIT *</label>
          <input id="checkout-dni" className={`mt-1.5 ${inp}`} value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, ''))} placeholder="20-12345678-9" />
          <p className="text-[10px] text-gray-500 mt-1">Requerido por Mercado Pago para asegurar la transacción.</p>
        </div>

        <div>
          <label htmlFor="checkout-phone-number" className="text-xs font-semibold text-gray-600">Teléfono *</label>
          <div className="flex gap-2 mt-1.5">
            <input
              aria-label="Código de área"
              className={`${inp} !w-24`}
              value={phoneArea}
              onChange={e => setPhoneArea(e.target.value.replace(/\D/g, ''))}
              placeholder="Cód (11)"
              maxLength={4}
            />
            <input
              id="checkout-phone-number"
              className={inp}
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Número (12345678)"
              maxLength={10}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkout-notes" className="text-xs font-semibold text-gray-600">Notas (opcional)</label>
          <textarea id="checkout-notes" className={`mt-1.5 ${inp}`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Horarios, observaciones..." />
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

// Componente de módulo (no definido dentro de StepShipping) para que su
// identidad no cambie en cada render — si se redefine en cada render de un
// padre que re-renderiza en cada tecleo (como este formulario), React lo
// trata como un componente distinto y lo remonta de cero cada vez.
function MethodCard({
  icon, title, description, available, badge, selected, onSelect,
}: {
  icon: React.ReactNode; title: string; description: string; available: boolean; badge?: string
  selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={() => available && onSelect()}
      disabled={!available}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all
        ${!available ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50' :
          selected ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' :
            'border-gray-200 hover:border-[var(--brand-primary)]/40 bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0
          ${selected ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100 text-gray-500'}`}>
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
          ${selected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-gray-300'}`}>
          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  )
}

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
  const { isAuthenticated, user } = useAuth()
  const cart = useCart()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const debouncedPostalCode = useDebounce(postalCode, 500)

  const { data: savedAddresses = [], isSuccess: addressesLoaded } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: isAuthenticated,
  })

  // Autoselecciona la dirección default la primera vez que llegan.
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === null && !address) {
      const def = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0]
      pickAddress(def)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses])

  // Si el cliente no tiene ninguna dirección guardada (nunca usó "Mis
  // direcciones"), cae en los datos de domicilio que ya tiene cargados en el
  // CRM (Customer.address/city/province/postal_code) en vez de dejar todo
  // vacío. Espera a que la query de direcciones guardadas termine para no
  // pisar una dirección real que esté por llegar.
  useEffect(() => {
    if (addressesLoaded && savedAddresses.length === 0 && !address && user?.address) {
      setAddress(user.address)
      setCity(user.city ?? '')
      setProvince(user.province ?? '')
      setPostalCode(user.postal_code ?? '')
      if (!selectedMethod) setSelectedMethod('home_delivery')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesLoaded, savedAddresses, user])

  function pickAddress(addr: CustomerAddress) {
    setSelectedAddressId(addr.id)
    setAddress(addr.address)
    setCity(addr.city)
    setProvince(addr.province)
    setPostalCode(addr.postal_code ?? '')
    if (!selectedMethod) setSelectedMethod('home_delivery')
  }

  const quoteItems = useMemo(
    () => cart.items.map((it) => ({ product_id: it.product.id, qty: it.qty })),
    [cart.items]
  )

  const { data: options, isLoading } = useQuery({
    queryKey: ['shipping_options', city, province, debouncedPostalCode, quoteItems],
    queryFn: () => getShippingOptions({ city, province, postal_code: debouncedPostalCode || undefined, items: quoteItems }),
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

  return (
    <div className="space-y-5">
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold">Método de entrega</h2>

        {savedAddresses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tus direcciones guardadas</p>
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => pickAddress(addr)}
                className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all text-sm
                  ${selectedAddressId === addr.id ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{addr.recipient}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{addr.address}</p>
                    <p className="text-xs text-gray-500">{addr.city}, {addr.province}{addr.postal_code ? ` (${addr.postal_code})` : ''}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center
                    ${selectedAddressId === addr.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-gray-300'}`}>
                    {selectedAddressId === addr.id && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* City/province for moto availability */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-city" className="text-xs font-semibold text-gray-600">Ciudad</label>
            <input id="checkout-city" className={`mt-1.5 ${inp}`} value={city} onChange={e => setCity(e.target.value)} placeholder="Formosa" />
          </div>
          <div>
            <label htmlFor="checkout-province" className="text-xs font-semibold text-gray-600">Provincia</label>
            <input id="checkout-province" className={`mt-1.5 ${inp}`} value={province} onChange={e => setProvince(e.target.value)} placeholder="Formosa" />
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
              selected={selectedMethod === 'home_delivery'}
              onSelect={() => setSelectedMethod('home_delivery')}
              icon={<Home size={20} />}
              title={options?.home_delivery.label ?? 'Envío a domicilio'}
              description={options?.home_delivery.description ?? 'Recibí tu pedido en tu domicilio'}
              available={options?.home_delivery.available ?? true}
            />
            <MethodCard
              selected={selectedMethod === 'pickup_point'}
              onSelect={() => setSelectedMethod('pickup_point')}
              icon={<Package size={20} />}
              title={options?.pickup_points.label ?? 'Retiro en punto de entrega'}
              description={options?.pickup_points.available ? options.pickup_points.description : 'No hay puntos disponibles'}
              available={options?.pickup_points.available ?? false}
            />
            <MethodCard
              selected={selectedMethod === 'moto'}
              onSelect={() => setSelectedMethod('moto')}
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
              <label htmlFor="checkout-address" className="text-xs font-semibold text-gray-600">Dirección *</label>
              <input id="checkout-address" className={`mt-1.5 ${inp}`} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, piso/dpto" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="checkout-postal" className="text-xs font-semibold text-gray-600">Código Postal</label>
                <input id="checkout-postal" className={`mt-1.5 ${inp}`} value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="3600" />
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
                    {point.schedule && <p className="text-xs text-gray-500 mt-0.5">{point.schedule}</p>}
                    {point.phone && <p className="text-xs text-gray-500">{point.phone}</p>}
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
                    {company.phone && <p className="text-xs text-gray-500">{company.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--brand-primary)]">{formatMoney(company.price)}</p>
                    <p className="text-[10px] text-gray-500">costo de envío</p>
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
            <label htmlFor="checkout-address" className="text-xs font-semibold text-gray-600">Dirección de entrega *</label>
            <input id="checkout-address" className={`mt-1.5 ${inp}`} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, piso/dpto" />
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

// Nave SVG icon (Galicia colors)
function NaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#E8001D" />
      <path d="M5 17V7l4.5 7V7M14.5 7h4.5M14.5 12h4M14.5 17h4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  mercadopago: <CreditCard size={20} />,
  bank_transfer: <Landmark size={20} />,
  qr: <QrCode size={20} />,
  cash: <Banknote size={20} />,
  nave: <NaveIcon />,
}

// ── Step 3: Payment method ──────────────────────────────────────────────────────
function StepPayment({
  selectedPayment, setSelectedPayment,
  selectedMethod, selectedPickupPoint,
  onBack, onNext,
}: {
  selectedPayment: PaymentOption | null
  setSelectedPayment: (p: PaymentOption) => void
  selectedMethod: ShippingMethod | null
  selectedPickupPoint: PickupPoint | null
  onBack: () => void
  onNext: () => void
}) {
  const { data: rawOptions = [], isLoading } = useQuery({
    queryKey: ['payment_options'],
    queryFn: getPaymentOptions,
    staleTime: 5 * 60_000,
  })

  // Ocultar efectivo si la sucursal elegida no lo acepta
  const options = rawOptions.filter(opt => {
    if (opt.type !== 'cash') return true
    if (selectedMethod === 'pickup_point') {
      return selectedPickupPoint?.accepts_cash_payment === true
    }
    return true
  })

  return (
    <div className="space-y-4">
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold">Método de pago</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-sm text-gray-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-r-transparent" />
            Cargando métodos de pago…
          </div>
        ) : options.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No hay métodos de pago disponibles.</p>
        ) : (
          <div className="space-y-3">
            {options.map(opt => (
              <button
                key={opt.type}
                onClick={() => setSelectedPayment(opt)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all
                  ${selectedPayment?.type === opt.type
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]'
                    : 'border-gray-200 hover:border-[var(--brand-primary)]/40 bg-white'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0
                    ${selectedPayment?.type === opt.type ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {PAYMENT_ICONS[opt.type] ?? <CreditCard size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                    {opt.instructions && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{opt.instructions}</p>
                    )}
                    {opt.type === 'cash' && opt.pickup_points && opt.pickup_points.length > 0 && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        Disponible en {opt.pickup_points.length} punto{opt.pickup_points.length !== 1 ? 's' : ''} de retiro
                      </p>
                    )}
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center
                    ${selectedPayment?.type === opt.type ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-gray-300'}`}>
                    {selectedPayment?.type === opt.type && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button className="btn btn-outline gap-2" onClick={onBack}>Volver</button>
        <button
          className={`btn btn-primary px-8 gap-2 ${!selectedPayment ? 'opacity-40 pointer-events-none' : ''}`}
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
  const config = useConfig()

  const [step, setStep] = useState(() => loadDraft().step ?? 1)

  // Step 1 fields — se restauran desde sessionStorage si existen
  const [name, setName] = useState(() => loadDraft().name ?? '')
  const [email, setEmail] = useState(() => loadDraft().email ?? localStorage.getItem(LS_LAST_EMAIL) ?? '')
  const [phone, setPhone] = useState(() => loadDraft().phone ?? '')
  const [dni, setDni] = useState(() => loadDraft().dni ?? '')
  const [notes, setNotes] = useState(() => loadDraft().notes ?? '')

  // Step 2 fields
  const [city, setCity] = useState(() => loadDraft().city ?? '')
  const [province, setProvince] = useState(() => loadDraft().province ?? '')
  const [address, setAddress] = useState(() => loadDraft().address ?? '')
  const [postalCode, setPostalCode] = useState(() => loadDraft().postalCode ?? '')
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null)
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null)
  const [selectedMotoCompany, setSelectedMotoCompany] = useState<MotoCompany | null>(null)

  const [selectedPayment, setSelectedPayment] = useState<PaymentOption | null>(null)

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [appliedLoyaltyRedemption, setAppliedLoyaltyRedemption] = useState<number>(0)
  const [appliedLoyaltyRewardId, setAppliedLoyaltyRewardId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  const [mpLoading, setMpLoading] = useState(false)
  const [naveLoading, setNaveLoading] = useState(false)

  // Prefill from user (solo si el campo está vacío para no pisar el draft)
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name)
      if (user.email && !email) setEmail(user.email)
      if (user.phone && !phone) setPhone(user.phone)
      if (user.dni && !dni) setDni(user.dni)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persistencia automática del borrador en sessionStorage
  useEffect(() => {
    saveDraft({ step, name, email, phone, dni, notes, city, province, address, postalCode })
  }, [step, name, email, phone, dni, notes, city, province, address, postalCode])

  const debouncedPostalCodeForQuote = useDebounce(postalCode, 500)
  const quoteItemsForCost = useMemo(
    () => cart.items.map((it) => ({ product_id: it.product.id, qty: it.qty })),
    [cart.items]
  )
  // Mismo queryKey que usa StepShipping — React Query reutiliza el resultado
  // ya en caché en vez de duplicar el pedido a la API.
  const { data: shippingOptionsForCost } = useQuery({
    queryKey: ['shipping_options', city, province, debouncedPostalCodeForQuote, quoteItemsForCost],
    queryFn: () => getShippingOptions({ city, province, postal_code: debouncedPostalCodeForQuote || undefined, items: quoteItemsForCost }),
    staleTime: 60_000,
    enabled: selectedMethod === 'home_delivery',
  })

  const rawShippingCost = useMemo(() => {
    if (selectedMethod === 'moto' && selectedMotoCompany) return selectedMotoCompany.price
    if (selectedMethod === 'home_delivery') return shippingOptionsForCost?.home_delivery.cost ?? 0
    return 0
  }, [selectedMethod, selectedMotoCompany, shippingOptionsForCost])

  // Envío gratis a partir de un monto (Sistema → Administración → Envío
  // Gratis en el CRM). Se calcula sobre el total ya con cupón y puntos
  // aplicados — el backend vuelve a decidir esto de forma autoritativa en
  // checkout(), acá solo es para mostrarlo antes de confirmar.
  const qualifiesForFreeShipping = useMemo(() => {
    if (!config.shipping.free_shipping_enabled || config.shipping.free_shipping_minimum_amount == null) return false
    if (rawShippingCost <= 0) return false
    const preShippingTotal = cart.subtotal - (appliedCoupon?.discount ?? 0) - appliedLoyaltyRedemption
    return preShippingTotal >= config.shipping.free_shipping_minimum_amount
  }, [config.shipping, rawShippingCost, cart.subtotal, appliedCoupon, appliedLoyaltyRedemption])

  const shippingCost = qualifiesForFreeShipping ? 0 : rawShippingCost

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
      const cleanDoc = dni.trim().replace(/\D/g, '')
      const isCuit = cleanDoc.length === 11

      const payload = {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || undefined,
        customer_dni: !isCuit && cleanDoc ? cleanDoc : undefined,
        customer_cuit: isCuit ? cleanDoc : undefined,
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
        loyalty_reward_id: appliedLoyaltyRewardId || undefined,
        selected_payment_method: selectedPayment?.type ?? undefined,
        items: cart.items.map((it) => ({
          product_id: it.product.id,
          qty: it.qty,
          ...(it.variant_id ? { variant_id: it.variant_id } : {}),
        })),
      }

      const res = await checkout(payload)
      localStorage.setItem(LS_LAST_EMAIL, email.trim())

      // purchase event — fired once order is created in the backend
      const cartTotal = Math.max(0, cart.subtotal - (appliedCoupon?.discount ?? 0) - appliedLoyaltyRedemption + shippingCost)
      analytics.purchase({
        id: res.code,
        value: cartTotal,
        shipping: shippingCost,
        items: cart.items.map((it) => ({
          product_id: it.product.id,
          name: it.product.name,
          unit_price: Number(it.variant_price ?? it.product.price_final ?? it.product.price ?? 0),
          qty: it.qty,
        })),
      })

      cart.clear()
      clearDraft()
      setOrderCode(res.code)
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudo generar el pedido.'))
    } finally {
      setLoading(false)
    }
  }

  async function payWithMp() {
    if (!orderCode) return
    setMpLoading(true)
    try {
      const pref = await createMpPreference(orderCode)
      window.location.href = getMpCheckoutUrl(pref)
    } catch {
      setError('No se pudo iniciar el pago con MercadoPago.')
      setMpLoading(false)
    }
  }

  async function payWithNave() {
    if (!orderCode) return
    setNaveLoading(true)
    try {
      const intent = await createNavePayment(orderCode)
      window.location.href = intent.checkout_url
    } catch {
      setError('No se pudo iniciar el pago con Nave.')
      setNaveLoading(false)
    }
  }

  // Post-checkout payment screen
  if (orderCode) {
    const pm = selectedPayment
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="card p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">¡Pedido creado!</h2>
            <p className="mt-1 text-sm text-gray-500">Pedido <span className="font-mono font-semibold">#{orderCode}</span></p>
          </div>

          {/* MercadoPago */}
          {(!pm || pm.type === 'mercadopago') && (
            <>
              <p className="text-sm text-gray-600 text-center">¿Querés pagar ahora con MercadoPago o lo hacés después?</p>
              <div className="space-y-3">
                <button onClick={payWithMp} disabled={mpLoading} className="btn btn-primary w-full py-3 gap-2">
                  <CreditCard size={18} />
                  {mpLoading ? 'Redirigiendo a MercadoPago…' : 'Pagar ahora con MercadoPago'}
                </button>
                <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-outline w-full py-3">
                  Pagar después / Ver pedido
                </button>
              </div>
            </>
          )}

          {/* Transferencia */}
          {pm?.type === 'bank_transfer' && (
            <div className="space-y-4">
              {pm.instructions && <p className="text-sm text-gray-600">{pm.instructions}</p>}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 space-y-2 text-sm">
                {pm.account_name && <div className="flex justify-between"><span className="text-gray-500">Titular</span><span className="font-semibold">{pm.account_name}</span></div>}
                {pm.cbu && <div className="flex justify-between gap-4"><span className="text-gray-500">CBU/CVU</span><span className="font-mono font-semibold break-all">{pm.cbu}</span></div>}
                {pm.alias && <div className="flex justify-between"><span className="text-gray-500">Alias</span><span className="font-semibold">{pm.alias}</span></div>}
              </div>
              <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-primary w-full py-3">
                Ver mi pedido
              </button>
            </div>
          )}

          {/* QR */}
          {pm?.type === 'qr' && (
            <div className="space-y-4 text-center">
              {pm.instructions && <p className="text-sm text-gray-600">{pm.instructions}</p>}
              {pm.image_url && (
                <div className="flex justify-center">
                  <img src={pm.image_url} alt="QR de pago" className="h-48 w-48 rounded-2xl border object-contain p-2 bg-white shadow" />
                </div>
              )}
              {pm.payment_url && (
                <a href={pm.payment_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full py-3 gap-2 inline-flex justify-center items-center">
                  <QrCode size={18} /> Ir al link de pago
                </a>
              )}
              <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-outline w-full py-3">
                Ver mi pedido
              </button>
            </div>
          )}

          {/* Efectivo */}
          {pm?.type === 'cash' && (
            <div className="space-y-4">
              {pm.instructions && <p className="text-sm text-gray-600">{pm.instructions}</p>}
              {pm.pickup_points && pm.pickup_points.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Puntos donde pagar en efectivo</p>
                  {pm.pickup_points.map(pp => (
                    <div key={pp.id} className="text-sm">
                      <p className="font-semibold text-gray-800">{pp.name}</p>
                      <p className="text-xs text-gray-500">{pp.address}, {pp.city}</p>
                      {pp.schedule && <p className="text-xs text-gray-500">{pp.schedule}</p>}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-primary w-full py-3">
                Ver mi pedido
              </button>
            </div>
          )}

          {/* Nave */}
          {pm?.type === 'nave' && (
            <div className="space-y-4">
              {pm.instructions && <p className="text-sm text-gray-600">{pm.instructions}</p>}
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <NaveIcon />
                  <p className="font-semibold text-gray-800">Nave (Galicia / Naranja X)</p>
                </div>
                <p className="text-xs text-gray-500">
                  Vas a ser redirigido al checkout de Nave donde podés pagar con QR o tarjeta.
                  En desktop se muestra un QR; en mobile te redirige a MODO o tu app bancaria.
                </p>
                {pm.sandbox_mode && (
                  <p className="text-[10px] text-amber-600 font-semibold">Modo sandbox activo (entorno de pruebas)</p>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={payWithNave}
                  disabled={naveLoading}
                  className="btn btn-primary w-full py-3 gap-2 flex items-center justify-center"
                >
                  <NaveIcon />
                  {naveLoading ? 'Redirigiendo a Nave…' : 'Pagar ahora con Nave'}
                </button>
                <button
                  onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)}
                  className="btn btn-outline w-full py-3"
                >
                  Pagar después / Ver pedido
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
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
              dni={dni} setDni={setDni}
              phone={phone} setPhone={setPhone}
              notes={notes} setNotes={setNotes}
              onNext={() => {
                setStep(2)
                // Registrar intención de compra — job diferido 1h enviará email si no completa
                trackCart(
                  email.trim(),
                  cart.items.map((it) => ({
                    product_id: it.product.id,
                    name: it.product.name,
                    qty: it.qty,
                    price: Number(it.variant_price ?? it.product.price_final ?? it.product.price ?? 0),
                  })),
                )
              }}
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
                setSelectedPayment(null)
              }}
              selectedPickupPoint={selectedPickupPoint} setSelectedPickupPoint={(p) => {
                setSelectedPickupPoint(p)
                setSelectedPayment(null)
              }}
              selectedMotoCompany={selectedMotoCompany} setSelectedMotoCompany={setSelectedMotoCompany}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepPayment
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              selectedMethod={selectedMethod}
              selectedPickupPoint={selectedPickupPoint}
              onBack={() => setStep(2)}
              onNext={() => {
                analytics.beginCheckout(
                  cart.items.map((it) => ({
                    product_id: it.product.id,
                    name: it.product.name,
                    unit_price: Number(it.variant_price ?? it.product.price_final ?? it.product.price ?? 0),
                    qty: it.qty,
                  })),
                  Math.max(0, cart.subtotal - (appliedCoupon?.discount ?? 0) - appliedLoyaltyRedemption + shippingCost),
                )
                setStep(4)
              }}
            />
          )}

          {step === 4 && (
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
                {shippingCost === 0 && qualifiesForFreeShipping && (
                  <div className="flex flex-col sm:flex-row sm:gap-2 text-gray-700">
                    <span className="font-semibold sm:w-24 sm:shrink-0 text-gray-500">Costo envío:</span>
                    <span className="text-green-600 font-semibold">¡Gratis!</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              {/* Payment method summary */}
              {selectedPayment && (
                <div className="flex flex-col sm:flex-row sm:gap-2 text-gray-700 text-sm">
                  <span className="font-semibold sm:w-24 sm:shrink-0 text-gray-500">Pago:</span>
                  <span>{selectedPayment.label}</span>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button className="btn btn-outline gap-2" onClick={() => setStep(3)}>Volver</button>
                <button
                  className={`btn btn-primary px-8 gap-2 ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                  onClick={onSubmit}
                >
                  {loading ? 'Generando pedido…' : 'Confirmar pedido →'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Al confirmar se genera el pedido.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="order-first lg:order-last">
          <OrderSummary
            shippingCost={shippingCost}
            shippingLabel={shippingLabel}
            freeShipping={qualifiesForFreeShipping}
            appliedCoupon={appliedCoupon}
            onCouponApplied={setAppliedCoupon}
            onCouponRemoved={() => setAppliedCoupon(null)}
            appliedLoyaltyRedemption={appliedLoyaltyRedemption}
            onLoyaltyRedemptionApplied={(rewardId, discountAmount) => {
              setAppliedLoyaltyRewardId(rewardId)
              setAppliedLoyaltyRedemption(discountAmount)
            }}
            onLoyaltyRedemptionRemoved={() => {
              setAppliedLoyaltyRewardId(null)
              setAppliedLoyaltyRedemption(0)
            }}
          />
        </div>
      </div>
    </div>
  )
}
