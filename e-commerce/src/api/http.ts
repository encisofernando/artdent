import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

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

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
