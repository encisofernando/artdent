import { http } from './http'

export type User = {
  id: number
  name: string
  email: string
  company_id?: number | null
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  const { data } = await http.post('/auth/login', { email, password })
  return data
}

export async function register(payload: { name: string; email: string; password: string; password_confirmation: string }): Promise<any> {
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

export async function createPassword(payload: { email: string; password: string; password_confirmation: string }): Promise<any> {
  const { data } = await http.post('/auth/create-password', payload)
  return data
}

export async function forgotPassword(email: string): Promise<any> {
  const { data } = await http.post('/auth/password/forgot', { email })
  return data
}
