import Layout from "@/Components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"

export default function VentaShow({ sale }: { sale: any }) {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Venta #{sale?.id}</h1>
      <Card>
        <CardHeader><CardTitle>Detalle</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">Stub detalle de venta.</CardContent>
      </Card>
    </Layout>
  )
}
