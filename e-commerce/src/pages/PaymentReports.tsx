import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileCheck2, Package, ChevronRight, Landmark } from 'lucide-react'
import { getOrders, type CustomerOrder } from '../api/customer'
import PaymentReportButton from '../components/PaymentReportButton'

function fmt(n: number) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Recibido', confirmed: 'Confirmado', processing: 'En preparación',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700', shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
}

export default function PaymentReports() {
  const qc = useQueryClient()

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['customer_orders'],
    queryFn: getOrders,
    staleTime: 0,
  })

  // Only bank transfer orders that haven't been fully paid
  const pending = orders.filter(
    (o) => o.selected_payment_method === 'bank_transfer' && o.payment_status !== 'paid' && o.status !== 'cancelled'
  )

  const updateOrder = (updated: CustomerOrder) => {
    qc.setQueryData<CustomerOrder[]>(['customer_orders'], (prev = []) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--brand-primary)' }}>
            <FileCheck2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Informar pago</h1>
            <p className="text-sm text-gray-500">Transferencias bancarias pendientes de confirmación</p>
          </div>
        </div>

        {/* Bank details reminder */}
        <div className="mt-4 rounded-xl border border-[var(--brand-primary)]/25 bg-[var(--brand-soft)] px-4 py-3 text-sm text-gray-700 flex items-start gap-3">
          <Landmark size={16} className="text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800 mb-1">Datos bancarios ArtDent</p>
            <p><span className="text-gray-500">CBU:</span> <span className="font-mono font-medium">0000000000000000000000</span></p>
            <p><span className="text-gray-500">Alias:</span> <span className="font-medium">ARTDENT.PAGOS</span></p>
            <p><span className="text-gray-500">Titular:</span> <span className="font-medium">ArtDent S.R.L.</span></p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="text-sm text-gray-500 py-10 text-center">Cargando pedidos…</div>
      )}

      {isError && (
        <div className="text-sm text-red-600 py-10 text-center">Error al cargar pedidos.</div>
      )}

      {!isLoading && !isError && pending.length === 0 && (
        <div className="card p-10 text-center">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No tenés pedidos pendientes de pago por transferencia.</p>
          <Link to="/mi-cuenta?tab=orders" className="mt-4 btn btn-primary inline-flex">
            Ver todos mis pedidos
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {pending.map((order) => (
          <div key={order.id} className="card overflow-hidden">
            {/* Order header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
              <div>
                <p className="text-sm font-bold text-gray-900">#{order.code}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <span className="text-sm font-bold text-gray-900">{fmt(order.total)}</span>
              </div>
            </div>

            {/* Items summary */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-1.5">Productos</p>
              <div className="space-y-1">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate mr-4">{it.name} <span className="text-gray-400">×{it.qty}</span></span>
                    <span className="font-medium text-gray-900 shrink-0">{fmt(it.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Report button */}
            <div className="px-4 py-4 space-y-2">
              <PaymentReportButton
                order={order}
                onReported={(report) => updateOrder({ ...order, payment_report: report })}
              />
              <Link
                to={`/pedido/${order.code}`}
                className="flex items-center justify-center gap-1.5 text-xs text-[var(--brand-primary)] hover:underline py-1"
              >
                <ChevronRight size={13} /> Ver detalle del pedido
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/mi-cuenta?tab=orders" className="text-sm text-[var(--brand-primary)] hover:underline font-medium">
          ← Ver todos mis pedidos
        </Link>
      </div>
    </div>
  )
}
