import { Head, Link, useForm } from "@inertiajs/react"
import GuestLayout from "@/Layouts/GuestLayout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

function FieldError({ message }) {
  if (!message) return null
  return <div className="mt-2 text-sm text-red-400">{message}</div>
}

export default function ForgotPassword({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
  })

  const submit = (e) => {
    e.preventDefault()
    post("/forgot-password")
  }

  const sent = Boolean(status)

  return (
    <GuestLayout title="Recuperar contraseña">
      <Head title="Recuperar contraseña" />

      <Link
        href="/login"
        className="mb-5 inline-flex items-center gap-2 text-sm text-white/40 hover:text-[rgba(172,214,206,0.95)] transition"
      >
        <ArrowLeft size={16} />
        Volver al inicio de sesión
      </Link>

      {!sent ? (
        <>
          <div className="mb-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl
                            border border-white/10 bg-white/[0.04]">
              <Mail size={20} className="text-[rgba(172,214,206,0.95)]" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight">Recuperar contraseña</h2>
            <p className="mt-1 text-sm text-white/45 leading-6">
              Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
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
                  autoFocus
                  autoComplete="email"
                  placeholder="email@artdent.com.ar"
                  onChange={(e) => setData("email", e.target.value)}
                  className="pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/25
                             focus-visible:ring-2 focus-visible:ring-[rgba(172,214,206,0.7)]"
                />
              </div>
              <FieldError message={errors.email} />
            </div>

            <Button
              type="submit"
              disabled={processing || !data.email}
              className="w-full h-11 rounded-xl font-bold uppercase tracking-wider
                         bg-[linear-gradient(90deg,#397B9C,#49949C)]
                         hover:bg-[linear-gradient(90deg,#49949C,#5AAD9C)]
                         shadow-[0_12px_30px_rgba(57,123,156,0.26)]
                         hover:shadow-[0_14px_34px_rgba(90,173,156,0.30)]
                         transition"
            >
              {processing ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center py-2">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full
                          border border-emerald-500/25 bg-emerald-500/10">
            <CheckCircle2 size={24} className="text-emerald-300" />
          </div>

          <h2 className="text-xl font-bold">¡Correo enviado!</h2>
          <p className="mt-2 text-sm text-white/45 leading-6">{status}</p>

          <Button asChild className="mt-5 rounded-xl">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      )}
    </GuestLayout>
  )
}
