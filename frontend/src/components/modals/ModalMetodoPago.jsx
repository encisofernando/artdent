import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stack,
  InputAdornment,
  Typography,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
} from "@mui/icons-material";

const METODOS = [
  {
    label: "Efectivo",
    code: "CASH",
    icon: <PaymentIcon />,
    color: "success.main",
  },
  {
    label: "Tarjeta Débito",
    code: "DEBIT",
    icon: <CardIcon />,
    color: "info.main",
  },
  {
    label: "Tarjeta Crédito",
    code: "CREDIT",
    icon: <CardIcon />,
    color: "warning.main",
  },
  {
    label: "Transferencia",
    code: "TRANSFER",
    icon: <BankIcon />,
    color: "primary.main",
  },
  {
    label: "Mercado Pago",
    code: "MERCADO_PAGO",
    icon: <PaymentIcon />,
    color: "info.main",
  },
];

export default function ModalMetodoPago({
  open,
  onClose,
  total = 0,
  defaultMetodo = "Efectivo",
  onConfirm,
}) {
  const [metodo, setMetodo] = useState(defaultMetodo);
  const [nota, setNota] = useState("");
  const [recibido, setRecibido] = useState("");
  const [cambio, setCambio] = useState(0);

  // Calcular cambio
  useEffect(() => {
    const r = Number(recibido || 0);
    setCambio(r > total ? r - total : 0);
  }, [recibido, total]);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setMetodo(defaultMetodo);
      setNota("");
      setRecibido("");
      setCambio(0);
    }
  }, [open, defaultMetodo]);

  const handleConfirm = () => {
    if (metodo === "Efectivo" && Number(recibido || 0) < total) {
      return; // No permitir si el monto recibido es menor
    }

    onConfirm?.({
      metodo,
      metodo_code: METODOS.find((m) => m.label === metodo)?.code || null,
      nota: nota?.trim() || null,
      recibido: Number(recibido || 0),
      cambio,
    });
  };

  const selectedMetodo = METODOS.find((m) => m.label === metodo);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {selectedMetodo?.icon}
          <Typography variant="h6" fontWeight={700}>
            Método de Pago
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Total */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'primary.50',
              borderColor: 'primary.main',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={600}>
                Total a Cobrar
              </Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Typography>
            </Stack>
          </Paper>

          {/* Métodos de pago */}
          <FormControl>
            <FormLabel sx={{ fontWeight: 600, mb: 1.5 }}>
              Seleccionar Método
            </FormLabel>
            <RadioGroup value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <Stack spacing={1}>
                {METODOS.map((m) => (
                  <Paper
                    key={m.code}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: metodo === m.label ? m.color : 'divider',
                      borderWidth: metodo === m.label ? 2 : 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <FormControlLabel
                      value={m.label}
                      control={<Radio />}
                      label={
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ color: m.color }}>{m.icon}</Box>
                          <Typography fontWeight={500}>{m.label}</Typography>
                        </Stack>
                      }
                      sx={{ m: 0, p: 1.5, width: '100%' }}
                    />
                  </Paper>
                ))}
              </Stack>
            </RadioGroup>
          </FormControl>

          {/* Efectivo: Recibido y Cambio */}
          {metodo === "Efectivo" && (
            <>
              <Divider />
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Monto Recibido"
                  value={recibido}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setRecibido(val);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    inputMode: "decimal",
                  }}
                  error={recibido && Number(recibido) < total}
                  helperText={
                    recibido && Number(recibido) < total
                      ? 'El monto recibido debe ser mayor o igual al total'
                      : ' '
                  }
                />

                {recibido && Number(recibido) >= total && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: cambio > 0 ? 'success.50' : 'grey.50',
                      borderColor: cambio > 0 ? 'success.main' : 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body1" fontWeight={600}>
                        Cambio
                      </Typography>
                      <Typography
                        variant="h5"
                        color={cambio > 0 ? 'success.main' : 'text.secondary'}
                        fontWeight={700}
                      >
                        ${cambio.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </>
          )}

          {/* Nota/Referencia */}
          <TextField
            label="Nota / Referencia (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder={
              metodo.includes('Tarjeta')
                ? 'Últimos 4 dígitos'
                : metodo === 'Transferencia'
                ? 'Número de operación'
                : 'Información adicional'
            }
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} size="large">
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleConfirm}
          disabled={metodo === "Efectivo" && Number(recibido || 0) < total}
        >
          Confirmar Cobro
        </Button>
      </DialogActions>
    </Dialog>
  );
}
