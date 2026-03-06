import Layout from "@/Components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"

export default function LaboratorioShow({ job }) {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Job #{job?.id}</h1>
      <Card>
        <CardHeader><CardTitle>Detalle</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">Estado: {job?.status}</CardContent>
      </Card>
    </Layout>
  )
}
