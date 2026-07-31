import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle, Circle, Truck, XCircle, Clock, RefreshCw, CreditCard, X, ChevronDown, ExternalLink, AlertTriangle } from 'lucide-react'

const TRACKING_STATUS_LABELS: Record<string, string> = {
  preparing: 'En preparación',
  shipped: 'Despachado',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  returned: 'Devuelto',
}
import { getOrder } from '../api/orders'
import { useAuth } from '../store/auth'
import { getCustomerOrder, cancelOrder, changePaymentMethod } from '../api/customer'
import { createMpPreference, getMpCheckoutUrl } from '../api/payment'
import { createNavePayment } from '../api/nave'
import { getPaymentOptions, PaymentOption } from '../api/paymentOptions'
import { formatMoney as fmt } from '../lib/format'
import { getApiErrorMessage } from '../lib/apiError'

const LS_LAST_EMAIL = 'artdent_last_checkout_email'

/* ── Status timeline ─────────────────────────────────────────────────── */
const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const
const STEP_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', processing: 'En preparación',
  shipped: 'Enviado', delivered: 'Entregado',
}

const PAY_LABEL: Record<string, string> = {
  pending: 'Sin pagar', paid: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado',
}
const PAY_COLOR: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50', paid: 'text-green-700 bg-green-50',
  failed: 'text-red-600 bg-red-50', refunded: 'text-gray-600 bg-gray-100',
}

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  mercadopago: '💳', bank_transfer: '🏦', qr: '📱', cash: '💵', nave: '🔲',
}

function StatusTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
        <XCircle size={20} /> <span className="font-semibold">Pedido cancelado</span>
      </div>
    )
  }
  if (status === 'refunded') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-gray-100 border p-4 text-gray-600">
        <RefreshCw size={20} /> <span className="font-semibold">Pedido reembolsado</span>
      </div>
    )
  }

  const currentIdx = ORDER_STEPS.indexOf(status as any)

  return (
    <div className="relative flex items-start justify-between">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-8" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-[var(--brand-primary)] mx-8 transition-all"
        style={{ width: currentIdx >= 0 ? `${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%` : '0%' }}
      />
      {ORDER_STEPS.map((step, i) => {
        const done = currentIdx >= i
        const current = currentIdx === i
        return (
          <div key={step} className="relative flex flex-col items-center gap-2 flex-1">
            <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
              done
                ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                : 'bg-white border-gray-300 text-gray-500'
            } ${current ? 'ring-4 ring-[var(--brand-primary)]/20' : ''}`}>
              {done ? <CheckCircle size={16} /> : <Circle size={16} />}
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight ${done ? 'text-[var(--brand-primary)]' : 'text-gray-500'}`}>
              {STEP_LABEL[step]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Payment method change panel ────────────────────────────────────── */
function PaymentMethodChanger({
  code,
  currentMethod: _currentMethod,
  shippingMethodType,
  onSuccess,
}: {
  code: string
  currentMethod: string | null
  shippingMethodType: string | null
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')

  const { data: allOptions } = useQuery({
    queryKey: ['payment-options'],
    queryFn: getPaymentOptions,
    enabled: open,
  })

  const options = (allOptions ?? []).filter((opt: PaymentOption) => {
    if (opt.type === 'cash' && shippingMethodType !== 'pickup_point') return false
    return true
  })

  const mut = useMutation({
    mutationFn: (method: string) => changePaymentMethod(code, method),
    onSuccess: () => { setOpen(false); setSelected(null); setError(''); onSuccess() },
    onError: (e: any) => setError(getApiErrorMessage(e, 'Error al cambiar el método de pago.')),
  })

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <ChevronDown size={14} /> Cambiar método de pago
      </button>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Elegí un método de pago</p>
        <button onClick={() => { setOpen(false); setSelected(null); setError('') }} className="text-gray-500 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {options.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">Cargando métodos…</p>
      )}

      <div className="space-y-2">
        {options.map((opt: PaymentOption) => (
          <button
            key={opt.type}
            onClick={() => setSelected(opt.type)}
            className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors text-sm ${
              selected === opt.type
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-lg leading-none">{PAYMENT_METHOD_ICONS[opt.type]}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{opt.label}</p>
              {opt.instructions && <p className="text-xs text-gray-500 mt-0.5">{opt.instructions}</p>}
            </div>
            {selected === opt.type && <CheckCircle size={16} className="text-[var(--brand-primary)] flex-shrink-0" />}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        onClick={() => selected && mut.mutate(selected)}
        disabled={!selected || mut.isPending}
        className="btn btn-primary w-full py-2 text-sm disabled:opacity-50"
      >
        {mut.isPending ? 'Guardando…' : 'Confirmar método'}
      </button>
    </div>
  )
}

/* ── CancelModal ─────────────────────────────────────────────────────── */
function CancelModal({ onConfirm, onClose, loading }: { onConfirm: () => void; onClose: () => void; loading: boolean }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2 text-red-600">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100">
              <AlertTriangle size={18} />
            </div>
            <h2 className="text-base font-bold text-gray-900">Cancelar pedido</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            ¿Confirmás que querés <span className="font-semibold text-gray-800">cancelar este pedido</span>? Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            No, volver
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><RefreshCw size={14} className="animate-spin" /> Cancelando…</> : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function OrderDetail() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const code = String(params.code || '')
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const mpResult = searchParams.get('mp')

  const [email, setEmail] = useState(() => localStorage.getItem(LS_LAST_EMAIL) || '')
  const [cancelError, setCancelError] = useState('')
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // No tiene sentido seguir preguntando cada 30s una vez que el pedido llegó
  // a un estado terminal — antes seguía sondeando indefinidamente mientras
  // la pestaña quedara abierta, incluso con el pedido ya entregado.
  const TERMINAL_STATUSES = ['delivered', 'cancelled', 'refunded']
  const pollIfActive = (query: { state: { data?: { status?: string } } }) =>
    query.state.data && TERMINAL_STATUSES.includes(query.state.data.status ?? '') ? false : 30_000

  const authQuery = useQuery({
    queryKey: ['customer_order', code],
    queryFn: () => getCustomerOrder(code),
    enabled: Boolean(code) && isAuthenticated,
    retry: false,
    refetchInterval: pollIfActive,
    staleTime: 0,
  })

  const guestQuery = useQuery({
    queryKey: ['order', code, email],
    queryFn: () => getOrder(code, email ? { email } : {}),
    enabled: Boolean(code) && !isAuthenticated && Boolean(email),
    retry: false,
    refetchInterval: pollIfActive,
    staleTime: 0,
  })

  const query = isAuthenticated ? authQuery : guestQuery
  const order = query.data as any

  const mpMut = useMutation({
    mutationFn: () => createMpPreference(code),
    onSuccess: (pref) => { window.location.href = getMpCheckoutUrl(pref) },
  })

  const naveMut = useMutation({
    mutationFn: () => createNavePayment(code),
    onSuccess: (intent) => { window.location.href = intent.checkout_url },
  })

  const cancelMut = useMutation({
    mutationFn: () => cancelOrder(code),
    onSuccess: () => {
      setCancelSuccess(true)
      setCancelError('')
      queryClient.invalidateQueries({ queryKey: ['customer_order', code] })
    },
    onError: (e: any) => setCancelError(getApiErrorMessage(e, 'No se pudo cancelar el pedido.')),
  })

  const handleCancelConfirm = () => {
    cancelMut.mutate()
    setShowCancelModal(false)
  }

  const canCancel = isAuthenticated && order?.can_cancel
  const canChangePayment = isAuthenticated
    && order?.payment_status === 'pending'
    && !['cancelled', 'refunded'].includes(order?.status ?? '')

  return (
    <>
    {showCancelModal && (
      <CancelModal
        onConfirm={handleCancelConfirm}
        onClose={() => setShowCancelModal(false)}
        loading={cancelMut.isPending}
      />
    )}
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{code}</h1>
          {order?.created_at && (
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('es-AR', { dateStyle: 'long' })}</p>
          )}
        </div>
        <Link to={isAuthenticated ? '/mi-cuenta' : '/productos'} className="btn btn-outline text-sm">
          {isAuthenticated ? '← Mi cuenta' : '← Catálogo'}
        </Link>
      </div>

      {/* MP result banner */}
      {mpResult === 'success' && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 font-semibold">
          <CheckCircle size={20} /> ¡Pago procesado con éxito! Tu pedido fue confirmado.
        </div>
      )}
      {mpResult === 'failure' && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 font-semibold">
          <XCircle size={20} /> El pago no pudo procesarse. Podés intentarlo nuevamente.
        </div>
      )}
      {mpResult === 'pending' && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-700 font-semibold">
          <Clock size={20} /> Pago en revisión. Te avisaremos cuando se confirme.
        </div>
      )}

      {cancelSuccess && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 font-semibold">
          <XCircle size={20} /> Tu pedido fue cancelado.
        </div>
      )}

      {/* Guest email lookup */}
      {!isAuthenticated && (
        <div className="card p-5 mb-5">
          <p className="text-sm text-gray-600 mb-3">Ingresá el email con el que realizaste el pedido para ver los detalles.</p>
          <div className="flex gap-2">
            <input
              type="email"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
            <button className="btn btn-primary" onClick={() => { localStorage.setItem(LS_LAST_EMAIL, email); guestQuery.refetch() }}>
              Consultar
            </button>
          </div>
        </div>
      )}

      {query.isLoading && <p className="text-sm text-gray-500 py-10 text-center">Cargando pedido…</p>}

      {query.isError && (
        <div className="card p-6 text-center">
          <p className="text-sm font-semibold text-red-700">No se pudo cargar el pedido.</p>
          <p className="mt-1 text-sm text-gray-500">
            {getApiErrorMessage(query.error, 'Error de conexión.')}
          </p>
        </div>
      )}

      {order && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status timeline */}
            <div className="card p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-4">Estado del pedido</h2>
              <StatusTimeline status={order.status ?? 'pending'} />
            </div>

            {/* Tracking */}
            {order.tracking && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Truck size={16} /> Seguimiento del envío</h2>
                  {order.tracking.tracking_url && (
                    <a
                      href={order.tracking.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink size={12} /> Rastrear envío
                    </a>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {order.tracking.carrier && <div><p className="text-xs text-gray-500 font-semibold">Carrier</p><p>{order.tracking.carrier}</p></div>}
                  {order.tracking.tracking_code && <div><p className="text-xs text-gray-500 font-semibold">Código de seguimiento</p><p className="font-mono">{order.tracking.tracking_code}</p></div>}
                  {order.tracking.status && <div><p className="text-xs text-gray-500 font-semibold">Estado del envío</p><p>{TRACKING_STATUS_LABELS[order.tracking.status] ?? order.tracking.status}</p></div>}
                  {order.tracking.estimated_delivery && <div><p className="text-xs text-gray-500 font-semibold">Entrega estimada</p><p>{new Date(order.tracking.estimated_delivery).toLocaleDateString('es-AR')}</p></div>}
                  {order.tracking.shipped_at && <div><p className="text-xs text-gray-500 font-semibold">Fecha de envío</p><p>{new Date(order.tracking.shipped_at).toLocaleDateString('es-AR')}</p></div>}
                  {order.tracking.delivered_at && <div><p className="text-xs text-gray-500 font-semibold">Entregado</p><p>{new Date(order.tracking.delivered_at).toLocaleDateString('es-AR')}</p></div>}
                </div>
                {order.tracking.notes && <p className="mt-3 text-xs text-gray-500 border-t pt-2">{order.tracking.notes}</p>}
              </div>
            )}

            {/* Items */}
            <div className="card p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Productos</h2>
              <div className="space-y-3">
                {(order.items ?? []).map((it: any) => (
                  <div key={it.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{it.name}</p>
                      <p className="text-xs text-gray-500">
                        x{it.qty} · {fmt(it.unit_price)} c/u
                        {it.sku && ` · SKU: ${it.sku}`}
                      </p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0">{fmt(it.total ?? it.line_total)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="card p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Pago</span>
                  <span className={`badge ${PAY_COLOR[order.payment_status] ?? 'bg-gray-100'}`}>
                    {PAY_LABEL[order.payment_status] ?? order.payment_status}
                  </span>
                </div>
                {order.selected_payment_method && (
                  <div className="flex justify-between text-gray-600">
                    <span>Método</span>
                    <span className="font-medium text-gray-800">
                      {PAYMENT_METHOD_ICONS[order.selected_payment_method]}{' '}
                      {({ mercadopago: 'MercadoPago', bank_transfer: 'Transferencia', qr: 'QR', cash: 'Efectivo', nave: 'Nave' } as Record<string, string>)[order.selected_payment_method] ?? order.selected_payment_method}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                {(order.discount_amount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-700"><span>Descuento</span><span>-{fmt(order.discount_amount)}</span></div>
                )}
                {(order.shipping_cost ?? 0) > 0 && (
                  <div className="flex justify-between text-gray-600"><span>Envío</span><span>{fmt(order.shipping_cost)}</span></div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t text-base">
                  <span>Total</span><span>{fmt(order.total)}</span>
                </div>
              </div>

              {/* Pay button — only when method is MP and payment is pending */}
              {order.payment_status === 'pending'
                && order.status !== 'cancelled'
                && (order.selected_payment_method === 'mercadopago' || !order.selected_payment_method) && (
                <button
                  onClick={() => mpMut.mutate()}
                  disabled={mpMut.isPending}
                  className="mt-4 btn btn-primary w-full py-2.5 gap-2"
                >
                  <CreditCard size={16} />
                  {mpMut.isPending ? 'Redirigiendo…' : 'Pagar con MercadoPago'}
                </button>
              )}
              {mpMut.isError && (
                <p className="mt-2 text-xs text-red-600">{getApiErrorMessage(mpMut.error, 'Error al iniciar el pago.')}</p>
              )}

              {/* Pay button — Nave */}
              {order.payment_status === 'pending'
                && order.status !== 'cancelled'
                && order.selected_payment_method === 'nave' && (
                <button
                  onClick={() => naveMut.mutate()}
                  disabled={naveMut.isPending}
                  className="mt-4 btn btn-primary w-full py-2.5 gap-2"
                >
                  <CreditCard size={16} />
                  {naveMut.isPending ? 'Redirigiendo…' : 'Pagar con Nave'}
                </button>
              )}
              {naveMut.isError && (
                <p className="mt-2 text-xs text-red-600">{getApiErrorMessage(naveMut.error, 'Error al iniciar el pago.')}</p>
              )}

              {/* Change payment method */}
              {canChangePayment && (
                <PaymentMethodChanger
                  code={code}
                  currentMethod={order.selected_payment_method}
                  shippingMethodType={order.shipping_method_type}
                  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['customer_order', code] })}
                />
              )}

              {/* Cancel button */}
              {canCancel && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelMut.isPending}
                    className="w-full rounded-xl border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar pedido
                  </button>
                  {cancelError && <p className="mt-1 text-xs text-red-600">{cancelError}</p>}
                </div>
              )}
            </div>

            {/* Shipping info */}
            {(order.shipping_name || order.shipping_address) && (
              <div className="card p-5">
                <h2 className="text-sm font-bold text-gray-700 mb-2">Datos de envío</h2>
                <div className="text-sm text-gray-600 space-y-0.5">
                  {order.shipping_name && <p className="font-semibold text-gray-800">{order.shipping_name}</p>}
                  {order.shipping_address && <p>{order.shipping_address}</p>}
                  {(order.shipping_city || order.shipping_province) && (
                    <p>{[order.shipping_city, order.shipping_province, order.shipping_postal].filter(Boolean).join(', ')}</p>
                  )}
                  {order.shipping_phone && <p>{order.shipping_phone}</p>}
                  {(order.customer_notes ?? order.notes) && (
                    <p className="pt-1 text-xs italic text-gray-500">{order.customer_notes ?? order.notes}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
