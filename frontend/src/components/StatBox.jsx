// src/components/StatBox.jsx
//
// Props (backward-compatible con el original):
//   title      – label del métrico (e.g. "Nuevos Clientes")
//   subtitle   – valor principal  (e.g. "1.325")
//   icon       – ReactNode (elemento MUI Icon)
//   progress   – string|number 0–1 (e.g. "0.75")
//   increase   – string (e.g. "+14%" o "-3%")
//   color      – (opcional) color de acento; default brand green #5AAD9C
//
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import TrendingUpIcon   from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ProgressCircle   from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase, color }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const accent   = color ?? "#5AAD9C";
  const rawInc   = parseFloat((increase || "0").replace("%", "").replace("+", "")) || 0;
  const isPos    = rawInc >= 0;
  const trendCol = isPos ? "#5AAD9C" : "#E63946";

  const textCol  = isDark ? "#E6EEF5"                 : "#1A202C";
  const mutedCol = isDark ? "rgba(230,238,245,0.45)"  : "rgba(26,32,44,0.45)";

  return (
    <Box
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
      }}
    >
      {/* ── Top: ícono + circle ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        {/* Icon badge */}
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "11px",
            bgcolor: alpha(accent, isDark ? 0.18 : 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            flexShrink: 0,
            "& svg": { fontSize: 21 },
          }}
        >
          {icon}
        </Box>

        <ProgressCircle progress={progress} size={42} color={accent} />
      </Stack>

      {/* ── Valor + label ── */}
      <Box>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 800,
            color: textCol,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {subtitle}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: mutedCol,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            mt: 0.5,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* ── Trend ── */}
      {increase !== undefined && (
        <Stack direction="row" alignItems="center" spacing={0.6} mt="auto">
          {isPos
            ? <TrendingUpIcon   sx={{ fontSize: 15, color: trendCol }} />
            : <TrendingDownIcon sx={{ fontSize: 15, color: trendCol }} />
          }
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: trendCol,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {rawInc > 0 && !String(increase).startsWith("+") ? "+" : ""}{increase}
          </Typography>
          <Typography sx={{ fontSize: 11, color: mutedCol }}>
            vs período anterior
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default StatBox;