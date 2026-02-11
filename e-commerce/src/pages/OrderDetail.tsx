import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orders'

const LS_LAST_EMAIL = 'artdent_last_checkout_email'

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

export default function OrderDetail() {
  const params = useParams()
  const code = String(params.code || '')
  const [email, setEmail] = useState(() => localStorage.getItem(LS_LAST_EMAIL) || '')

  const query = useQuery({
    queryKey: ['order', code, email],
    queryFn: () => getOrder(code, email ? { email } : {}),
    enabled: Boolean(code),
    retry: false,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedido</h1>
          <p className="mt-2 text-sm text-gray-600">Código: <span className="font-semibold">{code}</span></p>
        </div>
        <Link to="/productos" className="btn btn-outline">Volver al catálogo</Link>
      </div>

      <div className="mt-6 card p-6">
        <p className="text-sm text-gray-600">
          Si no estás logueado, para ver el pedido el backend solicita el email con el que se generó.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="email"
            className="w-full sm:w-96 rounded-xl border px-4 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email del comprador"
          />
          <button className="btn btn-primary" onClick={() => {
            localStorage.setItem(LS_LAST_EMAIL, email)
            query.refetch()
          }}>
            Consultar
          </button>
        </div>
      </div>

      <div className="mt-6">
        {query.isLoading ? (
          <p className="text-sm text-gray-500">Cargando pedido...</p>
        ) : query.isError ? (
          <div className="card p-6">
            <p className="text-sm font-semibold text-red-700">No se pudo cargar el pedido.</p>
            <p className="mt-2 text-sm text-gray-600">
              {String((query.error as any)?.response?.data?.message || (query.error as any)?.message || '')}
            </p>
          </div>
        ) : query.data ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 card p-6">
              <h2 className="text-lg font-bold">Ítems</h2>
              <div className="mt-4 space-y-3">
                {query.data.items.map((it) => (
                  <div key={it.id} className="flex items-start justify-between gap-4 border-b pb-3">
                    <div>
                      <p className="font-semibold leading-tight">{it.name}</p>
                      <p className="text-xs text-gray-500">x {it.qty} · {formatMoney(it.unit_price)} · IVA {it.tax_rate}%</p>
                    </div>
                    <p className="font-semibold">{formatMoney(it.line_total)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 h-fit">
              <h2 className="text-lg font-bold">Resumen</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estado</span>
                  <span className="font-semibold">{query.data.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Modo</span>
                  <span className="font-semibold">{query.data.pricing_mode.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatMoney(query.data.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">IVA</span>
                  <span className="font-semibold">{formatMoney(query.data.tax_total)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-gray-600">Total</span>
                  <span className="text-lg font-bold">{formatMoney(query.data.total)}</span>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-600">
                <p><span className="font-semibold">Comprador:</span> {query.data.customer_name}</p>
                <p><span className="font-semibold">Email:</span> {query.data.customer_email}</p>
                {query.data.customer_phone ? <p><span className="font-semibold">Tel:</span> {query.data.customer_phone}</p> : null}
                {query.data.shipping_address ? (
                  <p className="mt-2 whitespace-pre-wrap"><span className="font-semibold">Envío:</span> {query.data.shipping_address}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
