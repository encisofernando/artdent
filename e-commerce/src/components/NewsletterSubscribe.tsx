import { useState } from 'react'
import { Mail, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { subscribeNewsletter } from '../api/newsletter'

interface NewsletterSubscribeProps {
  variant?: 'inline' | 'modal' | 'footer'
  className?: string
}

export default function NewsletterSubscribe({ 
  variant = 'footer',
  className = '' 
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const subscribeMutation = useMutation({
    mutationFn: (data: { email: string; name?: string }) => subscribeNewsletter(data),
    onSuccess: () => {
      setIsSuccess(true)
      setEmail('')
      setName('')
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    subscribeMutation.mutate({
      email: email.trim(),
      name: name.trim() || undefined,
    })
  }

  // Inline variant (compact, for sidebars)
  if (variant === 'inline') {
    return (
      <div className={`rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-blue-600 p-6 text-white ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-white/20 p-2">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-bold">Newsletter</h3>
            <p className="text-xs opacity-90">Ofertas exclusivas</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="rounded-xl bg-white/20 p-4 text-center">
            <Check size={24} className="mx-auto mb-2" />
            <p className="text-sm font-semibold">¡Suscrito con éxito!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border-0 bg-white/20 px-4 py-2 text-sm text-white placeholder-white/70 outline-none backdrop-blur-sm focus:bg-white/30"
              required
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-gray-100 disabled:opacity-50"
            >
              {subscribeMutation.isPending ? 'Suscribiendo...' : 'Suscribirse'}
            </button>
          </form>
        )}

        {subscribeMutation.isError && (
          <p className="mt-2 text-xs text-red-200">
            {(subscribeMutation.error as any)?.response?.data?.message || 'Error al suscribirse'}
          </p>
        )}
      </div>
    )
  }

  // Modal variant (full featured)
  if (variant === 'modal') {
    return (
      <div className={`card max-w-lg mx-auto p-8 ${className}`}>
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 grid place-items-center mb-4">
            <Mail size={32} className="text-[var(--brand-primary)]" />
          </div>
          <h2 className="text-2xl font-bold">Únete a nuestro Newsletter</h2>
          <p className="mt-2 text-gray-600">
            Recibe ofertas exclusivas, novedades y promociones especiales
          </p>
        </div>

        {isSuccess ? (
          <div className="rounded-xl bg-green-50 border-2 border-green-500 p-6 text-center">
            <Check size={48} className="mx-auto mb-3 text-green-600" />
            <h3 className="text-xl font-bold text-green-900 mb-2">
              ¡Bienvenido a ARTDENT!
            </h3>
            <p className="text-green-700">
              Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="w-full btn btn-primary"
            >
              {subscribeMutation.isPending ? 'Suscribiendo...' : 'Suscribirse al Newsletter'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Al suscribirte, aceptas recibir emails promocionales de ARTDENT.
              Puedes darte de baja en cualquier momento.
            </p>
          </form>
        )}

        {subscribeMutation.isError && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              {(subscribeMutation.error as any)?.response?.data?.message || 
               'Hubo un error al suscribirte. Por favor, intenta de nuevo.'}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Footer variant (default)
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Mail size={20} className="text-[var(--brand-primary)]" />
        <h3 className="font-bold text-lg">Newsletter</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Suscríbete para recibir ofertas exclusivas y novedades
      </p>

      {isSuccess ? (
        <div className="rounded-xl bg-green-50 border-2 border-green-500 p-4 flex items-center gap-3">
          <Check size={20} className="text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-900">
            ¡Gracias por suscribirte!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="flex-1 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            required
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="rounded-xl bg-[var(--brand-primary)] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {subscribeMutation.isPending ? '...' : 'Suscribirse'}
          </button>
        </form>
      )}

      {subscribeMutation.isError && (
        <p className="mt-2 text-xs text-red-600">
          {(subscribeMutation.error as any)?.response?.data?.message || 'Error al suscribirse'}
        </p>
      )}
    </div>
  )
}
