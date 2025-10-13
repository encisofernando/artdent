// theme.js
import { createContext, useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        // Paleta ARTDENT con nombres directos
        brand: {
          primaryBlue:  "#397B9C", // 2150 CP
          primaryGreen: "#5AAD9C", // 7473 C
          secondaryMint:"#ACD6CE", // 565 CP
          secondaryTeal:"#49949C", // 5483 C
          tertiaryMint: "#DAEEE3", // 566 C
          tertiaryIce:  "#DAE6F0", // 7457 C
          tertiaryBlue: "#7CA5C3", // 542 C
        },
        // Escalas
        primary: {
          100: "#DAE6F0",
          200: "#C8D9E8",
          300: "#B6CCE0",
          400: "#7CA5C3",
          500: "#397B9C",
          600: "#2F6782",
          700: "#274F65",
          800: "#1D3B4C",
          900: "#142A37",
        },
        greenAccent: {
          100: "#DAEEE3",
          200: "#CFE7DE",
          300: "#BFE0D6",
          400: "#ACD6CE",
          500: "#5AAD9C",
          600: "#4E9587",
          700: "#3F766B",
          800: "#305851",
          900: "#233E39",
        },
        blueAccent: {
          100: "#DAE6F0",
          200: "#CFE0EB",
          300: "#B9D2E3",
          400: "#7CA5C3",
          500: "#397B9C",
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
          1000: "#ffffff",
          1100: "#000000",
        },
        text: { primary: "#ffffff", secondary: "#000000" },

        // === Aliases usados por Sidebar / estilos previos (evitan undefined[500]) ===
        sidebartext: { 500: "#DAE6F0" }, // texto sidebar en dark
        hovermenu:   { 500: "#2F6782" }, // hover de items en dark
        azul:        { 500: "#397B9C" }, // base del sidebar en dark
        black:       { 500: "#000000" },
        orange:      { 500: "#FFA500" },
        yellow:      { 500: "#FFD700" },
        naranja:     { 500: "#FF5733" },
        redAccent: {
          100:"#f8dcdb",200:"#f1b9b7",300:"#e99592",400:"#e2726e",500:"#db4f4a",
          600:"#af3f3b",700:"#832f2c",800:"#58201e",900:"#2c100f",
        },
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
          100: "#DAE6F0",
          200: "#C8D9E8",
          300: "#B6CCE0",
          400: "#7CA5C3",
          500: "#397B9C",
          600: "#2F6782",
          700: "#274F65",
          800: "#1D3B4C",
          900: "#142A37",
        },
        greenAccent: {
          100: "#DAEEE3",
          200: "#CFE7DE",
          300: "#BFE0D6",
          400: "#ACD6CE",
          500: "#5AAD9C",
          600: "#4E9587",
          700: "#3F766B",
          800: "#305851",
          900: "#233E39",
        },
        blueAccent: {
          100: "#DAE6F0",
          200: "#CFE0EB",
          300: "#B9D2E3",
          400: "#7CA5C3",
          500: "#397B9C",
          600: "#2F6782",
          700: "#274F65",
          800: "#1D3B4C",
          900: "#142A37",
        },
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
          1000: "#ffffff",
          1100: "#000000",
        },
        text: { primary: "#000000", secondary: "#ffffff" },

        // Aliases para light
        sidebartext: { 500: "#274F65" }, // texto sidebar en light
        hovermenu:   { 500: "#E7E9F0" }, // hover de items en light
        azul:        { 500: "#DAE6F0" }, // base del sidebar en light
        black:       { 500: "#000000" },
        orange:      { 500: "#FFA500" },
        yellow:      { 500: "#FFD700" },
        naranja:     { 500: "#FF5733" },
        redAccent: {
          100:"#f8dcdb",200:"#f1b9b7",300:"#e99592",400:"#e2726e",500:"#db4f4a",
          600:"#af3f3b",700:"#832f2c",800:"#58201e",900:"#2c100f",
        },
      }),
});

export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            primary:   { main: colors.primary[500] },     // #397B9C
            secondary: { main: colors.greenAccent[500] }, // #5AAD9C
            background:{ default: colors.primary[500] },
            text:      { primary: "#fff", secondary: "#000" },
          }
        : {
            primary:   { main: colors.primary[100] },     // #DAE6F0
            secondary: { main: colors.greenAccent[500] }, // #5AAD9C
            background:{ default: "#fcfcfc" },
            text:      { primary: "#000", secondary: "#fff" },
          }),

      // === Colores semánticos (p/ <Alert/> y más)
      success: { main: colors.greenAccent[500], contrastText: "#fff" },
      info:    { main: colors.blueAccent[400],  contrastText: "#fff" },
      warning: { main: "#FFD700",               contrastText: "#000" },
      error:   { main: "#DB4F4A",               contrastText: "#fff" },
    },
    typography: {
      fontFamily: ["Montserrat", "sans-serif"].join(","),
      fontSize: 12,
      h1: { fontFamily: "Montserrat, sans-serif", fontSize: 40, fontWeight: 700 },
      h2: { fontFamily: "Montserrat, sans-serif", fontSize: 32, fontWeight: 600 },
      h3: { fontFamily: "Montserrat, sans-serif", fontSize: 24, fontWeight: 600 },
      h4: { fontFamily: "Montserrat, sans-serif", fontSize: 20, fontWeight: 500 },
      h5: { fontFamily: "Montserrat, sans-serif", fontSize: 16, fontWeight: 500 },
      h6: { fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 400 },
      body1: { fontFamily: "Montserrat, sans-serif", fontSize: 14 },
      body2: { fontFamily: "Montserrat, sans-serif", fontSize: 12 },
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
