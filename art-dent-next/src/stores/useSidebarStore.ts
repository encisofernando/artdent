"use client";
import { create } from "zustand";

export const SIDEBAR_WIDTH   = 280;
export const COLLAPSED_WIDTH = 72;

interface SidebarState {
  isCollapsed:  boolean;
  mobileOpen:   boolean;
  sidebarWidth: number;

  toggleCollapse: () => void;
  setCollapsed:   (v: boolean) => void;
  openMobile:     () => void;
  closeMobile:    () => void;
}

export const useSidebarStore = create<SidebarState>()((set, get) => ({
  isCollapsed:  false,
  mobileOpen:   false,
  sidebarWidth: SIDEBAR_WIDTH,

  toggleCollapse: () =>
    set((s) => ({
      isCollapsed:  !s.isCollapsed,
      sidebarWidth: s.isCollapsed ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
    })),

  setCollapsed: (v) =>
    set({ isCollapsed: v, sidebarWidth: v ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }),

  openMobile:  () => set({ mobileOpen: true }),
  closeMobile: () => set({ mobileOpen: false }),
}));
