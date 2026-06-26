import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'
import SocialButtons from '../components/SocialButtons'
import { analytics } from '../api/analytics'

export default function SignIn() {
  const { signIn } = useAuth()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/productos'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = () => window.location.replace(from)
  const handleError = (msg: string) => setError(msg)

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-gray-600">Ingresa con tu cuenta de usuario.</p>

      {/* Social buttons */}
      <div className="mt-6">
        <SocialButtons onSuccess={handleSuccess} onError={handleError} />
      </div>

      {/* Divider */}
      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 shrink-0 text-xs text-gray-400 font-medium uppercase tracking-wide">
          o ingresá con email
        </span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setIsSubmitting(true)
          try {
            await signIn(email, password)
            analytics.login('email')
            window.location.replace(from)
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
