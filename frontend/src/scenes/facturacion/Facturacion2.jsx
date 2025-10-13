import { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import Header from "../../components/Header";
import { Customers, Products, Sales, Invoices } from "../../services";

const Facturacion2 = () => {
  const [cliente, setCliente] = useState(null);
  const [items, setItems] = useState([]);
  const [tiposFactura, setTiposFactura] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("C");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    (async () => {
      if (Invoices?.listInvoiceTypes) {
        try { const t = await Invoices.listInvoiceTypes(); setTiposFactura(t || []); } catch {}
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, it) => acc + (Number(it.unit_price) * Number(it.qty || 1)), 0);
    const tax_total = items.reduce((acc, it) => acc + (Number(it.tax_rate || 0) / 100) * (Number(it.unit_price) * Number(it.qty || 1)), 0);
    const total = subtotal + tax_total;
    return { subtotal, tax_total, total };
  }, [items]);

  const agregarItem = useCallback((prod) => {
    setItems((prev) => [
      ...prev,
      {
        product_id: prod.idArticulo || prod.id,
        description: prod.Nombre || prod.name,
        qty: 1,
        unit_price: prod.PrecioPublico || prod.price || 0,
        tax_rate: prod.Iva || prod.tax_rate || 0,
      },
    ]);
  }, []);

  const quitarCliente = () => setCliente(null);

  const confirmarVenta = async () => {
    const payload = {
      customer_id: cliente?.idCliente || cliente?.id,
      sale_date: new Date().toISOString().slice(0, 10),
      items,
      observations,
      ...totals,
    };
    const sale = await Sales.createSale(payload);
    if (tipoSeleccionado) {
      await Invoices.createInvoice({ sale_id: sale.id || sale.sale_id || sale.Id, invoice_type_code: tipoSeleccionado, issue_date: payload.sale_date });
    }
    alert("Venta confirmada");
    setCliente(null); setItems([]); setObservaciones("");
  };

  return (
    <Box m="20px">
      <Header title="FACTURACIÓN" subtitle="Nueva venta" />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Cliente</Typography>
          {cliente ? (
            <Box display="flex" gap={1} alignItems="center">
              <Typography>{cliente.Nombre || cliente.name}</Typography>
              <Button size="small" color="warning" onClick={quitarCliente}>Quitar</Button>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => window.location.href='/clientes'}>Buscar cliente</Button>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Producto</Typography>
          <Button variant="outlined" onClick={() => window.location.href='/articulos'}>Buscar producto</Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2">Observaciones</Typography>
          <TextField fullWidth value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Typography>Subtotal: {totals.subtotal.toFixed(2)}</Typography>
            <Typography>Impuestos: {totals.tax_total.toFixed(2)}</Typography>
            <Typography>Total: {totals.total.toFixed(2)}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="secondary" onClick={confirmarVenta}>Confirmar venta</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Facturacion2;
