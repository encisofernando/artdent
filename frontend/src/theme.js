// theme.js - SISTEMA DE DISEÑO PROFESIONAL ARTDENT (corregido)
// - Respeta manual: paleta de marca única en light/dark (pág. 8) :contentReference[oaicite:0]{index=0}
// - Fix autofill Chrome/Edge (:-webkit-autofill) para que no pinte azul
// - Estética minimalista, moderna y profesional (pág. 19) :contentReference[oaicite:1]{index=1}

import { createContext, useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

export const tokens = (mode) => {
  // ✅ Marca: NO cambia entre light/dark (manual pág. 8)
  const brand = {
    primaryBlue: "#397B9C",
    primaryGreen: "#5AAD9C",
    secondaryMint: "#ACD6CE",
    secondaryTeal: "#49949C",
    tertiaryMint: "#DAEEE3",
    tertiaryIce: "#DAE6F0",
    tertiaryBlue: "#7CA5C3",
  };

  return {
    ...(mode === "dark"
      ? {
          brand,

          primary: {
            100: "#DAE6F0",
            200: "#C8D9E8",
            300: "#B6CCE0",
            400: "#7CA5C3",
            500: brand.primaryBlue,
            600: "#2F6782",
            700: "#274F65",
            800: "#1D3B4C",
            900: "#142A37",
          },

          greenAccent: {
            100: "#DAEEE3",
            200: "#CFE7DE",
            300: "#BFE0D6",
            400: brand.secondaryMint,
            500: brand.primaryGreen,
            600: "#4E9587",
            700: "#3F766B",
            800: "#305851",
            900: "#233E39",
          },

          blueAccent: {
            100: "#DAE6F0",
            200: "#CFE0EB",
            300: "#B9D2E3",
            400: brand.tertiaryBlue,
            500: brand.primaryBlue,
            600: "#2F6782",
            700: "#274F65",
            800: "#1D3B4C",
            900: "#142A37",
          },

          grey: {
            100: "#e0e0e0",
            200: "#c2c2c2",
            300: "#a3a3a3",
            400: "#858585",
            500: "#666666",
            600: "#525252",
            700: "#3d3d3d",
            800: "#292929",
            900: "#141414",
          },

          redAccent: {
            100: "#f8dcdb",
            200: "#f1b9b7",
            300: "#e99592",
            400: "#e2726e",
            500: "#db4f4a",
            600: "#af3f3b",
            700: "#832f2c",
            800: "#58201e",
            900: "#2c100f",
          },

          // Superficies oscuras (no “negro puro”, más profesional)
          surface: "#172A36",
          surfaceAlt: "#1D3644",
          outline: "rgba(148,163,184,.18)",
          textOnSurface: "#E6EEF5",
          bgDefault: "#0F1F2A",
        }
      : {
          brand,

          // En light, mantenemos marca igual; cambiamos superficies/textos
          primary: {
            100: "#1A202C",
            200: "#2D3748",
            300: "#4A5568",
            400: "#718096",
            500: brand.primaryBlue,
            600: "#2F6782",
            700: "#274F65",
            800: "#1D3B4C",
            900: "#142A37",
          },

          greenAccent: {
            100: "#1F4637",
            200: "#295F4A",
            300: "#347A5D",
            400: "#3F9470",
            500: brand.primaryGreen,
            600: "#7FCFA5",
            700: brand.secondaryMint,
            800: "#D2F2E0",
            900: "#E9F9F0",
          },

          blueAccent: {
            100: "#123443",
            200: "#174558",
            300: "#1D556C",
            400: "#236783",
            500: brand.primaryBlue,
            600: "#8CBED6",
            700: "#B3DBF3",
            800: "#CCE7F7",
            900: "#E6F3FB",
          },

          grey: {
            100: "#1A202C",
            200: "#2D3748",
            300: "#4A5568",
            400: "#718096",
            500: "#A0AEC0",
            600: "#CBD5E0",
            700: "#E2E8F0",
            800: "#EDF2F7",
            900: "#F7FAFC",
          },

          redAccent: {
            100: "#2E0B0E",
            200: "#5C161C",
            300: "#8A212A",
            400: "#B82D38",
            500: "#E63946",
            600: "#F46B63",
            700: "#FA928B",
            800: "#FDBAB3",
            900: "#FEE0DC",
          },

          // Superficies claras (limpias)
          surface: "#FFFFFF",
          surfaceAlt: "#F7FAFC",
          outline: "#E2E8F0",
          textOnSurface: "#1A202C",
          bgDefault: "#F7FAFC",
        }),
  };
};

export const themeSettings = (mode) => {
  const c = tokens(mode);

  return {
    palette: {
      mode,

      primary: { main: c.brand.primaryBlue },
      secondary: { main: c.brand.primaryGreen },

      background: {
        default: c.bgDefault,
        paper: c.surface,
      },

      divider: c.outline,

      success: { main: c.brand.primaryGreen, contrastText: "#fff" },
      info: { main: c.brand.primaryBlue, contrastText: "#fff" },
      warning: { main: "#FFB020", contrastText: "#000" },
      error: { main: "#E63946", contrastText: "#fff" },

      text: {
        primary: c.textOnSurface,
        secondary: mode === "dark" ? c.primary[300] : c.grey[400],
      },
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: ["Montserrat", "sans-serif"].join(","),
      fontSize: 12,
      h1: { fontSize: 40, fontWeight: 700 },
      h2: { fontSize: 32, fontWeight: 600 },
      h3: { fontSize: 24, fontWeight: 600 },
      h4: { fontSize: 20, fontWeight: 600 },
      h5: { fontSize: 16, fontWeight: 600 },
      h6: { fontSize: 14, fontWeight: 600 },
      button: { fontWeight: 700 },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.bgDefault,
            color: c.textOnSurface,
          },

          /* ✅ FIX AUTOFILL (Chrome/Edge) */
          "input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0px 1000px ${c.surface} inset`,
            WebkitTextFillColor: c.textOnSurface,
            caretColor: c.textOnSurface,
            transition: "background-color 9999s ease-in-out 0s",
          },
          "input:-webkit-autofill:hover, textarea:-webkit-autofill:hover, select:-webkit-autofill:hover": {
            WebkitBoxShadow: `0 0 0px 1000px ${c.surface} inset`,
            WebkitTextFillColor: c.textOnSurface,
          },
          "input:-webkit-autofill:focus, textarea:-webkit-autofill:focus, select:-webkit-autofill:focus": {
            WebkitBoxShadow: `0 0 0px 1000px ${c.surface} inset`,
            WebkitTextFillColor: c.textOnSurface,
          },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: c.surface,
            border: `1px solid ${c.outline}`,
            borderRadius: 12,
          },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: c.surface,
            border: `1px solid ${c.outline}`,
            overflow: "hidden",
            borderRadius: 12,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 10, fontWeight: 700 },
          containedPrimary: { color: "#fff" },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&:hover": {
              backgroundColor: mode === "dark" ? "rgba(148,163,184,.14)" : "rgba(0,0,0,.04)",
            },
          },
        },
      },

      // ✅ Inputs uniformes y minimalistas (evita “capsulas raras”)
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: c.surface,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: c.outline,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: c.brand.tertiaryBlue,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: c.brand.primaryBlue,
              borderWidth: 1,
            },
          },
          input: {
            color: c.textOnSurface,
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? c.primary[300] : c.grey[400],
            "&.Mui-focused": {
              color: c.brand.primaryBlue,
            },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: 0,
          },
        },
      },

      MuiCheckbox: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            color: mode === "dark" ? c.brand.tertiaryBlue : c.grey[500],
            "&.Mui-checked": { color: c.brand.primaryGreen },
          },
        },
      },

      MuiLink: {
        styleOverrides: {
          root: {
            fontFamily: "Montserrat, sans-serif",
          },
        },
      },
    },
  };
};

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useMode = () => {
  const [mode, setMode] = useState("dark");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};