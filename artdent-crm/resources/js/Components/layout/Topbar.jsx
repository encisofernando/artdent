import { useEffect, useMemo, useState } from "react"
import { Link, router, usePage } from "@inertiajs/react"
import { Bell, LogOut, Menu, Moon, Sun, User } from "lucide-react"

const TOPBAR_HEIGHT = 64

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark"
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add("dark")
    else root.classList.remove("dark")
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light")
    } catch {}
  }, [isDark])

  return { isDark, toggle: () => setIsDark((v) => !v) }
}

function StatusDot({ state, latencyMs, label }) {
  // state: null=pending, true=ok, false=error
  const color =
    state === null ? "bg-amber-400"
    : state ? "bg-emerald-500"
    : "bg-red-500"

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-lg border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-3 py-1.5 select-none">
      <span className={`h-2 w-2 rounded-full ${color} ${state === null ? "animate-pulse" : ""}`} />
      <span className="text-xs font-semibold text-slate-700/80 dark:text-slate-100/85">
        {label}
      </span>
      {latencyMs != null && (
        <span className="text-[11px] font-bold text-slate-600/80 dark:text-[rgba(172,214,206,0.75)]">
          {latencyMs}ms
        </span>
      )}
    </div>
  )
}

export default function Topbar({ onOpenSidebar }) {
  const { props, url } = usePage()
  const user = props?.auth?.user || null

  const { isDark, toggle } = useDarkMode()

  const userInitial = useMemo(() => {
    const base = user?.name || user?.email || "A"
    return String(base).trim().charAt(0).toUpperCase()
  }, [user])

  // Estado API/latencia (simple): ping a /dashboard (HEAD/GET liviano)
  const [apiOk, setApiOk] = useState(null)
  const [latencyMs, setLatencyMs] = useState(null)
  const [label, setLabel] = useState("Sistema")

  useEffect(() => {
    let cancelled = false

    // rotulado parecido a tu lógica original
    if (url.startsWith("/productos")) setLabel("Productos")
    else if (url.startsWith("/clientes")) setLabel("Clientes")
    else setLabel("Sistema")

    const run = async () => {
      try {
        setApiOk(null)
        setLatencyMs(null)
        const t0 = performance.now()

        // Endpoint liviano. Si preferís uno real: /health o /ping
        const res = await fetch("/dashboard", { method: "HEAD" })

        if (cancelled) return
        setApiOk(res.ok)
        setLatencyMs(Math.round(performance.now() - t0))
      } catch {
        if (!cancelled) setApiOk(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [url])

  const logout = () => {
    router.post("/logout")
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b border-black/5 dark:border-white/10"
      style={{ height: TOPBAR_HEIGHT }}
    >
      <div className="h-full bg-white/85 dark:bg-slate-950/75">
        <div className="h-full px-3 sm:px-4 md:px-5 flex items-center gap-2">
          {/* Hamburger mobile */}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700/80 hover:bg-black/[0.04] dark:text-slate-100/80 dark:hover:bg-white/[0.06] transition"
            onClick={onOpenSidebar}
            aria-label="Abrir menú"
            type="button"
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo */}
          <Link href="/dashboard" className="md:hidden inline-flex items-center">
            <img
              src={isDark ? "/brand/logo-artdent-blanco.png" : "/brand/logo-artdent-color.png"}
              alt="ArtDent"
              className="h-8 w-auto"
            />
          </Link>

          <StatusDot state={apiOk} latencyMs={latencyMs} label={label} />

          <div className="flex-1" />

          <div className="flex items-center gap-1.5">
            {/* Theme */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700/80 hover:bg-black/[0.04] dark:text-slate-100/80 dark:hover:bg-white/[0.06] transition"
              onClick={toggle}
              type="button"
              aria-label={isDark ? "Modo claro" : "Modo oscuro"}
              title={isDark ? "Modo claro" : "Modo oscuro"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifs (placeholder) */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700/80 hover:bg-black/[0.04] dark:text-slate-100/80 dark:hover:bg-white/[0.06] transition"
              type="button"
              aria-label="Notificaciones"
              title="Notificaciones"
            >
              <Bell size={18} />
            </button>

            {/* Logout */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700/80 hover:bg-black/[0.04] dark:text-slate-100/80 dark:hover:bg-white/[0.06] transition"
              onClick={logout}
              type="button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>

            <div className="mx-1 h-6 w-px bg-black/10 dark:bg-white/10" />

            {/* Profile */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
              title={user?.name || user?.email || "Perfil"}
            >
              <div className="h-8 w-8 rounded-lg grid place-items-center text-white text-sm font-extrabold"
                   style={{ background: "linear-gradient(135deg,#397B9C,#5AAD9C)" }}>
                {userInitial}
              </div>

              <div className="hidden lg:block leading-tight max-w-[150px]">
                <div className="text-xs font-bold text-slate-800/90 dark:text-slate-100/90 truncate">
                  {user?.name || "Usuario"}
                </div>
                <div className="text-[11px] font-medium text-slate-600/70 dark:text-[rgba(172,214,206,0.7)] truncate">
                  {(user?.role || user?.email || "").toString()}
                </div>
              </div>

              <User className="hidden lg:block text-slate-500/70 dark:text-slate-300/60" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
