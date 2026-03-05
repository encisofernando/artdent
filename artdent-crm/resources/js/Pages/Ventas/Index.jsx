import Layout from "@/Components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"

export default function VentasIndex() {
  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Ventas</h1>
        <Link href="/ventas/pos"><Button>Ir a POS</Button></Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          Listado base (stub). Aquí van filtros, paginación y exportación.
        </CardContent>
      </Card>
    </Layout>
  )
}
