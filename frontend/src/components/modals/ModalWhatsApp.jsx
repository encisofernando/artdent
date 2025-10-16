import { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Typography, useTheme, Paper
} from "@mui/material";

const fmt = (n = 0) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Props:
 * - open, onClose
 * - cliente: {name, whatsapp, email?}
 * - items: [{name, qty, subtotal}]
 * - total: number
 * - pago: { metodo, nota, cambio }
 * - totales?: { iva21, iva105, subtotal }
 * - cajero?: string
 */
const ModalWhatsApp = ({
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
  const [telefono, setTelefono] = useState(cliente?.whatsapp || "");

  const texto = useMemo(() => {
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

    return `Hola ${cliente?.name || "Cliente"}, te envío el detalle de tu compra:

${lines.join("\n")}

Total: $${fmt(total)}${extras.length ? `

${extras.join("\n")}` : ""}

¡Gracias por tu compra!`;
  }, [cliente, items, total, pago, totales, cajero]);

  const urlWA = useMemo(() => {
    const phone = (telefono || "").replace(/\D/g, "");
    const msg = encodeURIComponent(texto);
    return `https://wa.me/${phone}?text=${msg}`;
  }, [telefono, texto]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enviar por WhatsApp</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <TextField
            label="Teléfono (con código de país)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+54 9 3xxx ..."
            fullWidth
          />
          <Typography variant="subtitle2">Mensaje</Typography>
          <Paper
            variant="outlined"
            sx={{ p: 1, borderRadius: 2, background: theme.palette.background.default }}
          >
            <Typography component="pre" sx={{ whiteSpace: "pre-wrap", m: 0 }}>
              {texto}
            </Typography>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" color="secondary" href={urlWA} target="_blank" rel="noreferrer">
          Abrir WhatsApp
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalWhatsApp;
