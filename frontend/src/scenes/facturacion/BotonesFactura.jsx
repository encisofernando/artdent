import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Grid, TextField, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import  jsPDF  from 'jspdf'; // Importa jsPDF
import "jspdf-autotable"; // Asegúrate de importar AutoTable

const BotonesFactura = ({ limpiarProductos, tipoComprobante, numeroComprobante, clienteSeleccionado, calcularTotalFinal,rows }) => {

  const [openPago, setOpenPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [pagos, setPagos] = useState([]);
  const [openOpciones, setOpenOpciones] = useState(false);
  const getInitialDateTime = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // Restar 3 horas
    const formatted = localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    return formatted;
};

const fechaActual = getInitialDateTime();

  const isEmitirDisabled = !tipoComprobante || !numeroComprobante || rows.length === 0;
  // Función para emitir factura y abrir el diálogo de opciones de pago
  const emitirFactura = () => {
    setOpenPago(true);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Agregar título
    doc.setFontSize(20);
    doc.text("Detalles de la Factura", 14, 20);

    // Agregar tipo de comprobante y número de comprobante
    doc.setFontSize(12);
    doc.text(`Cliente: ${clienteSeleccionado.Nom1 || ''} ${clienteSeleccionado.Nom2 || ''} - ${clienteSeleccionado.CUIT }`, 14, 40);
    doc.text(`Tipo de Comprobante: ${tipoComprobante}`, 14, 50);
    doc.text(`Número de Comprobante: ${numeroComprobante}`, 14, 60);
    doc.text(`Fecha de Emision: ${fechaActual}`, 14, 70);

    // Generar la tabla de productos
    const tableColumn = ["Código de Barra", "Nombre", "Precio Unitario", "Cantidad", "Subtotal"];
    const tableRows = rows.map(product => [
        product.CodigoBarra,
        product.Nombre,
        product.PrecioPublico,
        product.cantidad,
        product.subtotal,
    ]);

    // Nueva sintaxis para autoTable
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80, // Ajusta la posición Y de inicio para la tabla
    });

    // Calcular el total final y agregarlo
    const totalFinal = calcularTotalFinal(rows); // Debes implementar calcularTotalFinal
    doc.text(`Total Final: $${totalFinal.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 10);

    // Descargar el PDF
    doc.save("factura.pdf");
};

  
const printInvoice = () => {
    // Crear el contenido HTML de la factura
    const invoiceContent = `
        <div style="text-align: center;">
            <h1>Detalles de la Factura</h1>
            <p>Cliente: ${clienteSeleccionado.Nom1 || ''} ${clienteSeleccionado.Nom2 || ''} - ${clienteSeleccionado.CUIT}</p>
            <p>Tipo de Comprobante: ${tipoComprobante}</p>
            <p>Número de Comprobante: ${numeroComprobante}</p>
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
                ${rows.map(product => {
                    const precioUnitario = parseFloat(product.PrecioPublico) || 0;
                    const subtotal = parseFloat(product.subtotal) || 0;
                    return `
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px;">${product.CodigoBarra}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${product.Nombre}</td>
                            <td style="border: 1px solid #000; padding: 8px;">$${precioUnitario.toFixed(2)}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${product.cantidad}</td>
                            <td style="border: 1px solid #000; padding: 8px;">$${subtotal.toFixed(2)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div style="margin-top: 20px; text-align: right;">
            <strong>Total Final: $${calcularTotalFinal(rows).toFixed(2)}</strong>
        </div>
    `;

    // Crear un iframe oculto para la impresión
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write('<html><head><title>Factura</title>');
    iframeDocument.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } h1 { margin: 0; } </style>');
    iframeDocument.write('</head><body>');
    iframeDocument.write(invoiceContent);
    iframeDocument.write('</body></html>');
    iframeDocument.close();

    // Imprimir el contenido del iframe
    iframe.contentWindow.focus(); // Necesario para IE
    iframe.contentWindow.print(); // Abrir el diálogo de impresión

    // Eliminar el iframe después de imprimir
    document.body.removeChild(iframe);
};



  const limpiarTodo = () => {
    setMetodoPago("");
    setPagos([]);
    limpiarProductos(); // Llama a la función de limpiar productos pasada como props
  };

  return (
    <Box>
        
      {/* Botones de Limpiar y Emitir Factura */}
      <Box display="flex" justifyContent="end" mt="20px" gap="10px">
        <Button
          type="button"
          color="secondary"
          variant="contained"
          onClick={limpiarProductos}
        >
          Limpiar
        </Button>
        <Button
          type="button"
          color="success"
          variant="contained"
          onClick={emitirFactura} // Abre el diálogo de pago
          disabled={isEmitirDisabled}
        >
          Emitir Factura
        </Button>
      </Box>

      {/* Diálogo para Opciones de Pago */}
      <Dialog
        open={openPago}
        onClose={() => setOpenPago(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Opciones de Pago</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="metodo-pago-label">Método de Pago</InputLabel>
            <Select
              labelId="metodo-pago-label"
              id="metodoPago"
              value={metodoPago}
              onChange={(e) => {
                setMetodoPago(e.target.value);
              }}
              label="Método de Pago"
            >
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="tarjeta">Tarjeta</MenuItem>
              <MenuItem value="qr">QR</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
            </Select>
          </FormControl>

          {/* Campo para pagos fraccionados */}
          <Box mt="20px">
            <Typography variant="h6">Pagos Fraccionados</Typography>
            {pagos.map((pago, index) => (
              <Grid container spacing={2} alignItems="center" key={index}>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id={`pago-metodo-${index}`}>Método</InputLabel>
                    <Select
                      labelId={`pago-metodo-${index}`}
                      id={`pago-metodo-${index}`}
                      value={pago.metodo}
                      onChange={(e) => {
                        const newPagos = [...pagos];
                        newPagos[index].metodo = e.target.value;
                        setPagos(newPagos);
                      }}
                      label="Método"
                    >
                      <MenuItem value="efectivo">Efectivo</MenuItem>
                      <MenuItem value="tarjeta">Tarjeta</MenuItem>
                      <MenuItem value="qr">QR</MenuItem>
                      <MenuItem value="transferencia">Transferencia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    label="Monto"
                    value={pago.monto}
                    onChange={(e) => {
                      const newPagos = [...pagos];
                      newPagos[index].monto = parseFloat(e.target.value);
                      setPagos(newPagos);
                    }}
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newPagos = pagos.filter((_, i) => i !== index);
                      setPagos(newPagos);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setPagos([...pagos, { metodo: "", monto: 0 }])}
              sx={{ mt: 2 }}
            >
              Agregar Pago
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPago(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              // Lógica para validar y procesar el pago
           
                
    setOpenPago(false); // Cerrar el diálogo de pago
    setOpenOpciones(true); // Abrir el diálogo de opciones
            }}
            color="primary"
            variant="contained"
          >
            Procesar Pago
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
  open={openOpciones}
  onClose={() => setOpenOpciones(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Opciones de Factura</DialogTitle>
  <DialogContent dividers>
    <Typography variant="h6">¿Qué deseas hacer con la factura?</Typography>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => {
        // Lógica para descargar el PDF
        handleDownloadPDF();
        limpiarTodo(); 
        setOpenOpciones(false); // Cerrar el diálogo
      }}
      color="success"
    >
      Descargar PDF
    </Button>
    <Button
      onClick={() => {
        // Lógica para imprimir la factura
        printInvoice();
        limpiarTodo(); // Limpiar todo después de descargar el PDF
        setOpenOpciones(false); // Cerrar el diálogo
      }}
      color="secondary"
    >
      Imprimir
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default BotonesFactura;
