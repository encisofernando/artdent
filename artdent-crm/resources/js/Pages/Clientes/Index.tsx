import Layout from "@/Components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"

export default function ClientesIndex() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <Card>
        <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">Stub clientes.</CardContent>
      </Card>
    </Layout>
  )
}
