import { Link } from 'react-router-dom'
import { Target, Eye, Heart, Users, Award, Zap, Leaf, Handshake, GraduationCap, Globe } from 'lucide-react'
import logoAzul from '../assets/logo-azul.png'
import logoColor from '../assets/logo-artdent-color.png'
import logoBlanco from '../assets/logo-artdent-blanco.png'
import logoInsumos from '../assets/logo-blanco.png'
import SEOHead from '../components/SEOHead'

// ── Valores de la empresa ────────────────────────────────────────────────────
const valores = [
  { icon: Award,     label: 'Calidad',           desc: 'Cada trabajo entregado refleja el mayor estándar técnico.' },
  { icon: Heart,     label: 'Estética',           desc: 'Funcionalidad y belleza, siempre en equilibrio.' },
  { icon: Zap,       label: 'Rapidez',            desc: 'Entregas ágiles sin resignar precisión.' },
  { icon: Users,     label: 'Trabajo en equipo',  desc: 'Colaboración y coordinación como pilares operativos.' },
  { icon: Handshake, label: 'Compromiso',         desc: 'Nos involucramos en cada caso como un verdadero aliado.' },
  { icon: GraduationCap, label: 'Profesionalismo', desc: 'Formación continua y ética en cada decisión.' },
  { icon: Heart,     label: 'Empatía',            desc: 'Escuchamos y entendemos la realidad de cada profesional.' },
  { icon: Leaf,      label: 'Medio ambiente',     desc: 'Responsabilidad con el entorno en cada proceso productivo.' },
]

// ── Hoja de ruta ─────────────────────────────────────────────────────────────
const roadmap = [
  {
    plazo: '1 año',
    color: 'bg-[var(--brand-primary)]',
    textColor: 'text-white',
    titulo: 'Consolidación',
    items: [
      '12 clientes estratégicos de flujo diario',
      'Facturación mensual de $25.000.000',
      'Liderazgo digital reconocido en la región',
    ],
  },
  {
    plazo: '3 años',
    color: 'bg-[var(--brand-accent)]',
    textColor: 'text-white',
    titulo: 'ArtDent Academy',
    items: [
      'Centro de capacitación presencial y online',
      'Congreso de Técnicos Dentales en Formosa',
      'Cursos en ExoCAD, cerámica, prótesis flexibles y liderazgo',
    ],
  },
  {
    plazo: '5 años',
    color: 'bg-[var(--brand-secondary)]',
    textColor: 'text-white',
    titulo: 'Expansión regional',
    items: [
      'Presencia en Asunción, Paraguay',
      'Red de distribución en todo el NEA',
      'Referente internacional en innovación odontológica',
    ],
  },
]

export default function QuienesSomos() {
  const aboutStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Quiénes somos | ArtDent',
    description:
      'Conocé la historia, visión y compromiso de ArtDent con odontólogos, clínicas y profesionales de la salud bucal.',
    url: 'https://shop.artdent.com.ar/nosotros',
    about: {
      '@type': 'Organization',
      name: 'ArtDent',
      description:
        'Laboratorio odontológico e insumos dentales con foco en tecnología digital, precisión técnica y atención personalizada.',
      areaServed: 'Argentina',
    },
  }

  return (
    <>
      <SEOHead
        title="Quiénes somos y nuestra visión"
        description="Descubrí la historia de ArtDent, su visión de crecimiento, el trabajo con odontólogos y su propuesta profesional en laboratorio e insumos dentales."
        keywords={[
          'artdent',
          'laboratorio odontológico',
          'insumos dentales argentina',
          'quienes somos artdent',
          'odontología formosa',
        ]}
        url="/nosotros"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Nosotros', url: '/nosotros' },
        ]}
        structuredData={aboutStructuredData}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-primary-dark) 0%, var(--brand-primary) 50%, var(--brand-accent) 100%)' }}
      >
        {/* Forma decorativa */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-[300px] w-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-14 md:py-20 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <span>🦷</span> Formosa, Argentina
          </div>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
            El arte de crear<br />
            <span className="opacity-80">para toda la vida.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/85 md:text-lg max-w-2xl mx-auto">
            Somos ArtDent — Laboratorio odontológico e insumos dentales.
            Combinamos tecnología digital, precisión técnica y atención
            personalizada para ser el aliado estratégico del profesional
            de la salud bucal.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/productos" className="btn bg-white text-[var(--brand-primary)] font-bold hover:bg-white/90 px-6 py-2.5">
              Ver insumos
            </Link>
            <Link to="/contacto" className="btn border border-white/40 bg-white/10 text-white hover:bg-white/20 px-6 py-2.5">
              Contactarnos
            </Link>
          </div>
        </div>
      </section>

      {/* ── Números ───────────────────────────────────────────────────────── */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { num: '+50',   label: 'Odontólogos activos' },
              { num: '100%',  label: 'Tecnología digital' },
              { num: '1',     label: 'Laboratorio en Formosa' },
              { num: '3 años', label: 'Para ser líderes del NEA' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-[var(--brand-primary)] md:text-3xl">{s.num}</p>
                <p className="mt-1 text-xs font-medium text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Misión y Visión ───────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Nuestra razón de ser</h2>
            <p className="mt-2 text-sm text-gray-500">Lo que nos mueve hoy y hacia dónde vamos</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Misión */}
            <div className="card p-6 md:p-8 relative overflow-hidden">
              <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 opacity-5"
                style={{ background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)' }}
              />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)]">
                <Target size={22} className="text-[var(--brand-primary)]" />
              </div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--brand-muted)]">Misión</h3>
              <p className="text-base font-semibold leading-relaxed text-gray-800">
                Impulsar la excelencia en la salud dental integrando la fabricación de
                prótesis de alta precisión con la provisión de insumos especializados
                de vanguardia.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Existimos para facilitar el trabajo de odontólogos, clínicas y técnicos
                a través de soluciones rápidas, estéticas y personalizadas — combinando
                tecnología digital, educación continua y un soporte técnico humano que
                garantiza la mejor inversión y el bienestar del paciente.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Precisión', 'Rapidez', 'Personalización'].map((tag) => (
                  <span key={tag} className="badge">{tag}</span>
                ))}
              </div>
            </div>

            {/* Visión */}
            <div className="card p-6 md:p-8 relative overflow-hidden border-[var(--brand-primary)]/20">
              <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 opacity-5"
                style={{ background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)' }}
              />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)]">
                <Eye size={22} className="text-[var(--brand-primary)]" />
              </div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--brand-muted)]">Visión</h3>
              <p className="text-base font-semibold leading-relaxed text-gray-800">
                Consolidarnos como el laboratorio digital pionero y líder de la región
                NEA para el año 2029.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Aspiramos a ser un referente internacional con presencia en Asunción,
                Paraguay, expandiendo nuestro impacto a través de ArtDent Academy y
                nuestra plataforma de e-commerce — integrando formación técnica
                disruptiva con innovación tecnológica en beneficio de toda la comunidad
                odontológica.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['NEA', 'Paraguay', 'Academy', 'Innovación'].map((tag) => (
                  <span key={tag} className="badge">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nuestra historia ──────────────────────────────────────────────── */}
      <section className="bg-[var(--brand-soft)] py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">

            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">¿Quiénes somos?</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                ArtDent nació en Formosa con una convicción simple: los odontólogos merecen
                un laboratorio que funcione como un verdadero aliado. Uno que entregue a
                tiempo, con la estética y funcionalidad que el paciente necesita, y con
                el trato personalizado que el profesional valora.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                Combinamos prótesis dentales de alta precisión con la comercialización de
                insumos especializados, creando un ecosistema integral donde el odontólogo,
                la clínica y el técnico dental encuentran todo lo que necesitan en un solo lugar.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                Hoy somos el primer laboratorio digital de la región en aplicar sistemas
                de gestión ágiles que reducen los tiempos de entrega sin resignar calidad.
                Nuestro objetivo: que cada caso que llegue a nuestro laboratorio
                <strong className="text-[var(--brand-primary)]"> llegue más rápido y con la mayor precisión posible</strong>.
              </p>
              <blockquote className="mt-6 border-l-4 border-[var(--brand-primary)] pl-4">
                <p className="text-sm italic text-gray-600">
                  "Si mañana ArtDent desapareciera, los odontólogos perderían un aliado."
                </p>
              </blockquote>
            </div>

            {/* Visual con logo e isotipo */}
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="flex gap-4 flex-wrap justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-[var(--border)] flex items-center justify-center">
                    <img src={logoColor} alt="ArtDent Laboratorio" className="h-14 object-contain" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500"></span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-[var(--border)] flex items-center justify-center">
                    <img src={logoAzul} alt="ArtDent Insumos" className="h-14 object-contain" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500"></span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {[
                  { icon: '🦷', text: 'Laboratorio odontológico' },
                  { icon: '🛒', text: 'Insumos dentales' },
                  { icon: '🎓', text: 'ArtDent Academy' },
                  { icon: '🌎', text: 'Expansión regional' },
                ].map((item) => (
                  <div key={item.text} className="rounded-xl bg-white p-3 text-center shadow-sm border border-[var(--border)]">
                    <div className="text-xl">{item.icon}</div>
                    <p className="mt-1 text-xs font-semibold text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores ───────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Nuestros valores</h2>
            <p className="mt-2 text-sm text-gray-500">Los principios que nunca negociamos</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {valores.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card p-5 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-soft)]">
                  <Icon size={20} className="text-[var(--brand-primary)]" />
                </div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hoja de ruta ──────────────────────────────────────────────────── */}
      <section className="bg-[var(--brand-soft)] py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
              <Globe size={20} className="text-[var(--brand-primary)]" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Hacia dónde vamos</h2>
            <p className="mt-2 text-sm text-gray-500">Nuestra hoja de ruta estratégica</p>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Línea conectora (solo desktop) */}
            <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-0.5 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-accent)] to-[var(--brand-secondary)] opacity-30 md:block" />

            {roadmap.map((etapa, i) => (
              <div key={etapa.plazo} className="card relative overflow-hidden p-0">
                {/* Header de color */}
                <div className={`${etapa.color} ${etapa.textColor} px-5 py-4 flex items-center gap-3`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold opacity-80 uppercase tracking-widest">{etapa.plazo}</p>
                    <p className="text-base font-extrabold">{etapa.titulo}</p>
                  </div>
                </div>
                {/* Items */}
                <ul className="px-5 py-4 space-y-2">
                  {etapa.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand-primary)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ecosistema integrado ──────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Un ecosistema completo</h2>
            <p className="mt-2 text-sm text-gray-500">Tres unidades que se potencian entre sí</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: '🦷',
                titulo: 'Laboratorio',
                desc: 'Fabricación de prótesis y rehabilitaciones dentales con tecnología digital de fresado. Precisión, rapidez y estética en cada pieza.',
                badge: 'Núcleo técnico',
              },
              {
                icon: '🛒',
                titulo: 'Insumos',
                desc: 'Tienda online de materiales especializados para odontólogos y técnicos dentales. Los mismos insumos que usamos en nuestro laboratorio.',
                badge: 'E-commerce',
              },
              {
                icon: '🎓',
                titulo: 'Academy',
                desc: 'Cursos presenciales y online de cerámica, ExoCAD, prótesis flexibles y liderazgo. Formación disruptiva para el profesional del futuro.',
                badge: 'Próximamente',
              },
            ].map((item) => (
              <div key={item.titulo} className="card p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900">{item.titulo}</p>
                    <span className="badge text-[10px]">{item.badge}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-14 text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-primary-dark) 0%, var(--brand-primary) 60%, var(--brand-accent) 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }}
        />
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <div className="flex items-center justify-center gap-6 mb-5">
            <img src={logoBlanco} alt="ArtDent Laboratorio" className="h-10 object-contain" />
            <div className="w-px h-8 bg-white/30" />
            <img src={logoInsumos} alt="ArtDent Insumos" className="h-10 object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold md:text-3xl">¿Listo para trabajar juntos?</h2>
          <p className="mt-3 text-sm text-white/80">
            Sumáte a los odontólogos y clínicas que eligieron a ArtDent como su aliado
            estratégico en Formosa y la región.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/productos" className="btn bg-white !text-[var(--brand-primary)] font-bold hover:bg-white/90 px-7 py-2.5">
              Ver catálogo →
            </Link>
            <Link to="/contacto" className="btn border border-white/40 bg-white/10 text-white hover:bg-white/20 px-7 py-2.5">
              Contactarnos
            </Link>
          </div>
        </div>
      </section>

      </div>
    </>
  )
}
