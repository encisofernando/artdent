// src/scenes/laboratorio/SelectorDientesSVG.jsx
// Selector visual de dientes con numeración FDI y paleta VITA
import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, ToggleButton, ToggleButtonGroup,
  Chip, Stack, IconButton, Tooltip, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ── Paleta VITA ───────────────────────────────────────────────────────────────
const VITA = [
  { code: "A1",  hex: "#F9EDE1", dark: false },
  { code: "A2",  hex: "#F2DCC8", dark: false },
  { code: "A3",  hex: "#E6C4A8", dark: false },
  { code: "A3.5",hex: "#D9AF8E", dark: false },
  { code: "A4",  hex: "#CC9878", dark: false },
  { code: "B1",  hex: "#FBF0E3", dark: false },
  { code: "B2",  hex: "#F4DCBF", dark: false },
  { code: "B3",  hex: "#E7C5A0", dark: false },
  { code: "B4",  hex: "#D9AF88", dark: false },
  { code: "C1",  hex: "#F7E8D0", dark: false },
  { code: "C2",  hex: "#EBCFAC", dark: false },
  { code: "C3",  hex: "#DCB58A", dark: false },
  { code: "C4",  hex: "#CC9A6E", dark: false },
  { code: "D2",  hex: "#EDD5B0", dark: false },
  { code: "D3",  hex: "#DEC090", dark: false },
  { code: "D4",  hex: "#CEA872", dark: false },
];

// ── FDI numeración ────────────────────────────────────────────────────────────
const CUADRANTES = [
  { label: "Superior Derecha", nums: [18,17,16,15,14,13,12,11] },
  { label: "Superior Izquierda", nums: [21,22,23,24,25,26,27,28] },
  { label: "Inferior Izquierda", nums: [31,32,33,34,35,36,37,38] },
  { label: "Inferior Derecha", nums: [48,47,46,45,44,43,42,41] },
];

// Tipos de diente por número (para icono SVG)
function toothType(n) {
  const u = n % 10;
  if (u === 8) return "molar3";
  if (u === 7 || u === 6) return "molar";
  if (u === 5 || u === 4) return "premolar";
  if (u === 3) return "canino";
  return "incisivo";
}

// Diente SVG simplificado
function ToothSVG({ type, selected, color }) {
  const fill = selected ? color || "#397B9C" : "#fff";
  const stroke = selected ? "#397B9C" : "#CBD5E1";
  const w = 28, h = type === "molar" || type === "molar3" ? 32 : 28;

  if (type === "molar" || type === "molar3") return (
    <svg width={w} height={h} viewBox="0 0 28 32">
      <rect x="2" y="4" width="24" height="24" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5"/>
      <rect x="7" y="9" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5"/>
      <rect x="16" y="9" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5"/>
      <rect x="7" y="18" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5"/>
      <rect x="16" y="18" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5"/>
      <path d="M 14 4 Q 14 0 14 0" stroke={stroke} strokeWidth="1.5" fill="none"/>
    </svg>
  );

  if (type === "premolar") return (
    <svg width={w} height={h} viewBox="0 0 28 28">
      <rect x="2" y="4" width="24" height="22" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5"/>
      <rect x="8" y="10" width="12" height="7" rx="2" fill={stroke} opacity="0.4"/>
      <path d="M 14 4 Q 14 0 14 0" stroke={stroke} strokeWidth="1.5" fill="none"/>
    </svg>
  );

  if (type === "canino") return (
    <svg width={w} height={h} viewBox="0 0 28 28">
      <path d="M 4 6 Q 4 3 14 3 Q 24 3 24 6 L 22 24 Q 22 26 14 26 Q 6 26 6 24 Z" fill={fill} stroke={stroke} strokeWidth="1.5"/>
      <path d="M 14 3 L 14 0" stroke={stroke} strokeWidth="1.5"/>
    </svg>
  );

  return ( // incisivo
    <svg width={w} height={h} viewBox="0 0 28 28">
      <rect x="4" y="4" width="20" height="22" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5"/>
      <path d="M 14 4 L 14 0" stroke={stroke} strokeWidth="1.5"/>
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SelectorDientesSVG({ open, onClose, onSelect, multiple = false, initialValue = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const blue = "#397B9C";
  const green = "#5AAD9C";
  const mint = "#ACD6CE";

  // Estado: mapa { numero: tonoCode }
  const [selMap, setSelMap] = useState(() => {
    const m = {};
    (initialValue || []).forEach(v => {
      const [n, t] = v.split(" - ");
      if (n && t) m[Number(n)] = t;
    });
    return m;
  });
  const [activeTono, setActiveTono] = useState("A2");
  const [activeNum, setActiveNum] = useState(null);

  const handleTooth = (num) => {
    if (multiple) {
      setSelMap(prev => {
        const next = { ...prev };
        if (next[num]) { delete next[num]; }
        else { next[num] = activeTono; }
        return next;
      });
    } else {
      setActiveNum(num === activeNum ? null : num);
    }
  };

  const handleGuardar = () => {
    if (multiple) {
      const arr = Object.entries(selMap).map(([n, t]) => `${n} - ${t}`);
      onSelect(arr);
    } else {
      if (!activeNum || !activeTono) return;
      onSelect(`${activeNum} - ${activeTono}`);
    }
    onClose();
  };

  const isSelected = (n) => multiple ? !!selMap[n] : n === activeNum;
  const tonoForTooth = (n) => multiple ? (selMap[n] ? VITA.find(v => v.code === selMap[n])?.hex : undefined) : undefined;

  const selCount = multiple ? Object.keys(selMap).length : (activeNum ? 1 : 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: theme.palette.mode === "dark" ? "#0F1F2A" : "#F8FBFF",
          backgroundImage: `radial-gradient(ellipse at 10% 0%, ${mint}18 0%, transparent 60%)`,
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          background: `linear-gradient(135deg, ${blue} 0%, ${green} 100%)`,
          px: 3, py: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#fff" fontFamily="Montserrat, sans-serif">
              Selector de Piezas Dentales
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Sistema FDI — Seleccioná pieza y tono VITA
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, pt: { xs: 2, sm: 2.5 } }}>

        {/* Diagrama dental */}
        <Box sx={{
          border: `1.5px solid ${mint}`,
          borderRadius: 2,
          p: { xs: 1, sm: 2 },
          mb: 2,
          background: theme.palette.mode === "dark" ? "rgba(172,214,206,0.05)" : "rgba(172,214,206,0.08)",
        }}>
          {/* Línea divisoria central */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>

            {/* SUPERIOR */}
            <Typography variant="overline" sx={{ color: blue, fontWeight: 700, letterSpacing: 2, fontSize: "0.65rem", textAlign: "center" }}>
              ↑  ARCADA SUPERIOR
            </Typography>
            <Box sx={{
              display: "flex", justifyContent: "center", gap: "2px",
              borderBottom: `2px dashed ${mint}`,
              pb: 1, mb: 0.5,
            }}>
              {[...CUADRANTES[0].nums, ...CUADRANTES[1].nums].map(n => (
                <Tooltip key={n} title={`${n}${selMap[n] ? ` — ${selMap[n]}` : ""}`} arrow>
                  <Box
                    onClick={() => handleTooth(n)}
                    sx={{
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 0.3,
                      p: 0.3,
                      borderRadius: 1,
                      transition: "all .15s",
                      "&:hover": { transform: "scale(1.12)", bgcolor: `${mint}33` },
                      ...(isSelected(n) && {
                        transform: "scale(1.1)",
                        filter: `drop-shadow(0 2px 6px ${blue}88)`,
                      }),
                    }}
                  >
                    <ToothSVG
                      type={toothType(n)}
                      selected={isSelected(n)}
                      color={tonoForTooth(n) || blue}
                    />
                    <Typography variant="caption" sx={{
                      fontSize: "0.6rem",
                      fontWeight: isSelected(n) ? 800 : 500,
                      color: isSelected(n) ? blue : theme.palette.text.secondary,
                      lineHeight: 1,
                    }}>
                      {n}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>

            {/* INFERIOR */}
            <Box sx={{
              display: "flex", justifyContent: "center", gap: "2px",
              pt: 0.5,
            }}>
              {[...CUADRANTES[2].nums, ...CUADRANTES[3].nums].map(n => (
                <Tooltip key={n} title={`${n}${selMap[n] ? ` — ${selMap[n]}` : ""}`} arrow>
                  <Box
                    onClick={() => handleTooth(n)}
                    sx={{
                      cursor: "pointer",
                      display: "flex", flexDirection: "column-reverse", alignItems: "center",
                      gap: 0.3,
                      p: 0.3,
                      borderRadius: 1,
                      transition: "all .15s",
                      "&:hover": { transform: "scale(1.12)", bgcolor: `${mint}33` },
                      ...(isSelected(n) && {
                        transform: "scale(1.1)",
                        filter: `drop-shadow(0 2px 6px ${green}88)`,
                      }),
                    }}
                  >
                    <ToothSVG
                      type={toothType(n)}
                      selected={isSelected(n)}
                      color={tonoForTooth(n) || green}
                    />
                    <Typography variant="caption" sx={{
                      fontSize: "0.6rem",
                      fontWeight: isSelected(n) ? 800 : 500,
                      color: isSelected(n) ? green : theme.palette.text.secondary,
                      lineHeight: 1,
                    }}>
                      {n}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
            <Typography variant="overline" sx={{ color: green, fontWeight: 700, letterSpacing: 2, fontSize: "0.65rem", textAlign: "center" }}>
              ↓  ARCADA INFERIOR
            </Typography>
          </Box>
        </Box>

        {/* Paleta VITA */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: blue, fontFamily: "Montserrat, sans-serif" }}>
            Tono VITA activo: <Chip label={activeTono} size="small" sx={{ bgcolor: blue, color: "#fff", fontWeight: 800, ml: 0.5 }} />
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {VITA.map(v => (
              <Tooltip key={v.code} title={v.code} arrow>
                <Box
                  onClick={() => setActiveTono(v.code)}
                  sx={{
                    width: 46, height: 42, borderRadius: 1.5,
                    bgcolor: v.hex,
                    border: activeTono === v.code ? `2.5px solid ${blue}` : "1.5px solid #CBD5E1",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                    boxShadow: activeTono === v.code ? `0 0 0 3px ${blue}44` : "none",
                    "&:hover": { transform: "scale(1.1)", borderColor: blue },
                  }}
                >
                  <Typography variant="caption" sx={{
                    fontSize: "0.6rem", fontWeight: 700,
                    color: "#6B5B4E",
                    textShadow: "0 0 4px rgba(255,255,255,0.8)",
                  }}>
                    {v.code}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Seleccionados múltiples */}
        {multiple && Object.keys(selMap).length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: green }}>
              Piezas seleccionadas:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              {Object.entries(selMap).map(([n, t]) => (
                <Chip
                  key={n}
                  label={`${n} — ${t}`}
                  size="small"
                  onDelete={() => setSelMap(prev => { const next = {...prev}; delete next[n]; return next; })}
                  sx={{
                    bgcolor: `${green}22`, color: green,
                    border: `1px solid ${green}66`,
                    fontWeight: 600, fontSize: "0.72rem",
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{
        justifyContent: "space-between", px: 3, py: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: blue, color: blue }}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={selCount === 0}
          startIcon={<CheckCircleIcon />}
          sx={{
            background: `linear-gradient(135deg, ${blue} 0%, ${green} 100%)`,
            fontWeight: 700, px: 3,
            "&:disabled": { opacity: 0.5 },
          }}
        >
          Confirmar {selCount > 0 ? `(${selCount})` : ""}
        </Button>
      </DialogActions>
    </Dialog>
  );
}