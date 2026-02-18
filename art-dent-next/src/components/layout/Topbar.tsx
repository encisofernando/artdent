"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  Menu,
  Sun,
  Moon,
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gauge,
} from "lucide-react";

import { Companies, Products, Customers } from "@/services";

const TOPBAR_HEIGHT = 64;

type TopbarProps = {
  onOpenSidebar?: () => void;
  onLogout?: () => void;
  setIsAuthenticated?: (v: boolean) => void;
};

export default function Topbar({
  setIsAuthenticated,
  onOpenSidebar,
  onLogout,
}: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  // Importante: para evitar hydration mismatch, no usamos "isDark" para clases del header.
  // Usamos colores por CSS variables (bg-background, border-border, etc).
  // Solo usamos resolvedTheme para el ícono (y lo hacemos "safe" con mounted).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  const [apiOk, setApiOk] = React.useState<boolean | null>(null);
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null);
  const [label, setLabel] = React.useState<string>("Sistema");
  const [count, setCount] = React.useState<number | null>(null);

  const logout = React.useCallback(() => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("token");
      localStorage.removeItem("artdent_token");
      setIsAuthenticated?.(false);
    }
    router.push("/");
  }, [onLogout, router, setIsAuthenticated]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setApiOk(null);
        setLatencyMs(null);
        setCount(null);

        const t0 = performance.now();

        if (
          pathname.startsWith("/ventas") ||
          pathname.startsWith("/facturacion") ||
          pathname.startsWith("/articulos")
        ) {
          setLabel("Productos");
          const rows = await Products.listProducts?.({ page: 1, per_page: 1 });
          const list = Array.isArray(rows) ? rows : rows?.data ?? [];
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(performance.now() - t0));
            setCount(list.length);
          }
          return;
        }

        if (pathname.startsWith("/clientes")) {
          setLabel("Clientes");
          const res = await Customers.list?.({ page: 1, per_page: 1 });
          const list = Array.isArray(res) ? res : res?.data ?? [];
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(performance.now() - t0));
            setCount(list.length);
          }
          return;
        }

        setLabel("Sistema");
        await Companies.get?.();
        if (!cancelled) {
          setApiOk(true);
          setLatencyMs(Math.round(performance.now() - t0));
        }
      } catch {
        if (!cancelled) setApiOk(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const status = React.useMemo(() => {
    if (apiOk === null) {
      return {
        dotClass: "bg-yellow-500 animate-pulse",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: "Verificando",
      };
    }
    if (apiOk) {
      return {
        dotClass: "bg-emerald-500",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        text: "Conectado",
      };
    }
    return {
      dotClass: "bg-rose-500",
      icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
      text: "Error",
    };
  }, [apiOk]);

  const toggleTheme = React.useCallback(() => {
    // Ojo: si no está mounted, igual no pasa nada grave; es click del usuario.
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return (
    <header
      className="sticky top-0 z-[1100] w-full border-b backdrop-blur-xl bg-background/70 border-border"
      style={{ height: TOPBAR_HEIGHT }}
    >
      <div className="h-full px-3 sm:px-4 flex items-center gap-2">
        {/* Menú móvil */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted/40"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Panel de estado (OCULTO EN MOBILE) */}
        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-border px-3 py-2 min-w-0 w-[360px] bg-card/60">
          <span className={["h-3 w-3 rounded-full", status.dotClass].join(" ")} />

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-extrabold truncate">{label}</span>

                {typeof count === "number" && (
                  <span
                    className="text-[11px] font-semibold rounded-full px-2 py-[2px] border border-border bg-muted/40 text-foreground/90"
                    title="Cantidad (muestra 1 por el health-check)"
                  >
                    {count}
                  </span>
                )}
              </div>

              <div className="text-[11px] truncate text-muted-foreground">
                {status.text}
              </div>
            </div>

            {latencyMs !== null && (
              <span
                className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] font-semibold border border-border bg-muted/40"
                title="Latencia"
              >
                <Gauge className="h-3 w-3" />
                {latencyMs}ms
              </span>
            )}
          </div>

          {status.icon}
        </div>

        <div className="flex-1" />

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted/40"
            aria-label={isDark ? "Modo claro" : "Modo oscuro"}
            title={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted/40"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted/40"
            aria-label="Configuración"
            title="Configuración"
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted/40"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="ml-1 h-9 w-9 rounded-full grid place-items-center font-extrabold text-sm border border-border bg-emerald-500/20 text-emerald-200"
            aria-label="Perfil"
            title="Perfil"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}
