import { Head, Link, useForm } from "@inertiajs/react"
import { useState } from "react"
import GuestLayout from "@/Layouts/GuestLayout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react"

function FieldError({ message }) {
  if (!message) return null
  return <div className="mt-2 text-sm text-red-400">{message}</div>
}

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  const submit = (e) => {
    e.preventDefault()

    post("/register", {
      onFinish: () => reset("password", "password_confirmation"),
    })
  }

  return (
    <GuestLayout title="Crear cuenta">
      <Head title="Crear cuenta" />

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Crear cuenta</h2>
        <p className="mt-1 text-sm text-white/45">Completá tus datos para registrarte</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="text-sm font-medium text-white/70">Nombre completo</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
              <User size={18} />
            </span>
            <Input
              id="name"
              name="name"
              value={data.name}
              autoComplete="name"
              autoFocus
              onChange={(e) => setData("name", e.target.value)}
              className="pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25
                         focus-visible:ring-2 focus-visible:ring-[rgba(172,214,206,0.7)]"
            />
          </div>
          <FieldError message={errors.name} />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-white/70">Correo electrónico</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
              <Mail size={18} />
            </span>
            <Input
              id="email"
              name="email"
              type="email"
              value={data.email}
              autoComplete="username"
              placeholder="email@artdent.com.ar"
              onChange={(e) => setData("email", e.target.value)}
              className="pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25
                         focus-visible:ring-2 focus-visible:ring-[rgba(172,214,206,0.7)]"
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
              name="password"
              type={showPwd ? "text" : "password"}
              value={data.password}
              autoComplete="new-password"
              onChange={(e) => setData("password", e.target.value)}
              className="pl-10 pr-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25
                         focus-visible:ring-2 focus-visible:ring-[rgba(90,173,156,0.7)]"
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

        {/* Password confirmation */}
        <div>
          <label className="text-sm font-medium text-white/70">Confirmar contraseña</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
              <Lock size={18} />
            </span>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type={showPwd2 ? "text" : "password"}
              value={data.password_confirmation}
              autoComplete="new-password"
              onChange={(e) => setData("password_confirmation", e.target.value)}
              className="pl-10 pr-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25
                         focus-visible:ring-2 focus-visible:ring-[rgba(90,173,156,0.7)]"
            />
            <button
              type="button"
              onClick={() => setShowPwd2((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition"
              aria-label="Mostrar/ocultar contraseña"
            >
              {showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldError message={errors.password_confirmation} />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={processing}
          className="w-full h-11 rounded-xl font-bold uppercase tracking-wider
                     bg-[linear-gradient(90deg,#5AAD9C,#49949C)]
                     hover:bg-[linear-gradient(90deg,#49949C,#397B9C)]
                     shadow-[0_12px_30px_rgba(90,173,156,0.26)]
                     hover:shadow-[0_14px_34px_rgba(57,123,156,0.30)]
                     transition"
        >
          {processing ? "Creando..." : "Crear cuenta"}
        </Button>

        {/* Google (visual placeholder) */}
        <button
          type="button"
          className="w-full h-11 rounded-xl border border-white/15 bg-white/[0.02]
                     text-white/70 font-semibold hover:bg-white/[0.06] hover:border-white/25 transition"
          onClick={() => alert("Google OAuth pendiente de implementar.")}
        >
          Registrarse con Google
        </button>

        {/* Link login */}
        <p className="pt-2 text-center text-sm text-white/40">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[rgba(172,214,206,0.95)] hover:text-[rgba(90,173,156,1)] transition"
          >
            Iniciá sesión
          </Link>
        </p>
      </form>
    </GuestLayout>
  )
}
