import { Head, useForm, Link } from "@inertiajs/react"
import { useState } from "react"
import GuestLayout from "@/Layouts/GuestLayout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"

function FieldError({ message }) {
  if (!message) return null
  return <div className="mt-2 text-sm text-red-400">{message}</div>
}

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: "",
  })

  const [showPwd, setShowPwd] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    post("/confirm-password", {
      onFinish: () => reset("password"),
    })
  }

  return (
    <GuestLayout title="Confirmar contraseña">
      <Head title="Confirmar contraseña" />

      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm text-white/40 hover:text-[rgba(172,214,206,0.95)] transition"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <div className="mb-6">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Lock size={20} className="text-[rgba(172,214,206,0.95)]" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight">Confirmación requerida</h2>
        <p className="mt-2 text-sm text-white/45 leading-6">
          Para continuar, confirmá tu contraseña.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white/70">Contraseña</label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              name="password"
              value={data.password}
              autoComplete="current-password"
              onChange={(e) => setData("password", e.target.value)}
              className="pr-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25
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

        <Button
          type="submit"
          disabled={processing}
          className="w-full h-11 rounded-xl font-bold uppercase tracking-wider
                     bg-[linear-gradient(90deg,#397B9C,#49949C)]
                     hover:bg-[linear-gradient(90deg,#49949C,#5AAD9C)]
                     shadow-[0_12px_30px_rgba(57,123,156,0.26)]
                     hover:shadow-[0_14px_34px_rgba(90,173,156,0.30)]
                     transition"
        >
          {processing ? "Confirmando..." : "Confirmar"}
        </Button>
      </form>
    </GuestLayout>
  )
}
