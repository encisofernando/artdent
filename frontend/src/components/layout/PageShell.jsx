import React from "react";
import { Box, Paper, useTheme, useMediaQuery } from "@mui/material";
import useSidebarWidth from "./useSidebarWidth";

const TOPBAR_HEIGHT = (theme) =>
  (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

/**
 * PageShell: Layout unificado (tipo FacturarPOS)
 * - Bloquea scroll del navegador (contenedor fijo)
 * - Respeta Topbar
 * - Compensa el sidebar en desktop automáticamente
 * - Permite elegir si el scroll es del contenido (interno) o si lo manejan hijos (ej: tablas)
 */
export default function PageShell({
  children,
  padding = 2,
  paper = true,
  paperSx,
  containerSx,
  contentSx,
  contentOverflow = "auto", // "auto" para scroll interno de página; "hidden" para que solo scrolleen tablas internas
}) {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const sidebarW = useSidebarWidth();
  const appbarH = TOPBAR_HEIGHT(theme);

  const body = (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: mdDown ? 0 : sidebarW,
        right: 0,
        bottom: 0,
        p: padding,
        overflow: "hidden",
        transition: "left .18s ease",
        ...containerSx,
      }}
    >
      {paper ? (
        <Paper
          variant="outlined"
          sx={{
            height: "100%",
            borderRadius: 2,
            p: 2,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            ...paperSx,
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: contentOverflow, ...contentSx }}>
            {children}
          </Box>
        </Paper>
      ) : (
        <Box sx={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: contentOverflow, ...contentSx }}>
            {children}
          </Box>
        </Box>
      )}
    </Box>
  );

  return body;
}
