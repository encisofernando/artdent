import { useMemo, useState } from 'react'
import { X, Search, MapPin, Check } from 'lucide-react'
import type { AndreaniBranch } from '../api/shipping'

type Props = {
  branches: AndreaniBranch[]
  selected: AndreaniBranch | null
  onSelect: (branch: AndreaniBranch) => void
  onClose: () => void
}

export default function AndreaniBranchModal({ branches, selected, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((b) =>
      `${b.name} ${b.address} ${b.city}`.toLowerCase().includes(q)
    )
  }, [branches, query])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="flex w-full sm:max-w-lg flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Elegí tu sucursal Andreani</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100" aria-label="Cerrar">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="border-b px-5 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por dirección, barrio..."
              className="w-full rounded-xl border px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No encontramos sucursales con esa búsqueda.</p>
          )}
          {filtered.map((branch) => {
            const isSelected = selected?.code === branch.code
            return (
              <button
                key={branch.code}
                type="button"
                onClick={() => onSelect(branch)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors
                  ${isSelected ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900">{branch.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{branch.address}</p>
                  <p className="text-xs text-gray-500">{branch.city}, {branch.province}</p>
                </div>
                {isSelected && <Check size={18} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
