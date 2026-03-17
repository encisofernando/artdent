import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../store/cart'

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

export default function Cart() {
  const cart = useCart()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carrito</h1>
        </div>

        {cart.items.length ? (
          <button className="btn btn-outline" onClick={() => cart.clear()}>
            Vaciar
          </button>
        ) : null}
      </div>

      {!cart.items.length ? (
        <div className="mt-8 card p-8">
          <p className="text-sm text-gray-700">Tu carrito está vacío.</p>
          <Link to="/productos" className="mt-4 inline-block btn btn-primary">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 card p-6">
            <div className="space-y-4">
              {cart.items.map((it) => {
                const unit = Number(it.variant_price ?? it.product.price_final ?? it.product.price ?? 0)
                const line = unit * it.qty
                const sku = it.variant_sku ?? it.product.sku
                const cartKey = `${it.product.id}-${it.variant_id ?? 0}`
                return (
                  <div key={cartKey} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
                    {/* Fila 1: nombre + botón quitar */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <Link to={`/productos/${it.product.id}`} className="text-sm font-semibold hover:underline leading-tight">
                          {it.product.name}
                        </Link>
                        {it.variant_label && (
                          <p className="mt-0.5 text-xs text-[var(--brand-primary)] font-medium">{it.variant_label}</p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-500">SKU: {sku || '—'}</p>
                      </div>
                      <button
                        className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50 border border-gray-200"
                        onClick={() => cart.remove(it.product.id, it.variant_id)}
                      >
                        Quitar
                      </button>
                    </div>
                    {/* Fila 2: precio unitario × cantidad = total */}
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 shrink-0">{formatMoney(unit)}</p>
                      <span className="text-gray-300 text-xs">×</span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={it.qty}
                        onChange={(e) => cart.setQty(it.product.id, Number(e.target.value || 1), it.variant_id)}
                        className="w-16 rounded-xl border px-2 py-1.5 text-sm text-center"
                      />
                      <p className="ml-auto text-sm font-bold shrink-0">{formatMoney(line)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-6 h-fit">
            <h2 className="text-lg font-bold">Resumen</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{formatMoney(cart.subtotal)}</span>
              </div>
            </div>
            <button className="btn btn-primary w-full mt-6" onClick={() => navigate('/checkout')}>
              Continuar con el pago
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
