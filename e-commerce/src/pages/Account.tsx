import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User, ShoppingBag, Lock, ChevronRight, Plus, Trash2, Edit2,
  Check, Package, Clock, CheckCircle2, Truck, XCircle, AlertTriangle,
  RefreshCw, MapPinned, RotateCcw, Phone, Mail, Home, IdCard, LogOut, Gift,
} from 'lucide-react'
import { useAuth } from '../store/auth'
import {
  getProfile, updateProfile, changePassword,
  getOrders, getAddresses, createAddress, updateAddress, deleteAddress,
  cancelOrder,
  type CustomerProfile, type CustomerAddress, type CustomerOrder,
} from '../api/customer'
import { getLoyaltyBalance } from '../api/loyalty'
import PaymentReportButton from '../components/PaymentReportButton'
import { getApiErrorMessage } from '../lib/apiError'

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
type Tab = 'profile' | 'orders' | 'loyalty' | 'security'

/* ══════════════════════════════════════════════════════════════════════ */
export default function Account() {
  const { user, signOut } = useAuth()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'profile'
  const [tab, setTab] = useState<Tab>(initialTab)

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-gray-600 mb-4">Necesitás iniciar sesión para ver tu cuenta.</p>
        <Link to="/iniciar-sesion" className="btn btn-primary px-8">Iniciar sesión</Link>
      </div>
    )
  }

  const initials = (user.name ?? '').split(' ').filter(Boolean).slice(0, 3).map(w => w[0].toUpperCase()).join('')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',  label: 'Mi perfil',     icon: <User size={16} /> },
    { id: 'orders',   label: 'Mis pedidos',   icon: <ShoppingBag size={16} /> },
    { id: 'loyalty',  label: 'Mis puntos',    icon: <Gift size={16} /> },
    { id: 'security', label: 'Seguridad',     icon: <Lock size={16} /> },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <button
          onClick={async () => { await signOut(); window.location.replace('/') }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition"
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-52 flex-shrink-0 md:sticky md:top-24 md:self-start">
          {/* Avatar card */}
          <div className="card p-4 mb-3 flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--brand-primary)' }}>
              <span className="text-white text-lg font-extrabold tracking-tight leading-none">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 break-all">{user.email}</p>
            </div>
          </div>

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
          {tab === 'profile'  && <ProfilePage qc={qc} user={user} onChangePwd={() => setTab('security')} />}
          {tab === 'orders'   && <OrdersTab qc={qc} />}
          {tab === 'loyalty'  && <LoyaltyTab />}
          {tab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

/* ── ProfilePage (perfil + domicilios) ───────────────────────────────── */
function ProfilePage({ qc, user, onChangePwd }: { qc: ReturnType<typeof useQueryClient>; user: any; onChangePwd: () => void }) {
  const initials = (user.name ?? '').split(' ').filter(Boolean).slice(0, 3).map((w: string) => w[0].toUpperCase()).join('')

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Mi perfil</h2>

      {/* ── Header card ── */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: 'var(--brand-primary)' }}>
            <span className="text-white text-xl font-extrabold tracking-tight leading-none">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 uppercase leading-tight">{user.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
            <button
              onClick={onChangePwd}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:underline transition"
            >
              <Lock size={12} /> Cambiar contraseña
            </button>
          </div>
        </div>
      </div>

      {/* ── Data card ── */}
      <ProfileDataCard qc={qc} />

      {/* ── Addresses ── */}
      <AddressesSection qc={qc} />
    </div>
  )
}

/* ── ProfileDataCard ─────────────────────────────────────────────────── */
function ProfileDataCard({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
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

  if (isLoading) return <div className="card p-6 text-sm text-gray-500 text-center py-10">Cargando datos…</div>
  if (!profile) return null

  if (editing) {
    return (
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4">Editar datos</h3>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['name', 'Nombre completo', 'text'],
              ['phone', 'Teléfono', 'tel'],
              ['dni', 'DNI / CUIT', 'text'],
              ['address', 'Dirección fiscal', 'text'],
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
            <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error, 'Error al guardar.')}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1 py-2.5">
              {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-outline px-4">Cancelar</button>
          </div>
        </form>
      </div>
    )
  }

  const rows: { icon: React.ReactNode; value: string; label: string; editable?: boolean }[] = [
    { icon: <IdCard size={16} className="text-gray-500" />, value: profile.dni ?? '—', label: 'DNI / CUIT' },
    { icon: <Phone size={16} className="text-gray-500" />, value: profile.phone ?? '—', label: 'Teléfono', editable: true },
    { icon: <Mail size={16} className="text-gray-500" />, value: profile.email, label: 'Correo electrónico' },
    { icon: <Home size={16} className="text-gray-500" />, value: [profile.address, profile.city, profile.province, profile.postal_code].filter(Boolean).join(', ') || '—', label: 'Domicilio fiscal' },
  ]

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">Datos personales</h3>
        <button
          onClick={() => { setForm({ ...profile }); setEditing(true) }}
          className="flex items-center gap-1.5 text-sm text-[var(--brand-primary)] font-semibold hover:underline"
        >
          <Edit2 size={13} /> Editar
        </button>
      </div>

      {saved && (
        <div className="px-5 py-2 bg-green-50 border-b border-green-100 text-sm text-green-700 flex items-center gap-2">
          <Check size={14} /> Datos guardados correctamente.
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4 px-5 py-3.5">
            <div className="w-8 flex items-center justify-center shrink-0">{row.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{row.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{row.label}</p>
            </div>
            {row.editable && (
              <button
                onClick={() => { setForm({ ...profile }); setEditing(true) }}
                className="text-xs text-gray-500 hover:text-[var(--brand-primary)] flex items-center gap-1 transition shrink-0"
              >
                <Edit2 size={12} /> Editar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${profile.accepts_marketing ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-xs text-gray-500">
          {profile.accepts_marketing ? 'Suscripto a novedades y ofertas' : 'No suscripto a novedades'}
        </span>
      </div>
    </div>
  )
}

/* ── AddressesSection ────────────────────────────────────────────────── */
function AddressesSection({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
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

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">Domicilios de entrega</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary text-xs py-1.5 px-3 gap-1"
          >
            <Plus size={13} /> Agregar domicilio
          </button>
        )}
      </div>

      {showForm && (
        <div className="px-5 py-4 border-b border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Nueva dirección</h4>
          <AddressForm
            onSave={(d) => createMut.mutate(d)}
            onCancel={() => setShowForm(false)}
            saving={createMut.isPending}
          />
        </div>
      )}

      {isLoading && (
        <div className="px-5 py-6 text-sm text-gray-500 text-center">Cargando…</div>
      )}

      {!isLoading && addresses.length === 0 && !showForm && (
        <div className="px-5 py-8 text-center text-sm text-gray-500">
          No tenés domicilios guardados.
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {addresses.map((addr) => (
          <div key={addr.id} className="px-5 py-4">
            {editId === addr.id ? (
              <AddressForm
                initial={{ ...addr }}
                onSave={(d) => updateMut.mutate({ id: addr.id, data: d })}
                onCancel={() => setEditId(null)}
                saving={updateMut.isPending}
              />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-800 uppercase">{addr.recipient}</p>
                    {addr.is_default && (
                      <span className="text-[10px] font-bold bg-[var(--brand-soft)] text-[var(--brand-primary)] px-1.5 py-0.5 rounded-md">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  {addr.label && <p className="text-xs text-gray-500 mb-0.5">{addr.label}</p>}
                  <p className="text-sm text-gray-600">{addr.address}</p>
                  <p className="text-sm text-gray-500">
                    {[addr.city, addr.province].filter(Boolean).join(' · ')}
                    {addr.postal_code ? ` (${addr.postal_code})` : ''}
                  </p>
                  {addr.phone && <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditId(addr.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[var(--brand-primary)] transition"
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => deleteMut.mutate(addr.id)}
                    disabled={deleteMut.isPending}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── helpers de pedidos ──────────────────────────────────────────────── */
const ORDER_STEPS: CustomerOrder['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const STEP_LABELS: Record<string, string> = {
  pending: 'Recibido', confirmed: 'Confirmado', processing: 'Preparando',
  shipped: 'En camino', delivered: 'Entregado',
}
const TRACKING_LABELS: Record<string, string> = {
  preparing: 'Preparando', shipped: 'Despachado', in_transit: 'En tránsito',
  delivered: 'Entregado', returned: 'Devuelto',
}

function canCancel(order: CustomerOrder): boolean {
  if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)) return false
  return new Date().getTime() - new Date(order.created_at).getTime() < 2 * 60 * 60 * 1000
}

function cancelTimeLeft(order: CustomerOrder): string {
  const ms = 2 * 60 * 60 * 1000 - (new Date().getTime() - new Date(order.created_at).getTime())
  if (ms <= 0) return ''
  const mins = Math.ceil(ms / 60000)
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`
}

/* ── StatusStepper ───────────────────────────────────────────────────── */
function StatusStepper({ status }: { status: CustomerOrder['status'] }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-2">
        <XCircle size={18} className="text-red-500 shrink-0" />
        <span className="text-sm font-semibold text-red-600">Pedido cancelado</span>
      </div>
    )
  }
  if (status === 'refunded') {
    return (
      <div className="flex items-center gap-2 py-2">
        <RotateCcw size={18} className="text-gray-500 shrink-0" />
        <span className="text-sm font-semibold text-gray-600">Pedido reembolsado</span>
      </div>
    )
  }
  const currentIdx = ORDER_STEPS.indexOf(status)
  return (
    <div className="flex items-start w-full overflow-x-auto pb-1">
      {ORDER_STEPS.map((step, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        return (
          <div key={step} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                done ? 'bg-[var(--brand-primary)]' : active ? 'bg-[var(--brand-primary)] ring-4 ring-[var(--brand-primary)]/20' : 'bg-gray-200'
              }`}>
                {done
                  ? <Check size={13} className="text-white" />
                  : <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{idx + 1}</span>
                }
              </div>
              <span className={`text-[10px] mt-1 text-center leading-tight px-0.5 ${active ? 'font-bold text-[var(--brand-primary)]' : done ? 'text-gray-600' : 'text-gray-500'}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {idx < ORDER_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mt-3.5 mx-1 shrink-0 ${idx < currentIdx ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── TrackingCard ────────────────────────────────────────────────────── */
function TrackingCard({ tracking }: { tracking: NonNullable<CustomerOrder['tracking']> }) {
  return (
    <div className="rounded-xl border border-[var(--brand-primary)]/25 bg-[var(--brand-soft)] p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Truck size={16} className="text-[var(--brand-primary)]" />
        <p className="font-bold text-[var(--brand-primary)] text-sm">Seguimiento del envío</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {tracking.carrier && <div><span className="text-gray-500 text-xs">Carrier</span><p className="font-semibold text-gray-800">{tracking.carrier}</p></div>}
        {tracking.tracking_code && <div><span className="text-gray-500 text-xs">Código de rastreo</span><p className="font-mono font-bold text-gray-800 text-xs">{tracking.tracking_code}</p></div>}
        {tracking.status && <div><span className="text-gray-500 text-xs">Estado</span><p className="font-semibold text-gray-800">{TRACKING_LABELS[tracking.status] ?? tracking.status}</p></div>}
        {tracking.estimated_delivery && <div><span className="text-gray-500 text-xs">Entrega estimada</span><p className="font-semibold text-gray-800">{new Date(tracking.estimated_delivery).toLocaleDateString('es-AR')}</p></div>}
        {tracking.shipped_at && <div><span className="text-gray-500 text-xs">Despachado</span><p className="font-semibold text-gray-800">{new Date(tracking.shipped_at).toLocaleDateString('es-AR')}</p></div>}
        {tracking.delivered_at && <div><span className="text-gray-500 text-xs">Entregado</span><p className="font-semibold text-gray-800">{new Date(tracking.delivered_at).toLocaleDateString('es-AR')}</p></div>}
      </div>
      {tracking.tracking_url && (
        <a href={tracking.tracking_url} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
          Rastrear envío →
        </a>
      )}
      {tracking.notes && <p className="text-xs text-gray-500 border-t pt-2 mt-1">{tracking.notes}</p>}
    </div>
  )
}

/* ── PayOrderButton ──────────────────────────────────────────────────── */
function PayOrderButton({ code, failed }: { code: string; failed?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const pay = async () => {
    setLoading(true); setErr(null)
    try {
      const { createMpPreference, getMpCheckoutUrl } = await import('../api/payment')
      const pref = await createMpPreference(code)
      window.location.href = getMpCheckoutUrl(pref)
    } catch (e: any) {
      setErr(getApiErrorMessage(e, 'Error al iniciar el pago.'))
      setLoading(false)
    }
  }

  return (
    <div>
      {failed && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 mb-2 text-sm text-red-700">
          <AlertTriangle size={15} className="shrink-0" />
          El pago anterior fue rechazado. Podés intentarlo nuevamente.
        </div>
      )}
      <button onClick={pay} disabled={loading}
        className={`btn w-full py-2.5 flex items-center justify-center gap-2 ${failed ? 'btn-outline border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'btn-primary'}`}>
        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Redirigiendo…' : failed ? 'Reintentar pago con MercadoPago' : 'Pagar con MercadoPago'}
      </button>
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
    </div>
  )
}

/* ── CancelButton ────────────────────────────────────────────────────── */
function CancelButton({ order, onCancelled }: { order: CustomerOrder; onCancelled: (updated: CustomerOrder) => void }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(cancelTimeLeft(order))

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(cancelTimeLeft(order)), 30000)
    return () => clearInterval(t)
  }, [order])

  const doCancel = async () => {
    setLoading(true); setErr(null)
    try {
      const updated = await cancelOrder(order.code)
      onCancelled(updated)
    } catch (e: any) {
      setErr(getApiErrorMessage(e, 'No se pudo cancelar el pedido.'))
      setLoading(false)
      setConfirm(false)
    }
  }

  if (!confirm) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setConfirm(true)} className="btn btn-outline text-sm border-red-300 text-red-600 hover:bg-red-50 gap-1.5">
          <XCircle size={14} /> Cancelar pedido
        </button>
        {timeLeft && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} /> Podés cancelar hasta en {timeLeft}
          </span>
        )}
        {err && <p className="text-xs text-red-600 w-full">{err}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-3 space-y-2">
      <p className="text-sm font-semibold text-red-700">¿Confirmás la cancelación del pedido?</p>
      <p className="text-xs text-red-600">Esta acción no se puede deshacer.</p>
      <div className="flex gap-2">
        <button onClick={doCancel} disabled={loading}
          className="btn text-sm bg-red-600 hover:bg-red-700 text-white flex-1 py-2">
          {loading ? 'Cancelando…' : 'Sí, cancelar'}
        </button>
        <button onClick={() => setConfirm(false)} disabled={loading} className="btn btn-outline text-sm px-4">No</button>
      </div>
    </div>
  )
}

/* ── LoyaltyTab ──────────────────────────────────────────────────────── */
function LoyaltyTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['loyalty_balance'],
    queryFn: getLoyaltyBalance,
    staleTime: 0,
  })

  if (isLoading) return <div className="text-sm text-gray-500 py-8 text-center">Cargando puntos…</div>
  if (isError)   return <div className="text-sm text-red-600 py-8 text-center">Error al cargar tus puntos.</div>

  if (!data?.enabled) {
    return (
      <div className="card p-10 text-center">
        <Gift size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Todavía no hay un programa de puntos activo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Mis puntos</h2>
      <div className="card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-primary)' }}>
          <Gift size={22} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Saldo disponible</p>
          <p className="text-3xl font-bold text-gray-900">{data.balance.toLocaleString('es-AR')} pts</p>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Acumulás un {data.accrual_percentage}% de cada compra (en el local o acá) como puntos, y los podés usar como descuento en tu próxima compra.
      </p>
    </div>
  )
}

/* ── OrdersTab ───────────────────────────────────────────────────────── */
function OrdersTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['customer_orders'],
    queryFn: getOrders,
    refetchInterval: 30_000,
    staleTime: 0,
  })

  const updateOrder = (updated: CustomerOrder) => {
    qc.setQueryData<CustomerOrder[]>(['customer_orders'], (prev = []) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    )
  }

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
      <h2 className="text-lg font-bold text-gray-900">Mis pedidos ({orders.length})</h2>
      {orders.map((order) => (
        <div key={order.id} className="card overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0">
                <p className="text-sm font-bold text-gray-900">#{order.code}</p>
                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center min-w-0">
                <span className={`badge text-xs ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <span className={`badge text-xs ${PAY_COLOR[order.payment_status] ?? 'bg-gray-100'}`}>
                  {PAY_LABEL[order.payment_status] ?? order.payment_status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="text-sm font-bold text-gray-900">{fmt(order.total)}</span>
              <ChevronRight size={16} className={`text-gray-500 transition-transform ${expanded === order.id ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {expanded === order.id && (
            <div className="border-t px-4 pb-5 pt-4 space-y-5">
              <StatusStepper status={order.status} />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Productos</p>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between px-3 py-2.5 text-sm bg-white">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{it.name}</p>
                        {it.sku && <p className="text-[10px] text-gray-500">SKU: {it.sku}</p>}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-semibold text-gray-900">{fmt(it.total)}</p>
                        <p className="text-[11px] text-gray-500">{fmt(it.unit_price)} × {it.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm space-y-1.5">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                {(order.discount_amount ?? 0) > 0 && <div className="flex justify-between text-green-700 font-medium"><span>Descuento</span><span>−{fmt(order.discount_amount)}</span></div>}
                {(order.shipping_cost ?? 0) > 0 && <div className="flex justify-between text-gray-600"><span>Envío</span><span>{fmt(order.shipping_cost)}</span></div>}
                {(order.tax_amount ?? 0) > 0 && <div className="flex justify-between text-gray-500"><span>IVA incluido</span><span>{fmt(order.tax_amount)}</span></div>}
                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200 text-base">
                  <span>Total</span><span>{fmt(order.total)}</span>
                </div>
              </div>
              {order.shipping_address && (
                <div className="flex gap-2 text-sm text-gray-600">
                  <MapPinned size={15} className="text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-0.5">Dirección de entrega</p>
                    {order.shipping_name && <p className="font-medium">{order.shipping_name}</p>}
                    <p>{[order.shipping_address, order.shipping_city, order.shipping_province, order.shipping_postal].filter(Boolean).join(', ')}</p>
                    {order.shipping_phone && <p className="text-gray-500">{order.shipping_phone}</p>}
                  </div>
                </div>
              )}
              {order.tracking && <TrackingCard tracking={order.tracking} />}
              {order.customer_notes && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="font-semibold">Nota:</span> {order.customer_notes}
                </div>
              )}
              <div className="space-y-2 pt-1">
                {(order.payment_status === 'pending' || order.payment_status === 'failed') && order.status !== 'cancelled' && (
                  order.selected_payment_method === 'bank_transfer'
                    ? <PaymentReportButton
                        order={order}
                        onReported={(report) => updateOrder({ ...order, payment_report: report })}
                      />
                    : <PayOrderButton code={order.code} failed={order.payment_status === 'failed'} />
                )}
                {canCancel(order) && <CancelButton order={order} onCancelled={updateOrder} />}
                <Link to={`/pedido/${order.code}`} className="flex items-center justify-center gap-1.5 text-xs text-[var(--brand-primary)] hover:underline py-1">
                  <CheckCircle2 size={13} /> Ver página del pedido
                </Link>
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
    onSuccess: () => {
      setForm({ current_password: '', password: '', password_confirmation: '' })
      setOk(true)
      setTimeout(() => setOk(false), 4000)
    },
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
          <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error, 'Error al cambiar contraseña.')}</p>
        )}
        {ok && <p className="text-sm text-green-600 flex items-center gap-1"><Check size={14} /> Contraseña actualizada.</p>}
        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full py-2.5">
          {mutation.isPending ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
