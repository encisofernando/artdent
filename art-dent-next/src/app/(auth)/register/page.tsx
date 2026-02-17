"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import authService from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

const BG = "https://artdent.com.ar/static/lab/25.jpeg";

interface FieldErrors {
  name?:                  string[];
  email?:                 string[];
  password?:              string[];
  password_confirmation?: string[];
}

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
  });
  const [showPwd,   setShowPwd]   = useState(false);
  const [showPwd2,  setShowPwd2]  = useState(false);
  const [errors,    setErrors]    = useState<FieldErrors>({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading,   setLoading]   = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
    setGlobalErr("");
  };

  const firstError = (field: keyof FieldErrors) => errors[field]?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalErr(""); setErrors({});
    if (!form.name || !form.email || !form.password) {
      setGlobalErr("Completá todos los campos obligatorios.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ["Las contraseñas no coinciden."] });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.register(form);
      if (res?.token) {
        setAuth(res.token, res.user as Record<string, unknown>);
        toast.success("¡Cuenta creada!");
        router.replace("/");
      } else {
        setGlobalErr("No se recibió token.");
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { errors?: FieldErrors; message?: string } } })?.response?.data;
      if (data?.errors) setErrors(data.errors);
      if (data?.message && !data?.errors) setGlobalErr(data.message);
      if (!data) setGlobalErr("No se pudo registrar. Intentalo de nuevo.");
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

        <h1 className="text-xl font-semibold text-white text-center mb-6">Crear cuenta</h1>

        {globalErr && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 px-3 py-2 text-sm text-red-200 text-center">
            {globalErr}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {[
            { label: "Nombre",    name: "name",  type: "text",     autoComplete: "name" },
            { label: "Email",     name: "email", type: "email",    autoComplete: "email" },
          ].map(({ label, name, type, autoComplete }) => (
            <div key={name} className="space-y-1">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                name={name}
                required
                autoComplete={autoComplete}
                value={form[name as keyof typeof form]}
                onChange={onChange}
                className={cn(
                  "w-full rounded-xl bg-white/10 border px-4 py-2.5 text-sm text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all",
                  firstError(name as keyof FieldErrors)
                    ? "border-red-400/70"
                    : "border-white/25"
                )}
              />
              {firstError(name as keyof FieldErrors) && (
                <p className="text-xs text-red-300">{firstError(name as keyof FieldErrors)}</p>
              )}
            </div>
          ))}

          {/* Contraseña */}
          {[
            { label: "Contraseña",          name: "password",              show: showPwd,  toggle: () => setShowPwd(p => !p) },
            { label: "Confirmar contraseña", name: "password_confirmation", show: showPwd2, toggle: () => setShowPwd2(p => !p) },
          ].map(({ label, name, show, toggle }) => (
            <div key={name} className="space-y-1">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wider">{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  name={name}
                  required
                  value={form[name as keyof typeof form]}
                  onChange={onChange}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-xl bg-white/10 border px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/40",
                    "focus:outline-none focus:ring-2 focus:ring-brand-green transition-all",
                    firstError(name as keyof FieldErrors)
                      ? "border-red-400/70"
                      : "border-white/25"
                  )}
                />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {firstError(name as keyof FieldErrors) && (
                <p className="text-xs text-red-300">{firstError(name as keyof FieldErrors)}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 mt-2",
              "bg-brand-blue hover:bg-brand-blue-mid disabled:opacity-60",
              "text-white font-semibold text-sm rounded-full py-3",
              "transition-all duration-200 shadow-lg shadow-brand-blue/30",
              "focus:outline-none focus:ring-2 focus:ring-brand-blue"
            )}
          >
            {loading
              ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              : <><UserPlus size={16} /> Crear cuenta</>
            }
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-xs">o</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        <button type="button" className="w-full flex items-center justify-center gap-2 border border-white/40 hover:border-white hover:bg-white/10 text-white font-semibold text-sm rounded-full py-2.5 transition-all">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Registrarse con Google
        </button>

        <p className="text-center text-sm text-white/60 mt-5">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-brand-mint hover:text-white font-semibold transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
