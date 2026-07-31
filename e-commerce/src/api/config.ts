import { http } from './http'

export type RemoteConfig = {
  company: {
    name: string | null
    fantasy_name: string | null
    logo_url: string | null
    email: string | null
    phone: string | null
    whatsapp: string | null
    address: string | null
    city: string | null
    province: string | null
    country: string | null
    website: string | null
  }
  analytics: {
    ga4_id: string | null
    meta_pixel_id: string | null
    hotjar_id: string | null
    gtm_id: string | null
  }
  payment: {
    mp_enabled: boolean
    mp_public_key: string | null
    mp_sandbox: boolean
  }
}

const CACHE_KEY = 'artdent_remote_config'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

type Cached = { ts: number; data: RemoteConfig }

export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const cached: Cached = JSON.parse(raw)
      if (Date.now() - cached.ts < CACHE_TTL) {
        return cached.data
      }
    }
  } catch { /* cache corrupta o inaccesible, se ignora y se pide de nuevo */ }

  try {
    const { data } = await http.get<RemoteConfig>('/config')
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
    } catch { /* localStorage lleno o deshabilitado, no es crítico */ }
    return data
  } catch {
    // Fallback silencioso: vacío para no bloquear el arranque
    return {
      company: { name: null, fantasy_name: null, logo_url: null, email: null, phone: null, whatsapp: null, address: null, city: null, province: null, country: null, website: null },
      analytics: { ga4_id: null, meta_pixel_id: null, hotjar_id: null, gtm_id: null },
      payment: { mp_enabled: false, mp_public_key: null, mp_sandbox: false },
    }
  }
}

export function clearConfigCache(): void {
  localStorage.removeItem(CACHE_KEY)
}
