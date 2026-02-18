"use client";

import * as React from "react";
import Sidebar, { COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const sidebarW = isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div
      className="min-h-screen"
      style={{ ["--sidebar-w" as any]: `${sidebarW}px` }}
    >
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main className="min-h-screen pl-0 md:pl-[var(--sidebar-w)]">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        {children}
      </main>
    </div>
  );
}
