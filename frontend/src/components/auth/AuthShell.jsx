import React, { useMemo } from "react";
import { Container, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { getAuthStyles } from "./authStyles";

/**
 * AuthShell:
 * - Aplica el fondo (layout)
 * - Centra el contenido
 * - Renderiza una "card" consistente
 *
 * Uso:
 * <AuthShell>
 *   ...formulario...
 * </AuthShell>
 */
export default function AuthShell({ children, maxWidth = "xs" }) {
  const theme = useTheme();
  const t = tokens?.(theme.palette?.mode || "light") || {};
  const styles = useMemo(() => getAuthStyles(t?.brand || {}), [t?.brand]);

  return (
    <Box sx={styles.layout}>
      <Container component="main" maxWidth={maxWidth} sx={styles.container}>
        <Box sx={styles.card}>{children}</Box>
      </Container>
    </Box>
  );
}