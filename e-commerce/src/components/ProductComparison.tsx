import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Download, ArrowRight } from 'lucide-react'
import { getComparison, removeFromComparison } from '../api/comparison'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

export default function ProductComparison() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false)

  const comparisonQuery = useQuery({
    queryKey: ['comparison'],
    queryFn: getComparison,
  })

  const removeMutation = useMutation({
    mutationFn: (comparisonId: number) => removeFromComparison(comparisonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparison'] })
    },
  })

  const products = comparisonQuery.data || []

  // Extract all unique attributes
  const attributes = useMemo(() => {
    const attrs = new Set<string>()
    products.forEach((item: any) => {
      const p = item.product
      if (p.category_id) attrs.add('category')
      if (p.sku) attrs.add('sku')
      if (p.barcode) attrs.add('barcode')
      if (p.unit) attrs.add('unit')
      if (p.description) attrs.add('description')
      attrs.add('price')
      attrs.add('tax_rate')
      attrs.add('stock')
      if (p.is_active !== undefined) attrs.add('status')
    })
    return Array.from(attrs)
  }, [products])

  const getAttributeValue = (product: any, attr: string): string => {
    switch (attr) {
      case 'category':
        return product.category?.name || '—'
      case 'sku':
        return product.sku || '—'
      case 'barcode':
        return product.barcode || '—'
      case 'unit':
        return product.unit || 'UN'
      case 'description':
        return product.description || '—'
      case 'price':
        return formatMoney(product.price_final || product.price || 0)
      case 'tax_rate':
        return `${product.tax_rate || 0}%`
      case 'stock':
        return product.stock ? `${product.stock} disponibles` : 'Sin stock'
      case 'status':
        return product.is_active ? 'Activo' : 'Inactivo'
      default:
        return '—'
    }
  }

  const attributeLabels: Record<string, string> = {
    category: 'Categoría',
    sku: 'SKU',
    barcode: 'Código de barras',
    unit: 'Unidad',
    description: 'Descripción',
    price: 'Precio',
    tax_rate: 'IVA',
    stock: 'Disponibilidad',
    status: 'Estado',
  }

  const shouldShowRow = (attr: string): boolean => {
    if (!showDifferencesOnly) return true
    
    const values = products.map((item: any) => getAttributeValue(item.product, attr))
    const uniqueValues = new Set(values)
    return uniqueValues.size > 1 // Show only if values differ
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(16)
    doc.text('Comparación de Productos - ARTDENT', 14, 15)
    
    const tableData = attributes
      .filter(shouldShowRow)
      .map((attr) => [
        attributeLabels[attr] || attr,
        ...products.map((item: any) => getAttributeValue(item.product, attr))
      ])

    ;(doc as any).autoTable({
      head: [['Característica', ...products.map((item: any) => item.product.name)]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 102, 204] },
    })

    doc.save('comparacion-productos.pdf')
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Comparar Productos</h1>
        <div className="mt-8 card p-8 text-center">
          <p className="text-gray-600">No hay productos en la comparación.</p>
          <p className="mt-2 text-sm text-gray-500">
            Agrega productos desde el catálogo para compararlos lado a lado.
          </p>
          <button
            onClick={() => navigate('/productos')}
            className="btn btn-primary mt-6"
          >
            Ir al catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comparar Productos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Compara hasta 4 productos para tomar la mejor decisión.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
            className={`btn ${showDifferencesOnly ? 'btn-primary' : 'btn-outline'}`}
          >
            {showDifferencesOnly ? 'Mostrar todo' : 'Solo diferencias'}
          </button>
          <button onClick={exportToPDF} className="btn btn-outline">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2">
              <th className="p-4 text-left text-sm font-semibold text-gray-600 w-48">
                Característica
              </th>
              {products.map((item: any) => (
                <th key={item.id} className="p-4 min-w-[250px]">
                  <div className="card p-4 relative">
                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      className="absolute top-2 right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                      title="Quitar de comparación"
                    >
                      <X size={16} />
                    </button>

                    <div className="h-32 w-full overflow-hidden rounded-xl border bg-white mb-3">
                      {item.product.primary_image_url ? (
                        <img
                          src={item.product.primary_image_url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center">
                          <span className="text-xs text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold line-clamp-2">
                      {item.product.name}
                    </h3>
                    
                    <button
                      onClick={() => navigate(`/productos/${item.product.id}`)}
                      className="mt-3 text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                    >
                      Ver detalles
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {attributes.filter(shouldShowRow).map((attr) => {
              const values = products.map((item: any) => getAttributeValue(item.product, attr))
              const uniqueValues = new Set(values)
              const hasDifferences = uniqueValues.size > 1

              return (
                <tr
                  key={attr}
                  className={`border-b ${hasDifferences ? 'bg-yellow-50' : ''}`}
                >
                  <td className="p-4 text-sm font-semibold text-gray-700">
                    {attributeLabels[attr] || attr}
                  </td>
                  {products.map((item: any) => (
                    <td key={item.id} className="p-4 text-sm text-gray-700">
                      {attr === 'description' ? (
                        <div className="max-h-20 overflow-auto text-xs">
                          {getAttributeValue(item.product, attr)}
                        </div>
                      ) : (
                        <span className={hasDifferences ? 'font-semibold' : ''}>
                          {getAttributeValue(item.product, attr)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {products.length < 4 && (
        <div className="mt-6 card p-6 text-center">
          <p className="text-sm text-gray-600">
            Puedes agregar hasta {4 - products.length} producto(s) más.
          </p>
          <button
            onClick={() => navigate('/productos')}
            className="btn btn-outline mt-4"
          >
            Agregar más productos
          </button>
        </div>
      )}
    </div>
  )
}
