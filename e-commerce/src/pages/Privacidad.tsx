import { Link } from 'react-router-dom'
import {
  Lock,
  Eye,
  Database,
  Shield,
  Mail,
  ChevronRight,
  ExternalLink,
  UserCheck,
  RefreshCw,
  Bell,
} from 'lucide-react'

const EMPRESA = {
  razonSocial: 'Centurion Roxana Paola',
  email: 'ventas@artdent.com.ar',
  domicilio: 'B° Sagrado Corazón Mz 40 Casa 2, Formosa Capital, Formosa, Argentina',
  telefono: '+54 3704-995406',
}

type SectionProps = {
  id: string
  icon: React.ElementType
  title: string
  num: string
  children: React.ReactNode
}

function Section({ id, icon: Icon, title, num, children }: SectionProps) {
  return (
    <section id={id} className="card p-5 md:p-7 scroll-mt-24">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
          <Icon size={20} className="text-[var(--brand-primary)]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-widest mb-0.5">
            Sección {num}
          </p>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

const TOC = [
  { href: '#responsable', label: 'Responsable del tratamiento' },
  { href: '#datos-recolectados', label: 'Datos que recolectamos' },
  { href: '#finalidades', label: 'Finalidades del tratamiento' },
  { href: '#base-legal', label: 'Base legal' },
  { href: '#conservacion', label: 'Conservación de datos' },
  { href: '#comparticion', label: 'Compartición con terceros' },
  { href: '#derechos', label: 'Tus derechos (ARCO)' },
  { href: '#cookies', label: 'Cookies y rastreo' },
  { href: '#seguridad', label: 'Seguridad' },
  { href: '#menores', label: 'Menores de edad' },
  { href: '#cambios', label: 'Cambios en esta política' },
]

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <Lock size={15} />
              Ley 25.326 — Protección de Datos Personales
            </div>
            <h1 className="text-2xl font-bold md:text-4xl">Política de Privacidad</h1>
            <p className="mt-3 text-base text-white/90 max-w-xl mx-auto">
              Tu privacidad es importante para nosotros. Esta política explica qué datos recolectamos, cómo los usamos y cuáles son tus derechos.
            </p>
            <p className="mt-2 text-xs text-white/70">Última actualización: marzo de 2026</p>
          </div>
        </div>
      </section>

      {/* Índice */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 overflow-x-auto">
          <nav className="flex items-center gap-1 text-xs font-medium text-gray-600 whitespace-nowrap">
            {TOC.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition"
              >
                <ChevronRight size={12} />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">

            <Section id="responsable" icon={UserCheck} title="Responsable del Tratamiento" num="1">
              <p>
                El responsable del tratamiento de los datos personales recolectados a través de este sitio web es:
              </p>
              <div className="rounded-xl bg-gray-50 border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {[
                  ['Razón social', EMPRESA.razonSocial],
                  ['Domicilio', EMPRESA.domicilio],
                  ['Email de contacto', EMPRESA.email],
                  ['Teléfono', EMPRESA.telefono],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:gap-4 px-4 py-2.5">
                    <span className="w-44 shrink-0 font-medium text-gray-500 text-xs uppercase tracking-wide">{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Para consultas relacionadas con el tratamiento de tus datos personales, escribinos a{' '}
                <a href={`mailto:${EMPRESA.email}`} className="text-[var(--brand-primary)] hover:underline">{EMPRESA.email}</a> con el asunto "Datos Personales".
              </p>
            </Section>

            <Section id="datos-recolectados" icon={Database} title="Datos que Recolectamos" num="2">
              <p>Recolectamos los siguientes datos, según la interacción que tengas con el sitio:</p>
              <div className="space-y-3">
                {[
                  {
                    titulo: 'Datos de registro y cuenta',
                    items: ['Nombre y apellido', 'Dirección de correo electrónico', 'Contraseña (almacenada en formato cifrado)'],
                  },
                  {
                    titulo: 'Datos de compra y envío',
                    items: ['Dirección de entrega (calle, ciudad, provincia, código postal)', 'Teléfono de contacto', 'Historial de pedidos'],
                  },
                  {
                    titulo: 'Datos de pago',
                    items: [
                      'Los datos de tarjeta de crédito/débito son procesados directamente por MercadoPago; ARTDENT no almacena información de tarjetas.',
                      'Guardamos el estado del pago (aprobado/pendiente/rechazado) y el número de transacción.',
                    ],
                  },
                  {
                    titulo: 'Datos de navegación',
                    items: [
                      'Dirección IP',
                      'Tipo de navegador y sistema operativo',
                      'Páginas visitadas y tiempo de permanencia',
                      'Origen de la visita (referrer)',
                      'Cookies de sesión y analíticas (ver sección Cookies)',
                    ],
                  },
                  {
                    titulo: 'Datos que nos enviás voluntariamente',
                    items: ['Mensajes enviados por el formulario de contacto', 'Consultas por WhatsApp o email'],
                  },
                ].map((bloque) => (
                  <div key={bloque.titulo} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900 mb-2">{bloque.titulo}</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {bloque.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="finalidades" icon={Eye} title="Finalidades del Tratamiento" num="3">
              <p>Utilizamos tus datos personales para las siguientes finalidades:</p>
              <ul className="list-disc list-inside space-y-2 ml-1">
                <li><strong>Gestión de pedidos:</strong> procesar, confirmar, facturar y coordinar la entrega de tus compras.</li>
                <li><strong>Atención al cliente:</strong> responder consultas, gestionar reclamos y ejercicio de derechos del consumidor.</li>
                <li><strong>Cumplimiento legal:</strong> emisión de comprobantes fiscales (AFIP/ARCA), cumplimiento de obligaciones contables e impositivas.</li>
                <li><strong>Comunicaciones comerciales:</strong> enviarte novedades, promociones y actualizaciones del catálogo, únicamente si prestaste tu consentimiento expreso. Podés darte de baja en cualquier momento.</li>
                <li><strong>Mejora del servicio:</strong> análisis de navegación y uso del sitio (datos agregados y anonimizados).</li>
                <li><strong>Seguridad:</strong> detección y prevención de fraudes y accesos no autorizados.</li>
              </ul>
            </Section>

            <Section id="base-legal" icon={Shield} title="Base Legal del Tratamiento" num="4">
              <p>El tratamiento de tus datos se sustenta en las siguientes bases legales según la <strong>Ley 25.326</strong> y el <strong>Código Civil y Comercial de la Nación</strong>:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { base: 'Ejecución del contrato', desc: 'Necesario para procesar y entregar tus pedidos.' },
                  { base: 'Consentimiento', desc: 'Para comunicaciones de marketing; revocable en cualquier momento.' },
                  { base: 'Obligación legal', desc: 'Facturación, contabilidad y obligaciones ante AFIP/ARCA.' },
                  { base: 'Interés legítimo', desc: 'Seguridad, prevención de fraudes y mejora del servicio.' },
                ].map((item) => (
                  <div key={item.base} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900 mb-1">{item.base}</p>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="conservacion" icon={Database} title="Conservación de los Datos" num="5">
              <p>Conservamos tus datos personales durante el tiempo necesario para cumplir las finalidades descriptas:</p>
              <ul className="list-disc list-inside space-y-2 ml-1">
                <li><strong>Datos de cuenta activa:</strong> mientras mantengas una cuenta activa en el sitio.</li>
                <li><strong>Datos de transacciones:</strong> 10 años, conforme a las obligaciones contables e impositivas (Ley 19.550, Resolución General AFIP).</li>
                <li><strong>Datos de navegación:</strong> máximo 26 meses en herramientas analíticas (conforme a la política de Google Analytics).</li>
                <li><strong>Consultas y reclamos:</strong> hasta 5 años desde la fecha del último contacto.</li>
              </ul>
              <p>Una vez vencidos estos plazos, los datos son eliminados o anonimizados de forma irreversible.</p>
            </Section>

            <Section id="comparticion" icon={UserCheck} title="Compartición con Terceros" num="6">
              <p>
                <strong>No vendemos ni cedemos tus datos personales a terceros con fines comerciales.</strong> Compartimos datos únicamente en los siguientes casos:
              </p>
              <div className="space-y-3">
                {[
                  {
                    nombre: 'MercadoPago (procesamiento de pagos)',
                    desc: 'Recibe los datos necesarios para procesar el pago. Política de privacidad de MercadoPago disponible en su sitio oficial.',
                  },
                  {
                    nombre: 'Google Analytics (analítica web)',
                    desc: 'Recibe datos de navegación anonimizados para análisis de tráfico. No se envían datos personales identificables.',
                  },
                  {
                    nombre: 'Servicios postales y de mensajería',
                    desc: 'Nombre, dirección y teléfono de entrega, estrictamente para coordinar el envío de tu pedido.',
                  },
                  {
                    nombre: 'Organismos públicos (AFIP/ARCA, justicia)',
                    desc: 'Cuando sea requerido por ley, orden judicial o resolución administrativa.',
                  },
                ].map((item) => (
                  <div key={item.nombre} className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <ChevronRight size={16} className="text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.nombre}</p>
                      <p className="text-gray-600 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="derechos" icon={UserCheck} title="Tus Derechos (ARCO)" num="7">
              <p>
                Conforme a los <strong>Arts. 14 a 16 de la Ley 25.326</strong>, sos titular de los siguientes derechos respecto de tus datos personales:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { letra: 'A', nombre: 'Acceso', desc: 'Conocer qué datos tuyos tenemos almacenados, cómo los usamos y a quién los cedimos.' },
                  { letra: 'R', nombre: 'Rectificación', desc: 'Corregir datos inexactos, incompletos o desactualizados.' },
                  { letra: 'C', nombre: 'Confidencialidad / Supresión', desc: 'Solicitar la eliminación de datos cuyo tratamiento ya no tenga base legal o cuyo plazo haya expirado.' },
                  { letra: 'O', nombre: 'Oposición', desc: 'Oponerte al tratamiento para fines de marketing directo en cualquier momento.' },
                ].map((item) => (
                  <div key={item.letra} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-extrabold">
                        {item.letra}
                      </span>
                      <p className="font-semibold text-gray-900">{item.nombre}</p>
                    </div>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="font-semibold text-blue-900 mb-1">¿Cómo ejercer tus derechos?</p>
                <p className="text-blue-800">
                  Enviá un email a{' '}
                  <a href={`mailto:${EMPRESA.email}?subject=${encodeURIComponent('Ejercicio derechos ARCO – Datos Personales')}`} className="underline font-semibold">
                    {EMPRESA.email}
                  </a>{' '}
                  con el asunto <strong>"Ejercicio derechos ARCO – Datos Personales"</strong>, adjuntando una copia de tu DNI o documento identificatorio. Responderemos dentro de los <strong>5 días hábiles</strong>.
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Si considerás que el tratamiento de tus datos vulnera la normativa vigente, podés presentar una denuncia ante la{' '}
                <a
                  href="https://www.argentina.gob.ar/aaip/datospersonales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1"
                >
                  Agencia de Acceso a la Información Pública (AAIP) <ExternalLink size={11} />
                </a>.
              </p>
            </Section>

            <Section id="cookies" icon={Eye} title="Cookies y Tecnologías de Rastreo" num="8">
              <p>
                Este sitio utiliza cookies y tecnologías similares para mejorar tu experiencia de navegación. Podés configurar o deshabilitar las cookies desde la configuración de tu navegador.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">Tipo</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">Finalidad</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">Duración</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">Obligatoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tipo: 'Sesión / autenticación', fin: 'Mantener tu sesión iniciada y el carrito de compras.', dur: 'Sesión / 30 días', req: 'Sí' },
                      { tipo: 'Analíticas (Google Analytics)', fin: 'Medir el tráfico y comportamiento de navegación de forma anónima.', dur: 'Hasta 26 meses', req: 'No' },
                      { tipo: 'Marketing (Meta Pixel)', fin: 'Medir la efectividad de anuncios en redes sociales.', dur: 'Hasta 180 días', req: 'No' },
                    ].map((row) => (
                      <tr key={row.tipo} className="border-b border-gray-100">
                        <td className="px-3 py-2 border border-gray-200 font-medium text-gray-900">{row.tipo}</td>
                        <td className="px-3 py-2 border border-gray-200 text-gray-600">{row.fin}</td>
                        <td className="px-3 py-2 border border-gray-200 text-gray-600">{row.dur}</td>
                        <td className="px-3 py-2 border border-gray-200 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${row.req === 'Sí' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                            {row.req}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">
                Para deshabilitar las cookies analíticas podés instalar el{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1">
                  complemento de inhabilitación de Google Analytics <ExternalLink size={10} />
                </a>.
              </p>
            </Section>

            <Section id="seguridad" icon={Shield} title="Seguridad de los Datos" num="9">
              <p>Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos personales:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-1">
                <li>Comunicaciones cifradas mediante <strong>HTTPS/TLS</strong>.</li>
                <li>Contraseñas almacenadas usando algoritmos de hashing seguros (bcrypt).</li>
                <li>Acceso a datos de clientes restringido al personal autorizado bajo principio de mínimo privilegio.</li>
                <li>Datos de tarjetas de crédito/débito no almacenados en nuestros servidores; procesados directamente por <strong>MercadoPago</strong> (certificado PCI DSS).</li>
                <li>Copias de seguridad periódicas de la base de datos.</li>
              </ul>
              <p>
                A pesar de estas medidas, ningún sistema es 100 % infalible. Si detectás un uso no autorizado de tu cuenta, comunicate con nosotros de inmediato a <a href={`mailto:${EMPRESA.email}`} className="text-[var(--brand-primary)] hover:underline">{EMPRESA.email}</a>.
              </p>
            </Section>

            <Section id="menores" icon={UserCheck} title="Menores de Edad" num="10">
              <p>
                Este sitio no está dirigido a personas menores de 18 años. No recolectamos intencionalmente datos personales de menores. Si sos padre o tutor y tenés conocimiento de que un menor nos ha proporcionado datos personales sin tu consentimiento, contactanos para proceder a su eliminación.
              </p>
            </Section>

            <Section id="cambios" icon={RefreshCw} title="Cambios en esta Política" num="11">
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Cuando realicemos cambios materiales, te notificaremos por correo electrónico (si tenés cuenta registrada) o mediante un aviso destacado en el sitio, con al menos <strong>15 días hábiles</strong> de antelación.
              </p>
              <p>
                La versión vigente siempre estará disponible en <Link to="/privacidad" className="text-[var(--brand-primary)] hover:underline">artdent.com.ar/privacidad</Link> con la fecha de última actualización indicada al inicio del documento.
              </p>
            </Section>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Mail size={16} className="text-[var(--brand-primary)]" />
                Contacto de privacidad
              </h3>
              <p className="text-sm text-gray-600 mb-3">Para ejercer tus derechos ARCO o cualquier consulta sobre el tratamiento de tus datos:</p>
              <a
                href={`mailto:${EMPRESA.email}?subject=${encodeURIComponent('Ejercicio derechos ARCO – Datos Personales')}`}
                className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] text-white font-semibold text-sm px-4 py-2.5 hover:opacity-90 transition justify-center"
              >
                <Mail size={15} />
                {EMPRESA.email}
              </a>
              <p className="text-xs text-gray-500 mt-2 text-center">Asunto: "Ejercicio derechos ARCO"</p>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Marco normativo</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                {[
                  { ley: 'Ley 25.326', desc: 'Protección de Datos Personales' },
                  { ley: 'Decreto 1558/2001', desc: 'Reglamentación Ley 25.326' },
                  { ley: 'Resolución 47/2018', desc: 'Disposiciones complementarias AAIP' },
                  { ley: 'Código Civil y Comercial', desc: 'Arts. 1097–1116 (contratos de consumo)' },
                ].map((item) => (
                  <li key={item.ley} className="flex justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-[var(--brand-primary)] whitespace-nowrap">{item.ley}</span>
                    <span className="text-gray-600 text-right">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Organismos</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { name: 'AAIP — Datos Personales', url: 'https://www.argentina.gob.ar/aaip/datospersonales' },
                  { name: 'DNDC — Consumidor', url: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor' },
                ].map((org) => (
                  <li key={org.url}>
                    <a href={org.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-[var(--brand-primary)] hover:opacity-80 font-medium transition">
                      <span>{org.name}</span>
                      <ExternalLink size={13} className="shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Ver también</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { to: '/terminos', label: 'Términos y condiciones' },
                  { to: '/defensa-consumidor', label: 'Defensa del consumidor' },
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

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <Bell size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Aviso de Habeas Data</p>
                  <p className="text-xs text-amber-800 mt-1">
                    El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326.
                  </p>
                  <p className="text-xs text-amber-700 mt-1 font-semibold">
                    La DIRECCIÓN NACIONAL DE PROTECCIÓN DE DATOS PERSONALES, órgano de control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500">
          <p>Esta Política de Privacidad cumple con lo dispuesto por la <strong>Ley 25.326</strong> de Protección de los Datos Personales de la República Argentina y su decreto reglamentario <strong>1558/2001</strong>.</p>
          <p className="mt-1">Última actualización: marzo de 2026</p>
        </div>
      </div>
    </div>
  )
}
