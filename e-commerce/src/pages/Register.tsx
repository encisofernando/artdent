import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { http } from '../api/http'
import SocialButtons from '../components/SocialButtons'
import { analytics } from '../api/analytics'

export default function Register() {
  const { signIn } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
    password: '',
    password_confirmation: '',
    accepts_marketing: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.password_confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      const cleanDoc = form.dni.replace(/\D/g, '')
      const isCuit = cleanDoc.length === 11

      await http.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        phone: form.phone || undefined,
        dni: !isCuit && cleanDoc ? cleanDoc : undefined,
        cuit: isCuit ? cleanDoc : undefined,
        accepts_marketing: form.accepts_marketing,
      })
      analytics.signup('email')
      await signIn(form.email, form.password)
      window.location.replace('/mi-cuenta')
    } catch (err: any) {
      const msg = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err?.response?.data?.message || 'No se pudo crear la cuenta.'
      setError(String(msg))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20'
  const labelCls = 'block text-sm font-semibold text-gray-700'

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
      <p className="mt-1 text-sm text-gray-500">Completá tus datos para registrarte en ArtDent.</p>

      {/* Social buttons */}
      <div className="mt-6">
        <SocialButtons
          onSuccess={() => window.location.replace('/mi-cuenta')}
          onError={(msg) => setError(msg)}
        />
      </div>

      {/* Divider */}
      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 shrink-0 text-xs text-gray-400 font-medium uppercase tracking-wide">
          o registrate con email
        </span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className={labelCls}>Nombre completo *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)}
            className={inputCls} placeholder="Tu nombre y apellido" required />
        </div>

        <div>
          <label className={labelCls}>Email *</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
            className={inputCls} placeholder="tu@email.com" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Teléfono</label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
              className={inputCls} placeholder="+54 9 11..." />
          </div>
          <div>
            <label className={labelCls}>DNI / CUIT</label>
            <input value={form.dni} onChange={(e) => set('dni', e.target.value)}
              className={inputCls} placeholder="20123456789" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Contraseña *</label>
          <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
            className={inputCls} placeholder="Mínimo 8 caracteres" required minLength={8} />
        </div>

        <div>
          <label className={labelCls}>Confirmar contraseña *</label>
          <input type="password" value={form.password_confirmation}
            onChange={(e) => set('password_confirmation', e.target.value)}
            className={inputCls} placeholder="Repetí tu contraseña" required />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.accepts_marketing}
            onChange={(e) => set('accepts_marketing', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--brand-primary)]" />
          <span className="text-sm text-gray-600">
            Quiero recibir novedades, ofertas y promociones de ArtDent.
          </span>
        </label>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <button className="btn btn-primary w-full py-3" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/iniciar-sesion" className="font-semibold text-[var(--brand-primary)]">Ingresá</Link>
        </p>
      </form>
    </div>
  )
}
