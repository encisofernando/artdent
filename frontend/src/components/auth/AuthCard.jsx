// src/components/auth/AuthCard.jsx
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { getAuthStyles } from "./authStyle";

export default function AuthCard({ children }) {
  const theme = useTheme();
  const t = tokens(theme.palette?.mode || "light");

  const styles = useMemo(
    () => getAuthStyles(t?.brand || {}, theme),
    [t?.brand, theme]
  );

  return (
    <Box sx={styles.card} role="region" aria-label="Autenticación">
      {children}
    </Box>
  );
}