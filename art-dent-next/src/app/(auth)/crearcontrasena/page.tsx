"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Auth } from "@/services";
import { cn } from "@/lib/utils";

const BG = "https://artdent.com.ar/static/lab/25.jpeg";

export default function RecuperarContraseñaPage() {
  const [email,   setEmail]   = useState("");
  const [msg,     setMsg]     = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    setLoading(true);
    try {
      const res = await Auth.requestPasswordReset(email) as { message?: string };
      const message = res?.message ?? "Si el correo existe, te enviamos un enlace para restablecer la contraseña.";
      setMsg(message);
      setSent(true);
      toast.success("¡Correo enviado!");
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No pudimos procesar tu solicitud.";
      setError(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src={BG} alt="Fondo ARTDENT" fill className="object-cover object-center" priority unoptimized />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="glass w-full max-w-sm rounded-2xl p-10 shadow-2xl animate-fade-in hover:-translate-y-0.5 transition-transform duration-300">
        <div className="flex flex-col items-center mb-6 gap-1">
          <span className="text-3xl font-bold tracking-tight text-white">ARTDENT</span>
          <span className="text-xs text-white/60 tracking-widest uppercase">Sistema de Gestión</span>
        </div>

        <h1 className="text-xl font-semibold text-white text-center mb-2">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-white/60 text-center mb-6">
          Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 px-3 py-2 text-sm text-red-200 text-center">
            {error}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-lg bg-green-500/20 border border-green-400/40 px-3 py-2 text-sm text-green-200 text-center">
            {msg}
          </div>
        )}

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wider">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@artdent.com.ar"
                className={cn(
                  "w-full rounded-xl bg-white/10 border border-white/25",
                  "px-4 py-2.5 text-sm text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "bg-brand-blue hover:bg-brand-blue-mid disabled:opacity-60",
                "text-white font-semibold text-sm rounded-full py-3",
                "transition-all duration-200 shadow-lg shadow-brand-blue/30"
              )}
            >
              {loading
                ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                : <><Mail size={16} /> Enviar enlace</>
              }
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-white/60 hover:text-white mt-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver a Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
