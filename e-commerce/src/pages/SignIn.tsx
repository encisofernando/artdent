import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/productos'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-gray-600">Ingresa con tu cuenta de usuario.</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setIsSubmitting(true)
          try {
            await signIn(email, password)
            navigate(from, { replace: true })
          } catch (err: any) {
            setError(err?.response?.data?.message || 'Correo o contraseña incorrectos.')
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <div>
          <label className="text-sm font-semibold">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2"
            required
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/recuperar" className="font-semibold text-[var(--brand-primary)]">¿Olvidaste tu contraseña?</Link>
          <Link to="/registrarme" className="font-semibold text-[var(--brand-primary)]">Creá tu cuenta</Link>
        </div>
      </form>
    </div>
  )
}
