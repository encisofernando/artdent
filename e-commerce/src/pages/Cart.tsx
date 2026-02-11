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
          <p className="mt-2 text-sm text-gray-600">
            Precios dinámicos: si iniciás sesión con cuenta B2B, el catálogo ya viene con el precio correcto.
          </p>
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
                const unit = Number(it.product.price_final ?? it.product.price ?? 0)
                const line = unit * it.qty
                return (
                  <div key={it.product.id} className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link to={`/productos/${it.product.id}`} className="text-sm font-semibold hover:underline">
                        {it.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">SKU: {it.product.sku || '—'}</p>
                      <p className="mt-2 text-sm font-bold">{formatMoney(unit)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0.001}
                        step={1}
                        value={it.qty}
                        onChange={(e) => cart.setQty(it.product.id, Number(e.target.value || 1))}
                        className="w-24 rounded-xl border px-3 py-2 text-sm"
                      />
                      <p className="w-28 text-right text-sm font-semibold">{formatMoney(line)}</p>
                      <button className="btn btn-outline" onClick={() => cart.remove(it.product.id)}>
                        Quitar
                      </button>
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
                <span className="text-gray-600">Subtotal (sin IVA)</span>
                <span className="font-semibold">{formatMoney(cart.subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500">
                El IVA se calcula en el checkout (por producto) al generar el pedido.
              </p>
            </div>
            <button className="btn btn-primary w-full mt-6" onClick={() => navigate('/checkout')}>
              Continuar a checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
