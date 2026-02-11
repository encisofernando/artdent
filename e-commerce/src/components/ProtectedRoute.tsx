import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-sm text-gray-500">
        Cargando...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace state={{ from: location }} />
  }

  return <>{children}</>
}
