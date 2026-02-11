import { useAuth } from '../store/auth'

export default function Account() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Mi cuenta</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm font-semibold text-[var(--brand-primary)]">Perfil</p>
          <div className="mt-4 text-sm">
            <p><span className="text-gray-600">Nombre:</span> <span className="font-semibold">{user?.name}</span></p>
            <p className="mt-2"><span className="text-gray-600">Email:</span> <span className="font-semibold">{user?.email}</span></p>
            <p className="mt-2"><span className="text-gray-600">Empresa (company_id):</span> <span className="font-semibold">{user?.company_id ?? '—'}</span></p>
          </div>
        </div>
        <div className="card p-6">
          <p className="text-sm font-semibold text-[var(--brand-primary)]">Próximos pasos (e-commerce)</p>
          <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>Exponer endpoints públicos para catálogo (si no querés forzar login).</li>
            <li>Agregar imágenes/galería de productos.</li>
            <li>Implementar carrito real: convertir a venta/pedido en backend.</li>
            <li>Integrar medios de pago y factura.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
