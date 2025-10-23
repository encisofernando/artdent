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
        // ========= MODO CLARO VIBRANTE + CÁLIDO (aplicado globalmente) =========
        brand: {
          primaryBlue:  "#2C7DA0",   // más saturado
          primaryGreen: "#4FB286",   // verde cálido
          secondaryMint:"#B9E4C9",   // menta clara cálida
          secondaryTeal:"#6DB9A9",
          tertiaryMint: "#E3F6EF",
          tertiaryIce:  "#E0F2FA",
          tertiaryBlue: "#8CBED6",
        },
        primary: {
          100:"#EAF6FA", 200:"#D8EEF4", 300:"#BFE1EC", 400:"#8CBED6",
          500:"#2C7DA0", 600:"#236783", 700:"#1D556C", 800:"#174558", 900:"#123443",
        },
        greenAccent: {
          100:"#E9F9F0", 200:"#D2F2E0", 300:"#B9E4C9", 400:"#7FCFA5",
          500:"#4FB286", 600:"#3F9470", 700:"#347A5D", 800:"#295F4A", 900:"#1F4637",
        },
        blueAccent: {
          100:"#E6F3FB", 200:"#CCE7F7", 300:"#B3DBF3", 400:"#8CBED6",
          500:"#2C7DA0", 600:"#236783", 700:"#1D556C", 800:"#174558", 900:"#123443",
        },
        grey: {
          100:"#1A202C",200:"#2D3748",300:"#4A5568",400:"#718096",500:"#A0AEC0",
          600:"#CBD5E0",700:"#E2E8F0",800:"#EDF2F7",900:"#FAFAFA",1000:"#ffffff",1100:"#000000",
        },

        // Sidebar y acentos
        sidebartext: { 500: "#2D5565" },
        hovermenu:   { 500: "#E4F1ED" },
        azul:        { 500: "#E7F2F5" },
        black:       { 500: "#000000" },
        redAccent: {
          100:"#FEE0DC",200:"#FDBAB3",300:"#FA928B",400:"#F46B63",500:"#E63946",
          600:"#B82D38",700:"#8A212A",800:"#5C161C",900:"#2E0B0E",
        },

        // Superficies globales
        surface:       "#ffffffff",   // papers/cards/dialogs
        surfaceAlt:    "#c5f0e4ff",   // headers de cards / tablas
        fieldBg:       "#E9F3F0",   // inputs/selects/autocomplete
        menuBg:        "#E7F2F5",   // menus / popovers
        outline:       "rgba(44,125,160,.35)",
        backdropGlass: "rgba(255,255,255,.55)",
        textOnSurface: "#24323B",
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
        default: mode === "dark" ? "#0F1F2A" : "#CDE1DB", // fondo de app cálido
        paper:   c.surface,                               // cards/contenedores
      },
      divider: c.outline,

      success: { main: c.greenAccent[500], contrastText: "#fff" },
      info:    { main: mode === "dark" ? c.blueAccent[400] : c.primary[500], contrastText: "#fff" },
      warning: { main: "#FFD700", contrastText: "#000" },
      error:   { main: "#DB4F4A", contrastText: "#fff" },

      text: {
        primary:   c.textOnSurface,
        secondary: mode === "dark" ? c.primary[300] : "#2D3748",
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
      // Fondo global y saneo de backgrounds
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === "dark" ? "#0F1F2A" : "#BFD3E0",
            color: c.textOnSurface,
          },
          ".MuiPaper-root": { backgroundImage: "none" },
        },
      },

      // Cards / contenedores con superficies suaves
      MuiPaper: {
        defaultProps: { elevation: 0, variant: "outlined" },
        styleOverrides: {
          root: {
            backgroundColor: c.surface,
            border: `1px solid ${c.outline}`,
            boxShadow: "0 4px 10px rgba(0,0,0,.08)",
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0, variant: "outlined" },
        styleOverrides: {
          root: {
            backgroundColor: c.surface,
            border: `1px solid ${c.outline}`,
            boxShadow: "0 8px 16px rgba(0,0,0,.10)",
            overflow: "hidden",
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            backgroundColor: c.surfaceAlt,
            borderBottom: `1px solid ${c.outline}`,
            paddingTop: 12,
            paddingBottom: 12,
          },
          title: { fontWeight: 600 },
          subheader: { opacity: .85 },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { backgroundColor: c.surface } },
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
          root: { textTransform: "none", borderRadius: 10, fontWeight: 700 },
          containedPrimary: { color: "#fff" },
          outlinedPrimary: {
            borderColor: c.primary[600],
            "&:hover": { borderColor: c.primary[700] },
          },
        },
      },

      // Inputs y bordes suaves (formularios en todas las vistas)
      MuiInputBase: {
        styleOverrides: { root: { backgroundColor: c.fieldBg, borderRadius: 10 } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: { borderColor: c.outline },
          root: {
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.primary[400] },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: c.primary[500] },
          },
        },
      },
      MuiSelect: {
        styleOverrides: { select: { backgroundColor: c.fieldBg, borderRadius: 10 } },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: { backgroundColor: c.menuBg, border: `1px solid ${c.outline}` },
        },
      },

      // Menús, popovers, tooltips, dialogs con el mismo tono
      MuiMenu:    { styleOverrides: { paper: { backgroundColor: c.menuBg, border: `1px solid ${c.outline}` } } },
      MuiPopover: { styleOverrides: { paper: { backgroundColor: c.menuBg, border: `1px solid ${c.outline}` } } },
      MuiDialog:  { styleOverrides: { paper: { backgroundColor: c.surface, border: `1px solid ${c.outline}` } } },

      // Tablas y DataGrid (headers claros en todas las vistas)
      MuiTableHead: { styleOverrides: { root: { backgroundColor: c.surfaceAlt } } },
      MuiTableCell: { styleOverrides: { head: { fontWeight: 600 } } },
      MuiDataGrid: {
        styleOverrides: {
          root: { backgroundColor: c.surface, border: `1px solid ${c.outline}` },
          columnHeaders: { backgroundColor: c.surfaceAlt, borderBottom: `1px solid ${c.outline}` },
          row: {
            "&:nth-of-type(even)": { backgroundColor: mode === "dark" ? "transparent" : "#EAF3F0" },
            "&:hover": { backgroundColor: mode === "dark" ? "rgba(148,163,184,.1)" : "#E2EFEA" },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&:hover": {
              backgroundColor:
                mode === "dark" ? "rgba(148,163,184,.14)" : "rgba(39,79,101,.08)",
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
