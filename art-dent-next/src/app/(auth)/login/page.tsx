"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { Auth } from "@/services";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

const BG = "https://artdent.com.ar/static/lab/25.jpeg";

export default function LoginPage() {
  const router   = useRouter();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (isAuthed) router.replace("/");
  }, [isAuthed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await Auth.login(email, password);
      if (!token) { setError("Usuario o contraseña incorrectos"); return; }
      setAuth(token, user as Record<string, unknown>);
      toast.success("¡Bienvenido!");
      router.replace("/");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { errors?: { email?: string[] }; message?: string } } })?.response?.data;
      const msg  =
        data?.errors?.email?.[0] ||
        data?.message ||
        (err as Error)?.message ||
        "No se pudo iniciar sesión.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={BG}
          alt="Fondo ARTDENT"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "glass w-full max-w-sm rounded-2xl p-10 shadow-2xl",
          "animate-fade-in hover:-translate-y-0.5 transition-transform duration-300"
        )}
      >
        {/* Logo / título */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <span className="text-3xl font-bold tracking-tight text-white">
            ARTDENT
          </span>
          <span className="text-sm text-white/70 tracking-widest uppercase">
            Sistema de Gestión
          </span>
        </div>

        <h1 className="text-xl font-semibold text-white text-center mb-6">
          Iniciar sesión
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 px-3 py-2 text-sm text-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 uppercase tracking-wider">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@artdent.com.ar"
              className={cn(
                "w-full rounded-xl bg-white/10 border border-white/25",
                "px-4 py-2.5 text-sm text-white placeholder:text-white/40",
                "focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent",
                "transition-all duration-200"
              )}
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wider">
                Contraseña
              </label>
              <Link
                href="/crearcontrasena"
                className="text-xs text-brand-mint hover:text-white transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-xl bg-white/10 border border-white/25",
                  "px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                  "transition-all duration-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Recordarme */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-green"
            />
            <span className="text-sm text-white/80">Recordarme</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "bg-brand-blue hover:bg-brand-blue-mid disabled:opacity-60",
              "text-white font-semibold text-sm rounded-full py-3",
              "transition-all duration-200 shadow-lg shadow-brand-blue/30",
              "focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-transparent"
            )}
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <>
                <LogIn size={16} />
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-xs">o</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Google */}
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "border border-white/40 hover:border-white hover:bg-white/10",
            "text-white font-semibold text-sm rounded-full py-2.5",
            "transition-all duration-200"
          )}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Iniciar sesión con Google
        </button>

        <p className="text-center text-sm text-white/60 mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-brand-mint hover:text-white font-semibold transition-colors">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
