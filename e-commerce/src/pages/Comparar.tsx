import ProductComparison from '../components/ProductComparison'

export default function Comparar() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Comparar Productos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Compara hasta 4 productos lado a lado para tomar la mejor decisión de compra.
        </p>
      </div>

      <ProductComparison />

      <div className="mt-8 card p-6">
        <h2 className="font-bold mb-3">Cómo usar el comparador</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
          <li>Busca productos desde la barra de búsqueda</li>
          <li>Agrega hasta 4 productos para comparar</li>
          <li>Usa el toggle "Solo diferencias" para ver únicamente lo que cambia</li>
          <li>Exporta la comparación a PDF si lo necesitas</li>
        </ul>
      </div>
    </div>
  )
}