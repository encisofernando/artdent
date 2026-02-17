"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Menu, Sun, Moon, Bell, Settings, LogOut,
  CheckCircle2, XCircle, Clock, Zap, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore, SIDEBAR_WIDTH, COLLAPSED_WIDTH } from "@/stores/useSidebarStore";
import { useAuthStore } from "@/stores/useAuthStore";

// Status indicator
type ApiStatus = "idle" | "ok" | "error";

export default function Topbar() {
  const router   = useRouter();
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const { isCollapsed, openMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();

  const [status,    setStatus]    = useState<ApiStatus>("idle");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [label,     setLabel]     = useState("Sistema");

  // Health check (lightweight ping)
  useEffect(() => {
    let cancelled = false;
    setStatus("idle"); setLatencyMs(null);

    const check = async () => {
      const t0 = performance.now();
      try {
        const token =
          typeof window !== "undefined"
            ? (localStorage.getItem("artdent_token") || localStorage.getItem("token"))
            : null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "https://api.artdent.com.ar/api"}/company`,
          { headers: { Authorization: `Bearer ${token ?? ""}`, Accept: "application/json" }, signal: AbortSignal.timeout(6000) }
        );

        if (!cancelled) {
          setStatus(res.ok ? "ok" : "error");
          setLatencyMs(Math.round(performance.now() - t0));
          setLabel(
            pathname.startsWith("/facturacion") || pathname.startsWith("/articulos")
              ? "Productos"
              : pathname.startsWith("/clientes")
              ? "Clientes"
              : "Sistema"
          );
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    check();
    return () => { cancelled = true; };
  }, [pathname]);

  const statusConfig = useMemo(() => ({
    idle:  { color: "text-yellow-400", dot: "bg-yellow-400", icon: <Clock     size={13} />, text: "Verificando" },
    ok:    { color: "text-emerald-400", dot: "bg-emerald-400", icon: <CheckCircle2 size={13} />, text: "Conectado" },
    error: { color: "text-red-400",    dot: "bg-red-400",    icon: <XCircle   size={13} />, text: "Error" },
  }[status]), [status]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  const sidebarW = isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const userInitial = user?.name ? String(user.name)[0].toUpperCase() : "A";

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 flex items-center",
        "border-b border-border",
        "bg-background/80 backdrop-blur-md",
        "transition-all duration-300"
      )}
      style={{ left: `${sidebarW}px` }}
    >
      <div className="flex items-center gap-2 px-4 w-full">
        {/* Hamburger (mobile) */}
        <button
          onClick={openMobile}
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu size={18} className="text-foreground/70" />
        </button>

        {/* API Status pill */}
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border",
          "bg-card border-border text-sm font-medium min-w-[160px]"
        )}>
          <span className={cn("w-2 h-2 rounded-full shrink-0", statusConfig.dot,
            status === "idle" && "animate-pulse"
          )} />
          <span className="text-foreground/80 truncate">{label}</span>
          {latencyMs !== null && (
            <span className={cn(
              "ml-auto flex items-center gap-0.5 text-xs font-semibold",
              statusConfig.color
            )}>
              <Zap size={11} />
              {latencyMs}ms
            </span>
          )}
          <span className={cn("ml-1", statusConfig.color)}>
            {statusConfig.icon}
          </span>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Modo claro" : "Modo oscuro"}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground/70 hover:text-foreground"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notificaciones */}
          <button
            title="Notificaciones"
            className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground/70 hover:text-foreground relative"
          >
            <Bell size={17} />
            {/* Badge ejemplo */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-green rounded-full" />
          </button>

          {/* Settings */}
          <Link
            href="/settings"
            title="Configuración"
            className="hidden sm:flex p-2 rounded-lg hover:bg-accent transition-colors text-foreground/70 hover:text-foreground"
          >
            <Settings size={17} />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-foreground/70"
          >
            <LogOut size={17} />
          </button>

          {/* Avatar */}
          <Link
            href="/profile"
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-xl ml-1",
              "bg-brand-green text-white font-bold text-sm",
              "hover:opacity-90 transition-opacity"
            )}
            title="Mi perfil"
          >
            {user?.name ? userInitial : <User size={14} />}
          </Link>
        </div>
      </div>
    </header>
  );
}
