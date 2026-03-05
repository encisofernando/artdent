import Layout from "@/Components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"

export default function Reportes() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <Card>
        <CardHeader><CardTitle>Panel</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">Stub reportes.</CardContent>
      </Card>
    </Layout>
  )
}
