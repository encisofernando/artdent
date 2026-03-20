import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RotateCcw,
  Shield,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
  Clock,
  Package,
  Truck,
  CreditCard,
  FileText,
} from 'lucide-react'

const EMPRESA = {
  email: 'ventas@artdent.com.ar',
  whatsapp: '5493704995406',
  telefono: '+54 3704-995406',
  horarios: 'Lunes a Viernes de 8:00 a 14:00 hs',
}

type Motivo = 'arrepentimiento' | 'defecto' | 'error-envio' | 'producto-incorrecto' | 'otro'
type FormStatus = 'idle' | 'loading' | 'success' | 'error'

type FormData = {
  nombre: string
  email: string
  telefono: string
  orden: string
  motivo: Motivo | ''
  producto: string
  descripcion: string
  preferencia: 'reembolso' | 'cambio' | ''
}

const MOTIVOS: { value: Motivo; label: string }[] = [
  { value: 'arrepentimiento', label: 'Ejercicio del derecho de arrepentimiento (Art. 34 Ley 24.240)' },
  { value: 'defecto', label: 'Producto con defecto o falla de fabricación' },
  { value: 'error-envio', label: 'Error en el envío (me llegó algo distinto a lo pedido)' },
  { value: 'producto-incorrecto', label: 'Producto incorrecto o no coincide con la descripción' },
  { value: 'otro', label: 'Otro motivo' },
]

function StepCard({ num, title, desc, icon: Icon }: { num: string; title: string; desc: string; icon: React.ElementType }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-extrabold">
          {num}
        </div>
        <div className="w-px flex-1 bg-gray-200 mt-2" />
      </div>
      <div className="pb-6 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={16} className="text-[var(--brand-primary)] shrink-0" />
          <p className="font-semibold text-gray-900">{title}</p>
        </div>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  )
}

export default function Devoluciones() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    orden: '',
    motivo: '',
    producto: '',
    descripcion: '',
    preferencia: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!formData.nombre.trim()) e.nombre = 'Requerido'
    if (!formData.email.trim()) e.email = 'Requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido'
    if (!formData.orden.trim()) e.orden = 'Requerido'
    if (!formData.motivo) e.motivo = 'Seleccioná un motivo'
    if (!formData.producto.trim()) e.producto = 'Requerido'
    if (!formData.descripcion.trim()) e.descripcion = 'Requerido'
    if (!formData.preferencia) e.preferencia = 'Seleccioná una preferencia'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    try {
      // Armar email con los datos del formulario
      const subject = encodeURIComponent(`Solicitud de devolución – Pedido ${formData.orden}`)
      const body = encodeURIComponent(
        `Nombre: ${formData.nombre}\n` +
        `Email: ${formData.email}\n` +
        `Teléfono: ${formData.telefono || '—'}\n` +
        `Nº de pedido: ${formData.orden}\n` +
        `Producto/s: ${formData.producto}\n` +
        `Motivo: ${MOTIVOS.find((m) => m.value === formData.motivo)?.label ?? formData.motivo}\n` +
        `Preferencia: ${formData.preferencia === 'reembolso' ? 'Reembolso del importe' : 'Cambio por otro producto'}\n\n` +
        `Descripción:\n${formData.descripcion}`
      )
      window.location.href = `mailto:${EMPRESA.email}?subject=${subject}&body=${body}`
      // Dar tiempo a que abra el cliente de correo antes de mostrar éxito
      await new Promise((r) => setTimeout(r, 800))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <RotateCcw size={15} />
              Ley 24.240 — Defensa del Consumidor
            </div>
            <h1 className="text-2xl font-bold md:text-4xl">Devoluciones y Cambios</h1>
            <p className="mt-3 text-base text-white/90 max-w-xl mx-auto">
              Conocé nuestra política de devoluciones y completá el formulario para iniciar tu solicitud. Te responderemos dentro de las 48 hs hábiles.
            </p>
          </div>
        </div>
      </section>

      {/* Índice rápido */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 overflow-x-auto">
          <nav className="flex items-center gap-1 text-xs font-medium text-gray-600 whitespace-nowrap">
            {[
              { href: '#politica', label: 'Política de devoluciones' },
              { href: '#plazo', label: 'Plazos y condiciones' },
              { href: '#proceso', label: 'Proceso paso a paso' },
              { href: '#formulario', label: 'Solicitar devolución' },
            ].map((item) => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition">
                <ChevronRight size={12} />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6 min-w-0 overflow-hidden">

            {/* Política general */}
            <section id="politica" className="card p-5 md:p-7 scroll-mt-24">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
                  <FileText size={20} className="text-[var(--brand-primary)]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">Política de devoluciones</h2>
              </div>
              <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                <p>
                  En ArtDent aceptamos devoluciones y cambios en los siguientes casos, siempre respetando los derechos establecidos por la <strong>Ley 24.240 de Defensa del Consumidor</strong>:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    {
                      icon: RotateCcw,
                      titulo: 'Derecho de arrepentimiento',
                      desc: 'Hasta 10 días hábiles desde la recepción del producto, sin necesidad de expresar causa (Art. 34 Ley 24.240).',
                      color: 'border-amber-200 bg-amber-50',
                      iconColor: 'text-amber-600',
                    },
                    {
                      icon: Shield,
                      titulo: 'Garantía legal',
                      desc: 'Hasta 6 meses para productos nuevos y 3 meses para usados por defectos o vicios de fabricación (Art. 11 Ley 24.240).',
                      color: 'border-blue-200 bg-blue-50',
                      iconColor: 'text-blue-600',
                    },
                    {
                      icon: Package,
                      titulo: 'Error en el pedido',
                      desc: 'Si recibiste un producto diferente al que compraste, gestionamos el cambio sin cargo.',
                      color: 'border-green-200 bg-green-50',
                      iconColor: 'text-green-600',
                    },
                    {
                      icon: Truck,
                      titulo: 'Producto dañado en el envío',
                      desc: 'Si el producto llegó con daños visibles del transporte, documentalos con fotos y contactanos dentro de las 48 hs de recibido.',
                      color: 'border-purple-200 bg-purple-50',
                      iconColor: 'text-purple-600',
                    },
                  ].map((item) => (
                    <div key={item.titulo} className={`rounded-xl border p-4 ${item.color}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <item.icon size={16} className={item.iconColor} />
                        <p className="font-semibold text-gray-900">{item.titulo}</p>
                      </div>
                      <p className="text-gray-700">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Plazos y condiciones */}
            <section id="plazo" className="card p-5 md:p-7 scroll-mt-24">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
                  <Clock size={20} className="text-[var(--brand-primary)]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">Plazos y condiciones</h2>
              </div>
              <div className="text-sm text-gray-700 space-y-4 leading-relaxed">

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-[640px] text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Caso</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Plazo para solicitar</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Costo de envío devolución</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Reembolso en</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { caso: 'Arrepentimiento', plazo: '10 días hábiles desde recepción', costo: 'A cargo del cliente (salvo defecto)', reembolso: '10 días hábiles' },
                        { caso: 'Defecto / garantía', plazo: '6 meses (prod. nuevo) · 3 meses (usado)', costo: 'A cargo de ArtDent', reembolso: '10 días hábiles' },
                        { caso: 'Error en el envío', plazo: '48 hs desde recepción', costo: 'A cargo de ArtDent', reembolso: 'Al confirmar el error' },
                        { caso: 'Daño en transporte', plazo: '48 hs desde recepción', costo: 'A cargo de ArtDent', reembolso: 'Tras verificación' },
                      ].map((row, i) => (
                        <tr key={row.caso} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900">{row.caso}</td>
                          <td className="px-4 py-3 border-b border-gray-100 text-gray-600">{row.plazo}</td>
                          <td className="px-4 py-3 border-b border-gray-100 text-gray-600">{row.costo}</td>
                          <td className="px-4 py-3 border-b border-gray-100 text-gray-600">{row.reembolso}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 mb-2">Condiciones del producto a devolver</p>
                  <ul className="space-y-1.5 ml-1">
                    {[
                      { ok: true, text: 'Producto en su embalaje original o equivalente que lo proteja.' },
                      { ok: true, text: 'Con todos sus accesorios, manuales y elementos incluidos originalmente.' },
                      { ok: true, text: 'Sin signos de uso indebido (aplica para arrepentimiento).' },
                      { ok: false, text: 'Productos perecederos, medicamentos o materiales de uso clínico abiertos.' },
                      { ok: false, text: 'Productos personalizados o fabricados bajo pedido especial.' },
                      { ok: false, text: 'Productos cuyo precinto de higiene haya sido retirado.' },
                    ].map((item) => (
                      <li key={item.text} className="flex items-start gap-2">
                        {item.ok
                          ? <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />
                          : <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                        }
                        <span className={item.ok ? 'text-gray-700' : 'text-gray-500'}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <CreditCard size={15} />
                    Reembolsos
                  </p>
                  <p className="text-blue-800">
                    Los reembolsos se acreditan por el mismo medio de pago utilizado en la compra. Para pagos con tarjeta de crédito, el tiempo de acreditación depende del banco emisor (generalmente 1 a 2 ciclos de facturación). Para MercadoPago, el saldo se acredita en tu cuenta dentro de los 10 días hábiles.
                  </p>
                </div>
              </div>
            </section>

            {/* Proceso */}
            <section id="proceso" className="card p-5 md:p-7 scroll-mt-24">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
                  <CheckCircle2 size={20} className="text-[var(--brand-primary)]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-1.5">Proceso paso a paso</h2>
              </div>
              <div>
                <StepCard num="1" icon={FileText} title="Completá el formulario"
                  desc="Llenás el formulario de más abajo o nos escribís por WhatsApp / email con tu número de pedido y el motivo de la devolución." />
                <StepCard num="2" icon={Clock} title="Evaluamos tu solicitud"
                  desc="Dentro de las 48 hs hábiles te confirmamos la aprobación y te enviamos las instrucciones de envío o retiro del producto." />
                <StepCard num="3" icon={Truck} title="Enviás o retiramos el producto"
                  desc="Si el costo de envío es nuestro, coordinamos el retiro a domicilio. Si es a cargo tuyo, te indicamos el destino exacto al que enviarlo." />
                <StepCard num="4" icon={Package} title="Inspeccionamos el producto"
                  desc="Al recibirlo, verificamos que se encuentre en las condiciones acordadas. Te notificamos el resultado dentro de las 48 hs." />
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-sm font-extrabold">
                    ✓
                  </div>
                  <div className="pb-2">
                    <p className="font-semibold text-gray-900 mb-1">Reembolso o cambio</p>
                    <p className="text-sm text-gray-600">Procesamos el reembolso o enviamos el producto de cambio dentro de los plazos indicados.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Formulario */}
            <section id="formulario" className="card p-5 md:p-7 scroll-mt-24">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
                  <Send size={20} className="text-[var(--brand-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mt-1.5">Solicitar devolución o cambio</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Completá todos los campos. Te responderemos dentro de las 48 hs hábiles.</p>
                </div>
              </div>

              {status === 'success' ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                  <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
                  <p className="font-bold text-green-900 text-lg">¡Solicitud enviada!</p>
                  <p className="text-green-800 text-sm mt-1">
                    Se abrió tu cliente de correo con los datos precargados. Si no se abrió automáticamente, escribinos directamente a{' '}
                    <a href={`mailto:${EMPRESA.email}`} className="underline font-semibold">{EMPRESA.email}</a>.
                  </p>
                  <button
                    onClick={() => { setStatus('idle'); setFormData({ nombre: '', email: '', telefono: '', orden: '', motivo: '', producto: '', descripcion: '', preferencia: '' }) }}
                    className="mt-4 btn btn-outline"
                  >
                    Nueva solicitud
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Datos personales */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input name="nombre" type="text" value={formData.nombre} onChange={handleChange}
                        placeholder="Juan Pérez"
                        className={`input ${errors.nombre ? 'border-red-400' : ''}`} />
                      {errors.nombre && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.nombre}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange}
                        placeholder="juan@ejemplo.com"
                        className={`input ${errors.email ? 'border-red-400' : ''}`} />
                      {errors.email && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                      <input name="telefono" type="tel" value={formData.telefono} onChange={handleChange}
                        placeholder="+54 11 XXXX-XXXX" className="input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Número de pedido <span className="text-red-500">*</span>
                      </label>
                      <input name="orden" type="text" value={formData.orden} onChange={handleChange}
                        placeholder="ORD-00001"
                        className={`input font-mono ${errors.orden ? 'border-red-400' : ''}`} />
                      {errors.orden && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.orden}</p>}
                    </div>
                  </div>

                  {/* Producto */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Producto/s a devolver <span className="text-red-500">*</span>
                    </label>
                    <input name="producto" type="text" value={formData.producto} onChange={handleChange}
                      placeholder="Ej: Resina Compuesta A2 × 1"
                      className={`input ${errors.producto ? 'border-red-400' : ''}`} />
                    {errors.producto && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.producto}</p>}
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Motivo de la devolución <span className="text-red-500">*</span>
                    </label>
                    <select name="motivo" value={formData.motivo} onChange={handleChange}
                      className={`input ${errors.motivo ? 'border-red-400' : ''}`}>
                      <option value="">Seleccionar motivo...</option>
                      {MOTIVOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    {errors.motivo && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.motivo}</p>}
                  </div>

                  {/* Preferencia */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      ¿Qué preferís? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { value: 'reembolso', label: 'Reembolso del importe', icon: CreditCard },
                        { value: 'cambio', label: 'Cambio por otro producto', icon: RotateCcw },
                      ].map((opt) => (
                        <label key={opt.value}
                          className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition ${
                            formData.preferencia === opt.value
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <input type="radio" name="preferencia" value={opt.value}
                            checked={formData.preferencia === opt.value}
                            onChange={handleChange} className="sr-only" />
                          <opt.icon size={18} className={formData.preferencia === opt.value ? 'text-[var(--brand-primary)]' : 'text-gray-400'} />
                          <span className={`font-medium text-sm ${formData.preferencia === opt.value ? 'text-[var(--brand-primary)]' : 'text-gray-700'}`}>
                            {opt.label}
                          </span>
                          {formData.preferencia === opt.value && (
                            <CheckCircle2 size={16} className="text-[var(--brand-primary)] ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.preferencia && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.preferencia}</p>}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Descripción del problema <span className="text-red-500">*</span>
                    </label>
                    <textarea name="descripcion" rows={4} value={formData.descripcion} onChange={handleChange}
                      placeholder="Describí con detalle el motivo de la devolución. Si hay un defecto, indicá cómo se manifiesta. Si podés adjuntar fotos, mencionalas aquí y las envías por email luego de completar el formulario."
                      className={`input resize-none ${errors.descripcion ? 'border-red-400' : ''}`} />
                    {errors.descripcion && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.descripcion}</p>}
                  </div>

                  <p className="text-xs text-gray-500">
                    Al enviar este formulario se abrirá tu cliente de correo con los datos precargados para que puedas adjuntar fotos si es necesario.
                  </p>

                  <button type="submit" disabled={status === 'loading'}
                    className="btn btn-primary w-full py-3 text-base font-bold">
                    {status === 'loading' ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Procesando...</>
                    ) : (
                      <><Send size={18} />Enviar solicitud</>
                    )}
                  </button>

                  {status === 'error' && (
                    <div className="rounded-lg bg-red-50 p-3 flex items-start gap-2 border border-red-200">
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">Ocurrió un error. Escribinos directamente a <a href={`mailto:${EMPRESA.email}`} className="underline">{EMPRESA.email}</a>.</p>
                    </div>
                  )}
                </form>
              )}
            </section>

          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-4">

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Contacto directo</h3>
              <p className="text-sm text-gray-600 mb-3">Si preferís, podés iniciar tu solicitud directamente:</p>
              <a href={`https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent('Hola, quiero iniciar una devolución. Pedido N°: ')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 transition mb-2">
                <svg viewBox="0 0 32 32" width="18" height="18" fill="white"><path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.627 4.64 1.813 6.667L2.667 29.333l6.88-1.786A13.28 13.28 0 0 0 16.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 2.4c6.04 0 10.929 4.889 10.929 10.933 0 6.04-4.889 10.933-10.93 10.933a10.888 10.888 0 0 1-5.546-1.52l-.4-.24-4.08 1.067 1.093-3.973-.267-.413A10.87 10.87 0 0 1 5.075 16c0-6.04 4.889-10.933 10.929-10.933zm-3.2 5.466c-.267 0-.693.107-.96.373-.267.267-1.013 1-1.013 2.453s1.04 2.84 1.187 3.04c.16.2 2.027 3.147 4.96 4.293 2.453.96 2.947.773 3.48.72.533-.053 1.707-.693 1.947-1.36.24-.667.24-1.24.16-1.36-.08-.12-.267-.2-.56-.347s-1.707-.84-1.973-.933c-.267-.107-.467-.16-.667.16-.2.32-.76.933-.933 1.12-.173.2-.347.213-.64.08-.293-.133-1.24-.453-2.36-1.453-.88-.773-1.467-1.733-1.64-2.027-.173-.293-.013-.453.133-.6.133-.133.293-.347.44-.52.147-.173.2-.293.293-.493.107-.2.053-.373-.013-.52-.067-.147-.64-1.573-.88-2.147-.24-.573-.48-.48-.667-.48l-.56-.013z" /></svg>
                WhatsApp
              </a>
              <a href={`mailto:${EMPRESA.email}?subject=${encodeURIComponent('Solicitud de devolución – Pedido N°')}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm px-4 py-2.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition">
                {EMPRESA.email}
              </a>
              <p className="text-xs text-gray-500 mt-2 text-center">{EMPRESA.horarios}</p>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Plazo de arrepentimiento</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Tenés <strong>10 días hábiles</strong> desde la recepción del producto para ejercer tu derecho de arrepentimiento sin dar explicaciones (Art. 34 Ley 24.240).
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Marco legal</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                {[
                  { ley: 'Art. 34 Ley 24.240', desc: 'Derecho de arrepentimiento' },
                  { ley: 'Art. 11 Ley 24.240', desc: 'Garantía legal' },
                  { ley: 'Ley 27.250', desc: 'Garantía 6 meses' },
                  { ley: 'Res. SC 424/2020', desc: 'Botón de arrepentimiento' },
                ].map((item) => (
                  <li key={item.ley} className="flex justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-[var(--brand-primary)] whitespace-nowrap">{item.ley}</span>
                    <span className="text-gray-600 text-right">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Ver también</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { to: '/defensa-consumidor', label: 'Defensa del consumidor' },
                  { to: '/terminos', label: 'Términos y condiciones' },
                  { to: '/contacto', label: 'Contacto' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="flex items-center gap-1.5 text-gray-700 hover:text-[var(--brand-primary)] transition">
                      <ChevronRight size={14} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-gray-500">
          <p>Política de devoluciones sujeta a la <strong>Ley 24.240</strong> de Defensa del Consumidor de la República Argentina. Última actualización: marzo de 2026.</p>
        </div>
      </div>
    </div>
  )
}
