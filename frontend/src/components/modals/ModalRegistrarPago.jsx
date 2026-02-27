// src/components/modals/ModalRegistrarPago.jsx
import {
  Dialog, DialogContent, Stack, Typography, TextField,
  Button, MenuItem, IconButton, CircularProgress, Alert,
  InputAdornment,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import CloseIcon          from "@mui/icons-material/Close";
import PaymentIcon        from "@mui/icons-material/Payment";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import { registerReceipts } from "../../services/salesService";

// ─── Brand ───────────────────────────────────────────────────────────────────
const B = {
  blue:  "#397B9C",
  green: "#5AAD9C",
  teal:  "#49949C",
};

const METHODS = [
  { id: null,  label: "Sin especificar" },
  { id: 1,     label: "Efectivo" },
  { id: 2,     label: "Transferencia" },
  { id: 3,     label: "Tarjeta de débito" },
  { id: 4,     label: "Tarjeta de crédito" },
  { id: 5,     label: "Mercado Pago / QR" },
  { id: 6,     label: "Cheque" },
];

const today = () => new Date().toISOString().split("T")[0];

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ModalRegistrarPago({
  open,
  onClose,
  saleId,          // ID de la venta (solo POS)
  pendingAmount,   // monto pendiente sugerido
  onSuccess,       // callback luego del registro exitoso
}) {
  const isDark = false; // puede conectarse a useTheme si se usa dark mode

  const [form, setForm] = useState({
    payment_method_id: null,
    amount:            "",
    receipt_date:      today(),
    reference:         "",
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill amount when modal opens
  useEffect(() => {
    if (open) {
      setForm({
        payment_method_id: null,
        amount:            pendingAmount > 0 ? String(pendingAmount) : "",
        receipt_date:      today(),
        reference:         "",
      });
      setError(null);
      setSuccess(false);
    }
  }, [open, pendingAmount]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleConfirm = async () => {
    const amount = parseFloat(String(form.amount).replace(",", "."));
    if (!amount || amount <= 0) {
      setError("Ingresá un importe válido mayor a cero.");
      return;
    }
    if (!saleId) {
      setError("No se pudo identificar la venta.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await registerReceipts(saleId, [{
        payment_method_id: form.payment_method_id,
        amount,
        receipt_date: form.receipt_date,
        reference:    form.reference || null,
      }]);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 900);
    } catch (e) {
      setError(e?.response?.data?.message ?? "No se pudo registrar el pago. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // ── Palette helpers ────────────────────────────────────────────────────────
  const borderCol  = "rgba(0,0,0,0.08)";
  const textCol    = "#1A202C";
  const mutedCol   = "rgba(26,32,44,0.5)";
  const surfaceBg  = "#F7FAFC";
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontSize: 13.5,
      bgcolor: "#fff",
    },
    "& .MuiInputLabel-root": { fontSize: 13, color: mutedCol },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: borderCol },
    "& .MuiSelect-icon": { color: mutedCol },
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: `0 24px 64px ${alpha(B.blue, 0.18)}`,
        },
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Stack
        direction="row" alignItems="center" justifyContent="space-between"
        sx={{
          px: 3, py: 2,
          background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <PaymentIcon sx={{ color: "#fff", fontSize: 20 }} />
          <Box>
            <Typography sx={{
              fontSize: 15, fontWeight: 800, color: "#fff",
              fontFamily: "Montserrat, sans-serif", lineHeight: 1.15,
            }}>
              Registrar pago
            </Typography>
            {pendingAmount > 0 && (
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                Pendiente: ${fmt(pendingAmount)}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton
          size="small" onClick={onClose} disabled={saving}
          sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ p: 3, bgcolor: surfaceBg }}>

        {/* Success state */}
        {success ? (
          <Stack alignItems="center" spacing={1.5} py={2}>
            <CheckCircleIcon sx={{ fontSize: 52, color: B.green }} />
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: textCol, fontFamily: "Montserrat, sans-serif" }}>
              ¡Pago registrado!
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 12.5 }}>
                {error}
              </Alert>
            )}

            {/* Amount */}
            <TextField
              label="Importe"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              size="small" fullWidth type="number"
              inputProps={{ min: 0, step: "0.01" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: B.blue }}>$</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                ...inputSx,
                "& .MuiOutlinedInput-root": {
                  ...inputSx["& .MuiOutlinedInput-root"],
                  "& input": { fontSize: 18, fontWeight: 800, color: B.blue, fontFamily: "Montserrat, sans-serif" },
                },
              }}
            />

            {/* Method */}
            <TextField
              select size="small" label="Medio de pago" fullWidth
              value={form.payment_method_id ?? "null"}
              onChange={(e) => set("payment_method_id", e.target.value === "null" ? null : Number(e.target.value))}
              sx={inputSx}
            >
              {METHODS.map((m) => (
                <MenuItem key={String(m.id)} value={String(m.id)}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Date */}
            <TextField
              label="Fecha del pago"
              type="date"
              value={form.receipt_date}
              onChange={(e) => set("receipt_date", e.target.value)}
              size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />

            {/* Reference */}
            <TextField
              label="Referencia / N° transferencia (opcional)"
              value={form.reference}
              onChange={(e) => set("reference", e.target.value)}
              size="small" fullWidth
              placeholder="Ej: CVU, N° cheque, comprobante..."
              sx={inputSx}
            />

            {/* Actions */}
            <Stack direction="row" spacing={1.25} pt={0.5}>
              <Button
                fullWidth variant="outlined"
                onClick={onClose} disabled={saving}
                sx={{
                  borderRadius: "10px", textTransform: "none", fontWeight: 700,
                  py: 1.2, borderColor: borderCol, color: mutedCol,
                  "&:hover": { borderColor: B.blue, color: B.blue },
                }}
              >
                Cancelar
              </Button>
              <Button
                fullWidth variant="contained"
                onClick={handleConfirm} disabled={saving}
                sx={{
                  borderRadius: "10px", textTransform: "none",
                  fontWeight: 800, fontFamily: "Montserrat, sans-serif",
                  py: 1.2,
                  background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
                  boxShadow: `0 4px 14px ${alpha(B.blue, 0.35)}`,
                  "&:hover": { boxShadow: `0 6px 20px ${alpha(B.blue, 0.45)}` },
                  "&.Mui-disabled": { opacity: 0.6 },
                }}
              >
                {saving
                  ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                  : "Confirmar pago"
                }
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Missing Box import ───────────────────────────────────────────────────────
import { Box } from "@mui/material";