import { Head } from "@inertiajs/react"

const BgPattern = () => (
  <svg
    className="absolute inset-0 h-full w-full opacity-[0.07] pointer-events-none"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="adPat" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <ellipse cx="24" cy="18" rx="9" ry="11" fill="none" stroke="#fff" strokeWidth="2" />
        <ellipse cx="24" cy="42" rx="9" ry="11" fill="none" stroke="#fff" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#adPat)" />
  </svg>
)

export default function GuestLayout({ children, title = "Acceso" }) {
  return (
    <div className="min-h-screen bg-[#0e1a24] text-white">
      <Head title={title} />

      <div className="min-h-screen flex">
        {/* Panel izquierdo (desktop) */}
        <aside className="relative hidden md:flex md:w-[42%] md:min-w-[380px] flex-col justify-between overflow-hidden px-12 py-14
                          bg-[linear-gradient(145deg,#397B9C_0%,#49949C_55%,#5AAD9C_100%)]">
          <BgPattern />

          <div className="relative z-10">
            <img
              src="/brand/logo-artdent-blanco.png"
              alt="ArtDent Laboratorio Odontológico"
              className="h-16 w-auto"
            />
          </div>

          <div className="relative z-10">
            <h1 className="text-[2.6rem] font-extrabold leading-[1.12] tracking-tight">
              Tu sonrisa,<br />
              <span className="text-white/70">es nuestra</span><br />
              prioridad.
            </h1>

            <div className="mt-5 h-[3px] w-12 rounded bg-white/35" />

            <p className="mt-6 max-w-[290px] text-sm leading-7 text-white/60">
              Sistema de gestión para el laboratorio odontológico.
              Accedé con tu cuenta para continuar.
            </p>
          </div>

          <div className="relative z-10 text-[0.72rem] tracking-[0.22em] uppercase text-white/35">
            El arte de crear para toda la vida
          </div>
        </aside>

        {/* Panel derecho */}
        <main className="flex-1 flex items-center justify-center px-6 py-10 bg-[linear-gradient(180deg,#0e1a24_0%,#111f2c_100%)]">
          <div className="w-full max-w-[420px]">
            {/* Logo mobile */}
            <div className="mb-8 flex md:hidden items-center justify-center">
              <img src="/brand/logo-artdent-color.png" alt="ArtDent" className="h-12 w-auto" />
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
              {children}
            </div>

            <p className="mt-6 text-center text-xs text-white/25">
              pos.artdent.com.ar
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
