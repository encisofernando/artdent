"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Radix
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";

// Vaul (mobile drawer)
import { Drawer } from "vaul";

// Icons (lucide-react)
import {
  Home,
  Menu as MenuIcon,
  DollarSign,
  Users,
  Building2,
  BadgeCheck,
  Briefcase,
  BarChart3,
  FileText,
  Search,
  SlidersHorizontal,
  ShoppingCart,
  ListChecks,
  File,
  Accessibility,
  Wallet,
  UserPlus,
  Receipt,
  Users2,
  Clock,
  PlusCircle,
  ScanSearch,
  Tags,
  User,
  Building,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export const SIDEBAR_WIDTH = 280;
export const COLLAPSED_WIDTH = 80;

type MenuItem = {
  title: string;
  path?: string;
  key?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
};

function isActive(pathname: string, path?: string) {
  if (!path) return false;
  return pathname === path || pathname.startsWith(path + "/");
}

export default function Sidebar({
  mobileOpen,
  onClose,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    const p = pathname || "";

    if (p.startsWith("/facturacion") || p.startsWith("/invoices") || p.startsWith("/articulos")) {
      next.ventas = true;
    }
    if (p.startsWith("/clientes") || p.startsWith("/ctacte") || p.startsWith("/pagoscte")) {
      next.clientes = true;
    }
    if (p.startsWith("/proveedores")) next.proveedores = true;
    if (p.startsWith("/colaboradores")) next.colaboradores = true;
    if (p.startsWith("/trabajos")) next.trabajos = true;
    if (p.startsWith("/team") || p.startsWith("/settings") || p.startsWith("/categorias")) {
      next.administracion = true;
    }

    setOpenMenus((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  const menuItems: MenuItem[] = React.useMemo(
    () => [
      { title: "Panel General", icon: <Home className="h-5 w-5" />, path: "/dashboard" },
      {
        title: "Ventas",
        icon: <DollarSign className="h-5 w-5" />,
        key: "ventas",
        children: [
          { title: "Nueva Venta", icon: <ShoppingCart className="h-4 w-4" />, path: "/facturacion" },
          { title: "Lista de Ventas", icon: <ListChecks className="h-4 w-4" />, path: "/invoices" },
          { title: "Artículos", icon: <File className="h-4 w-4" />, path: "/articulos" },
        ],
      },
      {
        title: "Clientes",
        icon: <Users className="h-5 w-5" />,
        key: "clientes",
        children: [
          { title: "Lista de Clientes", icon: <Accessibility className="h-4 w-4" />, path: "/clientes" },
          { title: "Cta Cte", icon: <Wallet className="h-4 w-4" />, path: "/ctacte" },
          { title: "Pagos", icon: <UserPlus className="h-4 w-4" />, path: "/pagoscte" },
        ],
      },
      {
        title: "Proveedores",
        icon: <Building2 className="h-5 w-5" />,
        key: "proveedores",
        children: [
          { title: "Comprobantes", icon: <Receipt className="h-4 w-4" />, path: "/proveedores/comprobantes" },
          { title: "Pagos", icon: <Wallet className="h-4 w-4" />, path: "/proveedores/pagos" },
          { title: "CtaCte", icon: <Wallet className="h-4 w-4" />, path: "/proveedores/ctacte" },
        ],
      },
      {
        title: "Colaboradores",
        icon: <BadgeCheck className="h-5 w-5" />,
        key: "colaboradores",
        children: [
          { title: "Lista", icon: <Users2 className="h-4 w-4" />, path: "/colaboradores" },
          { title: "Asistencias", icon: <Clock className="h-4 w-4" />, path: "/colaboradores/asistencias" },
          { title: "Recibos", icon: <Receipt className="h-4 w-4" />, path: "/colaboradores/recibos" },
        ],
      },
      {
        title: "Trabajos",
        icon: <Briefcase className="h-5 w-5" />,
        key: "trabajos",
        children: [
          { title: "Ingresar", icon: <PlusCircle className="h-4 w-4" />, path: "/trabajos/ingresar" },
          { title: "Consultar", icon: <ScanSearch className="h-4 w-4" />, path: "/trabajos/consultar" },
        ],
      },
      { title: "Estadísticas", icon: <BarChart3 className="h-5 w-5" />, path: "/estadisticas" },
      { title: "Reportes", icon: <FileText className="h-5 w-5" />, path: "/reportes" },
      { title: "Operaciones", icon: <Search className="h-5 w-5" />, path: "/operaciones" },
      {
        title: "Administración",
        icon: <SlidersHorizontal className="h-5 w-5" />,
        key: "administracion",
        children: [
          { title: "Categorías", icon: <Tags className="h-4 w-4" />, path: "/categorias" },
          { title: "Usuarios", icon: <User className="h-4 w-4" />, path: "/team" },
          { title: "Empresa", icon: <Building className="h-4 w-4" />, path: "/settings" },
        ],
      },
    ],
    []
  );

  const toggleMenu = (key?: string) => {
    if (!key) return;
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SidebarHeader = (
    <div className="flex items-center justify-between border-b px-3 py-3">
      <div className={cn("font-extrabold tracking-tight", isCollapsed ? "hidden" : "block")}>
        ARTDENT
      </div>

      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
        aria-label="Toggle sidebar"
      >
        <MenuIcon className="h-5 w-5" />
      </button>
    </div>
  );

  function ItemButton({
    item,
    level = 0,
    collapsed = false,
  }: {
    item: MenuItem;
    level?: number;
    collapsed?: boolean;
  }) {
    const active = isActive(pathname || "", item.path);
    const base = "w-full flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-muted/70";
    const activeCls = active ? "bg-primary text-primary-foreground hover:bg-primary" : "";
    const indent = level > 0 ? "ml-2" : "";
    const textWeight = active ? "font-bold" : level > 0 ? "font-medium" : "font-semibold";

    const content = (
      <div className={cn(base, activeCls, indent, collapsed && "justify-center px-2")}>
        {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
        {!collapsed && <span className={cn("truncate text-sm", textWeight)}>{item.title}</span>}
        {!collapsed && level > 0 && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
      </div>
    );

    if (item.path) {
      return (
        <Link href={item.path} onClick={onClose}>
          {content}
        </Link>
      );
    }
    return content;
  }

  function RenderExpanded() {
    return (
      <div className="px-2 py-2">
        {menuItems.map((item) => {
          const hasChildren = !!item.children?.length;
          const open = item.key ? !!openMenus[item.key] : false;

          if (!hasChildren) {
            return (
              <div key={item.key || item.path || item.title} className="my-1">
                <ItemButton item={item} />
              </div>
            );
          }

          return (
            <Collapsible.Root
              key={item.key}
              open={open}
              onOpenChange={() => toggleMenu(item.key)}
              className="my-1"
            >
              <Collapsible.Trigger asChild>
                <button type="button" className="w-full" onClick={() => toggleMenu(item.key)}>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-muted/70">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate text-sm font-semibold">{item.title}</span>
                    <ChevronDown
                      className={cn("ml-auto h-4 w-4 opacity-60 transition-transform", open && "rotate-180")}
                    />
                  </div>
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content className="mt-1 rounded-xl bg-muted/30 p-1">
                {item.children!.map((child) => (
                  <div key={child.path || child.title} className="my-1">
                    <ItemButton item={child} level={1} />
                  </div>
                ))}
              </Collapsible.Content>
            </Collapsible.Root>
          );
        })}
      </div>
    );
  }

  function RenderCollapsed() {
    return (
      <Tooltip.Provider delayDuration={200}>
        <div className="px-2 py-2">
          {menuItems.map((item) => {
            if (!item.icon) return null;

            const hasChildren = !!item.children?.length;
            const active = isActive(pathname || "", item.path);

            if (hasChildren) {
              return (
                <div key={item.key || item.title} className="my-1">
                  <DropdownMenu.Root>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "w-full flex items-center justify-center rounded-xl px-2 py-2 transition hover:bg-muted/70",
                              active && "bg-primary text-primary-foreground hover:bg-primary"
                            )}
                            aria-label={item.title}
                          >
                            {item.icon}
                          </button>
                        </DropdownMenu.Trigger>
                      </Tooltip.Trigger>

                      <Tooltip.Content side="right" className="rounded-md bg-foreground px-2 py-1 text-xs text-background shadow">
                        {item.title}
                        <Tooltip.Arrow className="fill-foreground" />
                      </Tooltip.Content>
                    </Tooltip.Root>

                    <DropdownMenu.Content side="right" align="start" className="z-50 min-w-[220px] rounded-xl border bg-background p-1 shadow-lg">
                      <div className="px-2 py-2 text-xs font-semibold text-muted-foreground">{item.title}</div>
                      {item.children!.map((child) => {
                        const childActive = isActive(pathname || "", child.path);
                        return (
                          <DropdownMenu.Item key={child.path || child.title} asChild>
                            <Link
                              href={child.path || "#"}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-muted",
                                childActive && "bg-primary text-primary-foreground hover:bg-primary"
                              )}
                            >
                              <span className="shrink-0">{child.icon}</span>
                              <span className="truncate">{child.title}</span>
                            </Link>
                          </DropdownMenu.Item>
                        );
                      })}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              );
            }

            return (
              <div key={item.path || item.title} className="my-1">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={item.path || "#"}
                      onClick={onClose}
                      className={cn(
                        "w-full flex items-center justify-center rounded-xl px-2 py-2 transition hover:bg-muted/70",
                        active && "bg-primary text-primary-foreground hover:bg-primary"
                      )}
                      aria-label={item.title}
                    >
                      {item.icon}
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Content side="right" className="rounded-md bg-foreground px-2 py-1 text-xs text-background shadow">
                    {item.title}
                    <Tooltip.Arrow className="fill-foreground" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>
            );
          })}
        </div>
      </Tooltip.Provider>
    );
  }

  const DesktopSidebar = (
    <aside
      className="fixed left-0 top-0 z-40 h-screen border-r bg-background"
      style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
    >
      {SidebarHeader}

      <div className="h-[calc(100vh-64px)] overflow-y-auto px-1 pb-3">
        {isCollapsed ? <RenderCollapsed /> : <RenderExpanded />}
      </div>

      {!isCollapsed && (
        <div className="border-t px-3 py-3 text-center">
          <span className="inline-flex rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
            v1.0.0
          </span>
        </div>
      )}
    </aside>
  );

  const MobileDrawer = (
    <Drawer.Root open={mobileOpen} onOpenChange={(v) => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-y-0 left-0 z-50 w-[280px] bg-background border-r outline-none">
          {/* Accesibilidad (evita warnings tipo DialogTitle) */}
          <Drawer.Title className="sr-only">Menú</Drawer.Title>
          <Drawer.Description className="sr-only">Navegación principal</Drawer.Description>

          <div className="flex items-center justify-between border-b px-3 py-3">
            <div className="font-extrabold tracking-tight">ARTDENT</div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Cerrar menú"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="h-[calc(100vh-64px)] overflow-y-auto px-1 pb-3">
            <div className="px-2 py-2">
              {menuItems.map((item) => {
                const hasChildren = !!item.children?.length;
                const open = item.key ? !!openMenus[item.key] : false;

                if (!hasChildren) {
                  return (
                    <div key={item.key || item.path || item.title} className="my-1">
                      <ItemButton item={item} />
                    </div>
                  );
                }

                return (
                  <Collapsible.Root
                    key={item.key}
                    open={open}
                    onOpenChange={() => toggleMenu(item.key)}
                    className="my-1"
                  >
                    <Collapsible.Trigger asChild>
                      <button type="button" className="w-full" onClick={() => toggleMenu(item.key)}>
                        <div className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-muted/70">
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate text-sm font-semibold">{item.title}</span>
                          <ChevronDown
                            className={cn("ml-auto h-4 w-4 opacity-60 transition-transform", open && "rotate-180")}
                          />
                        </div>
                      </button>
                    </Collapsible.Trigger>

                    <Collapsible.Content className="mt-1 rounded-xl bg-muted/30 p-1">
                      {item.children!.map((child) => (
                        <div key={child.path || child.title} className="my-1">
                          <ItemButton item={child} level={1} />
                        </div>
                      ))}
                    </Collapsible.Content>
                  </Collapsible.Root>
                );
              })}
            </div>

            <div className="border-t px-3 py-3 text-center">
              <span className="inline-flex rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                v1.0.0
              </span>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );

  return (
    <>
      <div className="hidden md:block">{DesktopSidebar}</div>
      <div className="md:hidden">{MobileDrawer}</div>
    </>
  );
}
