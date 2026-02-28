// src/scenes/laboratorio/_shared.js
// Constantes y helpers compartidos por todos los módulos de laboratorio

export const TOPBAR_H   = 64;   // Topbar.jsx: const TOPBAR_HEIGHT = 64
export const MAIN_P_XS  = 2;    // Layout main: p: { xs: 2, md: 3 }  (×8px = 16px)
export const MAIN_P_MD  = 3;    //                                     (×8px = 24px)

export const BLUE  = "#397B9C";
export const GREEN = "#5AAD9C";
export const MINT  = "#ACD6CE";
export const TEAL  = "#49949C";

/**
 * sx base para el root de cada página de laboratorio.
 * Cancela el padding de <main> en Layout y ocupa el viewport completo.
 */
export const labPageSx = {
  mx:     { xs: -MAIN_P_XS, md: -MAIN_P_MD },
  mt:     { xs: -MAIN_P_XS, md: -MAIN_P_MD },
  height: `calc(100vh - ${TOPBAR_H}px)`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

// Rutas del módulo — se usan en el BottomNavigation mobile
export const LAB_NAV = [
  { label: "Órdenes",   path: "/laboratorio/ordenes"  },
  { label: "Clientes",  path: "/laboratorio/clientes" },
  { label: "Finanzas",  path: "/laboratorio/ctacte"   },
  { label: "Aranceles", path: "/laboratorio/aranceles"},
  { label: "Costos",    path: "/laboratorio/costos"   },
];