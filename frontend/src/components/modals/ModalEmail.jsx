import { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Typography, Paper, useTheme
} from "@mui/material";

const fmt = (n = 0) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Props:
 * - open, onClose
 * - cliente
 * - items: [{name, qty, subtotal}]
 * - total
 * - pago: {metodo, nota, cambio}
 * - totales?: { iva21, iva105, subtotal }
 * - cajero?: string
 */
const ModalEmail = ({
  open,
  onClose,
  cliente,
  items = [],
  total = 0,
  pago = {},
  totales = {},
  cajero,
}) => {
  const theme = useTheme();
  const [to, setTo] = useState(cliente?.email || "");
  const [subject, setSubject] = useState("Tu comprobante de compra");

  const body = useMemo(() => {
    const lines = items.map(
      (i) => `• ${i.qty || i.cantidad} x ${i.name || i.descripcion} — $${fmt(i.subtotal || i.total)}`
    );

    const extras = [];
    if (typeof totales.iva21 === "number" && totales.iva21 > 0) {
      extras.push(`IVA 21%: $${fmt(totales.iva21)}`);
    }
    if (typeof totales.iva105 === "number" && totales.iva105 > 0) {
      extras.push(`IVA 10,5%: $${fmt(totales.iva105)}`);
    }
    if (pago?.metodo) {
      extras.push(`Medio de pago: ${pago.metodo}${pago.nota ? ` (${pago.nota})` : ""}`);
      if (pago.cambio) extras.push(`Cambio: $${fmt(pago.cambio)}`);
    }
    if (cajero) {
      extras.push(`Cajero: ${cajero}`);
    }

    return `Hola ${cliente?.name || "Cliente"},\n\nAdjuntamos el detalle de tu compra:\n\n${lines.join(
      "\n"
    )}\n\nTotal: $${fmt(total)}${extras.length ? `\n\n${extras.join("\n")}` : ""}\n\nSaludos,\nArtDent`;
  }, [cliente, items, total, pago, totales, cajero]);

  // mailto de emergencia; en backend podés enviar real
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enviar por Email</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <TextField label="Para" value={to} onChange={(e) => setTo(e.target.value)} />
          <TextField label="Asunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Typography variant="subtitle2">Cuerpo</Typography>
          <Paper
            variant="outlined"
            sx={{ p: 1, borderRadius: 2, background: theme.palette.background.default }}
          >
            <Typography component="pre" sx={{ whiteSpace: "pre-wrap", m: 0 }}>
              {body}
            </Typography>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" color="secondary" href={mailto}>
          Abrir cliente de correo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEmail;
