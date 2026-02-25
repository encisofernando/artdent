// src/components/ProgressCircle.jsx
import { Box, Typography, useTheme } from "@mui/material";

/**
 * ProgressCircle
 *
 * @param {number|string} progress  – valor de 0 a 1 (e.g. "0.75" o 0.75)
 * @param {number|string} size      – diámetro en px (default "40")
 * @param {string}        color     – color de acento (default brand green #5AAD9C)
 * @param {boolean}       showLabel – mostrar % dentro (default: true si size >= 48)
 */
const ProgressCircle = ({
  progress  = "0.75",
  size      = "40",
  color,
  showLabel,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const pVal      = Math.min(1, Math.max(0, parseFloat(progress) || 0));
  const diameter  = parseInt(size);
  const deg       = pVal * 360;
  const accent    = color ?? "#5AAD9C";                // brand green por defecto
  const trackCol  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const innerSize = diameter * 0.64;
  const autoLabel = diameter >= 48;
  const doLabel   = showLabel !== undefined ? showLabel : autoLabel;
  const fontSize  = Math.max(9, Math.round(diameter * 0.21));

  return (
    <Box
      sx={{
        position: "relative",
        width: diameter,
        height: diameter,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* Donut exterior con conic-gradient */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(${accent} 0deg ${deg}deg, ${trackCol} ${deg}deg 360deg)`,
          transition: "background .5s cubic-bezier(.4,0,.2,1)",
        }}
      />

      {/* Recorte interior */}
      <Box
        sx={{
          position: "absolute",
          width: innerSize,
          height: innerSize,
          borderRadius: "50%",
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {doLabel && (
          <Typography
            sx={{
              fontSize,
              fontWeight: 800,
              color: accent,
              fontFamily: "Montserrat, sans-serif",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {Math.round(pVal * 100)}%
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProgressCircle;