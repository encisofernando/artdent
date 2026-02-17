import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * Útil para búsquedas en tiempo real y evitar llamadas excesivas a la API
 * 
 * @param value - Valor a hacer debounce
 * @param delay - Delay en milisegundos (default: 300ms)
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
