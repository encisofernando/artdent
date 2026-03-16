import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-gray-600">
        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setStatus('sending')
          setMessage(null)
          try {
            const res = await forgotPassword(email)
            setStatus('sent')
            setMessage(res?.message || 'Si el email existe, se enviará un enlace de recuperación.')
          } catch (err: any) {
            setStatus('error')
            setMessage(err?.response?.data?.message || 'No se pudo enviar el email.')
          }
        }}
      >
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2"
            required
          />
        </div>

        {message ? (
          <div className={`rounded-xl border p-3 text-sm ${status === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>
            {message}
          </div>
        ) : null}

        <button className="btn btn-primary w-full" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando...' : 'Enviar'}
        </button>

        <p className="text-sm text-gray-600">
          <Link to="/iniciar-sesion" className="font-semibold text-[var(--brand-primary)]">Volver a iniciar sesión</Link>
        </p>
      </form>
    </div>
  )
}
