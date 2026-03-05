import { useEffect, useMemo, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import {
  BarChart3, Building2, ClipboardList, CreditCard, FileText, FlaskConical, Home,
  LayoutDashboard, Package, Settings, ShoppingCart, Users, Wrench, ChevronDown, ChevronRight, X
} from "lucide-react"

const SIDEBAR_WIDTH = 272
const COLLAPSED_WIDTH = 72

const NAV = [
  { section: null, items: [{ title: "Panel General", icon: Home, href: "/dashboard" }] },
  {
    section: "Gestión",
    items: [
      {
        title: "Ventas", icon: CreditCard, key: "ventas",
        children: [
          { title: "POS", icon: ShoppingCart, href: "/ventas/pos" },
          { title: "Lista de Ventas", icon: FileText, href: "/ventas" },
          { title: "Productos", icon: Package, href: "/productos" },
        ],
      },
      {
        title: "Clientes", icon: Users, key: "clientes",
        children: [
          { title: "Lista", icon: ClipboardList, href: "/clientes" },
        ],
      },
      {
        title: "Compras", icon: FileText, href: "/compras",
      },
      {
        title: "Stock", icon: Package, href: "/stock",
      },
    ],
  },
  {
    section: "Laboratorio",
    items: [
      { title: "Jobs", icon: FlaskConical, href: "/laboratorio" },
    ],
  },
  {
    section: "Análisis",
    items: [
      { title: "Reportes", icon: BarChart3, href: "/reportes" },
    ],
  },
  {
    section: "Sistema",
    items: [
      { title: "Empresa", icon: Building2, href: "/settings" },
      { title: "Administración", icon: Settings, href: "/admin" },
    ],
  },
]

function isActive(url, href) {
  return url === href || url.startsWith(href + "/")
}

export default function Sidebar({
  variant, // "desktop" | "mobile"
  collapsed,
  setCollapsed,
  open,
  onClose,
}) {
  const { url } = usePage()
  const isMobile = variant === "mobile"

  const [openMenus, setOpenMenus] = useState({})

  useEffect(() => {
    // auto-open básico según url
    const next = {}
    if (url.startsWith("/ventas")) next.ventas = true
    if (url.startsWith("/clientes")) next.clientes = true
    setOpenMenus((prev) => ({ ...prev, ...next }))

    if (isMobile && onClose) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const width = isMobile ? SIDEBAR_WIDTH : (collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH)

  const container = (
    <aside
      className="h-screen border-r border-black/5 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
      style={{ width }}
    >
      {/* Header */}
      <div className="h-16 px-3 flex items-center justify-between border-b border-black/5 dark:border-white/10">
        {!collapsed || isMobile ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
              <img
                src="/brand/logo-artdent-color.png"
                alt="ArtDent"
                className="h-9 w-auto"
              />
            </Link>

            <button
              type="button"
              className="h-9 w-9 rounded-lg grid place-items-center text-slate-600/80 hover:bg-black/[0.04] dark:text-slate-200/70 dark:hover:bg-white/[0.06]"
              onClick={() => (isMobile ? onClose?.() : setCollapsed(true))}
              aria-label={isMobile ? "Cerrar menú" : "Colapsar sidebar"}
            >
              {isMobile ? <X size={18} /> : <ChevronRight size={18} />}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="mx-auto h-10 w-10 rounded-xl grid place-items-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir sidebar"
            title="Expandir"
          >
            <div className="h-9 w-9 rounded-lg grid place-items-center text-white font-extrabold"
                 style={{ background: "linear-gradient(135deg,#397B9C,#5AAD9C)" }}>
              AD
            </div>
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="h-[calc(100vh-64px)] overflow-y-auto py-2">
        {NAV.map((sec, idx) => (
          <div key={idx} className="mb-2">
            {sec.section && (!collapsed || isMobile) && (
              <div className="px-4 pt-3 pb-2 text-[10.5px] font-bold tracking-[0.12em] uppercase text-slate-500/70 dark:text-[rgba(172,214,206,0.55)]">
                {sec.section}
              </div>
            )}

            <div className="px-2 space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon
                const hasChildren = Array.isArray(item.children) && item.children.length > 0

                if (!hasChildren) {
                  const active = isActive(url, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                        active
                          ? "bg-[rgba(57,123,156,0.10)] dark:bg-[rgba(57,123,156,0.18)] text-slate-900 dark:text-[rgba(172,214,206,0.95)]"
                          : "text-slate-700/85 dark:text-slate-100/80 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                        collapsed && !isMobile ? "justify-center px-0" : "",
                      ].join(" ")}
                      title={collapsed && !isMobile ? item.title : undefined}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-[#5AAD9C]" />
                      )}
                      <Icon size={18} className="shrink-0" />
                      {(!collapsed || isMobile) && <span className="font-medium">{item.title}</span>}
                    </Link>
                  )
                }

                // parent
                const open = !!openMenus[item.key]
                const anyActive = item.children.some((c) => isActive(url, c.href))

                return (
                  <div key={item.key}>
                    <button
                      type="button"
                      onClick={() => setOpenMenus((p) => ({ ...p, [item.key]: !p[item.key] }))}
                      className={[
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                        anyActive
                          ? "text-slate-900 dark:text-[rgba(172,214,206,0.95)]"
                          : "text-slate-700/85 dark:text-slate-100/80",
                        "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                        collapsed && !isMobile ? "justify-center px-0" : "",
                      ].join(" ")}
                      title={collapsed && !isMobile ? item.title : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {(!collapsed || isMobile) && (
                        <>
                          <span className="flex-1 text-left font-medium">{item.title}</span>
                          <ChevronDown size={16} className={`opacity-70 transition ${open ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </button>

                    {(!collapsed || isMobile) && open && (
                      <div className="mt-1 ml-5 pl-3 border-l border-black/10 dark:border-white/10 space-y-1">
                        {item.children.map((c) => {
                          const CIcon = c.icon
                          const active = isActive(url, c.href)
                          return (
                            <Link
                              key={c.href}
                              href={c.href}
                              className={[
                                "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition",
                                active
                                  ? "bg-[rgba(57,123,156,0.10)] dark:bg-[rgba(57,123,156,0.18)] text-slate-900 dark:text-[rgba(172,214,206,0.95)]"
                                  : "text-slate-700/80 dark:text-slate-100/75 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                              ].join(" ")}
                            >
                              <CIcon size={16} className="shrink-0 opacity-90" />
                              <span className="font-medium">{c.title}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {(!collapsed || isMobile) && (
        <div className="border-t border-black/5 dark:border-white/10 px-4 py-3 text-xs text-slate-500/70 dark:text-slate-300/50">
          © {new Date().getFullYear()} ArtDent · Back Office
        </div>
      )}
    </aside>
  )

  // Mobile overlay wrapper
  if (isMobile) {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-[60] md:hidden">
        <div
          className="absolute inset-0 bg-black/35"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="absolute left-0 top-0 h-full shadow-[4px_0_24px_rgba(0,0,0,0.30)]">
          {container}
        </div>
      </div>
    )
  }

  // Desktop fixed sidebar
  return (
    <div className="fixed left-0 top-0 z-40">
      {container}
    </div>
  )
}
