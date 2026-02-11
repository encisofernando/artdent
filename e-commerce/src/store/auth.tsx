import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as AuthAPI from '../api/auth'

type AuthState = {
  user: AuthAPI.User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthAPI.User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  async function refreshMe() {
    const token = localStorage.getItem('artdent_token')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const me = await AuthAPI.me()
      setUser(me)
    } catch {
      localStorage.removeItem('artdent_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const { token } = await AuthAPI.login(email, password)
    localStorage.setItem('artdent_token', token)
    await refreshMe()
  }

  async function signOut() {
    try {
      await AuthAPI.logout()
    } finally {
      localStorage.removeItem('artdent_token')
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
