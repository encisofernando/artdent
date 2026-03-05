import { useEffect, useMemo, useState } from "react"
import Sidebar from "@/Components/layout/Sidebar"
import Topbar from "@/Components/layout/Topbar"

export default function AuthenticatedLayout({ children }) {
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Cerrar drawer mobile con ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpenMobile(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const leftOffset = useMemo(() => {
    // desktop: 272 o 72
    return collapsed ? 72 : 272
  }, [collapsed])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar
          variant="desktop"
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Sidebar mobile (overlay) */}
      <Sidebar
        variant="mobile"
        open={sidebarOpenMobile}
        onClose={() => setSidebarOpenMobile(false)}
        collapsed={false}
        setCollapsed={() => {}}
      />

      {/* Main column */}
      <div
        className="min-h-screen flex flex-col"
        style={{ marginLeft: leftOffset }}
      >
        {/* En mobile no hay offset */}
        <style>{`@media (max-width: 767px){ div[style]{ margin-left:0 !important; } }`}</style>

        <Topbar
          onOpenSidebar={() => setSidebarOpenMobile(true)}
        />

        <main className="flex-1 p-4 sm:p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
