import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './auth'
import * as AuthAPI from '../api/auth'

vi.mock('../api/auth')

const fakeUser: AuthAPI.User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
}

function setup() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider })
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useAuth', () => {
  it('al montar pregunta /auth/me — si falla (sin cookie de sesión), user queda null', async () => {
    vi.mocked(AuthAPI.me).mockRejectedValue({ response: { status: 401 } })
    const { result } = setup()

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('si /auth/me responde bien (hay cookie de sesión válida), arranca autenticado', async () => {
    vi.mocked(AuthAPI.me).mockResolvedValue(fakeUser)
    const { result } = setup()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toEqual(fakeUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('signIn: no guarda ningún token — solo usa el user que devuelve login()', async () => {
    vi.mocked(AuthAPI.me).mockRejectedValue({ response: { status: 401 } })
    vi.mocked(AuthAPI.login).mockResolvedValue({ user: fakeUser })
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })

    expect(AuthAPI.login).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(result.current.user).toEqual(fakeUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('signUp: registra y deja logueado sin un segundo llamado a login (la sesión ya la abre el backend)', async () => {
    vi.mocked(AuthAPI.me).mockRejectedValue({ response: { status: 401 } })
    vi.mocked(AuthAPI.register).mockResolvedValue({ user: fakeUser })
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.signUp({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      })
    })

    expect(AuthAPI.register).toHaveBeenCalledTimes(1)
    expect(AuthAPI.login).not.toHaveBeenCalled()
    expect(result.current.user).toEqual(fakeUser)
  })

  it('signOut limpia el user aunque el logout del backend falle', async () => {
    vi.mocked(AuthAPI.me).mockResolvedValue(fakeUser)
    vi.mocked(AuthAPI.logout).mockRejectedValue(new Error('network error'))
    const { result } = setup()
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    await act(async () => {
      await result.current.signOut().catch(() => {})
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
