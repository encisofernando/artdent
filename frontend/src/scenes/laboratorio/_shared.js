// src/scenes/laboratorio/_shared.js
// Constantes y helpers compartidos por todos los módulos de laboratorio

// ── Configuración de la aplicación ────────────────────────────────────────────
/**
 * COMPANY_ID: ID de la empresa para el módulo laboratorio
 * ⚠️ IMPORTANTE: Este valor debe coincidir con el company_id en la base de datos
 * 
 * Si tu aplicación maneja múltiples empresas, considera usar:
 * - Variable de entorno: import.meta.env.VITE_COMPANY_ID
 * - Context API de React para obtenerlo dinámicamente
 * - localStorage después del login
 */
export const COMPANY_ID = 2;

// ── Dimensiones del layout ─────────────────────────────────────────────────────
export const TOPBAR_H   = 64;   // Topbar.jsx: const TOPBAR_HEIGHT = 64
export const MAIN_P_XS  = 2;    // Layout main: p: { xs: 2, md: 3 }  (×8px = 16px)
export const MAIN_P_MD  = 3;    //                                     (×8px = 24px)

// ── Paleta de colores ──────────────────────────────────────────────────────────
export const BLUE  = "#397B9C";  // Color principal - Headers, botones primarios
export const GREEN = "#5AAD9C";  // Color secundario - Success, completado
export const MINT  = "#ACD6CE";  // Color accent - Hovers, highlights
export const TEAL  = "#49949C";  // Color variante - En proceso, secundario

/**
 * sx base para el root de cada página de laboratorio.
 * Cancela el padding de <main> en Layout y ocupa el viewport completo.
 * 
 * Uso:
 * <Box sx={{ ...labPageSx, bgcolor: "background.default" }}>
 */
export const labPageSx = {
  mx:     { xs: -MAIN_P_XS, md: -MAIN_P_MD },
  mt:     { xs: -MAIN_P_XS, md: -MAIN_P_MD },
  height: `calc(100vh - ${TOPBAR_H}px)`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

// ── Rutas del módulo ───────────────────────────────────────────────────────────
/**
 * Rutas de navegación del módulo laboratorio
 * Se usan en el BottomNavigation mobile y en la navegación lateral
 */
export const LAB_NAV = [
  { label: "Órdenes",   path: "/laboratorio/ordenes"   },
  { label: "Clientes",  path: "/laboratorio/clientes"  },
  { label: "Pacientes", path: "/laboratorio/pacientes" },  // ✅ Agregado
  { label: "Finanzas",  path: "/laboratorio/ctacte"    },
  { label: "Aranceles", path: "/laboratorio/aranceles" },
  { label: "Costos",    path: "/laboratorio/costos"    },
];

// ── Helper functions ───────────────────────────────────────────────────────────
/**
 * Formatea un número como moneda argentina
 * @param {number} value - El valor numérico a formatear
 * @returns {string} - El valor formateado como $X.XXX,XX
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

/**
 * Formatea una fecha en formato argentino
 * @param {string|Date} date - La fecha a formatear
 * @returns {string} - La fecha en formato DD/MM/YYYY
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-AR');
};

/**
 * Formatea una fecha y hora en formato argentino
 * @param {string|Date} date - La fecha a formatear
 * @returns {string} - La fecha en formato DD/MM/YYYY HH:mm
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Obtiene las iniciales de un nombre completo
 * @param {string} name - El nombre completo
 * @returns {string} - Las iniciales (máximo 2 caracteres)
 */
export const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string|Date} birthDate - La fecha de nacimiento
 * @returns {number} - La edad en años
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};