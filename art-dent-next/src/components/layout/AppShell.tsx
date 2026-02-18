"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/dashboard" },
  // agregá luego:
  // { label: "Productos", href: "/productos" },
  // { label: "Clientes", href: "/clientes" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("artdent_token");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r min-h-screen">
          <div className="p-4 font-semibold">ARTDENT</div>
          <nav className="px-2 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "block rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-muted font-medium"
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Topbar */}
          <header className="h-14 border-b flex items-center justify-between px-4">
            <div className="text-sm text-muted-foreground">
              {pathname.replace("/", "") || "inicio"}
            </div>
            <button
              onClick={logout}
              className="text-sm px-3 py-2 rounded-md border hover:bg-muted"
            >
              Salir
            </button>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
