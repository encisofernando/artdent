import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2, MapPin, Truck, CreditCard, Landmark, QrCode, Banknote,
  Check, Package, Home, Bike,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../store/cart'
import { useAuth } from '../store/auth'
import { productPath } from '../utils/slug'
import { getShippingOptions, type PickupPoint, type MotoCompany } from '../api/shipping'
import { getPaymentOptions, type PaymentOption } from '../api/paymentOptions'
import { getAddresses } from '../api/customer'
import { checkout } from '../api/orders'
import { createMpPreference, getMpCheckoutUrl } from '../api/payment'
import CouponInput from '../components/CouponInput'

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

type ShippingMethod = 'home_delivery' | 'pickup_point' | 'moto'

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  mercadopago: <CreditCard size={17} />,
  bank_transfer: <Landmark size={17} />,
  qr: <QrCode size={17} />,
  cash: <Banknote size={17} />,
}

// ── Radio bullet ─────────────────────────────────────────────────────────────
function RadioDot({ checked }: { checked: boolean }) {
  return (
    <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
      ${checked ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-gray-300'}`}>
      {checked && <div className="h-2 w-2 rounded-full bg-white" />}
    </div>
  )
}

// ── Shipping option row ───────────────────────────────────────────────────────
function ShippingOptionRow({ icon, title, description, price, available, selected, onSelect }: {
  icon: React.ReactNode; title: string; description: string; price?: string
  available: boolean; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={() => available && onSelect()}
      disabled={!available}
      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
        !available
          ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50'
          : selected
            ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]'
            : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
          ${selected ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800">{title}</p>
          {description && <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>}
        </div>
        {price && <p className="text-sm font-semibold text-gray-600 shrink-0">{price}</p>}
        <RadioDot checked={selected} />
      </div>
    </button>
  )
}

// ── Main Cart / Checkout ──────────────────────────────────────────────────────
export default function Cart() {
  const cart = useCart()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  // Customer
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  // Shipping
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null)
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null)
  const [selectedMotoCompany, setSelectedMotoCompany] = useState<MotoCompany | null>(null)

  // Payment
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption | null>(null)

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Submit
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  const [mpLoading, setMpLoading] = useState(false)

  // Prefill from user
  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email ?? '')
      if (user.phone) setPhone(user.phone)
    }
  }, [user])

  // Saved addresses
  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: isAuthenticated,
  })

  // Auto-select default address
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === null) {
      const def = savedAddresses.find(a => a.is_default) ?? savedAddresses[0]
      setSelectedAddressId(def.id)
      setAddress(def.address)
      setCity(def.city)
      setProvince(def.province)
      setPostalCode(def.postal_code ?? '')
    }
  }, [savedAddresses])

  // Shipping options
  const { data: shippingOptions, isLoading: loadingShipping } = useQuery({
    queryKey: ['shipping_options', city, province],
    queryFn: () => getShippingOptions({ city, province }),
    staleTime: 60_000,
  })

  // Payment options
  const { data: paymentOptions = [], isLoading: loadingPayment } = useQuery({
    queryKey: ['payment_options'],
    queryFn: getPaymentOptions,
    staleTime: 5 * 60_000,
  })

  const shippingCost = useMemo(() => {
    if (selectedMethod === 'moto' && selectedMotoCompany) return selectedMotoCompany.price
    return 0
  }, [selectedMethod, selectedMotoCompany])

  const totals = useMemo(() => {
    const subtotal = cart.subtotal
    const discount = appliedCoupon?.discount ?? 0
    const total = Math.max(0, subtotal - discount + shippingCost)
    return { subtotal, discount, total }
  }, [cart.subtotal, appliedCoupon, shippingCost])

  const canConfirm = useMemo(() => {
    if (!name.trim() || !email.includes('@')) return false
    if (!selectedMethod) return false
    if (selectedMethod === 'home_delivery' && address.trim().length < 4) return false
    if (selectedMethod === 'pickup_point' && !selectedPickupPoint) return false
    if (selectedMethod === 'moto' && (!selectedMotoCompany || address.trim().length < 4)) return false
    if (!selectedPayment) return false
    return true
  }, [name, email, selectedMethod, address, selectedPickupPoint, selectedMotoCompany, selectedPayment])

  function pickAddress(addr: typeof savedAddresses[0]) {
    setSelectedAddressId(addr.id)
    setAddress(addr.address)
    setCity(addr.city)
    setProvince(addr.province)
    setPostalCode(addr.postal_code ?? '')
  }

  function pickShipping(method: ShippingMethod) {
    setSelectedMethod(method)
    setSelectedPickupPoint(null)
    setSelectedMotoCompany(null)
  }

  async function onConfirm() {
    if (loading || !canConfirm) return
    setLoading(true)
    setError(null)
    try {
      const res = await checkout({
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
        ...(selectedPayment ? { selected_payment_method: selectedPayment.type } : {}),
        items: cart.items.map(it => ({
          product_id: it.product.id,
          qty: it.qty,
          ...(it.variant_id ? { variant_id: it.variant_id } : {}),
        })),
      } as any)
      cart.clear()
      setOrderCode(res.code)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo generar el pedido.')
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

  // ── Post-checkout ─────────────────────────────────────────────────────────
  if (orderCode) {
    const pm = selectedPayment
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="card p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={28} className="text-green-600" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">¡Pedido creado!</h2>
            <p className="mt-1 text-sm text-gray-500">
              Pedido <span className="font-mono font-semibold">#{orderCode}</span>
            </p>
          </div>

          {(!pm || pm.type === 'mercadopago') && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">¿Querés pagar ahora con MercadoPago?</p>
              <button onClick={payWithMp} disabled={mpLoading} className="btn btn-primary w-full py-3 gap-2">
                <CreditCard size={18} />
                {mpLoading ? 'Redirigiendo…' : 'Pagar con MercadoPago'}
              </button>
              <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-outline w-full py-3">
                Pagar después / Ver pedido
              </button>
            </div>
          )}

          {pm?.type === 'bank_transfer' && (
            <div className="space-y-4">
              {pm.instructions && <p className="text-sm text-gray-600">{pm.instructions}</p>}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 space-y-2 text-sm">
                {pm.account_name && <div className="flex justify-between"><span className="text-gray-500">Titular</span><span className="font-semibold">{pm.account_name}</span></div>}
                {pm.cbu && <div className="flex justify-between gap-4"><span className="text-gray-500">CBU/CVU</span><span className="font-mono font-semibold break-all">{pm.cbu}</span></div>}
                {pm.alias && <div className="flex justify-between"><span className="text-gray-500">Alias</span><span className="font-semibold">{pm.alias}</span></div>}
              </div>
              <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-primary w-full py-3">Ver mi pedido</button>
            </div>
          )}

          {pm?.type === 'qr' && (
            <div className="space-y-4 text-center">
              {pm.instructions && <p className="text-sm text-gray-600">{pm.instructions}</p>}
              {pm.image_url && <div className="flex justify-center"><img src={pm.image_url} alt="QR" className="h-48 w-48 rounded-2xl border object-contain p-2 bg-white shadow" /></div>}
              {pm.payment_url && <a href={pm.payment_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full py-3 gap-2 inline-flex justify-center items-center"><QrCode size={18} /> Ir al link de pago</a>}
              <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-outline w-full py-3">Ver mi pedido</button>
            </div>
          )}

          {pm?.type === 'cash' && (
            <div className="space-y-4">
              {pm.instructions && <p className="text-sm text-gray-600">{pm.instructions}</p>}
              {pm.pickup_points && pm.pickup_points.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Puntos de pago en efectivo</p>
                  {pm.pickup_points.map(pp => (
                    <div key={pp.id} className="text-sm">
                      <p className="font-semibold">{pp.name}</p>
                      <p className="text-xs text-gray-500">{pp.address}, {pp.city}</p>
                      {pp.schedule && <p className="text-xs text-gray-400">{pp.schedule}</p>}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => navigate(`/pedido/${encodeURIComponent(orderCode)}`)} className="btn btn-primary w-full py-3">Ver mi pedido</button>
            </div>
          )}

          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
        </div>
      </div>
    )
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Carrito</h1>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8 opacity-80">
            <ellipse cx="90" cy="148" rx="70" ry="8" fill="#e5e7eb" />
            <rect x="38" y="58" width="104" height="68" rx="12" fill="#dbeafe" />
            <rect x="44" y="64" width="92" height="56" rx="9" fill="#eff6ff" />
            <line x1="64" y1="64" x2="64" y2="120" stroke="#bfdbfe" strokeWidth="1.5" />
            <line x1="90" y1="64" x2="90" y2="120" stroke="#bfdbfe" strokeWidth="1.5" />
            <line x1="116" y1="64" x2="116" y2="120" stroke="#bfdbfe" strokeWidth="1.5" />
            <line x1="44" y1="85" x2="136" y2="85" stroke="#bfdbfe" strokeWidth="1.5" />
            <line x1="44" y1="102" x2="136" y2="102" stroke="#bfdbfe" strokeWidth="1.5" />
            <path d="M62 58 Q62 36 90 36 Q118 36 118 58" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="62" cy="134" r="8" fill="#93c5fd" />
            <circle cx="62" cy="134" r="4" fill="#dbeafe" />
            <circle cx="118" cy="134" r="8" fill="#93c5fd" />
            <circle cx="118" cy="134" r="4" fill="#dbeafe" />
            <text x="90" y="98" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#93c5fd" fontFamily="system-ui">?</text>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">El carrito está vacío.</h2>
          <p className="text-sm text-gray-500 max-w-xs mb-8">
            Todavía no tenés productos en el carrito. ¡Explorá nuestro catálogo y encontrá lo que necesitás!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="btn btn-outline px-6">Volver al inicio</Link>
            <Link to="/productos" className="btn btn-primary px-6">Ver catálogo</Link>
          </div>
        </div>
      </div>
    )
  }

  const inp = 'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--brand-primary)]'

  // ── Cart with items ───────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Carrito</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Items */}
          <div className="card p-5">
            <div className="divide-y">
              {cart.items.map((it) => {
                const unit = Number(it.variant_price ?? it.product.price_final ?? it.product.price ?? 0)
                const line = unit * it.qty
                const sku = it.variant_sku ?? it.product.sku
                const cartKey = `${it.product.id}-${it.variant_id ?? 0}`
                const img = it.product.primary_image_url
                return (
                  <div key={cartKey} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    {img ? (
                      <img src={img} alt={it.product.name} className="w-16 h-16 rounded-xl object-cover border shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={productPath(it.product.id, it.product.name)} className="text-sm font-semibold hover:underline leading-tight line-clamp-2 text-gray-800">
                        {it.product.name}
                      </Link>
                      {it.variant_label && (
                        <p className="mt-0.5 text-xs text-[var(--brand-primary)] font-medium">{it.variant_label}</p>
                      )}
                      {sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {sku}</p>}
                      <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Stock disponible
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatMoney(line)}</p>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={it.qty}
                          onChange={(e) => cart.setQty(it.product.id, Number(e.target.value || 1), it.variant_id)}
                          className="w-14 rounded-lg border px-2 py-1 text-sm text-center outline-none focus:border-[var(--brand-primary)]"
                        />
                        <button
                          onClick={() => cart.remove(it.product.id, it.variant_id)}
                          className="text-gray-300 hover:text-red-500 transition p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">{formatMoney(unit)} c/u</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end pt-3 border-t mt-2">
              <button onClick={() => cart.clear()} className="text-xs text-gray-400 hover:text-red-500 transition">
                Vaciar carrito
              </button>
            </div>
          </div>

          {/* Domicilio de entrega */}
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <MapPin size={16} className="text-[var(--brand-primary)]" /> Domicilio de entrega
            </h2>

            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                {savedAddresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => pickAddress(addr)}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all text-sm ${
                      selectedAddressId === addr.id
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{addr.recipient}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{addr.address}</p>
                        <p className="text-xs text-gray-500">{addr.city}, {addr.province}{addr.postal_code ? ` (${addr.postal_code})` : ''}</p>
                      </div>
                      <RadioDot checked={selectedAddressId === addr.id} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            <div className="grid gap-3 sm:grid-cols-2">
              {!isAuthenticated && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre y apellido *</label>
                    <input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Email *</label>
                    <input type="email" className={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@mail.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Teléfono</label>
                    <input className={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 9 370 000-0000" />
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Dirección</label>
                <input className={inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, piso/dpto" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Ciudad</label>
                <input className={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="Formosa" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Provincia</label>
                <input className={inp} value={province} onChange={e => setProvince(e.target.value)} placeholder="Formosa" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Código Postal</label>
                <input className={inp} value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="3600" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Notas / observaciones</label>
                <textarea className={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Horarios, referencias, instrucciones..." />
              </div>
            </div>

            {!isAuthenticated && (
              <p className="text-xs text-gray-500">
                ¿Tenés cuenta?{' '}
                <Link to="/ingresar" className="text-[var(--brand-primary)] font-semibold hover:underline">
                  Iniciá sesión
                </Link>{' '}
                para autocompletar tus datos.
              </p>
            )}
          </div>

          {/* Método de envío */}
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <Truck size={16} className="text-[var(--brand-primary)]" /> Método de envío
            </h2>

            {loadingShipping ? (
              <div className="flex items-center gap-3 py-4 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-r-transparent" />
                Cargando opciones…
              </div>
            ) : (
              <div className="space-y-2">
                <ShippingOptionRow
                  icon={<Home size={18} />}
                  title={shippingOptions?.home_delivery.label ?? 'Envío a domicilio'}
                  description={shippingOptions?.home_delivery.description ?? ''}
                  price="A coordinar"
                  available={shippingOptions?.home_delivery.available ?? true}
                  selected={selectedMethod === 'home_delivery'}
                  onSelect={() => pickShipping('home_delivery')}
                />
                <ShippingOptionRow
                  icon={<Package size={18} />}
                  title={shippingOptions?.pickup_points.label ?? 'Retiro en sucursal'}
                  description={shippingOptions?.pickup_points.available ? shippingOptions.pickup_points.description : 'No disponible en tu zona'}
                  price="Gratis"
                  available={shippingOptions?.pickup_points.available ?? false}
                  selected={selectedMethod === 'pickup_point'}
                  onSelect={() => pickShipping('pickup_point')}
                />
                <ShippingOptionRow
                  icon={<Bike size={18} />}
                  title={shippingOptions?.moto.label ?? 'Moto Mandados'}
                  description={shippingOptions?.moto.available ? shippingOptions.moto.description : 'Solo disponible en Formosa Capital'}
                  price={selectedMotoCompany ? formatMoney(selectedMotoCompany.price) : undefined}
                  available={shippingOptions?.moto.available ?? false}
                  selected={selectedMethod === 'moto'}
                  onSelect={() => pickShipping('moto')}
                />
              </div>
            )}

            {/* Pickup point selector */}
            {selectedMethod === 'pickup_point' && shippingOptions?.pickup_points.points && (
              <div className="space-y-2 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Elegí un punto de retiro</p>
                {shippingOptions.pickup_points.points.map(point => (
                  <button
                    key={point.id}
                    onClick={() => setSelectedPickupPoint(point)}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all text-sm ${
                      selectedPickupPoint?.id === point.id ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin size={14} className="text-[var(--brand-primary)] mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">{point.name}</p>
                        <p className="text-xs text-gray-500">{point.address}, {point.city}</p>
                        {point.schedule && <p className="text-xs text-gray-400 mt-0.5">{point.schedule}</p>}
                      </div>
                      <RadioDot checked={selectedPickupPoint?.id === point.id} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Moto company selector */}
            {selectedMethod === 'moto' && shippingOptions?.moto.companies && (
              <div className="space-y-2 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Elegí la empresa de moto</p>
                {shippingOptions.moto.companies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => setSelectedMotoCompany(company)}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all text-sm ${
                      selectedMotoCompany?.id === company.id ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bike size={14} className="text-[var(--brand-primary)] shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.zone ?? 'Formosa Capital'}</p>
                      </div>
                      <p className="font-bold text-[var(--brand-primary)] text-sm">{formatMoney(company.price)}</p>
                      <RadioDot checked={selectedMotoCompany?.id === company.id} />
                    </div>
                  </button>
                ))}

                {selectedMethod === 'moto' && (
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Dirección de entrega *</label>
                    <input className={inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, piso/dpto" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Método de pago */}
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <CreditCard size={16} className="text-[var(--brand-primary)]" /> Método de pago
            </h2>

            {loadingPayment ? (
              <div className="flex items-center gap-3 py-4 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-r-transparent" />
                Cargando métodos de pago…
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                  {paymentOptions.map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => setSelectedPayment(opt)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedPayment?.type === opt.type
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)] text-[var(--brand-primary)]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className={selectedPayment?.type === opt.type ? 'text-[var(--brand-primary)]' : 'text-gray-400'}>
                        {PAYMENT_ICONS[opt.type] ?? <CreditCard size={17} />}
                      </span>
                      {opt.label}
                      <RadioDot checked={selectedPayment?.type === opt.type} />
                    </button>
                  ))}
                </div>

                {/* Bank transfer details */}
                {selectedPayment?.type === 'bank_transfer' && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-0 text-sm divide-y divide-gray-100">
                    {selectedPayment.account_name && (
                      <div className="flex items-center justify-between py-2.5 first:pt-0">
                        <span className="text-gray-500 font-medium">Titular</span>
                        <span className="font-semibold">{selectedPayment.account_name}</span>
                      </div>
                    )}
                    {selectedPayment.alias && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-gray-500 font-medium">Alias</span>
                        <span className="font-mono font-semibold">{selectedPayment.alias}</span>
                      </div>
                    )}
                    {selectedPayment.cbu && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-gray-500 font-medium">CBU</span>
                        <span className="font-mono font-semibold text-xs break-all text-right max-w-[60%]">{selectedPayment.cbu}</span>
                      </div>
                    )}
                    {selectedPayment.instructions && (
                      <p className="text-xs text-gray-500 pt-3">{selectedPayment.instructions}</p>
                    )}
                  </div>
                )}

                {selectedPayment?.type === 'mercadopago' && selectedPayment.instructions && (
                  <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    {selectedPayment.instructions}
                  </p>
                )}

                {selectedPayment?.type === 'qr' && (
                  <div className="space-y-3">
                    {selectedPayment.instructions && <p className="text-sm text-gray-600">{selectedPayment.instructions}</p>}
                    {selectedPayment.image_url && (
                      <div className="flex justify-center">
                        <img src={selectedPayment.image_url} alt="QR de pago" className="h-40 w-40 rounded-2xl border object-contain p-2 bg-white shadow" />
                      </div>
                    )}
                  </div>
                )}

                {selectedPayment?.type === 'cash' && selectedPayment.pickup_points && selectedPayment.pickup_points.length > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Puntos de pago en efectivo</p>
                    {selectedPayment.pickup_points.map(pp => (
                      <div key={pp.id} className="text-sm">
                        <p className="font-semibold">{pp.name}</p>
                        <p className="text-xs text-gray-500">{pp.address}, {pp.city}</p>
                        {pp.schedule && <p className="text-xs text-gray-400">{pp.schedule}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ── Right column: Resumen ──────────────────────────────────────── */}
        <div>
          <div className="card p-5 space-y-4 lg:sticky lg:top-24">
            <h2 className="font-bold text-gray-900">Resumen</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatMoney(totals.subtotal)}</span>
              </div>

              {appliedCoupon && totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({appliedCoupon.coupon?.code})</span>
                  <span className="font-semibold">-{formatMoney(totals.discount)}</span>
                </div>
              )}

              {shippingCost > 0 ? (
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="font-semibold text-gray-900">{formatMoney(shippingCost)}</span>
                </div>
              ) : selectedMethod === 'home_delivery' ? (
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-amber-600 font-medium text-xs self-center">A coordinar</span>
                </div>
              ) : null}

              <div className="flex justify-between border-t pt-3 mt-1">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg text-[var(--brand-primary)]">{formatMoney(totals.total)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="border-t pt-4">
              <CouponInput
                cartTotal={cart.subtotal}
                cartItems={cart.items}
                onCouponApplied={setAppliedCoupon}
                onCouponRemoved={() => setAppliedCoupon(null)}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {!canConfirm && cart.items.length > 0 && (
              <p className="text-xs text-gray-400 text-center">
                Completá domicilio, envío y método de pago para confirmar.
              </p>
            )}

            <button
              onClick={onConfirm}
              disabled={!canConfirm || loading}
              className={`btn btn-primary w-full py-3 text-sm ${!canConfirm || loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {loading ? 'Generando pedido…' : 'Confirmar pedido'}
            </button>

            <Link to="/productos" className="btn btn-outline w-full py-2.5 text-sm text-center block">
              Seguir comprando
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
