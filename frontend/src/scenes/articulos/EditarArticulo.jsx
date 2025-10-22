import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

// ==== Helpers de saneamiento ====
const nz = (v) => (v ?? "");             // strings
const n0 = (v) => Number(v ?? 0);        // números
const b01 = (v) => (v ? 1 : 0);          // 0/1
const dateIso = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

// value seguro para selects async
const safeValue = (val, options, key) =>
  options?.some((o) => String(o[key]) === String(val)) ? String(val) : "";

/**
 * Props esperadas (ajústalas si en tu app cambian los nombres):
 * - open, onClose, onSave
 * - articuloEditando: objeto con los campos del artículo
 * - categorias: [{idCategoria, Nombre}]
 * - proveedores: [{idProveedor, Nombre}]
 * - ivas: [{idIva, Nombre, Porcentaje}]
 * - promociones: [{idPromocionCantidad, Nombre}]
 */
export default function EditarArticulo({
  open,
  onClose,
  onSave,
  articuloEditando,
  categorias = [],
  proveedores = [],
  ivas = [],
  promociones = [],
}) {
  const empty = useMemo(
    () => ({
      idArticulo: null,
      idCategoria: "",
      idProveedor1: "",
      idProveedor2: "",
      idPromocionCantidad: "",
      CodigoBarra: "",
      Nombre: "",
      Lote: "",
      Ubicacion: "",
      Codigo: "",
      Stock: 0,
      StockMin: 0,
      Costo: 0,
      Ganancia: 0,
      Iva: "", // string en UI
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
    }),
    []
  );

  const [articulo, setArticulo] = useState(empty);
  const [imagePreview, setImagePreview] = useState(null);

  // Normalizamos al cargar el artículo
  useEffect(() => {
    if (!open) return;
    const a = articuloEditando ?? {};
    setArticulo((s) => ({
      ...s,
      idArticulo: a.idArticulo ?? a.id ?? null,
      idCategoria: nz(a.idCategoria),
      idPromocionCantidad: nz(a.idPromocionCantidad),
      idProveedor1: nz(a.idProveedor1),
      idProveedor2: nz(a.idProveedor2),
      CodigoBarra: nz(a.CodigoBarra),
      Nombre: nz(a.Nombre),
      Lote: nz(a.Lote),
      Ubicacion: nz(a.Ubicacion),
      Codigo: nz(a.Codigo),
      Stock: n0(a.Stock),
      StockMin: n0(a.StockMin),
      Costo: n0(a.Costo),
      Ganancia: n0(a.Ganancia),
      Iva: a.Iva == null ? "" : String(a.Iva), // string en UI
      PrecioPublico: n0(a.PrecioPublico),
      Descripcion: nz(a.Descripcion),
      activo: b01(a.activo),
      HabPrecioManual: b01(a.HabPrecioManual),
      NoAplicaStock: b01(a.NoAplicaStock),
      NoAplicarDescuento: b01(a.NoAplicarDescuento),
      EmailPorBajoStock: b01(a.EmailPorBajoStock),
      HabNroSerie: b01(a.HabNroSerie),
      AplicaElab: b01(a.AplicaElab),
      FechaElab: dateIso(a.FechaElab),
      AplicaVto: b01(a.AplicaVto),
      FechaVto: dateIso(a.FechaVto),
      HabCostoDolar: b01(a.HabCostoDolar),
      CostoDolar: nz(a.CostoDolar),
      permitirModificarPrecio: b01(a.permitirModificarPrecio),
      ImagenUrl: nz(a.ImagenUrl),
    }));
    setImagePreview(a.ImagenUrl || null);
  }, [open, articuloEditando]);

  // === Handlers ===
  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setArticulo((s) => ({ ...s, [field]: value ?? "" }));
  };

  const handleNum = (field) => (e) => {
    const { value } = e.target;
    setArticulo((s) => ({ ...s, [field]: value === "" ? 0 : Number(value) }));
  };

  const handleCheck01 = (field) => (e) => {
    setArticulo((s) => ({ ...s, [field]: e.target.checked ? 1 : 0 }));
  };

  const handleIvaChange = (value) => {
    setArticulo((s) => ({ ...s, Iva: value ?? "" }));
  };

  const handleFecha = (field) => (e) => {
    setArticulo((s) => ({ ...s, [field]: e.target.value ?? "" }));
  };

  const handleImagen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const payload = {
      ...articulo,
      Stock: n0(articulo.Stock),
      StockMin: n0(articulo.StockMin),
      Costo: n0(articulo.Costo),
      Ganancia: n0(articulo.Ganancia),
      PrecioPublico: n0(articulo.PrecioPublico),
      Iva: articulo.Iva === "" ? null : Number(articulo.Iva),
      activo: b01(articulo.activo),
      HabPrecioManual: b01(articulo.HabPrecioManual),
      NoAplicaStock: b01(articulo.NoAplicaStock),
      NoAplicarDescuento: b01(articulo.NoAplicarDescuento),
      EmailPorBajoStock: b01(articulo.EmailPorBajoStock),
      HabNroSerie: b01(articulo.HabNroSerie),
      AplicaElab: b01(articulo.AplicaElab),
      FechaElab: dateIso(articulo.FechaElab) || null,
      AplicaVto: b01(articulo.AplicaVto),
      FechaVto: dateIso(articulo.FechaVto) || null,
      HabCostoDolar: b01(articulo.HabCostoDolar),
      permitirModificarPrecio: b01(articulo.permitirModificarPrecio),
    };
    onSave?.(payload);
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editar artículo</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                value={nz(articulo.Nombre)}
                onChange={handleChange("Nombre")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Código de barras"
                value={nz(articulo.CodigoBarra)}
                onChange={handleChange("CodigoBarra")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Categoría"
                value={safeValue(articulo.idCategoria, categorias, "idCategoria")}
                onChange={handleChange("idCategoria")}
                fullWidth
                disabled={!categorias.length}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  {categorias.length ? "Seleccionar…" : "Cargando…"}
                </MenuItem>
                {categorias.map((c) => (
                  <MenuItem key={c.idCategoria} value={String(c.idCategoria)}>
                    {c.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="IVA"
                value={safeValue(articulo.Iva, ivas, "Porcentaje")}
                onChange={(e) => handleIvaChange(e.target.value)}
                fullWidth
                disabled={!ivas.length}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  {ivas.length ? "Seleccionar…" : "Cargando…"}
                </MenuItem>
                {ivas.map((iva) => (
                  <MenuItem
                    key={iva.idIva}
                    value={String(iva.Porcentaje)}
                  >{`${iva.Nombre} (${iva.Porcentaje}%)`}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Proveedor 1"
                value={safeValue(articulo.idProveedor1, proveedores, "idProveedor")}
                onChange={handleChange("idProveedor1")}
                fullWidth
                disabled={!proveedores.length}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  {proveedores.length ? "Seleccionar…" : "Cargando…"}
                </MenuItem>
                {proveedores.map((p) => (
                  <MenuItem key={p.idProveedor} value={String(p.idProveedor)}>
                    {p.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Proveedor 2"
                value={safeValue(articulo.idProveedor2, proveedores, "idProveedor")}
                onChange={handleChange("idProveedor2")}
                fullWidth
                disabled={!proveedores.length}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  {proveedores.length ? "Seleccionar…" : "Cargando…"}
                </MenuItem>
                {proveedores.map((p) => (
                  <MenuItem key={p.idProveedor} value={String(p.idProveedor)}>
                    {p.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Promo por cantidad"
                value={safeValue(
                  articulo.idPromocionCantidad,
                  promociones,
                  "idPromocionCantidad"
                )}
                onChange={handleChange("idPromocionCantidad")}
                fullWidth
                disabled={!promociones.length}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  {promociones.length ? "Sin promoción" : "Cargando…"}
                </MenuItem>
                {promociones.map((pr) => (
                  <MenuItem
                    key={pr.idPromocionCantidad}
                    value={String(pr.idPromocionCantidad)}
                  >
                    {pr.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Costo"
                type="number"
                value={Number(articulo.Costo)}
                onChange={handleNum("Costo")}
                fullWidth
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Ganancia (%)"
                type="number"
                value={Number(articulo.Ganancia)}
                onChange={handleNum("Ganancia")}
                fullWidth
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Precio público"
                type="number"
                value={Number(articulo.PrecioPublico)}
                onChange={handleNum("PrecioPublico")}
                fullWidth
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Stock"
                type="number"
                value={Number(articulo.Stock)}
                onChange={handleNum("Stock")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Stock mínimo"
                type="number"
                value={Number(articulo.StockMin)}
                onChange={handleNum("StockMin")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={9}>
              <TextField
                label="Descripción"
                value={nz(articulo.Descripcion)}
                onChange={handleChange("Descripcion")}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.HabPrecioManual === 1}
                    onChange={handleCheck01("HabPrecioManual")}
                  />
                }
                label="Precio en el momento de la venta"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.NoAplicaStock === 1}
                    onChange={handleCheck01("NoAplicaStock")}
                  />
                }
                label="No aplica stock"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.NoAplicarDescuento === 1}
                    onChange={handleCheck01("NoAplicarDescuento")}
                  />
                }
                label="No aplicar descuento"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.EmailPorBajoStock === 1}
                    onChange={handleCheck01("EmailPorBajoStock")}
                  />
                }
                label="Email por bajo stock"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.HabNroSerie === 1}
                    onChange={handleCheck01("HabNroSerie")}
                  />
                }
                label="Habilitar Nº de serie"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.AplicaElab === 1}
                    onChange={handleCheck01("AplicaElab")}
                  />
                }
                label="Aplica fecha de elaboración"
              />
              <TextField
                label="Fecha Elaboración"
                type="date"
                value={nz(articulo.FechaElab)}
                onChange={handleFecha("FechaElab")}
                fullWidth
                disabled={articulo.AplicaElab !== 1}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.AplicaVto === 1}
                    onChange={handleCheck01("AplicaVto")}
                  />
                }
                label="Aplica fecha de vencimiento"
              />
              <TextField
                label="Fecha Vencimiento"
                type="date"
                value={nz(articulo.FechaVto)}
                onChange={handleFecha("FechaVto")}
                fullWidth
                disabled={articulo.AplicaVto !== 1}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.HabCostoDolar === 1}
                    onChange={handleCheck01("HabCostoDolar")}
                  />
                }
                label="Costo en USD"
              />
              <TextField
                label="Costo USD"
                value={nz(articulo.CostoDolar)}
                onChange={handleChange("CostoDolar")}
                fullWidth
                disabled={articulo.HabCostoDolar !== 1}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articulo.permitirModificarPrecio === 1}
                    onChange={handleCheck01("permitirModificarPrecio")}
                  />
                }
                label="Permitir modificar precio"
              />
              <input type="file" accept="image/*" onChange={handleImagen} />
              {imagePreview && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{ maxWidth: 160, borderRadius: 8 }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}
