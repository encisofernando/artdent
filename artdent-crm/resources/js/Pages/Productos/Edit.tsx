import Layout from "@/Components/layout/Layout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Link, useForm } from "@inertiajs/react"

type Product = { id: number; sku?: string; name: string; price: number; track_stock?: boolean; min_stock?: number }

export default function ProductosEdit({ product }: { product: Product }) {
  const { data, setData, put, processing, errors } = useForm({
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    price: String(product?.price ?? 0),
    track_stock: Boolean(product?.track_stock ?? true),
    min_stock: String(product?.min_stock ?? 0),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    put(`/productos/${product.id}`)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Editar producto</h1>
        <Link href="/productos"><Button variant="outline">Volver</Button></Link>
      </div>

      <form onSubmit={submit} className="max-w-xl space-y-3">
        <div>
          <label className="text-sm">SKU</label>
          <Input value={data.sku} onChange={(e) => setData("sku", e.target.value)} />
          {errors.sku && <div className="text-sm text-red-600">{errors.sku}</div>}
        </div>

        <div>
          <label className="text-sm">Nombre</label>
          <Input value={data.name} onChange={(e) => setData("name", e.target.value)} />
          {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
        </div>

        <div>
          <label className="text-sm">Precio</label>
          <Input value={data.price} onChange={(e) => setData("price", e.target.value)} />
          {errors.price && <div className="text-sm text-red-600">{errors.price}</div>}
        </div>

        <div className="flex gap-2 pt-2">
          <Button disabled={processing} type="submit">Guardar</Button>
          <Link href="/productos"><Button variant="ghost" type="button">Cancelar</Button></Link>
        </div>
      </form>
    </Layout>
  )
}
