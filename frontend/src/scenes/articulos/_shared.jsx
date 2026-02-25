// src/scenes/articulos/_shared.jsx
// Componentes y estilos compartidos entre CrearArticulo y EditarArticulo

import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const B = {
  blue:    "#397B9C",
  green:   "#5AAD9C",
  teal:    "#49949C",
  mint:    "#ACD6CE",
  blueSoft:"#7CA5C3",
};

export const toNumber = (v, fallback = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

export const pick = (obj, keys, fallback = "") => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
};

export function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );
}

export function SectionLabel({ children, isDark }) {
  return (
    <Typography sx={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: isDark ? "rgba(172,214,206,0.65)" : "rgba(57,123,156,0.7)",
      mb: 1.5,
    }}>
      {children}
    </Typography>
  );
}
