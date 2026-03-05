import Layout from "@/Components/layout/Layout"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Link, router } from "@inertiajs/react"
import { useMemo, useState } from "react"

type Product = { id: number; sku?: string; name: string; price: number }
type Props = {
  filters: { q?: string }
  products: { data: Product[]; links?: any; meta?: any }
}

export default function ProductosIndex({ filters, products }: Props) {
  const [q, setQ] = useState(filters?.q ?? "")

  const rows = useMemo(() => products?.data ?? [], [products])

  function submit() {
    router.get("/productos", { q }, { preserveState: true, replace: true })
  }

  return (
    <Layout>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-slate-500">Alta, edición y búsqueda.</p>
        </div>

        <Link href="/productos/crear">
          <Button>Crear</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o SKU..." />
        <Button variant="outline" onClick={submit}>Buscar</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-right">Precio</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3">{p.sku ?? "-"}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-right">${p.price}</td>
                <td className="p-3 text-right">
                  <Link className="text-artdent-blue hover:underline" href={`/productos/${p.id}/editar`}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={4}>
                  Sin productos (stub).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
