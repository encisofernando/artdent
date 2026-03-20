import { Link } from 'react-router-dom'
import {
  Shield,
  RotateCcw,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Lock,
  CheckCircle2,
  Gavel,
} from 'lucide-react'

const EMPRESA = {
  razonSocial: 'Centurion Roxana Paola',
  cuit: '23-29070589-4',
  domicilio: 'B° Sagrado Corazón Mz 40 Casa 2, Formosa Capital, Formosa, Argentina',
  email: 'ventas@artdent.com.ar',
  telefono: '+54 3704-995406',
  whatsapp: '5493704995406',
  horarios: 'Lunes a Viernes de 8:00 a 14:00 hs',
}

type SectionProps = {
  id: string
  icon: React.ElementType
  title: string
  badge?: string
  children: React.ReactNode
}

function Section({ id, icon: Icon, title, badge, children }: SectionProps) {
  return (
    <section id={id} className="card p-5 md:p-7 scroll-mt-24">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
          <Icon size={20} className="text-[var(--brand-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-[var(--brand-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-primary)]">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="shrink-0 w-48 font-medium text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}

export default function DefensaConsumidor() {
  const arrepentimientoSubject = encodeURIComponent('Ejercicio derecho de arrepentimiento – Pedido N° [número]')
  const arrepentimientoBody = encodeURIComponent(
    'Buenos días,\n\nPor medio del presente ejerzo mi derecho de arrepentimiento conforme al Art. 34 de la Ley 24.240.\n\nNombre completo: \nDNI: \nNúmero de pedido: \nProducto/s a devolver: \nMotivo (opcional): \n\nQuedo a disposición para coordinar la devolución.\n\nSaluda atte.'
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <Shield size={15} />
              Ley 24.240 de Defensa del Consumidor
            </div>
            <h1 className="text-2xl font-bold md:text-4xl">Defensa del Consumidor</h1>
            <p className="mt-3 text-base text-white/90 max-w-xl mx-auto">
              En ArtDent respetamos y protegemos tus derechos como consumidor. Encontrá aquí toda la información obligatoria según la normativa argentina vigente.
            </p>
          </div>
        </div>
      </section>

      {/* Índice rápido */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 overflow-x-auto">
          <nav className="flex items-center gap-1 text-xs font-medium text-gray-600 whitespace-nowrap">
            {[
              { href: '#empresa', label: 'Datos del proveedor' },
              { href: '#arrepentimiento', label: 'Derecho de arrepentimiento' },
              { href: '#garantia', label: 'Garantía legal' },
              { href: '#reclamos', label: 'Reclamos' },
              { href: '#coprec', label: 'COPREC' },
              { href: '#datos-personales', label: 'Datos personales' },
              { href: '#precios', label: 'Precios e IVA' },
            ].map((item) => (
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

      {/* Botón de arrepentimiento destacado */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Botón de Arrepentimiento</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  Resolución S.C. 424/2020 · Tenés <strong>10 días hábiles</strong> para arrepentirte de tu compra sin necesidad de dar explicaciones.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${EMPRESA.email}?subject=${arrepentimientoSubject}&body=${arrepentimientoBody}`}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-5 py-2.5 transition active:scale-95"
            >
              <RotateCcw size={16} />
              EJERCER ARREPENTIMIENTO
            </a>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6 order-last lg:order-first">

            {/* Datos del proveedor */}
            <Section id="empresa" icon={FileText} title="Datos del Proveedor" badge="Art. 10 Ley 24.240">
              <p>
                De conformidad con el <strong>Art. 10 de la Ley 24.240</strong>, el proveedor que realiza las operaciones de comercio electrónico es:
              </p>
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2 divide-y divide-gray-100">
                <InfoRow label="Razón social / Nombre" value={EMPRESA.razonSocial} />
                <InfoRow label="CUIT / CUIL" value={<span className="font-mono">{EMPRESA.cuit}</span>} />
                <InfoRow label="Domicilio comercial" value={EMPRESA.domicilio} />
                <InfoRow label="Correo electrónico" value={
                  <a href={`mailto:${EMPRESA.email}`} className="text-[var(--brand-primary)] hover:underline">{EMPRESA.email}</a>
                } />
                <InfoRow label="Teléfono" value={EMPRESA.telefono} />
                <InfoRow label="Horario de atención" value={EMPRESA.horarios} />
              </div>
            </Section>

            {/* Derecho de arrepentimiento */}
            <Section id="arrepentimiento" icon={RotateCcw} title="Derecho de Arrepentimiento" badge="Art. 34 Ley 24.240">
              <p>
                Conforme al <strong>Art. 34 de la Ley 24.240</strong> (modificado por Ley 26.361) y la <strong>Resolución S.C. N° 424/2020</strong>, tenés derecho a revocar la aceptación de cualquier compra realizada a distancia dentro de los <strong>10 (diez) días hábiles</strong> contados a partir de la fecha de entrega del producto o de la celebración del contrato, lo que ocurra último.
              </p>
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
                <p className="font-semibold text-green-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  ¿Cómo ejercer este derecho?
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-green-800">
                  <li>Hacé clic en el botón <strong>"EJERCER ARREPENTIMIENTO"</strong> destacado en esta página, o enviá un email a <a href={`mailto:${EMPRESA.email}`} className="underline">{EMPRESA.email}</a> con el asunto "Derecho de arrepentimiento – Pedido N° [número]".</li>
                  <li>También podés comunicarte por <a href={`https://wa.me/${EMPRESA.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a> o llamar al {EMPRESA.telefono}.</li>
                  <li>Indicá tu nombre completo, DNI y número de pedido.</li>
                  <li>Coordinaremos el retiro del producto sin cargo para vos.</li>
                </ol>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="font-semibold text-blue-900 mb-1">Condiciones del reintegro</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>El reintegro del importe abonado se realizará dentro de los <strong>10 días hábiles</strong> siguientes a la recepción de la devolución.</li>
                  <li>El producto debe encontrarse en las mismas condiciones en que fue recibido.</li>
                  <li>Los gastos de devolución son a cargo del proveedor cuando el ejercicio del derecho de arrepentimiento sea imputable a defectos o vicios del producto.</li>
                  <li>En caso de arrepentimiento sin causa imputable al proveedor, los gastos de envío de devolución son acordados entre las partes.</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500">
                Nota: El derecho de arrepentimiento no aplica a productos perecederos, medicamentos, productos personalizados o aquellos cuyo uso implique riesgo para la salud, según lo establecido por la normativa vigente.
              </p>
            </Section>

            {/* Garantía */}
            <Section id="garantia" icon={Shield} title="Garantía Legal" badge="Art. 11 Ley 24.240">
              <p>
                Todos los productos nuevos comercializados cuentan con una <strong>garantía legal mínima de 6 (seis) meses</strong> conforme al <strong>Art. 11 de la Ley 24.240</strong> (modificado por Ley 27.250). Para productos usados, la garantía mínima es de <strong>3 (tres) meses</strong>.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-1">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900 mb-2">Productos nuevos</p>
                  <p className="text-2xl font-extrabold text-[var(--brand-primary)]">6 meses</p>
                  <p className="text-xs text-gray-500 mt-1">Garantía legal mínima obligatoria</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900 mb-2">Productos usados</p>
                  <p className="text-2xl font-extrabold text-gray-600">3 meses</p>
                  <p className="text-xs text-gray-500 mt-1">Garantía legal mínima obligatoria</p>
                </div>
              </div>
              <p>
                La garantía cubre los <strong>defectos o vicios de fabricación</strong>. Durante el período de garantía, el consumidor tiene derecho a:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>La reparación gratuita del producto.</li>
                <li>La sustitución del producto por uno nuevo de idénticas características, si la reparación no resulta satisfactoria.</li>
                <li>La devolución de la suma pagada, a su elección.</li>
              </ul>
              <p>
                Para hacer efectiva la garantía, comunicate con nosotros mediante los canales habituales indicando el número de pedido y una descripción del defecto.
              </p>
            </Section>

            {/* Reclamos */}
            <Section id="reclamos" icon={Gavel} title="Cómo Realizar un Reclamo">
              <p>
                Si tu consulta o reclamo no fue resuelto satisfactoriamente por nuestro equipo, tenés derecho a recurrir a los organismos de defensa del consumidor:
              </p>
              <div className="space-y-3 mt-1">
                <div className="rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10">
                    <Gavel size={16} className="text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Dirección Nacional de Defensa del Consumidor (DNDC)
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5 mb-2">
                      Organismo nacional dependiente de la Secretaría de Comercio.
                    </p>
                    <a
                      href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                    >
                      Presentar reclamo en línea <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10">
                    <Phone size={16} className="text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Línea gratuita de atención al consumidor</p>
                    <a href="tel:0800666100" className="text-xl font-extrabold text-[var(--brand-primary)] hover:underline">
                      0800-666-1518
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5">Secretaría de Comercio · Lunes a viernes</p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10">
                    <Shield size={16} className="text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Dirección de Defensa del Consumidor — Provincia de Formosa
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Podés realizar tu reclamo también ante la autoridad de aplicación provincial correspondiente a tu domicilio.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* COPREC */}
            <Section id="coprec" icon={FileText} title="COPREC — Conciliación Previa" badge="Ley 26.993">
              <p>
                Conforme a la <strong>Ley 26.993</strong>, antes de iniciar una acción judicial podés recurrir al <strong>Servicio de Conciliación Previa en las Relaciones de Consumo (COPREC)</strong>, un mecanismo gratuito de resolución de conflictos.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>El trámite es <strong>gratuito y voluntario</strong> para el consumidor.</li>
                <li>La conciliación es realizada por un conciliador habilitado por el Ministerio de Justicia.</li>
                <li>El procedimiento debe iniciarse antes de la acción judicial para conflictos que no superen <strong>55 salarios mínimos vitales y móviles</strong>.</li>
              </ul>
              <a
                href="https://www.argentina.gob.ar/produccion/coprec"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-1 text-sm font-semibold text-[var(--brand-primary)] hover:underline"
              >
                Iniciar trámite COPREC <ExternalLink size={13} />
              </a>
            </Section>

            {/* Datos personales */}
            <Section id="datos-personales" icon={Lock} title="Protección de Datos Personales" badge="Ley 25.326">
              <p>
                ArtDent trata los datos personales de sus clientes con estricto cumplimiento de la <strong>Ley 25.326 de Protección de los Datos Personales</strong> (Ley de Habeas Data) y sus normas reglamentarias.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Los datos recolectados son utilizados exclusivamente para la gestión de pedidos, facturación y comunicaciones comerciales que el usuario autorice.</li>
                <li>No se ceden ni venden datos a terceros sin consentimiento previo del titular.</li>
                <li>Podés ejercer en forma gratuita tus derechos de <strong>acceso, rectificación, actualización y supresión</strong> de tus datos comunicándote a <a href={`mailto:${EMPRESA.email}`} className="text-[var(--brand-primary)] hover:underline">{EMPRESA.email}</a>.</li>
                <li>
                  La DNPDP (Dirección Nacional de Protección de Datos Personales) tiene la atribución de atender denuncias y reclamos.{' '}
                  <a
                    href="https://www.argentina.gob.ar/aaip/datospersonales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--brand-primary)] hover:underline"
                  >
                    Más información <ExternalLink size={11} />
                  </a>
                </li>
              </ul>
            </Section>

            {/* Precios */}
            <Section id="precios" icon={CheckCircle2} title="Precios, IVA y Facturación">
              <p>
                Todos los precios publicados en este sitio web están expresados en <strong>pesos argentinos (ARS)</strong> e incluyen el <strong>Impuesto al Valor Agregado (IVA)</strong> conforme a la alícuota correspondiente a cada producto.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Los precios pueden variar sin previo aviso. El precio aplicable es el vigente al momento de la confirmación del pedido.</li>
                <li>ArtDent emite comprobante fiscal (factura A o B según corresponda) por todas las transacciones.</li>
                <li>Para solicitar factura A, indicarlo al momento de la compra o comunicarse por email con el número de pedido y datos fiscales (razón social, CUIT, condición frente al IVA).</li>
                <li>En caso de publicarse un precio erróneo por error técnico, nos reservamos el derecho a cancelar el pedido, notificando al consumidor dentro de las 24 hs para acordar la operación al precio correcto o proceder a la devolución íntegra del pago.</li>
              </ul>
            </Section>

          </div>

          {/* Sidebar */}
          <div className="space-y-4 order-first lg:order-last">

            {/* Contacto rápido */}
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-gray-900">Contacto para reclamos</h3>
              <a
                href={`mailto:${EMPRESA.email}?subject=${arrepentimientoSubject}&body=${arrepentimientoBody}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 group-hover:bg-[var(--brand-primary)]/20 transition">
                  <Mail size={16} className="text-[var(--brand-primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{EMPRESA.email}</p>
                </div>
              </a>
              <a
                href={`https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent('Hola, quiero realizar un reclamo/consulta sobre mi pedido.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:border-green-500 hover:bg-green-50 transition group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition">
                  <Phone size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">WhatsApp</p>
                  <p className="text-sm font-semibold text-gray-900">{EMPRESA.telefono}</p>
                </div>
              </a>
              <p className="text-xs text-gray-500 text-center">{EMPRESA.horarios}</p>
            </div>

            {/* Marco legal */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Marco legal aplicable</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                {[
                  { ley: 'Ley 24.240', desc: 'Defensa del Consumidor' },
                  { ley: 'Ley 26.361', desc: 'Reforma Ley 24.240' },
                  { ley: 'Ley 27.250', desc: 'Garantía legal 6 meses' },
                  { ley: 'Ley 26.993', desc: 'COPREC' },
                  { ley: 'Ley 25.326', desc: 'Protección datos personales' },
                  { ley: 'Res. SC 424/2020', desc: 'Botón de arrepentimiento' },
                  { ley: 'Ley 25.065', desc: 'Tarjetas de crédito' },
                ].map((item) => (
                  <li key={item.ley} className="flex justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-[var(--brand-primary)] whitespace-nowrap">{item.ley}</span>
                    <span className="text-gray-600 text-right">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Organismos */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Organismos oficiales</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  {
                    name: 'DNDC — Defensa del Consumidor',
                    url: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor',
                  },
                  {
                    name: 'COPREC — Conciliación',
                    url: 'https://www.argentina.gob.ar/produccion/coprec',
                  },
                  {
                    name: 'AAIP — Datos Personales',
                    url: 'https://www.argentina.gob.ar/aaip/datospersonales',
                  },
                ].map((org) => (
                  <li key={org.url}>
                    <a
                      href={org.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-[var(--brand-primary)] hover:opacity-80 font-medium transition"
                    >
                      <span>{org.name}</span>
                      <ExternalLink size={13} className="shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Otros links */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Más información</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/contacto" className="flex items-center gap-1.5 text-gray-700 hover:text-[var(--brand-primary)] transition">
                    <ChevronRight size={14} />
                    Contacto general
                  </Link>
                </li>
                <li>
                  <Link to="/productos" className="flex items-center gap-1.5 text-gray-700 hover:text-[var(--brand-primary)] transition">
                    <ChevronRight size={14} />
                    Ver catálogo
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500">
          <p>
            Esta página cumple con las obligaciones de información al consumidor establecidas por la{' '}
            <strong>Ley 24.240</strong> de Defensa del Consumidor de la República Argentina y la{' '}
            <strong>Resolución S.C. N° 424/2020</strong> sobre comercio electrónico.
          </p>
          <p className="mt-1">
            Última actualización: marzo de 2026
          </p>
        </div>
      </div>
    </div>
  )
}
