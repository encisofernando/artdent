import { Link } from 'react-router-dom'
import isotipoAzul from '../assets/isotipo-azul.png'

export default function Home() {
  return (
    <div>
      <section className="brand-gradient">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold tracking-wide text-[var(--brand-primary)]">
                ARTDENT · E-commerce
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
                Tu sonrisa, es nuestra prioridad.
              </h1>
              <p className="mt-4 max-w-prose text-base/7 text-gray-600">
                Catálogo profesional con stock, impuestos y facturación integrados. Diseño minimalista y consistente con la identidad de ARTDENT.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/productos" className="btn btn-primary">Ver productos</Link>
                <Link to="/iniciar-sesion" className="btn btn-outline">Ingresar</Link>
              </div>
            </div>
            <div className="relative">
              <div className="card p-10">
                <img src={isotipoAzul} alt="ARTDENT" className="mx-auto h-44 w-auto opacity-90" />
                <p className="mt-6 text-center text-sm text-gray-600">
                  Minimalismo, claridad, confianza.
                </p>
              </div>
              <div className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-2xl border bg-white/60" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold">Acceso rápido</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card p-6">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Catálogo</p>
              <p className="mt-2 text-sm text-gray-600">Búsqueda por SKU, nombre y paginación desde API.</p>
              <Link to="/productos" className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">Abrir →</Link>
            </div>
            <div className="card p-6">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Cuenta</p>
              <p className="mt-2 text-sm text-gray-600">Sesión con Sanctum (Bearer) y permisos por token.</p>
              <Link to="/mi-cuenta" className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">Abrir →</Link>
            </div>
            <div className="card p-6">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Carrito</p>
              <p className="mt-2 text-sm text-gray-600">Estructura lista para cerrar pedido contra ventas.</p>
              <Link to="/carrito" className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">Abrir →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
