import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as AuthAPI from '../api/auth'

type AuthState = {
  user: AuthAPI.User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithSocial: (provider: 'google' | 'facebook', accessToken: string) => Promise<void>
  signUp: (payload: Parameters<typeof AuthAPI.register>[0]) => Promise<void>
  signOut: () => Promise<void>
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthAPI.User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // La sesión vive en una cookie httpOnly (ver api/http.ts) — no hay nada que
  // leer en localStorage, así que siempre se pregunta al backend.
  async function refreshMe() {
    try {
      const me = await AuthAPI.me()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const { user: loggedIn } = await AuthAPI.login(email, password)
    setUser(loggedIn)
  }

  async function signInWithSocial(provider: 'google' | 'facebook', accessToken: string) {
    const { user: loggedIn } = await AuthAPI.socialLogin(provider, accessToken)
    setUser(loggedIn)
  }

  async function signUp(payload: Parameters<typeof AuthAPI.register>[0]) {
    const { user: created } = await AuthAPI.register(payload)
    setUser(created)
  }

  async function signOut() {
    try {
      await AuthAPI.logout()
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthState>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signInWithSocial,
    signUp,
    signOut,
    refreshMe
  }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
