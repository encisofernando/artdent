"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore, SIDEBAR_WIDTH, COLLAPSED_WIDTH } from "@/stores/useSidebarStore";

import {
  Home, DollarSign, Users, ShoppingCart, Briefcase,
  BarChart2, Settings, ChevronRight, ChevronLeft,
  ChevronDown, ShoppingBag, List, FileText, UserCheck,
  Wallet, UserPlus, Receipt, Clock, PlusCircle, Search,
  Tag, Building2, X,
} from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface NavItem {
  label:    string;
  icon:     React.ReactNode;
  href?:    string;
  children?: NavItem[];
  badge?:   string;
}

// ─── Árbol de navegación (mismo que el Sidebar original) ─────────────────────
const NAV: NavItem[] = [
  { label: "Dashboard",    icon: <Home       size={18} />, href: "/" },
  {
    label: "Facturación",  icon: <DollarSign size={18} />,
    children: [
      { label: "POS / Ventas",   icon: <ShoppingCart size={16} />, href: "/facturacion" },
      { label: "Comprobantes",   icon: <FileText     size={16} />, href: "/invoices" },
    ],
  },
  {
    label: "Artículos",    icon: <ShoppingBag size={18} />,
    children: [
      { label: "Listado",        icon: <List         size={16} />, href: "/articulos" },
      { label: "Categorías",     icon: <Tag          size={16} />, href: "/categorias" },
    ],
  },
  {
    label: "Clientes",     icon: <Users size={18} />,
    children: [
      { label: "Listado",        icon: <List         size={16} />, href: "/clientes" },
      { label: "Cta. Corriente", icon: <Wallet       size={16} />, href: "/ctacte" },
      { label: "Pagos",          icon: <DollarSign   size={16} />, href: "/pagoscte" },
    ],
  },
  {
    label: "Proveedores",  icon: <Building2 size={18} />,
    children: [
      { label: "Comprobantes",   icon: <FileText     size={16} />, href: "/proveedores/comprobantes" },
      { label: "Pagos",          icon: <DollarSign   size={16} />, href: "/proveedores/pagos" },
      { label: "Cta. Corriente", icon: <Wallet       size={16} />, href: "/proveedores/ctacte" },
    ],
  },
  {
    label: "Trabajos",     icon: <Briefcase size={18} />,
    children: [
      { label: "Ingresar",       icon: <PlusCircle   size={16} />, href: "/trabajos/ingresar" },
      { label: "Consultar",      icon: <Search       size={16} />, href: "/trabajos/consultar" },
    ],
  },
  {
    label: "Team",         icon: <UserCheck size={18} />,
    children: [
      { label: "Equipo",         icon: <Users        size={16} />, href: "/team" },
      { label: "Nuevo empleado", icon: <UserPlus     size={16} />, href: "/nuevoempleado" },
    ],
  },
  {
    label: "Colaboradores",icon: <Users size={18} />,
    children: [
      { label: "Listado",        icon: <List         size={16} />, href: "/colaboradores" },
      { label: "Asistencias",    icon: <Clock        size={16} />, href: "/colaboradores/asistencias" },
      { label: "Recibos",        icon: <Receipt      size={16} />, href: "/colaboradores/recibos" },
    ],
  },
  { label: "Reportes",     icon: <BarChart2  size={18} />, href: "/bar" },
  { label: "Configuración",icon: <Settings   size={18} />, href: "/settings" },
];

// ─── Componente ──────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname    = usePathname();
  const { isCollapsed, mobileOpen, closeMobile, toggleCollapse } = useSidebarStore();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggle = useCallback((label: string) => {
    setOpenMenus((p) => ({ ...p, [label]: !p[label] }));
  }, []);

  const isActive = (href?: string) =>
    href ? (href === "/" ? pathname === "/" : pathname.startsWith(href)) : false;

  const hasActiveChild = (item: NavItem) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

  // ─── Nav item ──────────────────────────────────────────────────────────────
  const NavLink = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const active      = isActive(item.href);
    const childActive = hasActiveChild(item);
    const open        = openMenus[item.label] ?? childActive;

    if (item.children) {
      return (
        <div>
          <button
            onClick={() => toggle(item.label)}
            className={cn(
              "sidebar-item w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium gap-3",
              "text-sidebar-foreground",
              (childActive || open) && "bg-sidebar-accent text-sidebar-accent-foreground",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="shrink-0 opacity-80">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                <ChevronDown
                  size={14}
                  className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
                />
              </>
            )}
          </button>

          {!isCollapsed && open && (
            <div className="mt-0.5 ml-6 pl-3 border-l border-sidebar-border space-y-0.5">
              {item.children.map((child) => (
                <NavLink key={child.label} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href!}
        onClick={() => { if (mobileOpen) closeMobile(); }}
        className={cn(
          "sidebar-item flex items-center rounded-xl px-3 py-2.5 text-sm font-medium gap-3",
          "text-sidebar-foreground transition-colors",
          active && "sidebar-item-active shadow-sm",
          isCollapsed && "justify-center px-0"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <span className="shrink-0 opacity-90">{item.icon}</span>
        {!isCollapsed && (
          <span className="flex-1 truncate">{item.label}</span>
        )}
        {!isCollapsed && item.badge && (
          <span className="ml-auto shrink-0 text-[10px] font-bold bg-brand-green text-white rounded-full px-1.5 py-0.5">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  // ─── Inner sidebar content ────────────────────────────────────────────────
  const SidebarContent = () => (
    <div
      className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border shrink-0",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-sidebar-primary">ARTDENT</span>
            <span className="text-[10px] text-sidebar-foreground/50 tracking-widest uppercase">CRM</span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
          title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed
            ? <ChevronRight size={16} />
            : <ChevronLeft  size={16} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="shrink-0 px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/40 text-center">
            ARTDENT © {new Date().getFullYear()}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out"
        style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile: drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 md:hidden animate-slide-in">
            <div className="relative h-full">
              <SidebarContent />
              {/* Close btn */}
              <button
                onClick={closeMobile}
                className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70"
              >
                <X size={16} />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
