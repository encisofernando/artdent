import Layout from "@/Components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"

export default function LaboratorioIndex() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Laboratorio</h1>
      <Card>
        <CardHeader><CardTitle>Jobs</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          Stub de trabajos de laboratorio con estados y seguimiento.
        </CardContent>
      </Card>
    </Layout>
  )
}
