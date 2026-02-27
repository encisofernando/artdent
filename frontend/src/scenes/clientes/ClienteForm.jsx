// src/scenes/clientes/ClienteForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import * as Customers from "../../services/customerService";

const B = {
  blue: "#397B9C",
  green: "#5AAD9C",
  teal: "#49949C",
  mint: "#ACD6CE",
  soft: "#7CA5C3",
};

const initial = {
  code: "",
  name: "",
  tax_id: "",
  tax_condition: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  credit_limit: 0,
  is_active: 1,
};

export default function ClienteForm({ open, onClose, onCreated }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const bg = isDark ? "#0F2733" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "#E6EEF5" : "#111827";
  const muted = isDark ? "rgba(230,238,245,0.55)" : "rgba(17,24,39,0.55)";

  useEffect(() => {
    if (open) {
      setForm(initial);
      setSaving(false);
      setError("");
    }
  }, [open]);

  const canSave = useMemo(() => {
    return String(form.name || "").trim().length > 1;
  }, [form.name]);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm((p) => ({ ...p, [k]: v }));
  };

  const submit = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      credit_limit: Number(form.credit_limit || 0),
      is_active: form.is_active ? 1 : 0,
    };

    try {
      if (Customers.createCustomer) {
        await Customers.createCustomer(payload);
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al crear cliente");
      }

      onCreated?.();
    } catch (e) {
      console.error("[ClienteForm] create error:", e);
      setError(e?.response?.data?.message || e?.message || "Error al crear el cliente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: bg,
          color: text,
          borderBottom: `1px solid ${border}`,
          py: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 16, lineHeight: 1.1 }}>Nuevo cliente</Typography>
            <Typography sx={{ color: muted, fontSize: 12, mt: 0.25 }}>
              Alta rápida para POS y facturación
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ borderRadius: 2, border: `1px solid ${border}` }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: bg, color: text, p: { xs: 1.5, md: 2 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${border}`,
            bgcolor: alpha("#FFFFFF", isDark ? 0.03 : 0.7),
            p: 1.5,
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} gap={1.25}>
            <TextField label="Código" value={form.code} onChange={set("code")} fullWidth />
            <TextField label="Nombre / Razón Social *" value={form.name} onChange={set("name")} fullWidth />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.25} mt={1.25}>
            <TextField label="CUIT/CUIL" value={form.tax_id} onChange={set("tax_id")} fullWidth />
            <TextField
              label="Condición IVA"
              value={form.tax_condition}
              onChange={set("tax_condition")}
              placeholder="consumidor_final / responsable_inscripto / monotributista / exento"
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.25} mt={1.25}>
            <TextField label="Email" value={form.email} onChange={set("email")} fullWidth />
            <TextField label="Teléfono" value={form.phone} onChange={set("phone")} fullWidth />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.25} mt={1.25}>
            <TextField label="Dirección" value={form.address} onChange={set("address")} fullWidth />
            <TextField label="CP" value={form.zip} onChange={set("zip")} sx={{ maxWidth: { md: 180 } }} fullWidth />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.25} mt={1.25}>
            <TextField label="Ciudad" value={form.city} onChange={set("city")} fullWidth />
            <TextField label="Provincia" value={form.state} onChange={set("state")} fullWidth />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.25} mt={1.25} alignItems={{ md: "center" }}>
            <TextField
              label="Límite Cuenta Corriente"
              type="number"
              value={form.credit_limit}
              onChange={set("credit_limit")}
              fullWidth
            />
            <FormControlLabel
              control={<Checkbox checked={!!form.is_active} onChange={set("is_active")} />}
              label="Activo"
              sx={{ ml: { md: 0.5 } }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2, borderColor: border }} />

        <Stack direction="row" justifyContent="flex-end" gap={1}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              borderColor: alpha(B.blue, 0.35),
              color: text,
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={submit}
            disabled={!canSave || saving}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              bgcolor: B.blue,
              "&:hover": { bgcolor: B.teal },
              minWidth: 150,
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Guardar"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}