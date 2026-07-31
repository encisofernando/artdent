import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const usesLocalTunnel = /\.loca\.lt(\/|$)/i.test(baseURL)

/** Origen del backend (sin /api), para construir URLs de storage */
export const backendOrigin = baseURL.replace(/\/api\/?$/, '')

export const http = axios.create({
  baseURL,
  // La sesión de customer viaja en una cookie httpOnly (Sanctum SPA), no en
  // localStorage — withCredentials envía/recibe esa cookie en cada request,
  // withXSRFToken hace que axios adjunte el header X-XSRF-TOKEN aunque el
  // backend esté en otro subdominio (shop.artdent.com.ar → pos.artdent.com.ar).
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept': 'application/json',
    ...(usesLocalTunnel ? { 'bypass-tunnel-reminder': 'true' } : {}),
  }
})

/**
 * Pide la cookie CSRF (XSRF-TOKEN) al backend — hay que llamarla antes del
 * primer request que mute estado (login, register, checkout, etc.) para que
 * Sanctum acepte la sesión. Laravel renueva esa cookie en cada respuesta
 * mientras la sesión está activa, así que alcanza con pedirla una vez al
 * arrancar la app.
 */
export function ensureCsrfCookie(): Promise<unknown> {
  return axios.get(`${backendOrigin}/sanctum/csrf-cookie`, { withCredentials: true })
}

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
