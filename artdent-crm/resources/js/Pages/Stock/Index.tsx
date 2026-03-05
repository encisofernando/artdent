import Layout from "@/Components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"

export default function StockIndex({ items }: { items: any[] }) {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Stock</h1>

      <Card>
        <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          Pantalla base (stub) para stock multi-depósito y movimientos.
        </CardContent>
      </Card>
    </Layout>
  )
}
