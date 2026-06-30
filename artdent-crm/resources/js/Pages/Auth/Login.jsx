import { Head, Link, useForm } from "@inertiajs/react"
import { useState } from "react"
import GuestLayout from "@/Layouts/GuestLayout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"

// Si tenés lucide-react instalado, podés usar íconos.
// Si no, el código funciona igual sin ellos.
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

const C = {
  blue: "#397B9C",
  green: "#5AAD9C",
  mint: "#ACD6CE",
  teal: "#49949C",
}

function FieldError({ message }) {
  if (!message) return null
  return <div className="mt-2 text-sm text-red-400">{message}</div>
}

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  })

  const [showPwd, setShowPwd] = useState(false)

  const submit = (e) => {
    e.preventDefault()

    // Breeze usa POST /login
    post("/login", {
      onFinish: () => reset("password"),
    })
  }

  return (
    <GuestLayout title="Iniciar sesión">
      <Head title="Iniciar sesión" />

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Iniciar sesión</h2>
        <p className="mt-1 text-sm text-white/45">
          Ingresá tus credenciales para continuar
        </p>
      </div>

      {status && (
        <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {status}
        </div>
      )}

      {(errors?.email || errors?.password) && (
        <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Revisá tus datos e intentá nuevamente.
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-sm font-medium text-white/70">Correo electrónico</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
              <Mail size={18} />
            </span>
            <Input
              id="email"
              type="email"
              name="email"
              value={data.email}
              autoComplete="username"
              autoFocus
              placeholder="email@artdent.com.ar"
              onChange={(e) => setData("email", e.target.value)}
              className="pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus-visible:ring-2 focus-visible:ring-[rgba(172,214,206,0.7)]"
            />
          </div>
          <FieldError message={errors.email} />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-white/70">Contraseña</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
              <Lock size={18} />
            </span>

            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              name="password"
              value={data.password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={(e) => setData("password", e.target.value)}
              className="pl-10 pr-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus-visible:ring-2 focus-visible:ring-[rgba(90,173,156,0.7)]"
            />

            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition"
              aria-label="Mostrar/ocultar contraseña"
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldError message={errors.password} />
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm text-white/55 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-white/10 accent-[color:var(--accent)]"
              checked={data.remember}
              onChange={(e) => setData("remember", e.target.checked)}
              style={{ accentColor: C.green }}
            />
            Recordarme
          </label>

          {canResetPassword && (
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[rgba(172,214,206,0.9)] hover:text-[rgba(90,173,156,1)] transition"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={processing}
          className="w-full h-11 rounded-xl font-bold uppercase tracking-wider
                     bg-[linear-gradient(90deg,#397B9C,#49949C)]
                     hover:bg-[linear-gradient(90deg,#49949C,#5AAD9C)]
                     shadow-[0_12px_30px_rgba(57,123,156,0.30)]
                     hover:shadow-[0_14px_34px_rgba(90,173,156,0.32)]
                     transition"
        >
          {processing ? "Ingresando..." : "Iniciar sesión"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-white/10" />
          <div className="text-xs text-white/30">o continuá con</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Google (stub visual) */}
        <button
          type="button"
          title="Próximamente disponible"
          className="w-full h-11 rounded-xl border border-white/15 bg-white/[0.02]
                     text-white/40 font-semibold cursor-not-allowed opacity-60 transition"
          onClick={() => {}}
        >
          Iniciar sesión con Google (próximamente)
        </button>

        {/* Register */}
        <p className="pt-3 text-center text-sm text-white/40">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-semibold text-[rgba(172,214,206,0.95)] hover:text-[rgba(90,173,156,1)] transition"
          >
            Registrate
          </Link>
        </p>
      </form>
    </GuestLayout>
  )
}
