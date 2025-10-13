import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Grid, TextField, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * onConfirmarVenta(pagos) debe retornar { sale, invoice } si todo OK.
 */
const BotonesFactura = ({ limpiarProductos, tipoComprobante, numeroComprobante, clienteSeleccionado, calcularTotalFinal, rows, onConfirmarVenta }) => {
  const [openPago, setOpenPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [pagos, setPagos] = useState([]);
  const [openOpciones, setOpenOpciones] = useState(false);
  const [result, setResult] = useState(null);

  const getInitialDateTime = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    const formatted = localDate.toISOString().slice(0, 16);
    return formatted;
  };
  const fechaActual = getInitialDateTime();

  const isEmitirDisabled = !tipoComprobante || !rows.length || !clienteSeleccionado;

  const emitirFactura = () => setOpenPago(true);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Detalles de la Factura", 14, 20);

    doc.setFontSize(12);
    const nombre = clienteSeleccionado?.name || `${clienteSeleccionado?.Nom1 || ""} ${clienteSeleccionado?.Nom2 || ""}`.trim();
    const cuit = clienteSeleccionado?.tax_id || clienteSeleccionado?.CUIT || "";
    doc.text(`Cliente: ${nombre} - ${cuit}`, 14, 40);
    doc.text(`Tipo de Comprobante: ${tipoComprobante}`, 14, 50);
    if (result?.invoice?.invoice_number) doc.text(`N°: ${result.invoice.invoice_number}`, 14, 60);
    doc.text(`Fecha de Emision: ${fechaActual}`, 14, 70);

    const tableColumn = ["Código de Barra", "Nombre", "Precio Unitario", "Cantidad", "Subtotal"];
    const tableRows = rows.map((p) => [p.CodigoBarra, p.Nombre, p.PrecioPublico, p.cantidad, p.subtotal]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 80 });

    const totalFinal = calcularTotalFinal(rows);
    doc.text(`Total Final: $${totalFinal.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 10);
    doc.save("factura.pdf");
  };

  const printInvoice = () => {
    const nombre = clienteSeleccionado?.name || `${clienteSeleccionado?.Nom1 || ""} ${clienteSeleccionado?.Nom2 || ""}`.trim();
    const cuit = clienteSeleccionado?.tax_id || clienteSeleccionado?.CUIT || "";
    const invoiceContent = `
      <div style="text-align: center;">
        <h1>Detalles de la Factura</h1>
        <p>Cliente: ${nombre} - ${cuit}</p>
        <p>Tipo de Comprobante: ${tipoComprobante}</p>
        ${result?.invoice?.invoice_number ? `<p>N°: ${result.invoice.invoice_number}</p>` : ""}
        <p>Fecha de Emisión: ${fechaActual}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; padding: 8px;">Código de Barra</th>
            <th style="border: 1px solid #000; padding: 8px;">Nombre</th>
            <th style="border: 1px solid #000; padding: 8px;">Precio Unitario</th>
            <th style="border: 1px solid #000; padding: 8px;">Cantidad</th>
            <th style="border: 1px solid #000; padding: 8px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((p) => {
            const precioUnitario = parseFloat(p.PrecioPublico) || 0;
            const subtotal = parseFloat(p.subtotal) || 0;
            return `
              <tr>
                <td style="border: 1px solid #000; padding: 8px;">${p.CodigoBarra}</td>
                <td style="border: 1px solid #000; padding: 8px;">${p.Nombre}</td>
                <td style="border: 1px solid #000; padding: 8px;">$${precioUnitario.toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 8px;">${p.cantidad}</td>
                <td style="border: 1px solid #000; padding: 8px;">$${subtotal.toFixed(2)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px; text-align: right;">
        <strong>Total Final: $${calcularTotalFinal(rows).toFixed(2)}</strong>
      </div>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<html><head><title>Factura</title>');
    doc.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } h1 { margin: 0; }</style>');
    doc.write('</head><body>');
    doc.write(invoiceContent);
    doc.write('</body></html>');
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
  };

  const procesarPagoYConfirmar = async () => {
    // normalizamos pagos; si no hay fraccionados, usamos "metodoPago" simple
    const pagosNorm = pagos.length
      ? pagos.filter(p => p.monto > 0 && p.metodo)
      : (metodoPago ? [{ metodo: metodoPago, monto: calcularTotalFinal(rows) }] : []);

    if (!onConfirmarVenta) return setOpenPago(false);

    const r = await onConfirmarVenta(pagosNorm);
    setResult(r || null);

    setOpenPago(false);
    setOpenOpciones(true);
  };

  const limpiarTodo = () => {
    setMetodoPago(""); setPagos([]); limpiarProductos();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="end" mt="20px" gap="10px">
        <Button type="button" color="secondary" variant="contained" onClick={limpiarProductos}>Limpiar</Button>
        <Button type="button" color="success" variant="contained" onClick={emitirFactura} disabled={isEmitirDisabled}>
          Emitir Factura
        </Button>
      </Box>

      <Dialog open={openPago} onClose={() => setOpenPago(false)} fullWidth maxWidth="sm">
        <DialogTitle>Opciones de Pago</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="metodo-pago-label">Método de Pago</InputLabel>
            <Select labelId="metodo-pago-label" id="metodoPago" value={metodoPago} label="Método de Pago" onChange={(e) => setMetodoPago(e.target.value)}>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="tarjeta">Tarjeta</MenuItem>
              <MenuItem value="qr">QR</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
            </Select>
          </FormControl>

          <Box mt="20px">
            <Typography variant="h6">Pagos Fraccionados</Typography>
            {pagos.map((pago, index) => (
              <Grid container spacing={2} alignItems="center" key={index}>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id={`pago-metodo-${index}`}>Método</InputLabel>
                    <Select labelId={`pago-metodo-${index}`} id={`pago-metodo-${index}`} value={pago.metodo} label="Método"
                      onChange={(e) => { const a = [...pagos]; a[index].metodo = e.target.value; setPagos(a); }}>
                      <MenuItem value="efectivo">Efectivo</MenuItem>
                      <MenuItem value="tarjeta">Tarjeta</MenuItem>
                      <MenuItem value="qr">QR</MenuItem>
                      <MenuItem value="transferencia">Transferencia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField size="small" fullWidth type="number" label="Monto" value={pago.monto}
                    onChange={(e) => { const a = [...pagos]; a[index].monto = parseFloat(e.target.value); setPagos(a); }}
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="error" onClick={() => setPagos(pagos.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                </Grid>
              </Grid>
            ))}
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setPagos([...pagos, { metodo: "", monto: 0 }])} sx={{ mt: 2 }}>
              Agregar Pago
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPago(false)} color="secondary">Cancelar</Button>
          <Button onClick={procesarPagoYConfirmar} color="primary" variant="contained">Procesar Pago</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOpciones} onClose={() => setOpenOpciones(false)} fullWidth maxWidth="sm">
        <DialogTitle>Opciones de Factura</DialogTitle>
        <DialogContent dividers><Typography variant="h6">¿Qué deseas hacer con la factura?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => { handleDownloadPDF(); limpiarTodo(); setOpenOpciones(false); }} color="success">Descargar PDF</Button>
          <Button onClick={() => { printInvoice(); limpiarTodo(); setOpenOpciones(false); }} color="secondary">Imprimir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BotonesFactura;
