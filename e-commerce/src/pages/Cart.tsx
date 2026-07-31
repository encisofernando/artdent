import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Package } from 'lucide-react'
import { useCart } from '../store/cart'
import { productPath } from '../utils/slug'
import { formatMoney } from '../lib/format'

// ── Cart: revisión de ítems antes de pasar a /checkout ────────────────────────
export default function Cart() {
  const cart = useCart()
  const navigate = useNavigate()

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

  // ── Cart with items ───────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Carrito</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

        {/* ── Items ────────────────────────────────────────────────────── */}
        <div className="card p-5 min-w-0">
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

        {/* ── Resumen ──────────────────────────────────────────────────── */}
        <div>
          <div className="card p-5 space-y-4 lg:sticky lg:top-24">
            <h2 className="font-bold text-gray-900">Resumen</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between border-t pt-3">
                <span className="font-bold">Subtotal</span>
                <span className="font-bold text-lg text-[var(--brand-primary)]">{formatMoney(cart.subtotal)}</span>
              </div>
              <p className="text-xs text-gray-400">Envío y cupón de descuento se calculan en el siguiente paso.</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary w-full py-3 text-sm"
            >
              Ir a pagar
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
