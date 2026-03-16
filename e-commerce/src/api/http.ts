import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

/** Origen del backend (sin /api), para construir URLs de storage */
export const backendOrigin = baseURL.replace(/\/api\/?$/, '')

export const http = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('artdent_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      // Token inválido/expirado
      localStorage.removeItem('artdent_token')
    }
    return Promise.reject(err)
  }
)

/**
 * Convierte una ruta relativa de storage (/storage/...) en URL absoluta
 * del backend. Si ya es absoluta (http/https) la devuelve sin cambios.
 */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return backendOrigin + path
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
