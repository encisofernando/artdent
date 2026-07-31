import { useState, useEffect, useRef } from 'react'
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

export default function AdvancedSearch({ onSearch, placeholder, autoFocus = false }: AdvancedSearchProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasRecent, setHasRecent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(query, 300)

  // Get search suggestions
  const suggestionsQuery = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  // Get popular searches - CORREGIDO
  const popularQuery = useQuery<PopularSearch[]>({
    queryKey: ['popular-searches'],
    queryFn: () => getPopularSearches(10),  // ← límite fijo (cámbialo según necesites)
  })

  // Detect if we have recent searches (to decide if dropdown should open).
  useEffect(() => {
    if (!isFocused || query) {
      setHasRecent(false)
      return
    }
    try {
      const stored = localStorage.getItem('artdent_recent_searches')
      const parsed = stored ? JSON.parse(stored) : []
      setHasRecent(Array.isArray(parsed) && parsed.length > 0)
    } catch {
      setHasRecent(false)
    }
  }, [isFocused, query])

  // Voice search
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

  // Datos seguros con fallback
  const suggestions = suggestionsQuery.data ?? []
  const popularSearches = popularQuery.data ?? []

  // NOTE: do NOT let this expression evaluate to a number (0), otherwise React will render a stray “0”.
  const hasSuggestions = debouncedQuery.length >= 2 && (suggestions.length > 0)
  const hasPopular = !query && (popularSearches.length > 0)
  const showDropdown = Boolean(isFocused && (hasSuggestions || hasPopular || (!query && hasRecent)))

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder || '¿Qué estas buscando?'}
            className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-24 text-sm outline-none transition focus:border-[var(--brand-primary)]"
            autoFocus={autoFocus}
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
          className="absolute top-full left-0 right-0 mt-2 card max-h-96 overflow-y-auto z-50"
        >
          {/* Suggestions from current query */}
          {debouncedQuery.length >= 2 && suggestions.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500">Sugerencias</p>
              {suggestions.map((item: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(item.suggestion || item.name)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <Search size={16} className="text-gray-500" />
                  <span>{item.suggestion || item.name}</span>
                  {item.count && (
                    <span className="ml-auto text-xs text-gray-500">
                      {item.count} resultados
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Popular searches when no query */}
          {!query && popularSearches.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 flex items-center gap-2">
                <TrendingUp size={14} />
                Búsquedas populares
              </p>
              {popularSearches.slice(0, 8).map((item: PopularSearch, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(item.query)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <TrendingUp size={16} className="text-[var(--brand-primary)]" />
                  <span>{item.query}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {item.search_count} búsquedas
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches from localStorage */}
          {!query && (
            <RecentSearches onSelect={handleSelectSuggestion} />
          )}
        </div>
      )}
    </div>
  )
}

// Recent searches component
function RecentSearches({ onSelect }: { onSelect: (query: string) => void }) {
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('artdent_recent_searches')
    if (stored) {
      try {
        setRecent(JSON.parse(stored))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  if (recent.length === 0) return null

  const clearRecent = () => {
    localStorage.removeItem('artdent_recent_searches')
    setRecent([])
  }

  return (
    <div className="border-t p-2">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-xs font-semibold text-gray-500 flex items-center gap-2">
          <Clock size={14} />
          Búsquedas recientes
        </p>
        <button
          onClick={clearRecent}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Limpiar
        </button>
      </div>
      {recent.slice(0, 5).map((item, index) => (
        <button
          key={index}
          onClick={() => onSelect(item)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          <Clock size={16} className="text-gray-500" />
          <span>{item}</span>
        </button>
      ))}
    </div>
  )
}

// Save search to recent searches
export function saveRecentSearch(query: string) {
  try {
    const stored = localStorage.getItem('artdent_recent_searches')
    const recent = stored ? JSON.parse(stored) : []
    
    // Remove duplicates and add to beginning
    const filtered = recent.filter((q: string) => q !== query)
    const updated = [query, ...filtered].slice(0, 10) // Keep last 10
    
    localStorage.setItem('artdent_recent_searches', JSON.stringify(updated))
  } catch (e) {
    // Ignore localStorage errors
  }
}