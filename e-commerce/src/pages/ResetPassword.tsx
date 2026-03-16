import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { http } from '../api/http'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const inputCls = 'mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20'
  const labelCls = 'block text-sm font-semibold text-gray-700'

  if (!token || !email) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-sm text-red-600 font-semibold">Enlace inválido o expirado.</p>
        <Link to="/recuperar" className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      setMessage('Las contraseñas no coinciden.')
      setStatus('error')
      return
    }
    setStatus('submitting')
    setMessage(null)
    try {
      await http.post('/auth/password/reset', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setStatus('success')
      setMessage('¡Contraseña actualizada! Redirigiendo...')
      setTimeout(() => navigate('/iniciar-sesion'), 2000)
    } catch (err: any) {
      setStatus('error')
      setMessage(
        err?.response?.data?.errors?.token?.[0] ||
        err?.response?.data?.message ||
        'No se pudo restablecer la contraseña.'
      )
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
      <p className="mt-1 text-sm text-gray-500">Ingresá tu nueva contraseña para <strong>{email}</strong>.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className={labelCls}>Nueva contraseña *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className={labelCls}>Confirmar contraseña *</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className={inputCls}
            placeholder="Repetí tu contraseña"
            required
          />
        </div>

        {message && (
          <div className={`rounded-xl border p-3 text-sm ${status === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting' || status === 'success'}
          className="btn btn-primary w-full py-3"
        >
          {status === 'submitting' ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>

        <p className="text-center text-sm text-gray-600">
          <Link to="/iniciar-sesion" className="font-semibold text-[var(--brand-primary)]">
            Volver a iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
