// theme.js - SISTEMA DE DISEÑO PROFESIONAL ARTDENT
import { createContext, useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        // TEMA OSCURO - Azules profundos ARTDENT
        brand: {
          primaryBlue:  "#397B9C",
          primaryGreen: "#5AAD9C",
          secondaryMint:"#ACD6CE",
          secondaryTeal:"#49949C",
        },
        primary: {
          100:"#DAE6F0", 200:"#C8D9E8", 300:"#B6CCE0", 400:"#7CA5C3",
          500:"#397B9C", 600:"#2F6782", 700:"#274F65", 800:"#1D3B4C", 900:"#142A37",
        },
        greenAccent: {
          100:"#DAEEE3", 200:"#CFE7DE", 300:"#BFE0D6", 400:"#ACD6CE",
          500:"#5AAD9C", 600:"#4E9587", 700:"#3F766B", 800:"#305851", 900:"#233E39",
        },
        blueAccent: {
          100:"#DAE6F0", 200:"#CFE0EB", 300:"#B9D2E3", 400:"#7CA5C3",
          500:"#397B9C", 600:"#2F6782", 700:"#274F65", 800:"#1D3B4C", 900:"#142A37",
        },
        grey: {
          100:"#e0e0e0", 200:"#c2c2c2", 300:"#a3a3a3", 400:"#858585", 500:"#666666",
          600:"#525252", 700:"#3d3d3d", 800:"#292929", 900:"#141414",
        },
        redAccent: {
          100:"#f8dcdb", 200:"#f1b9b7", 300:"#e99592", 400:"#e2726e", 500:"#db4f4a",
          600:"#af3f3b", 700:"#832f2c", 800:"#58201e", 900:"#2c100f",
        },
        // Superficies oscuras
        surface:       "#172A36",
        surfaceAlt:    "#1D3644",
        outline:       "rgba(148,163,184,.16)",
        textOnSurface: "#E6EEF5",
      }
    : {
        // TEMA CLARO - Blanco limpio profesional
        brand: {
          primaryBlue:  "#2C7DA0",
          primaryGreen: "#4FB286",
          secondaryMint:"#B9E4C9",
          secondaryTeal:"#6DB9A9",
        },
        primary: {
          100:"#1A202C", 200:"#2D3748", 300:"#4A5568", 400:"#718096", 500:"#2C7DA0",
          600:"#236783", 700:"#1D556C", 800:"#174558", 900:"#123443",
        },
        greenAccent: {
          100:"#1F4637", 200:"#295F4A", 300:"#347A5D", 400:"#3F9470", 500:"#4FB286",
          600:"#7FCFA5", 700:"#B9E4C9", 800:"#D2F2E0", 900:"#E9F9F0",
        },
        blueAccent: {
          100:"#123443", 200:"#174558", 300:"#1D556C", 400:"#236783", 500:"#2C7DA0",
          600:"#8CBED6", 700:"#B3DBF3", 800:"#CCE7F7", 900:"#E6F3FB",
        },
        grey: {
          100:"#1A202C", 200:"#2D3748", 300:"#4A5568", 400:"#718096", 500:"#A0AEC0",
          600:"#CBD5E0", 700:"#E2E8F0", 800:"#EDF2F7", 900:"#F7FAFC",
        },
        redAccent: {
          100:"#2E0B0E", 200:"#5C161C", 300:"#8A212A", 400:"#B82D38", 500:"#E63946",
          600:"#F46B63", 700:"#FA928B", 800:"#FDBAB3", 900:"#FEE0DC",
        },
        // Superficies claras
        surface:       "#FFFFFF",
        surfaceAlt:    "#F7FAFC",
        outline:       "#E2E8F0",
        textOnSurface: "#1A202C",
      }),
});

export const themeSettings = (mode) => {
  const c = tokens(mode);

  return {
    palette: {
      mode,
      primary:   { main: mode === "dark" ? c.primary[500] : c.primary[500] },
      secondary: { main: c.greenAccent[500] },
      background: {
        default: mode === "dark" ? "#0F1F2A" : "#F7FAFC",
        paper:   c.surface,
      },
      divider: c.outline,
      success: { main: c.greenAccent[500], contrastText: "#fff" },
      info:    { main: c.blueAccent[500], contrastText: "#fff" },
      warning: { main: "#FFB020", contrastText: "#000" },
      error:   { main: "#E63946", contrastText: "#fff" },
      text: {
        primary:   c.textOnSurface,
        secondary: mode === "dark" ? c.primary[300] : c.grey[400],
      },
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: ["Montserrat", "sans-serif"].join(","),
      fontSize: 12,
      h1:{fontSize:40,fontWeight:700},
      h2:{fontSize:32,fontWeight:600},
      h3:{fontSize:24,fontWeight:600},
      h4:{fontSize:20,fontWeight:500},
      h5:{fontSize:16,fontWeight:500},
      h6:{fontSize:14,fontWeight:400},
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === "dark" ? "#0F1F2A" : "#F7FAFC",
            color: c.textOnSurface,
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
              backgroundColor: mode === "dark" 
                ? "rgba(148,163,184,.14)" 
                : "rgba(0,0,0,.04)",
            },
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
    () => ({ toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")) }),
    []
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};