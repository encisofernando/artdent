import { Link } from 'react-router-dom'
import {
  FileText,
  ShoppingCart,
  Truck,
  CreditCard,
  AlertCircle,
  Shield,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Scale,
} from 'lucide-react'

const EMPRESA = {
  razonSocial: 'Centurion Roxana Paola',
  domicilio: 'B° Sagrado Corazón Mz 40 Casa 2, Formosa Capital, Formosa, Argentina',
  email: 'ventas@artdent.com.ar',
  telefono: '+54 3704-995406',
  whatsapp: '5493704995406',
  provincia: 'Formosa',
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
            Artículo {num}
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
  { href: '#aceptacion', label: 'Aceptación' },
  { href: '#uso-sitio', label: 'Uso del sitio' },
  { href: '#cuenta', label: 'Cuenta de usuario' },
  { href: '#productos-precios', label: 'Productos y precios' },
  { href: '#proceso-compra', label: 'Proceso de compra' },
  { href: '#pagos', label: 'Medios de pago' },
  { href: '#envios', label: 'Envíos y entregas' },
  { href: '#devolucion', label: 'Devoluciones y garantía' },
  { href: '#propiedad-intelectual', label: 'Propiedad intelectual' },
  { href: '#responsabilidad', label: 'Responsabilidad' },
  { href: '#modificaciones', label: 'Modificaciones' },
  { href: '#jurisdiccion', label: 'Jurisdicción' },
]

export default function Terminos() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-[var(--brand-primary)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold mb-4">
              <FileText size={15} />
              Ley 24.240 · Código Civil y Comercial de la Nación
            </div>
            <h1 className="text-2xl font-bold md:text-4xl">Términos y Condiciones</h1>
            <p className="mt-3 text-base text-white/90 max-w-xl mx-auto">
              Al utilizar este sitio web y realizar compras, aceptás los términos y condiciones que se detallan a continuación. Te recomendamos leerlos detenidamente.
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

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6 order-last lg:order-first">

            <Section id="aceptacion" icon={FileText} title="Aceptación de los Términos" num="1">
              <p>
                Al acceder, navegar o realizar compras en <strong>artdent.com.ar</strong> (el "Sitio"), el usuario acepta en su totalidad los presentes Términos y Condiciones de Uso y Venta ("Términos"), así como la <Link to="/privacidad" className="text-[var(--brand-primary)] hover:underline">Política de Privacidad</Link> y la normativa de <Link to="/defensa-consumidor" className="text-[var(--brand-primary)] hover:underline">Defensa del Consumidor</Link>.
              </p>
              <p>
                El Sitio es operado por <strong>{EMPRESA.razonSocial}</strong>, con domicilio en {EMPRESA.domicilio}.
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  Si no estás de acuerdo con estos Términos, te pedimos que no utilices el Sitio ni realices compras. El uso continuado del Sitio implica la aceptación plena de estas condiciones.
                </p>
              </div>
            </Section>

            <Section id="uso-sitio" icon={FileText} title="Uso del Sitio Web" num="2">
              <p>El Sitio está destinado a personas mayores de 18 años con capacidad legal para contratar conforme al <strong>Código Civil y Comercial de la Nación Argentina</strong>. Al utilizarlo, declarás que:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-1">
                <li>Sos mayor de 18 años o contás con la autorización de tu representante legal.</li>
                <li>Los datos que proporcionás son verdaderos, exactos y completos.</li>
                <li>Utilizás el Sitio para fines lícitos y conforme a estos Términos.</li>
              </ul>
              <p>Queda expresamente prohibido:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-1">
                <li>Realizar compras fraudulentas o con datos falsos.</li>
                <li>Utilizar el Sitio para fines ilegales o que vulneren derechos de terceros.</li>
                <li>Reproducir, distribuir o modificar el contenido del Sitio sin autorización expresa.</li>
                <li>Intentar acceder sin autorización a sistemas o datos del Sitio.</li>
                <li>Utilizar bots, scrapers u otros medios automatizados sin consentimiento previo.</li>
              </ul>
            </Section>

            <Section id="cuenta" icon={FileText} title="Cuenta de Usuario" num="3">
              <p>
                Podés navegar y agregar productos al carrito sin registrarte. Sin embargo, para completar una compra y acceder al historial de pedidos, es necesario crear una cuenta o ingresar como invitado.
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-1">
                <li>Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.</li>
                <li>Debés notificarnos de inmediato cualquier uso no autorizado de tu cuenta a <a href={`mailto:${EMPRESA.email}`} className="text-[var(--brand-primary)] hover:underline">{EMPRESA.email}</a>.</li>
                <li>No podés transferir ni ceder tu cuenta a terceros.</li>
                <li>Nos reservamos el derecho de suspender o eliminar cuentas que violen estos Términos, sin perjuicio de las acciones legales que correspondan.</li>
              </ul>
            </Section>

            <Section id="productos-precios" icon={ShoppingCart} title="Productos y Precios" num="4">
              <p>
                ARTDENT comercializa productos para uso odontológico profesional. La disponibilidad de stock se muestra en tiempo real, aunque puede existir un margen de diferencia en situaciones de alta demanda simultánea.
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900 mb-1">Precios</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Todos los precios están expresados en <strong>pesos argentinos (ARS)</strong> e incluyen <strong>IVA</strong>.</li>
                    <li>Los precios pueden modificarse sin previo aviso. El precio aplicable es el vigente al momento de confirmar el pedido.</li>
                    <li>En caso de error tipográfico en el precio, nos reservamos el derecho de cancelar el pedido notificando al consumidor, conforme a la normativa vigente.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900 mb-1">Disponibilidad</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Si un producto adquirido no tuviera stock disponible al momento de preparar el pedido, te contactaremos dentro de las 24 hs para ofrecerte una alternativa o proceder con el reembolso.</li>
                    <li>Las imágenes de los productos son de carácter ilustrativo. El color real puede variar según el monitor.</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section id="proceso-compra" icon={ShoppingCart} title="Proceso de Compra" num="5">
              <p>El proceso de compra en el Sitio se realiza en los siguientes pasos:</p>
              <ol className="list-decimal list-inside space-y-2 ml-1">
                <li><strong>Selección de productos:</strong> agregá los productos deseados al carrito.</li>
                <li><strong>Revisión del carrito:</strong> verificá cantidades, precios y subtotal.</li>
                <li><strong>Datos de envío:</strong> ingresá la dirección de entrega y datos de contacto.</li>
                <li><strong>Pago:</strong> seleccioná el medio de pago y completá la transacción.</li>
                <li><strong>Confirmación:</strong> recibirás un email de confirmación con el detalle del pedido.</li>
              </ol>
              <p>
                El contrato de compraventa se perfecciona cuando ARTDENT confirma la recepción del pago y la disponibilidad del producto. La confirmación se comunica por correo electrónico al domicilio declarado por el usuario.
              </p>
              <p>
                ARTDENT se reserva el derecho de rechazar un pedido en caso de detectar fraude, incumplimiento de estos Términos o cualquier otra circunstancia que lo justifique, reembolsando el importe abonado íntegramente.
              </p>
            </Section>

            <Section id="pagos" icon={CreditCard} title="Medios de Pago" num="6">
              <p>Aceptamos los siguientes medios de pago a través de la plataforma <strong>MercadoPago</strong>:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { medio: 'Tarjetas de crédito', detalle: 'Visa, Mastercard, American Express y otras redes habilitadas por MercadoPago.' },
                  { medio: 'Tarjetas de débito', detalle: 'Maestro, Visa Débito y otras redes disponibles.' },
                  { medio: 'Dinero en MercadoPago', detalle: 'Saldo disponible en tu cuenta de MercadoPago.' },
                  { medio: 'Cuotas sin interés', detalle: 'En productos y períodos seleccionados. Verificá las condiciones al momento de la compra.' },
                ].map((item) => (
                  <div key={item.medio} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900 mb-1">{item.medio}</p>
                    <p className="text-gray-600">{item.detalle}</p>
                  </div>
                ))}
              </div>
              <p>
                Las transacciones son procesadas de forma segura por <strong>MercadoPago</strong> (certificado PCI DSS). ARTDENT no almacena datos de tarjetas de crédito/débito. Las cuotas sin interés están sujetas a disponibilidad según el banco y la tarjeta utilizada.
              </p>
              <p>
                En caso de rechazo del pago, el pedido no será procesado. Podés reintentar con otro medio de pago o contactarnos.
              </p>
            </Section>

            <Section id="envios" icon={Truck} title="Envíos y Entregas" num="7">
              <p>Realizamos envíos a todo el territorio de la <strong>República Argentina</strong> mediante empresas de correo y mensajería habilitadas.</p>
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900 mb-2">Plazos estimados</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li><strong>Formosa Capital:</strong> 1–3 días hábiles.</li>
                    <li><strong>Interior del país:</strong> 3–8 días hábiles según destino y modalidad de envío.</li>
                    <li>Los plazos son estimativos y pueden verse afectados por situaciones fuera del control de ARTDENT (fuerza mayor, días feriados, problemas del correo).</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900 mb-2">Costo de envío</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>El costo se calcula y muestra durante el proceso de checkout según el destino y el peso del pedido.</li>
                    <li>Podemos ofrecer envío gratuito en condiciones especiales o promociones vigentes.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900 mb-2">Responsabilidad en el envío</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>ARTDENT es responsable del producto hasta su entrega al servicio de correo.</li>
                    <li>Ante extravío o daño en el transporte, gestionaremos el reclamo ante la empresa de correo y te informaremos de los plazos de resolución.</li>
                    <li>Si el domicilio declarado es incorrecto o el destinatario no recibe el pedido, el reenvío puede implicar costos adicionales.</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section id="devolucion" icon={RefreshCw} title="Devoluciones y Garantía" num="8">
              <p>
                Las devoluciones y la garantía legal se rigen por la <strong>Ley 24.240 de Defensa del Consumidor</strong> y sus modificatorias. Para mayor detalle, consultá nuestra página de{' '}
                <Link to="/defensa-consumidor" className="text-[var(--brand-primary)] hover:underline">Defensa del Consumidor</Link>.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-900 mb-1">Derecho de arrepentimiento</p>
                  <p className="text-green-800"><strong>10 días hábiles</strong> desde la recepción del producto para devolver sin expresar causa (Art. 34 Ley 24.240).</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-900 mb-1">Garantía legal</p>
                  <p className="text-blue-800"><strong>6 meses</strong> para productos nuevos, <strong>3 meses</strong> para usados (Art. 11 Ley 24.240 mod. Ley 27.250).</p>
                </div>
              </div>
              <p>
                Para iniciar una devolución o reclamación de garantía, contactanos a <a href={`mailto:${EMPRESA.email}`} className="text-[var(--brand-primary)] hover:underline">{EMPRESA.email}</a> o por <a href={`https://wa.me/${EMPRESA.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] hover:underline">WhatsApp</a> indicando el número de pedido y el motivo.
              </p>
            </Section>

            <Section id="propiedad-intelectual" icon={Shield} title="Propiedad Intelectual" num="9">
              <p>
                Todo el contenido del Sitio —incluyendo textos, imágenes, logotipos, diseño gráfico, código fuente y base de datos de productos— es propiedad de <strong>ARTDENT</strong> o de sus proveedores de contenido, y está protegido por las leyes argentinas e internacionales de <strong>propiedad intelectual</strong> (Ley 11.723 de Propiedad Intelectual y Ley 22.362 de Marcas).
              </p>
              <p>Queda prohibido sin autorización escrita previa:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Reproducir, copiar, distribuir o modificar el contenido del Sitio.</li>
                <li>Utilizar el logotipo, nombre o marca ARTDENT con fines comerciales.</li>
                <li>Realizar ingeniería inversa del software del Sitio.</li>
              </ul>
              <p>
                Las marcas de los productos comercializados pertenecen a sus respectivos fabricantes y son utilizadas con fines meramente descriptivos.
              </p>
            </Section>

            <Section id="responsabilidad" icon={Scale} title="Limitación de Responsabilidad" num="10">
              <p>ARTDENT no será responsable por:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-1">
                <li>Interrupciones del servicio por mantenimiento, fallas técnicas o causas de fuerza mayor.</li>
                <li>Daños derivados del uso incorrecto de los productos adquiridos, siempre que se hayan provisto las instrucciones de uso correspondientes.</li>
                <li>Contenido de sitios web de terceros enlazados desde el Sitio.</li>
                <li>Pérdidas de datos por causas ajenas a nuestra voluntad.</li>
              </ul>
              <p>
                Esta limitación no aplica cuando medie dolo o culpa grave de ARTDENT, ni cuando se vulneren derechos irrenunciables del consumidor reconocidos por la <strong>Ley 24.240</strong>.
              </p>
            </Section>

            <Section id="modificaciones" icon={RefreshCw} title="Modificaciones de los Términos" num="11">
              <p>
                ARTDENT puede modificar estos Términos en cualquier momento. Los cambios entran en vigencia desde su publicación en el Sitio. Te notificaremos los cambios sustanciales por correo electrónico (si tenés cuenta registrada) con al menos <strong>15 días hábiles</strong> de anticipación.
              </p>
              <p>
                El uso continuado del Sitio tras la entrada en vigencia de los nuevos Términos implica su aceptación. Si no estás de acuerdo, podés solicitar la eliminación de tu cuenta.
              </p>
            </Section>

            <Section id="jurisdiccion" icon={Scale} title="Jurisdicción y Ley Aplicable" num="12">
              <p>
                Los presentes Términos se rigen por las leyes de la <strong>República Argentina</strong>. Ante cualquier controversia derivada de estos Términos o de las operaciones realizadas en el Sitio, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la ciudad de <strong>{EMPRESA.provincia}</strong>, renunciando expresamente a cualquier otro fuero que pudiere corresponder.
              </p>
              <p>
                Sin perjuicio de lo anterior, el consumidor conserva en todo momento el derecho de recurrir al <strong>COPREC</strong> (Conciliación Previa en las Relaciones de Consumo, Ley 26.993) o a la <strong>Dirección Nacional de Defensa del Consumidor</strong>, conforme a lo establecido por la <strong>Ley 24.240</strong>.
              </p>
              <div className="flex flex-wrap gap-3 mt-1">
                <a
                  href="https://www.argentina.gob.ar/produccion/coprec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  COPREC <ExternalLink size={13} />
                </a>
                <a
                  href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  Defensa del Consumidor <ExternalLink size={13} />
                </a>
              </div>
            </Section>

          </div>

          {/* Sidebar */}
          <div className="space-y-4 order-first lg:order-last">

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Consultas y reclamos</h3>
              <p className="text-sm text-gray-600 mb-3">Para consultas sobre estos Términos o cualquier aspecto de tu compra:</p>
              <a
                href={`mailto:${EMPRESA.email}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] text-white font-semibold text-sm px-4 py-2.5 hover:opacity-90 transition"
              >
                {EMPRESA.email}
              </a>
              <a
                href={`https://wa.me/${EMPRESA.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white font-semibold text-sm px-4 py-2.5 hover:bg-green-700 transition"
              >
                WhatsApp {EMPRESA.telefono}
              </a>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Marco normativo</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                {[
                  { ley: 'Ley 24.240', desc: 'Defensa del Consumidor' },
                  { ley: 'Ley 27.250', desc: 'Garantía legal 6 meses' },
                  { ley: 'Res. SC 424/2020', desc: 'Botón de arrepentimiento' },
                  { ley: 'Ley 26.993', desc: 'COPREC' },
                  { ley: 'Ley 25.326', desc: 'Datos Personales' },
                  { ley: 'Ley 11.723', desc: 'Propiedad Intelectual' },
                  { ley: 'Ley 22.362', desc: 'Marcas y Designaciones' },
                  { ley: 'Código Civil y Comercial', desc: 'Arts. 1097–1116' },
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
                  { to: '/privacidad', label: 'Política de privacidad' },
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

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-2">Vigencia</h3>
              <p className="text-sm text-gray-600">
                Estos Términos y Condiciones están vigentes desde el <strong>marzo de 2026</strong>.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                La versión actualizada siempre estará disponible en <Link to="/terminos" className="text-[var(--brand-primary)] hover:underline">artdent.com.ar/terminos</Link>.
              </p>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500">
          <p>
            Estos Términos y Condiciones se rigen por las leyes de la República Argentina, en particular la{' '}
            <strong>Ley 24.240</strong> de Defensa del Consumidor y el <strong>Código Civil y Comercial de la Nación</strong>.
          </p>
          <p className="mt-1">Última actualización: marzo de 2026</p>
        </div>
      </div>
    </div>
  )
}
