import { useEffect, useState } from "react";
import {
  DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem,
  CircularProgress, Box, Typography, FormControlLabel, Checkbox, Grid, Divider,
  Snackbar, Alert, Stack
} from "@mui/material";

import * as Products from "../../services/productService";
import * as Catalog from "../../services/catalogService";

export default function EditarArticulo({ open, onClose, articuloEditando, onArticuloEditado }) {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [promocion, setPromocion] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [ivas, setIvas] = useState([]);

  const [articulo, setArticulo] = useState({
    idArticulo: null,
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
    ImagenUrl: "",
  });

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

  useEffect(() => {
    if (!articuloEditando) return;
    const vto = articuloEditando.FechaVto ? new Date(articuloEditando.FechaVto) : null;
    const elab = articuloEditando.FechaElab ? new Date(articuloEditando.FechaElab) : null;
    setArticulo((s) => ({
      ...s,
      ...articuloEditando,
      FechaVto: vto ? vto.toISOString().split("T")[0] : "",
      FechaElab: elab ? elab.toISOString().split("T")[0] : "",
    }));
    setImagePreview(articuloEditando.ImagenUrl || null);
  }, [articuloEditando]);

  const calcularPrecioVenta = (costo, ganancia, iva) => {
    const ivaDec = iva ? Number(iva) / 100 : 0;
    return Number(costo) * (1 + (Number(ganancia) / 100)) * (1 + ivaDec);
  };
  const handlePrecioPublicoChange = (value) => {
    const costo = Number(articulo.Costo || 0);
    setArticulo((s) => ({ ...s, PrecioPublico: value, Ganancia: costo ? ((value - costo) / costo) * 100 : 0 }));
  };
  const handleCostoChange = (value) => {
    setArticulo((s) => ({ ...s, Costo: value, PrecioPublico: calcularPrecioVenta(value, s.Ganancia, s.Iva) }));
  };
  const handleIvaChange = (value) => {
    const ivaParsed = parseFloat(value || 0).toFixed(4);
    setArticulo((s) => ({ ...s, Iva: ivaParsed, PrecioPublico: calcularPrecioVenta(s.Costo, s.Ganancia, ivaParsed) }));
  };

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };
  const handleImageRemove = () => { setImageFile(null); setImagePreview(null); setArticulo((s)=>({...s, ImagenUrl:""})); };

  const handleSubmit = async () => {
    if (!articulo.Nombre || !articulo.Iva || isNaN(articulo.PrecioPublico)) {
      setSnack({ open: true, msg: "Completá Nombre, IVA y Precio.", sev: "warning" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      const payload = {
        CodigoBarra: articulo.CodigoBarra,
        Nombre: articulo.Nombre,
        Lote: articulo.Lote,
        Ubicacion: articulo.Ubicacion,
        Stock: articulo.Stock,
        Codigo: articulo.Codigo,
        Costo: articulo.Costo,
        PrecioPublico: articulo.PrecioPublico,
        Iva: parseFloat(articulo.Iva),
        idCategoria: articulo.idCategoria,
        idPromocionCantidad: Number(articulo.idPromocionCantidad || 0),
        idProveedor1: articulo.idProveedor1,
        idProveedor2: articulo.idProveedor2 || "",
        StockMin: articulo.StockMin,
        Ganancia: articulo.Ganancia,
        Descripcion: articulo.Descripcion,
        activo: articulo.activo,
        HabPrecioManual: articulo.HabPrecioManual,
        NoAplicaStock: articulo.NoAplicaStock,
        NoAplicarDescuento: articulo.NoAplicarDescuento,
        EmailPorBajoStock: articulo.EmailPorBajoStock,
        HabNroSerie: articulo.HabNroSerie,
        AplicaElab: articulo.AplicaElab,
        FechaElab: articulo.AplicaElab ? articulo.FechaElab : "",
        AplicaVto: articulo.AplicaVto,
        FechaVto: articulo.AplicaVto ? articulo.FechaVto : "",
        HabCostoDolar: articulo.HabCostoDolar,
        CostoDolar: articulo.HabCostoDolar ? articulo.CostoDolar : "",
        permitirModificarPrecio: articulo.permitirModificarPrecio,
      };
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (imageFile) fd.append("Imagen", imageFile);

      await Products.updateProduct(articulo.idArticulo || articulo.id, fd);
      setSnack({ open: true, msg: "Artículo actualizado", sev: "success" });
      onArticuloEditado?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: "Error al actualizar", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>Editar artículo</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField label="Nombre" value={articulo.Nombre} onChange={(e)=>setArticulo({...articulo,Nombre:e.target.value})} fullWidth margin="normal" required />
              <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <TextField label="SKU" value={articulo.Codigo} onChange={(e)=>setArticulo({...articulo,Codigo:e.target.value})} fullWidth />
                <TextField label="Código de barra" value={articulo.CodigoBarra} onChange={(e)=>setArticulo({...articulo,CodigoBarra:e.target.value})} fullWidth />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 2 }}>
                <TextField select label="Categoría" value={articulo.idCategoria} onChange={(e)=>setArticulo({...articulo,idCategoria:e.target.value})} fullWidth>
                  {categorias.map((c)=> <MenuItem key={c.idCategoria} value={c.idCategoria}>{c.Nombre}</MenuItem>)}
                </TextField>
                <TextField select label="IVA" value={articulo.Iva} onChange={(e)=>handleIvaChange(e.target.value)} fullWidth>
                  {ivas.map((iva)=> <MenuItem key={iva.idIva} value={iva.Porcentaje}>{iva.Nombre} ({iva.Porcentaje}%)</MenuItem>)}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 2 }}>
                <TextField label="Costo" type="number" value={articulo.Costo} onChange={(e)=>handleCostoChange(Number(e.target.value))} fullWidth />
                <TextField label="Precio público" type="number" value={articulo.PrecioPublico} onChange={(e)=>handlePrecioPublicoChange(Number(e.target.value))} fullWidth />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 2 }}>
                <TextField label="Stock" type="number" value={articulo.Stock} onChange={(e)=>setArticulo({...articulo,Stock:Number(e.target.value)})} fullWidth />
                <TextField label="Stock mínimo" type="number" value={articulo.StockMin} onChange={(e)=>setArticulo({...articulo,StockMin:Number(e.target.value)})} fullWidth />
              </Stack>

              <TextField label="Descripción" value={articulo.Descripcion} onChange={(e)=>setArticulo({...articulo,Descripcion:e.target.value})} fullWidth multiline rows={3} sx={{ mt: 2 }} />

              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={articulo.HabPrecioManual===1} onChange={(e)=>setArticulo({...articulo,HabPrecioManual:e.target.checked?1:0})}/>} label="Precio en el momento de la venta" />
                  <FormControlLabel control={<Checkbox checked={articulo.NoAplicaStock===1} onChange={(e)=>setArticulo({...articulo,NoAplicaStock:e.target.checked?1:0})}/>} label="Sin control de stock" />
                  <FormControlLabel control={<Checkbox checked={articulo.NoAplicarDescuento===1} onChange={(e)=>setArticulo({...articulo,NoAplicarDescuento:e.target.checked?1:0})}/>} label="No aplicar descuento" />
                  <FormControlLabel control={<Checkbox checked={articulo.EmailPorBajoStock===1} onChange={(e)=>setArticulo({...articulo,EmailPorBajoStock:e.target.checked?1:0})}/>} label="Alertar stock bajo por Email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={articulo.permitirModificarPrecio===1} onChange={(e)=>setArticulo({...articulo,permitirModificarPrecio:e.target.checked?1:0})}/>} label="Permitir modificar precio" />
                  <FormControlLabel control={<Checkbox checked={articulo.HabNroSerie===1} onChange={(e)=>setArticulo({...articulo,HabNroSerie:e.target.checked?1:0})}/>} label="Habilitar N° de serie" />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={articulo.AplicaVto===1} onChange={(e)=>setArticulo({...articulo,AplicaVto:e.target.checked?1:0, FechaVto:e.target.checked?(articulo.FechaVto||""):""})}/>} label="Con vencimiento" />
                  <TextField label="Fecha de vencimiento" type="date" fullWidth InputLabelProps={{shrink:true}} disabled={articulo.AplicaVto!==1} value={articulo.FechaVto} onChange={(e)=>setArticulo({...articulo,FechaVto:e.target.value})}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Checkbox checked={articulo.AplicaElab===1} onChange={(e)=>setArticulo({...articulo,AplicaElab:e.target.checked?1:0, FechaElab:e.target.checked?(articulo.FechaElab||""):""})}/>} label="Con elaboración" />
                  <TextField label="Fecha de elaboración" type="date" fullWidth InputLabelProps={{shrink:true}} disabled={articulo.AplicaElab!==1} value={articulo.FechaElab} onChange={(e)=>setArticulo({...articulo,FechaElab:e.target.value})}/>
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
                {imagePreview && (
                  <Button variant="outlined" color="error" onClick={handleImageRemove}>
                    Quitar
                  </Button>
                )}
              </Box>
              {imagePreview && (
                <Box mt={1}><img src={imagePreview} alt="Vista previa" style={{ maxWidth: "100%", borderRadius: 8 }} /></Box>
              )}

              <Divider sx={{ my: 2 }} />
              <TextField select label="Asociar a promoción" value={articulo.idPromocionCantidad} onChange={(e)=>setArticulo({...articulo,idPromocionCantidad:Number(e.target.value)})} fullWidth>
                {promocion.map((p)=> <MenuItem key={p.idPromocionCantidad} value={p.idPromocionCantidad}>{p.Nombre}</MenuItem>)}
              </TextField>
              <TextField select label="Proveedor principal" value={articulo.idProveedor1} onChange={(e)=>setArticulo({...articulo,idProveedor1:e.target.value})} fullWidth sx={{ mt: 2 }}>
                {proveedores.map((v)=> <MenuItem key={v.idProveedor} value={v.idProveedor}>{v.RazonSocial}</MenuItem>)}
              </TextField>
              <TextField select label="Proveedor auxiliar" value={articulo.idProveedor2} onChange={(e)=>setArticulo({...articulo,idProveedor2:e.target.value})} fullWidth sx={{ mt: 2 }}>
                {proveedores.map((v)=> <MenuItem key={v.idProveedor} value={v.idProveedor}>{v.RazonSocial}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={loading} startIcon={loading ? <CircularProgress size={18}/> : null}>
          {loading ? "Guardando…" : "Modificar artículo"}
        </Button>
      </DialogActions>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}
