// theme.js
import { createContext, useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

// === Tokens ARTDENT (respetan el manual) ===
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        brand: {
          primaryBlue:  "#397B9C", // 2150 CP
          primaryGreen: "#5AAD9C", // 7473 C
          secondaryMint:"#ACD6CE", // 565 CP
          secondaryTeal:"#49949C", // 5483 C
          tertiaryMint: "#DAEEE3", // 566 C
          tertiaryIce:  "#DAE6F0", // 7457 C
          tertiaryBlue: "#7CA5C3", // 542 C
        },
        // Escalas base (azules ARTDENT)
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
          100:"#e0e0e0",200:"#c2c2c2",300:"#a3a3a3",400:"#858585",500:"#666666",
          600:"#525252",700:"#3d3d3d",800:"#292929",900:"#141414",1000:"#ffffff",1100:"#000000",
        },

        // Aliases usados por Sidebar
        sidebartext: { 500: "#DAE6F0" },
        hovermenu:   { 500: "#2F6782" },
        azul:        { 500: "#1D3B4C" }, // base del sidebar en dark (más suave)
        black:       { 500: "#000000" },
        redAccent: {
          100:"#f8dcdb",200:"#f1b9b7",300:"#e99592",400:"#e2726e",500:"#db4f4a",
          600:"#af3f3b",700:"#832f2c",800:"#58201e",900:"#2c100f",
        },

        // Superficies amigables (claves para “menos fatiga visual”)
        surface:       "#172A36", // contenedores/cards (azul petróleo suave)
        surfaceAlt:    "#1D3644", // headers de cards / énfasis
        outline:       "rgba(148,163,184,.16)",
        backdropGlass: "rgba(17, 24, 39, .55)", // topbar
        textOnSurface: "#E6EEF5",
      }
    : {
        brand: {
          primaryBlue:  "#397B9C",
          primaryGreen: "#5AAD9C",
          secondaryMint:"#ACD6CE",
          secondaryTeal:"#49949C",
          tertiaryMint: "#DAEEE3",
          tertiaryIce:  "#DAE6F0",
          tertiaryBlue: "#7CA5C3",
        },
        primary: {
          100:"#F5FAFD", 200:"#EAF3F9", 300:"#DAE6F0", 400:"#C8D9E8",
          500:"#7CA5C3", 600:"#5E8BAE", 700:"#397B9C", 800:"#2F6782", 900:"#274F65",
        },
        greenAccent: {
          100:"#F2FAF7", 200:"#E7F5F0", 300:"#DAEEE3", 400:"#ACD6CE",
          500:"#5AAD9C", 600:"#4E9587", 700:"#3F766B", 800:"#305851", 900:"#233E39",
        },
        blueAccent: {
          100:"#F5FAFD", 200:"#EAF3F9", 300:"#DAE6F0", 400:"#7CA5C3",
          500:"#397B9C", 600:"#2F6782", 700:"#274F65", 800:"#1D3B4C", 900:"#142A37",
        },
        grey: {
          100:"#141414",200:"#292929",300:"#3d3d3d",400:"#525252",500:"#666666",
          600:"#858585",700:"#a3a3a3",800:"#c2c2c2",900:"#e0e0e0",1000:"#ffffff",1100:"#000000",
        },

        // Aliases para light
        sidebartext: { 500: "#274F65" },
        hovermenu:   { 500: "#E9F2F7" },
        azul:        { 500: "#F4F8FB" }, // base sidebar en light (casi blanco azulado)
        black:       { 500: "#000000" },
        redAccent: {
          100:"#f8dcdb",200:"#f1b9b7",300:"#e99592",400:"#e2726e",500:"#db4f4a",
          600:"#af3f3b",700:"#832f2c",800:"#58201e",900:"#2c100f",
        },

        // Superficies amigables
        surface:       "#FFFFFF",   // cards
        surfaceAlt:    "#F7FAFC",   // bloques / headers de sección
        outline:       "rgba(0,0,0,.08)",
        backdropGlass: "rgba(255,255,255,.6)", // topbar
        textOnSurface: "#1A202C",
      }),
});

// === Configuración del tema MUI (aplica las superficies y accesibilidad) ===
export const themeSettings = (mode) => {
  const c = tokens(mode);

  return {
    palette: {
      mode,
      // Colores de marca
      primary:   { main: mode === "dark" ? c.primary[500] : c.primary[700] },
      secondary: { main: c.greenAccent[500] },
      // Fondos y superficies
      background: {
        default: mode === "dark" ? "#0F1F2A" : "#F6F9FC", // fondo de app super suave
        paper:   c.surface,                                // cards/contenedores
      },
      divider: c.outline,

      success: { main: c.greenAccent[500], contrastText: "#fff" },
      info:    { main: c.blueAccent[400],  contrastText: "#fff" },
      warning: { main: "#FFD700",          contrastText: "#000" },
      error:   { main: "#DB4F4A",          contrastText: "#fff" },

      text: {
        primary:   c.textOnSurface,
        secondary: mode === "dark" ? c.primary[300] : "#4A5568",
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
      body1:{fontSize:14},
      body2:{fontSize:12},
    },

    components: {
      // Cards / contenedores con superficies suaves
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: c.surface,
            border: `1px solid ${c.outline}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: c.surface,
            border: `1px solid ${c.outline}`,
          },
        },
      },
      // AppBar translúcida y con blur
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "saturate(180%) blur(8px)",
            background: c.backdropGlass,
            borderBottom: `1px solid ${c.outline}`,
          },
        },
      },
      // Botones más legibles
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 10, fontWeight: 600 },
          containedPrimary: { color: "#fff" },
        },
      },
      // Inputs y bordes suaves
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: { borderColor: c.outline },
          root: {
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.blueAccent[300] },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: c.primary[500] },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&:hover": {
              backgroundColor:
                mode === "dark" ? "rgba(148,163,184,.14)" : "rgba(0,0,0,.06)",
            },
          },
        },
      },
      // Dividers suaves
      MuiDivider: { styleOverrides: { root: { borderColor: c.outline } } },
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
