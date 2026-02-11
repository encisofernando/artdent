import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as AuthAPI from '../api/auth'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Crear cuenta</h1>
      <p className="mt-2 text-sm text-gray-600">Alta vía <span className="font-semibold">/api/auth/register</span>.</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          if (password !== passwordConfirmation) {
            setError('La confirmación de contraseña no coincide.')
            return
          }
          setIsSubmitting(true)
          try {
            await AuthAPI.register({
              name,
              email,
              password,
              password_confirmation: passwordConfirmation
            })
            navigate('/iniciar-sesion')
          } catch (err: any) {
            setError(err?.response?.data?.message || 'No se pudo registrar.')
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <div>
          <label className="text-sm font-semibold">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2" required />
        </div>
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2" required />
        </div>
        <div>
          <label className="text-sm font-semibold">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2" required />
        </div>
        <div>
          <label className="text-sm font-semibold">Confirmar contraseña</label>
          <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2" required />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear cuenta'}
        </button>

        <p className="text-sm text-gray-600">
          ¿Ya tenés cuenta? <Link to="/iniciar-sesion" className="font-semibold text-[var(--brand-primary)]">Ingresá</Link>
        </p>
      </form>
    </div>
  )
}
