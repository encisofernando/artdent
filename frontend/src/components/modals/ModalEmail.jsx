import { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Typography, Paper, useTheme
} from "@mui/material";

const ModalEmail = ({ open, onClose, cliente, items = [], total = 0 }) => {
  const theme = useTheme();
  const [to, setTo] = useState(cliente?.email || "");
  const [subject, setSubject] = useState("Tu comprobante de compra");
  const body = useMemo(() => {
    const lines = items.map(i => `• ${i.qty} x ${i.name} — $${i.subtotal.toFixed(2)}`);
    return `Hola ${cliente?.name || "Cliente"},\n\nAdjuntamos el detalle de tu compra:\n\n${lines.join("\n")}\n\nTotal: $${total.toFixed(2)}\n\nSaludos,\nArtDent`;
  }, [cliente, items, total]);

  // mailto de emergencia; en tu backend podés enviar real
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enviar por Email</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <TextField label="Para" value={to} onChange={(e) => setTo(e.target.value)} />
          <TextField label="Asunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Typography variant="subtitle2">Cuerpo</Typography>
          <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, background: theme.palette.background.default }}>
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
