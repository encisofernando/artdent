import { useEffect, useState } from "react";
import {
  DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem,
  CircularProgress, Box, Typography, FormControlLabel, Checkbox, Grid, Divider,
  Snackbar, Alert, Stack
} from "@mui/material";

import * as Products from "../../services/productService";
import * as Catalog from "../../services/catalogService";

const initial = {
  idCategoria: "",
  idPromocionCantidad: "",
  idProveedor1: "",
  idProveedor2: "",
  CodigoBarra: "",
  Nombre: "",
  Lote: "",
  Ubicacion: "",
  Codigo: "",
  Stock: 0,
  StockMin: 0,
  Costo: 0,
  Ganancia: 0,
  Iva: "",
  PrecioPublico: 0,
  Descripcion: "",
  activo: 1,
  HabPrecioManual: 0,
  NoAplicaStock: 0,
  NoAplicarDescuento: 0,
  EmailPorBajoStock: 0,
  HabNroSerie: 0,
  AplicaElab: 0,
  FechaElab: "",
  AplicaVto: 0,
  FechaVto: "",
  HabCostoDolar: 0,
  CostoDolar: "",
  permitirModificarPrecio: 0,
};

export default function CrearArticulo({ open, onClose, onArticuloCreado }) {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [promocion, setPromocion] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [ivas, setIvas] = useState([]);
  const [nuevo, setNuevo] = useState(initial);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [c, t, p, v] = await Promise.all([
          Catalog.listCategories(),
          Catalog.listTaxes(),
          Catalog.listPromotions(),
          Catalog.listSuppliers(),
        ]);
        setCategorias(c);
        setIvas(t);
        setPromocion(p);
        setProveedores(v);
      } catch (e) { console.error(e); }
    })();
  }, [open]);

  const calcularPrecioVenta = (costo, ganancia, iva) => {
    const ivaDec = iva ? Number(iva) / 100 : 0;
    return Number(costo) * (1 + (Number(ganancia) / 100)) * (1 + ivaDec);
  };

  const handlePrecioPublicoChange = (value) => {
    const costo = Number(nuevo.Costo || 0);
    setNuevo((s) => ({ ...s, PrecioPublico: value, Ganancia: costo ? ((value - costo) / costo) * 100 : 0 }));
  };
  const handleCostoChange = (value) => {
    setNuevo((s) => ({ ...s, Costo: value, PrecioPublico: calcularPrecioVenta(value, s.Ganancia, s.Iva) }));
  };
  const handleIvaChange = (value) => {
    const ivaParsed = parseFloat(value || 0).toFixed(4);
    setNuevo((s) => ({ ...s, Iva: ivaParsed, PrecioPublico: calcularPrecioVenta(s.Costo, s.Ganancia, ivaParsed) }));
  };

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };
  const handleImageRemove = () => { setImageFile(null); setImagePreview(null); };

  const handleSubmit = async () => {
    if (!nuevo.Nombre || !nuevo.Iva || isNaN(nuevo.PrecioPublico)) {
      setSnack({ open: true, msg: "Completá Nombre, IVA y Precio.", sev: "warning" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      const payload = {
        CodigoBarra: nuevo.CodigoBarra,
        Nombre: nuevo.Nombre,
        Lote: nuevo.Lote,
        Ubicacion: nuevo.Ubicacion,
        Stock: nuevo.Stock,
        Codigo: nuevo.Codigo,
        Costo: nuevo.Costo,
        PrecioPublico: nuevo.PrecioPublico,
        Iva: parseFloat(nuevo.Iva),
        idCategoria: nuevo.idCategoria,
        idPromocionCantidad: Number(nuevo.idPromocionCantidad || 0),
        idProveedor1: nuevo.idProveedor1,
        idProveedor2: nuevo.idProveedor2 || "",
        StockMin: nuevo.StockMin,
        Ganancia: nuevo.Ganancia,
        Descripcion: nuevo.Descripcion,
        activo: nuevo.activo,
        HabPrecioManual: nuevo.HabPrecioManual,
        NoAplicaStock: nuevo.NoAplicaStock,
        NoAplicarDescuento: nuevo.NoAplicarDescuento,
        EmailPorBajoStock: nuevo.EmailPorBajoStock,
        HabNroSerie: nuevo.HabNroSerie,
        AplicaElab: nuevo.AplicaElab,
        FechaElab: nuevo.AplicaElab ? nuevo.FechaElab : "",
        AplicaVto: nuevo.AplicaVto,
        FechaVto: nuevo.AplicaVto ? nuevo.FechaVto : "",
        HabCostoDolar: nuevo.HabCostoDolar,
        CostoDolar: nuevo.HabCostoDolar ? nuevo.CostoDolar : "",
        permitirModificarPrecio: nuevo.permitirModificarPrecio,
      };
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (imageFile) fd.append("Imagen", imageFile);

      await Products.createProduct(fd);
      setSnack({ open: true, msg: "Artículo creado", sev: "success" });
      onArticuloCreado?.();
      setNuevo(initial);
      setImageFile(null); setImagePreview(null);
      onClose?.();
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: "Error al crear el artículo", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>Crear artículo</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField label="Nombre" value={nuevo.Nombre} onChange={(e)=>setNuevo({...nuevo,Nombre:e.target.value})} fullWidth margin="normal" required />
              <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <TextField label="SKU" value={nuevo.Codigo} onChange={(e)=>setNuevo({...nuevo,Codigo:e.target.value})} fullWidth />
                <TextField label="Código de barra" value={nuevo.CodigoBarra} onChange={(e)=>setNuevo({...nuevo,CodigoBarra:e.target.value})} fullWidth />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 2 }}>
                <TextField
                  select label="Categoría" value={nuevo.idCategoria}
                  onChange={(e)=>setNuevo({...nuevo,idCategoria:e.target.value})} fullWidth
                >
                  {categorias.map((c)=> <MenuItem key={c.idCategoria} value={c.idCategoria}>{c.Nombre}</MenuItem>)}
                </TextField>
                <TextField
                  select label="IVA" value={nuevo.Iva}
                  onChange={(e)=>handleIvaChange(e.target.value)} fullWidth
                >
                  {ivas.map((iva)=> <MenuItem key={iva.idIva} value={iva.Porcentaje}>{iva.Nombre} ({iva.Porcentaje}%)</MenuItem>)}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 2 }}>
                <TextField label="Costo" type="number" value={nuevo.Costo} onChange={(e)=>handleCostoChange(Number(e.target.value))} fullWidth />
                <TextField label="Precio público" type="number" value={nuevo.PrecioPublico} onChange={(e)=>handlePrecioPublicoChange(Number(e.target.value))} fullWidth />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 2 }}>
                <TextField label="Stock" type="number" value={nuevo.Stock} onChange={(e)=>setNuevo({...nuevo,Stock:Number(e.target.value)})} fullWidth />
                <TextField label="Stock mínimo" type="number" value={nuevo.StockMin} onChange={(e)=>setNuevo({...nuevo,StockMin:Number(e.target.value)})} fullWidth />
              </Stack>

              <TextField label="Descripción" value={nuevo.Descripcion} onChange={(e)=>setNuevo({...nuevo,Descripcion:e.target.value})} fullWidth multiline rows={3} sx={{ mt: 2 }} />

              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={nuevo.HabPrecioManual===1} onChange={(e)=>setNuevo({...nuevo,HabPrecioManual:e.target.checked?1:0})}/>} label="Precio en el momento de la venta" />
                  <FormControlLabel control={<Checkbox checked={nuevo.NoAplicaStock===1} onChange={(e)=>setNuevo({...nuevo,NoAplicaStock:e.target.checked?1:0})}/>} label="Sin control de stock" />
                  <FormControlLabel control={<Checkbox checked={nuevo.NoAplicarDescuento===1} onChange={(e)=>setNuevo({...nuevo,NoAplicarDescuento:e.target.checked?1:0})}/>} label="No aplicar descuento" />
                  <FormControlLabel control={<Checkbox checked={nuevo.EmailPorBajoStock===1} onChange={(e)=>setNuevo({...nuevo,EmailPorBajoStock:e.target.checked?1:0})}/>} label="Alertar stock bajo por Email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={nuevo.permitirModificarPrecio===1} onChange={(e)=>setNuevo({...nuevo,permitirModificarPrecio:e.target.checked?1:0})}/>} label="Permitir modificar precio" />
                  <FormControlLabel control={<Checkbox checked={nuevo.HabNroSerie===1} onChange={(e)=>setNuevo({...nuevo,HabNroSerie:e.target.checked?1:0})}/>} label="Habilitar N° de serie" />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={nuevo.AplicaVto===1} onChange={(e)=>setNuevo({...nuevo,AplicaVto:e.target.checked?1:0, FechaVto:e.target.checked?(nuevo.FechaVto||""):""})}/>} label="Con vencimiento" />
                  <TextField label="Fecha de vencimiento" type="date" fullWidth InputLabelProps={{shrink:true}} disabled={nuevo.AplicaVto!==1} value={nuevo.FechaVto} onChange={(e)=>setNuevo({...nuevo,FechaVto:e.target.value})}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={nuevo.AplicaElab===1} onChange={(e)=>setNuevo({...nuevo,AplicaElab:e.target.checked?1:0, FechaElab:e.target.checked?(nuevo.FechaElab||""):""})}/>} label="Con elaboración" />
                  <TextField label="Fecha de elaboración" type="date" fullWidth InputLabelProps={{shrink:true}} disabled={nuevo.AplicaElab!==1} value={nuevo.FechaElab} onChange={(e)=>setNuevo({...nuevo,FechaElab:e.target.value})}/>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Imagen</Typography>
              <Box display="flex" gap={1} mb={1}>
                <Button variant="contained" component="label">
                  Buscar Foto
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {imageFile && (
                  <Button variant="outlined" color="error" onClick={handleImageRemove}>
                    Quitar
                  </Button>
                )}
              </Box>
              {imagePreview && (
                <Box mt={1}><img src={imagePreview} alt="Vista previa" style={{ maxWidth: "100%", borderRadius: 8 }} /></Box>
              )}

              <Divider sx={{ my: 2 }} />
              <TextField select label="Asociar a promoción" value={nuevo.idPromocionCantidad} onChange={(e)=>setNuevo({...nuevo,idPromocionCantidad:Number(e.target.value)})} fullWidth>
                {promocion.map((p)=> <MenuItem key={p.idPromocionCantidad} value={p.idPromocionCantidad}>{p.Nombre}</MenuItem>)}
              </TextField>
              <TextField select label="Proveedor principal" value={nuevo.idProveedor1} onChange={(e)=>setNuevo({...nuevo,idProveedor1:e.target.value})} fullWidth sx={{ mt: 2 }}>
                {proveedores.map((v)=> <MenuItem key={v.idProveedor} value={v.idProveedor}>{v.RazonSocial}</MenuItem>)}
              </TextField>
              <TextField select label="Proveedor auxiliar" value={nuevo.idProveedor2} onChange={(e)=>setNuevo({...nuevo,idProveedor2:e.target.value})} fullWidth sx={{ mt: 2 }}>
                {proveedores.map((v)=> <MenuItem key={v.idProveedor} value={v.idProveedor}>{v.RazonSocial}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={loading} startIcon={loading ? <CircularProgress size={18}/> : null}>
          {loading ? "Guardando…" : "Crear artículo"}
        </Button>
      </DialogActions>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}
