import { Head, Link, useForm } from "@inertiajs/react"
import GuestLayout from "@/Layouts/GuestLayout"
import { Button } from "@/Components/ui/button"
import { MailCheck, LogOut } from "lucide-react"

export default function VerifyEmail({ status }) {
  const { post, processing } = useForm({})

  const submit = (e) => {
    e.preventDefault()
    post("/email/verification-notification")
  }

  const sent = status === "verification-link-sent"

  return (
    <GuestLayout title="Verificar email">
      <Head title="Verificar email" />

      <div className="mb-6">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <MailCheck size={22} className="text-[rgba(172,214,206,0.95)]" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight">Verificá tu correo</h2>
        <p className="mt-2 text-sm text-white/45 leading-6">
          Te enviamos un enlace de verificación. Abrí el correo y confirmá tu cuenta para continuar.
        </p>
      </div>

      {sent && (
        <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Enlace de verificación enviado. Revisá tu bandeja de entrada.
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <Button
          type="submit"
          disabled={processing}
          className="w-full h-11 rounded-xl font-bold uppercase tracking-wider
                     bg-[linear-gradient(90deg,#5AAD9C,#49949C)]
                     hover:bg-[linear-gradient(90deg,#49949C,#397B9C)]
                     shadow-[0_12px_30px_rgba(90,173,156,0.22)]
                     hover:shadow-[0_14px_34px_rgba(57,123,156,0.26)]
                     transition"
        >
          {processing ? "Enviando..." : "Reenviar verificación"}
        </Button>

        <Link
          href="/logout"
          method="post"
          as="button"
          className="w-full h-11 rounded-xl border border-white/15 bg-white/[0.02]
                     text-white/70 font-semibold hover:bg-white/[0.06] hover:border-white/25 transition
                     inline-flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Cerrar sesión
        </Link>
      </form>
    </GuestLayout>
  )
}
