import { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Typography, useTheme, Paper
} from "@mui/material";

const ModalWhatsApp = ({ open, onClose, cliente, items = [], total = 0 }) => {
  const theme = useTheme();
  const [telefono, setTelefono] = useState(cliente?.whatsapp || "");

  const texto = useMemo(() => {
    const lines = items.map(i => `• ${i.qty} x ${i.name} — $${i.subtotal.toFixed(2)}`);
    return `Hola ${cliente?.name || "Cliente"}, te envío el detalle de tu compra:\n\n${lines.join("\n")}\n\nTotal: $${total.toFixed(2)}\n\n¡Gracias por tu compra!`;
  }, [cliente, items, total]);

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
          <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, background: theme.palette.background.default }}>
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
