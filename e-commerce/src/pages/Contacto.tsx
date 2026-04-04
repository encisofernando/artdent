import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import SEOHead from '../components/SEOHead'

type FormData = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export default function Contacto() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Información de contacto de la empresa
  const contactInfo = {
    phone: '+54 3704-995406',
    email: 'ventas@artdent.com.ar',
    address: 'B° Sagrado Corazon Mz 40 Casa 2, Formosa Capital, Formosa, Argentina',
    hours: 'Lunes a Viernes: 8:00 - 14:00 hs',
    whatsapp: '+54 9 3704-995406',
  }

  // Coordenadas para el mapa (ejemplo: CABA)
  const mapLocation = {
    lat: -26.197791696237534,
    lng: -58.23693887447022,
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.9605928160313!2d-58.239524523803354!3d-26.197960163721365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x945caf0000251e81%3A0xab3ee68d381c52c8!2sArtDent%20FORMOSA!5e0!3m2!1ses-419!2sar!4v1771263678879!5m2!1ses-419!2sar',
  }

  const contactStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto ArtDent',
    description:
      'Canales de contacto comercial y soporte de ArtDent para compras, stock, envíos, devoluciones y atención al cliente.',
    url: 'https://shop.artdent.com.ar/contacto',
    mainEntity: {
      '@type': 'Organization',
      name: 'ArtDent',
      email: contactInfo.email,
      telephone: contactInfo.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'B° Sagrado Corazon Mz 40 Casa 2',
        addressLocality: 'Formosa Capital',
        addressRegion: 'Formosa',
        addressCountry: 'AR',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: contactInfo.email,
        telephone: contactInfo.phone,
        areaServed: 'AR',
        availableLanguage: 'es',
      },
    },
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error del campo al editar
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es obligatorio'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setStatus('loading')

    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // Simulación de envío
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })

      // Resetear estado después de 5 segundos
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      console.error('Error al enviar formulario:', error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <>
      <SEOHead
        title="Contacto comercial y soporte"
        description="Contactate con ArtDent para recibir asesoramiento comercial, soporte de pedidos, consultas de stock y atención postventa en insumos odontológicos."
        keywords={[
          'contacto artdent',
          'soporte artdent',
          'insumos odontológicos formosa',
          'whatsapp artdent',
          'atención al cliente odontología',
        ]}
        url="/contacto"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Contacto', url: '/contacto' },
        ]}
        structuredData={contactStructuredData}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero section */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold md:text-4xl">Contacto</h1>
            <p className="mt-2 text-base text-white/90">
              Estamos aquí para ayudarte. Envianos tu consulta y te responderemos a la brevedad.
            </p>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Formulario de contacto */}
            <div className="card p-5 md:p-6">
              <h2 className="text-xl font-bold text-gray-900">Envianos tu consulta</h2>
              <p className="mt-1 text-sm text-gray-600">
                Completá el formulario y nos pondremos en contacto contigo
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input mt-1 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Juan Pérez"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email y Teléfono */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input mt-1 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="juan@ejemplo.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input mt-1 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="+54 11 XXXX-XXXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label htmlFor="subject" className="block text-xs font-medium text-gray-700">
                    Asunto <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`input mt-1 ${errors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Seleccionar asunto</option>
                    <option value="consulta-producto">Consulta sobre producto</option>
                    <option value="cotizacion">Solicitud de cotización</option>
                    <option value="pedido">Estado de pedido</option>
                    <option value="facturacion">Facturación</option>
                    <option value="soporte-tecnico">Soporte técnico</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Mensaje */}
                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-gray-700">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={`input mt-1 resize-none ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Escribí tu consulta..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 10 caracteres
                  </p>
                </div>

                {/* Botón de envío */}
                <div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn btn-primary w-full"
                  >
                    {status === 'loading' ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar consulta
                      </>
                    )}
                  </button>
                </div>

                {/* Mensajes de estado */}
                {status === 'success' && (
                  <div className="rounded-lg bg-green-50 p-3 flex items-start gap-2 border border-green-200">
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">¡Mensaje enviado con éxito!</p>
                      <p className="mt-0.5 text-xs text-green-700">
                        Gracias por contactarnos. Te responderemos a la brevedad.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="rounded-lg bg-red-50 p-3 flex items-start gap-2 border border-red-200">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Error al enviar el mensaje</p>
                      <p className="mt-0.5 text-xs text-red-700">
                        Por favor, intentá nuevamente o contactanos por teléfono.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Información de contacto y mapa */}
            <div className="space-y-6">
              {/* Datos de contacto */}
              <div className="card p-5 md:p-6">
                <h2 className="text-xl font-bold text-gray-900">Información de contacto</h2>
                <p className="mt-1 text-sm text-gray-600">
                  También podés contactarnos por estos medios
                </p>

                <div className="mt-5 space-y-4">
                  {/* Teléfono */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 flex-shrink-0">
                      <Phone size={18} className="text-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Teléfono</p>
                      <a
                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                        className="mt-0.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] transition"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                      <Phone size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">WhatsApp</p>
                      <a
                        href={`https://wa.me/${contactInfo.whatsapp.replace(/[\s+-]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 text-sm text-gray-600 hover:text-green-600 transition"
                      >
                        {contactInfo.whatsapp}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 flex-shrink-0">
                      <Mail size={18} className="text-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="mt-0.5 text-sm text-gray-600 hover:text-[var(--brand-primary)] transition"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 flex-shrink-0">
                      <MapPin size={18} className="text-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Dirección</p>
                      <p className="mt-0.5 text-sm text-gray-600">{contactInfo.address}</p>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 flex-shrink-0">
                      <Clock size={18} className="text-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Horarios de atención</p>
                      <p className="mt-0.5 text-sm text-gray-600">{contactInfo.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div className="card overflow-hidden p-0">
                <div className="bg-[var(--brand-primary)] px-5 py-3">
                  <h3 className="text-sm font-semibold text-white">Nuestra ubicación</h3>
                </div>
                <div className="relative h-[250px] md:h-[300px]">
                  <iframe
                    src={mapLocation.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de ArtDent"
                    className="grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t">
                  <p className="text-xs text-gray-600">
                    <MapPin size={12} className="inline mr-1" />
                    {contactInfo.address}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapLocation.lat},${mapLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-semibold text-[var(--brand-primary)] hover:opacity-80 transition"
                  >
                    Ver en Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección adicional */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">¿Tenés dudas?</h2>
            <p className="mt-1 text-sm text-gray-600">
              Consultá nuestro centro de ayuda o comunicate directamente con nosotros
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a href="/ayuda" className="btn btn-outline">
                Centro de ayuda
              </a>
              <a href="/preguntas-frecuentes" className="btn btn-outline">
                Preguntas frecuentes
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
