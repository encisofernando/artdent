import { http } from './http'

export type User = {
  id: number
  name: string
  email: string
  phone?: string | null
  dni?: string | null
  address?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  accepts_marketing?: boolean | null
  company_id?: number | null
  has_password?: boolean
}

export async function login(email: string, password: string): Promise<{ user: User }> {
  const { data } = await http.post('/auth/login', { email, password })
  return data
}

export async function socialLogin(
  provider: 'google' | 'facebook',
  accessToken: string,
): Promise<{ user: User }> {
  const { data } = await http.post('/auth/social-login', { provider, access_token: accessToken })
  return data
}

export async function register(payload: {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  dni?: string
  cuit?: string
  accepts_marketing?: boolean
}): Promise<{ user: User }> {
  const { data } = await http.post('/auth/register', payload)
  return data
}

export async function me(): Promise<User> {
  const { data } = await http.get('/auth/me')
  return data.user ?? data
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout')
}

export async function forgotPassword(email: string): Promise<any> {
  const { data } = await http.post('/auth/password/forgot', { email })
  return data
}

export async function resetPassword(payload: {
  token: string
  email: string
  password: string
  password_confirmation: string
}): Promise<any> {
  const { data } = await http.post('/auth/password/reset', payload)
  return data
}
