import { forwardRef, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Paper, Stack, Divider, useTheme
} from "@mui/material";

const Ticket = forwardRef(({ cliente, items, total }, ref) => {
  const theme = useTheme();
  const subtotal = items.reduce((a, x) => a + x.subtotal, 0);
  const iva = subtotal * 0.21;

  return (
    <Paper ref={ref} elevation={0} sx={{ p: 2, width: 320, background: "#fff", color: "#000" }}>
      <Typography variant="h6" align="center" gutterBottom>ArtDent</Typography>
      <Typography variant="body2" align="center" gutterBottom>
        Venta a {cliente?.name || "Consumidor final"}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={0.5}>
        {items.map((i) => (
          <Stack key={i.id} direction="row" justifyContent="space-between">
            <Typography variant="body2">{i.qty} x {i.name}</Typography>
            <Typography variant="body2">${i.subtotal.toFixed(2)}</Typography>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">Subtotal</Typography>
          <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">IVA (21.00%)</Typography>
          <Typography variant="body2">${iva.toFixed(2)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
          <Typography variant="subtitle1" fontWeight={800}>
            ${total.toFixed(2)}
          </Typography>
        </Stack>
      </Stack>
      <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
        ¡Gracias por su compra!
      </Typography>
    </Paper>
  );
});

const ModalImprimir = ({ open, onClose, cliente, items = [], total = 0 }) => {
  const ticketRef = useRef(null);

  const imprimir = () => {
    // imprime sólo el contenido del ticket
    const html = ticketRef.current?.outerHTML || "";
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`
      <html><head><title>Ticket</title>
      <style>
        body{margin:0; padding:16px; font-family: Arial, Helvetica, sans-serif;}
        *{box-sizing:border-box;}
      </style>
      </head><body>${html}</body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Imprimir</DialogTitle>
      <DialogContent dividers>
        <Ticket ref={ticketRef} cliente={cliente} items={items} total={total} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" color="secondary" onClick={imprimir}>Imprimir</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalImprimir;
