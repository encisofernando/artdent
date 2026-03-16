import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, MapPin, ShoppingBag, Lock, ChevronRight, Plus, Trash2, Edit2, Check, Package } from 'lucide-react'
import { useAuth } from '../store/auth'
import {
  getProfile, updateProfile, changePassword,
  getOrders, getAddresses, createAddress, updateAddress, deleteAddress,
  type CustomerProfile, type CustomerAddress,
} from '../api/customer'

/* ── helpers ─────────────────────────────────────────────────────────── */
function fmt(n: number) { return `$${Number(n || 0).toLocaleString('es-AR')}` }

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', processing: 'En proceso',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado', refunded: 'Reembolsado',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700', shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}
const PAY_LABEL: Record<string, string> = {
  pending: 'Sin pagar', paid: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado',
}
const PAY_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-600', paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-600', refunded: 'bg-gray-50 text-gray-600',
}
const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20'
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide'

/* ── AddressForm ─────────────────────────────────────────────────────── */
type AddrFormData = Omit<CustomerAddress, 'id'>
const EMPTY_ADDR: AddrFormData = { label: '', recipient: '', address: '', city: '', province: '', postal_code: '', phone: '', is_default: false }

function AddressForm({ initial, onSave, onCancel, saving }: {
  initial?: AddrFormData
  onSave: (d: AddrFormData) => void
  onCancel: () => void
  saving: boolean
}) {
  const [f, setF] = useState<AddrFormData>(initial ?? EMPTY_ADDR)
  const set = (k: keyof AddrFormData, v: string | boolean) => setF((p) => ({ ...p, [k]: v }))

  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave(f) }}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Etiqueta (ej. Casa)</label>
          <input value={f.label ?? ''} onChange={(e) => set('label', e.target.value)} className={inputCls} placeholder="Casa, Consultorio…" />
        </div>
        <div>
          <label className={labelCls}>Destinatario *</label>
          <input value={f.recipient} onChange={(e) => set('recipient', e.target.value)} className={inputCls} required />
        </div>
      </div>
      <div>
        <label className={labelCls}>Dirección *</label>
        <input value={f.address} onChange={(e) => set('address', e.target.value)} className={inputCls} placeholder="Calle 123, Piso 4, Dpto B" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Ciudad *</label>
          <input value={f.city} onChange={(e) => set('city', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Provincia *</label>
          <input value={f.province} onChange={(e) => set('province', e.target.value)} className={inputCls} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Código Postal</label>
          <input value={f.postal_code ?? ''} onChange={(e) => set('postal_code', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Teléfono</label>
          <input value={f.phone ?? ''} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={f.is_default} onChange={(e) => set('is_default', e.target.checked)} className="accent-[var(--brand-primary)]" />
        Establecer como dirección predeterminada
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-2.5">
          {saving ? 'Guardando…' : 'Guardar dirección'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline px-4">Cancelar</button>
      </div>
    </form>
  )
}

/* ── Tabs ────────────────────────────────────────────────────────────── */
type Tab = 'orders' | 'profile' | 'addresses' | 'security'

/* ══════════════════════════════════════════════════════════════════════ */
export default function Account() {
  const { user, signOut } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('orders')

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-gray-600 mb-4">Necesitás iniciar sesión para ver tu cuenta.</p>
        <Link to="/iniciar-sesion" className="btn btn-primary px-8">Iniciar sesión</Link>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders',    label: 'Mis pedidos',   icon: <ShoppingBag size={16} /> },
    { id: 'profile',   label: 'Mis datos',     icon: <User size={16} /> },
    { id: 'addresses', label: 'Direcciones',   icon: <MapPin size={16} /> },
    { id: 'security',  label: 'Seguridad',     icon: <Lock size={16} /> },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <button onClick={() => signOut()} className="btn btn-outline text-sm">Cerrar sesión</button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-52 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tab === t.id
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'text-gray-700 hover:bg-[var(--brand-soft)]'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'orders'    && <OrdersTab qc={qc} />}
          {tab === 'profile'   && <ProfileTab qc={qc} />}
          {tab === 'addresses' && <AddressesTab qc={qc} />}
          {tab === 'security'  && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

/* ── OrdersTab ───────────────────────────────────────────────────────── */
function OrdersTab({ qc: _qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['customer_orders'],
    queryFn: getOrders,
  })

  if (isLoading) return <div className="text-sm text-gray-500 py-8 text-center">Cargando pedidos…</div>
  if (isError)   return <div className="text-sm text-red-600 py-8 text-center">Error al cargar pedidos.</div>
  if (orders.length === 0) {
    return (
      <div className="card p-10 text-center">
        <Package size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Todavía no tenés pedidos.</p>
        <Link to="/productos" className="mt-4 btn btn-primary inline-flex">Ver catálogo</Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Mis pedidos</h2>
      {orders.map((order) => (
        <div key={order.id} className="card overflow-hidden">
          {/* Row */}
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-gray-900">#{order.code}</p>
                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('es-AR')}</p>
              </div>
              <span className={`badge ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'} ml-2`}>
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
              <span className={`badge ${PAY_COLOR[order.payment_status] ?? 'bg-gray-100'}`}>
                {PAY_LABEL[order.payment_status] ?? order.payment_status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">{fmt(order.total)}</span>
              <ChevronRight size={16} className={`text-gray-400 transition-transform ${expanded === order.id ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {/* Detail */}
          {expanded === order.id && (
            <div className="border-t px-4 pb-4 pt-3 space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{it.name} × {it.qty}</span>
                    <span className="font-semibold">{fmt(it.total)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="rounded-xl bg-gray-50 p-3 text-sm space-y-1">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                {(order.discount_amount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-700"><span>Descuento</span><span>-{fmt(order.discount_amount)}</span></div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t"><span>Total</span><span>{fmt(order.total)}</span></div>
                <p className="text-[10px] text-gray-400">Precios con IVA incluido</p>
              </div>

              {/* Shipping */}
              {order.shipping_address && (
                <div className="text-xs text-gray-500">
                  <span className="font-semibold">Envío a:</span>{' '}
                  {[order.shipping_address, order.shipping_city, order.shipping_province, order.shipping_postal].filter(Boolean).join(', ')}
                </div>
              )}

              {/* Tracking */}
              {order.tracking && (
                <div className="rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-soft)] p-3 text-sm">
                  <p className="font-bold text-[var(--brand-primary)] mb-1">Seguimiento del envío</p>
                  {order.tracking.carrier && <p className="text-gray-700"><span className="font-semibold">Carrier:</span> {order.tracking.carrier}</p>}
                  {order.tracking.tracking_code && <p className="text-gray-700"><span className="font-semibold">Código:</span> {order.tracking.tracking_code}</p>}
                  {order.tracking.status && <p className="text-gray-700"><span className="font-semibold">Estado:</span> {order.tracking.status}</p>}
                  {order.tracking.estimated_delivery && <p className="text-gray-700"><span className="font-semibold">Entrega estimada:</span> {order.tracking.estimated_delivery}</p>}
                  {order.tracking.notes && <p className="text-gray-500 text-xs mt-1">{order.tracking.notes}</p>}
                </div>
              )}

              {/* MP pay button if unpaid */}
              {order.payment_status === 'pending' && (
                <PayOrderButton code={order.code} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── PayOrderButton ──────────────────────────────────────────────────── */
function PayOrderButton({ code }: { code: string }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const pay = async () => {
    setLoading(true); setErr(null)
    try {
      const { createMpPreference } = await import('../api/payment')
      const pref = await createMpPreference(code)
      window.location.href = pref.init_point
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Error al iniciar el pago.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={pay} disabled={loading} className="btn btn-primary w-full py-2.5">
        {loading ? 'Redirigiendo a MercadoPago…' : '💳 Pagar con MercadoPago'}
      </button>
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
    </div>
  )
}

/* ── ProfileTab ──────────────────────────────────────────────────────── */
function ProfileTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const { data: profile, isLoading } = useQuery({ queryKey: ['customer_profile'], queryFn: getProfile })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<CustomerProfile>>({})
  const [saved, setSaved] = useState(false)

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      qc.setQueryData(['customer_profile'], updated)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (isLoading) return <div className="text-sm text-gray-500 py-8 text-center">Cargando…</div>
  if (!profile) return null

  const startEdit = () => { setForm({ ...profile }); setEditing(true) }
  const cancelEdit = () => setEditing(false)

  if (!editing) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Mis datos</h2>
          {saved
            ? <span className="flex items-center gap-1 text-sm text-green-600"><Check size={14} /> Guardado</span>
            : <button onClick={startEdit} className="btn btn-outline text-sm gap-1"><Edit2 size={14} /> Editar</button>
          }
        </div>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {[
            ['Nombre', profile.name],
            ['Email', profile.email],
            ['Teléfono', profile.phone ?? '—'],
            ['DNI / CUIT', profile.dni ?? '—'],
            ['Dirección', profile.address ?? '—'],
            ['Ciudad', profile.city ?? '—'],
            ['Provincia', profile.province ?? '—'],
            ['Código postal', profile.postal_code ?? '—'],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{lbl}</p>
              <p className="text-gray-800 font-medium mt-0.5">{val}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className={`h-3 w-3 rounded-full ${profile.accepts_marketing ? 'bg-green-500' : 'bg-gray-300'}`} />
            {profile.accepts_marketing ? 'Suscripto a novedades' : 'No suscripto a novedades'}
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold mb-5">Editar datos</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ['name', 'Nombre', 'text'],
            ['phone', 'Teléfono', 'tel'],
            ['dni', 'DNI / CUIT', 'text'],
            ['address', 'Dirección', 'text'],
            ['city', 'Ciudad', 'text'],
            ['province', 'Provincia', 'text'],
            ['postal_code', 'Código postal', 'text'],
          ] as [keyof CustomerProfile, string, string][]).map(([field, lbl, type]) => (
            <div key={field}>
              <label className={labelCls}>{lbl}</label>
              <input
                type={type}
                value={(form[field] as string) ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!form.accepts_marketing}
            onChange={(e) => setForm((f) => ({ ...f, accepts_marketing: e.target.checked }))}
            className="accent-[var(--brand-primary)]" />
          Quiero recibir novedades y ofertas
        </label>
        {mutation.isError && (
          <p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.message ?? 'Error al guardar.'}</p>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1 py-2.5">
            {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={cancelEdit} className="btn btn-outline px-4">Cancelar</button>
        </div>
      </form>
    </div>
  )
}

/* ── AddressesTab ────────────────────────────────────────────────────── */
function AddressesTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const { data: addresses = [], isLoading } = useQuery({ queryKey: ['customer_addresses'], queryFn: getAddresses })

  const createMut = useMutation({
    mutationFn: createAddress,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer_addresses'] }); setShowForm(false) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<CustomerAddress, 'id'> }) => updateAddress(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer_addresses'] }); setEditId(null) },
  })

  const deleteMut = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer_addresses'] }),
  })

  if (isLoading) return <div className="text-sm text-gray-500 py-8 text-center">Cargando…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Mis direcciones</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm gap-1">
            <Plus size={14} /> Agregar
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-3">Nueva dirección</h3>
          <AddressForm
            onSave={(d) => createMut.mutate(d)}
            onCancel={() => setShowForm(false)}
            saving={createMut.isPending}
          />
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="card p-8 text-center text-gray-500 text-sm">
          No tenés direcciones guardadas.
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="card p-4">
          {editId === addr.id ? (
            <AddressForm
              initial={{ ...addr }}
              onSave={(d) => updateMut.mutate({ id: addr.id, data: d })}
              onCancel={() => setEditId(null)}
              saving={updateMut.isPending}
            />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-gray-800">{addr.label || 'Dirección'}</span>
                  {addr.is_default && <span className="badge badge-primary text-[10px]">Predeterminada</span>}
                </div>
                <p className="text-gray-700">{addr.recipient}</p>
                <p className="text-gray-500">{addr.address}</p>
                <p className="text-gray-500">{[addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ')}</p>
                {addr.phone && <p className="text-gray-500">{addr.phone}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditId(addr.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteMut.mutate(addr.id)}
                  disabled={deleteMut.isPending}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── SecurityTab ─────────────────────────────────────────────────────── */
function SecurityTab() {
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [ok, setOk] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => { setForm({ current_password: '', password: '', password_confirmation: '' }); setOk(true); setTimeout(() => setOk(false), 4000) },
  })

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold mb-5">Cambiar contraseña</h2>
      <form className="space-y-4 max-w-sm" onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
        {[
          ['current_password', 'Contraseña actual'],
          ['password', 'Nueva contraseña'],
          ['password_confirmation', 'Confirmar nueva contraseña'],
        ].map(([field, lbl]) => (
          <div key={field}>
            <label className={labelCls}>{lbl}</label>
            <input
              type="password"
              value={form[field as keyof typeof form]}
              onChange={(e) => set(field, e.target.value)}
              className={inputCls}
              required
              minLength={field !== 'current_password' ? 8 : undefined}
            />
          </div>
        ))}

        {mutation.isError && (
          <p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.errors?.current_password?.[0] ?? 'Error al cambiar contraseña.'}</p>
        )}
        {ok && <p className="text-sm text-green-600 flex items-center gap-1"><Check size={14} /> Contraseña actualizada.</p>}

        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full py-2.5">
          {mutation.isPending ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
