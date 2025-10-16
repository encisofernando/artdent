import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, TextField, Stack, InputAdornment
} from "@mui/material";

const METODOS = [
  "Efectivo",
  "Tarjeta",
  "Transferencia",
  "Mercado Pago",
];

export default function ModalMetodoPago({
  open,
  onClose,
  total = 0,
  defaultMetodo = "Efectivo",
  onConfirm, // ({metodo, nota, recibido, cambio})
}) {
  const [metodo, setMetodo] = useState(defaultMetodo);
  const [nota, setNota] = useState("");
  const [recibido, setRecibido] = useState("");
  const [cambio, setCambio] = useState(0);

  useEffect(() => {
    const r = Number(recibido || 0);
    setCambio(r > total ? r - total : 0);
  }, [recibido, total]);

  const handleConfirm = () => {
    onConfirm?.({
      metodo,
      nota: nota?.trim(),
      recibido: Number(recibido || 0),
      cambio,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Seleccionar método de pago</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Método</FormLabel>
            <RadioGroup
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
            >
              {METODOS.map((m) => (
                <FormControlLabel key={m} value={m} control={<Radio />} label={m} />
              ))}
            </RadioGroup>
          </FormControl>

          {metodo === "Efectivo" && (
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Recibido"
                value={recibido}
                onChange={(e) => setRecibido(e.target.value.replace(",", "."))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputMode: "decimal",
                }}
              />
              <TextField
                fullWidth
                label="Cambio"
                value={cambio.toFixed(2)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  readOnly: true,
                }}
              />
            </Stack>
          )}

          <TextField
            label="Nota / Referencia (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Últimos 4, número de operación, etc."
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
