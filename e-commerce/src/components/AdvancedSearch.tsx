import { useState, useEffect, useRef, useMemo, useId } from 'react'
import { Search, Mic, TrendingUp, Clock, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getPopularSearches, getSearchSuggestions } from '../api/search'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'

interface AdvancedSearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
  autoFocus?: boolean
}

// Ajusta este tipo según lo que realmente devuelva tu API
// Si no tienes un tipo definido, puedes usar any temporalmente
interface PopularSearch {
  query: string
  search_count: number
  // ... otros campos posibles
}

type SearchOption = {
  id: string
  label: string
  sublabel?: string
  icon: React.ReactNode
  value: string
}

const RECENT_KEY = 'artdent_recent_searches'

export default function AdvancedSearch({ onSearch, placeholder, autoFocus = false }: AdvancedSearchProps) {
  const navigate = useNavigate()
  const listboxId = useId()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  const suggestionsQuery = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const popularQuery = useQuery<PopularSearch[]>({
    queryKey: ['popular-searches'],
    queryFn: () => getPopularSearches(10),
  })

  // Carga búsquedas recientes cuando el input toma foco y no hay query —
  // vive acá (no en un componente aparte) para poder armar una sola lista
  // de opciones navegable por teclado sin importar la fuente.
  useEffect(() => {
    if (!isFocused || query) return
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      setRecent(Array.isArray(parsed) ? parsed : [])
    } catch {
      setRecent([])
    }
  }, [isFocused, query])

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY)
    setRecent([])
  }

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'es-AR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      handleSearch(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error)
      setIsListening(false)
    }

    recognition.start()
  }

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    if (onSearch) {
      onSearch(searchQuery.trim())
    } else {
      navigate(`/productos?q=${encodeURIComponent(searchQuery.trim())}`)
    }

    setIsFocused(false)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const suggestions = suggestionsQuery.data ?? []
  const popularSearches = popularQuery.data ?? []

  const hasSuggestions = debouncedQuery.length >= 2 && suggestions.length > 0
  const hasPopular = !query && popularSearches.length > 0
  const hasRecent = !query && recent.length > 0
  const showDropdown = Boolean(isFocused && (hasSuggestions || hasPopular || hasRecent))

  // Una sola lista plana con todo lo que está visible ahora mismo — es lo
  // que permite navegar con flechas sin importar de qué sección viene cada
  // opción (sugerencias / populares / recientes son mutuamente excluyentes
  // según el estado, así que no hay superposición real).
  const options: SearchOption[] = useMemo(() => {
    if (hasSuggestions) {
      return suggestions.map((item: any, i: number) => ({
        id: `${listboxId}-sug-${i}`,
        label: item.suggestion || item.name,
        icon: <Search size={16} className="text-gray-500" />,
        value: item.suggestion || item.name,
      }))
    }
    if (hasPopular) {
      return popularSearches.slice(0, 8).map((item, i) => ({
        id: `${listboxId}-pop-${i}`,
        label: item.query,
        sublabel: `${item.search_count} búsquedas`,
        icon: <TrendingUp size={16} className="text-[var(--brand-primary)]" />,
        value: item.query,
      }))
    }
    if (hasRecent) {
      return recent.slice(0, 5).map((item, i) => ({
        id: `${listboxId}-rec-${i}`,
        label: item,
        icon: <Clock size={16} className="text-gray-500" />,
        value: item,
      }))
    }
    return []
  }, [hasSuggestions, hasPopular, hasRecent, suggestions, popularSearches, recent, listboxId])

  // El índice activo se resetea cada vez que cambia el set de opciones
  // (nueva query, cambio de sección) para no dejar "pegado" un highlight
  // sobre una opción que ya no está.
  useEffect(() => {
    setActiveIndex(-1)
  }, [options])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || options.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelectSuggestion(options[activeIndex].value)
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      setActiveIndex(-1)
    }
  }

  const activeOptionId = activeIndex >= 0 ? options[activeIndex]?.id : undefined

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="relative"
        role="search"
      >
        <div
          className="relative"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-owns={listboxId}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || '¿Qué estas buscando?'}
            className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-24 text-sm outline-none transition focus:border-[var(--brand-primary)]"
            autoFocus={autoFocus}
            role="searchbox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-full p-1 hover:bg-gray-100"
                title="Limpiar"
              >
                <X size={18} className="text-gray-500" />
              </button>
            )}

            <button
              type="button"
              onClick={startVoiceSearch}
              className={`rounded-full p-2 transition ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Búsqueda por voz"
            >
              <Mic size={18} />
            </button>
          </div>
        </div>
      </form>

      {showDropdown && (
        <div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-label="Sugerencias de búsqueda"
          className="absolute top-full left-0 right-0 mt-2 card max-h-96 overflow-y-auto z-50"
        >
          {hasSuggestions && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500">Sugerencias</p>
              {options.map((opt, index) => (
                <button
                  key={opt.id}
                  id={opt.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelectSuggestion(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                    index === activeIndex ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {hasPopular && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 flex items-center gap-2">
                <TrendingUp size={14} />
                Búsquedas populares
              </p>
              {options.map((opt, index) => (
                <button
                  key={opt.id}
                  id={opt.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelectSuggestion(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                    index === activeIndex ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  {opt.sublabel && <span className="ml-auto text-xs text-gray-500">{opt.sublabel}</span>}
                </button>
              ))}
            </div>
          )}

          {hasRecent && (
            <div className="border-t p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                  <Clock size={14} />
                  Búsquedas recientes
                </p>
                <button type="button" onClick={clearRecent} className="text-xs text-gray-500 hover:text-gray-700">
                  Limpiar
                </button>
              </div>
              {options.map((opt, index) => (
                <button
                  key={opt.id}
                  id={opt.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelectSuggestion(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                    index === activeIndex ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Save search to recent searches
export function saveRecentSearch(query: string) {
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    const recent = stored ? JSON.parse(stored) : []

    // Remove duplicates and add to beginning
    const filtered = recent.filter((q: string) => q !== query)
    const updated = [query, ...filtered].slice(0, 10) // Keep last 10

    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}
