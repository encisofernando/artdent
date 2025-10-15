import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme.js"; // ajusta la ruta si es necesario

// --- Paleta VITA (aprox) ---
const TONOS = [
  { code: "A1", color: "#f4e2d1" },
  { code: "A2", color: "#eed1b8" },
  { code: "A3", color: "#e2bda0" },
  { code: "A3.5", color: "#d7aa8d" },
  { code: "A4", color: "#c9967e" },
  { code: "B1", color: "#f7e4cf" },
  { code: "B2", color: "#f0d3b6" },
  { code: "B3", color: "#e3bc9b" },
  { code: "B4", color: "#d4a98a" },
  { code: "C1", color: "#f3dfc4" },
  { code: "C2", color: "#e8c8a7" },
  { code: "C3", color: "#d9b28b" },
  { code: "C4", color: "#c59874" },
  { code: "D2", color: "#ead2b4" },
  { code: "D3", color: "#d8b996" },
  { code: "D4", color: "#c7a07e" },
];

const SUP = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const INF = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

function TeethRow({ teeth, selected, onSelect }) {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  return (
    <Grid container spacing={0.5} justifyContent="center" sx={{ mt: 1 }}>
      {teeth.map((n) => {
        const isSel = selected === n;
        return (
          <Grid item key={n}>
            <IconButton
              size="small"
              onClick={() => onSelect(n)}
              sx={{
                width: 44,
                height: 54,
                borderRadius: 1.2,
                border: isSel ? `2px solid ${c.brand.primaryBlue}` : `1px solid ${c.grey[300]}`,
                bgcolor: isSel ? c.brand.primaryLight : theme.palette.background.paper,
              }}
            >
              <Typography variant="body2">{n}</Typography>
            </IconButton>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default function SelectorDientes({ open, onClose, onSelect }) {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  const [dienteSeleccionado, setDienteSeleccionado] = useState(null);
  const [tonoSeleccionado, setTonoSeleccionado] = useState(null);

  const handleGuardar = () => {
    if (!dienteSeleccionado || !tonoSeleccionado) return;
    // Devolvemos un string amigable. Si preferís objeto, cambia aquí.
    onSelect(`${dienteSeleccionado} - ${tonoSeleccionado}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: 800 }}>
        Seleccionar Dientes
      </DialogTitle>
      <DialogContent>
        <Box sx={{ bgcolor: c.tertiaryIce, borderRadius: 2, p: 2, border: `1px solid ${c.blueAccent[100]}` }}>
          <Typography variant="subtitle2" align="center" sx={{ fontWeight: 700 }}>
            Arcada Superior
          </Typography>
          <TeethRow teeth={SUP} selected={dienteSeleccionado} onSelect={setDienteSeleccionado} />
          <Typography variant="subtitle2" align="center" sx={{ fontWeight: 700, mt: 1 }}>
            Arcada Inferior
          </Typography>
          <TeethRow teeth={INF} selected={dienteSeleccionado} onSelect={setDienteSeleccionado} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" textAlign="center" sx={{ fontWeight: 700 }}>
            Selecciona el color de la pieza dental:
          </Typography>

          <ToggleButtonGroup
            value={tonoSeleccionado}
            exclusive
            onChange={(_, v) => setTonoSeleccionado(v)}
            sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", mt: 1 }}
          >
            {TONOS.map((t) => (
              <ToggleButton
                key={t.code}
                value={t.code}
                sx={{
                  width: 52,
                  height: 48,
                  m: 0.4,
                  borderRadius: 1,
                  bgcolor: t.color,
                  border: tonoSeleccionado === t.code ? `2px solid ${c.brand.primaryBlue}` : "1px solid #cfcfcf",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {t.code}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Cerrar
        </Button>
        <Button onClick={handleGuardar} color="primary" variant="contained" disabled={!dienteSeleccionado || !tonoSeleccionado}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
