// src/contexts/SidebarContext.jsx
import { createContext, useContext } from 'react';

export const SidebarContext = createContext({
  isCollapsed: false,
  sidebarWidth: 280,
});

export const useSidebarContext = () => useContext(SidebarContext);