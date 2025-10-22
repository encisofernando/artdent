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
 * - categorias: [{idCategoria, Nombre}]
 * - proveedores: [{idProveedor, Nombre}]
 * - ivas: [{idIva, Nombre, Porcentaje}]
 * - promociones: [{idPromocionCantidad, Nombre}]
 */
export default function CrearArticulo({
  open,
  onClose,
  onSave,
  categorias = [],
  proveedores = [],
  ivas = [],
  promociones = [],
}) {
  const initial = useMemo(
    () => ({
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
      Iva: "", // guardamos como string en UI (ej: "21" o "10.5000")
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

  const [nuevo, setNuevo] = useState(initial);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!open) {
      setNuevo(initial);
      setImagePreview(null);
    }
  }, [open, initial]);

  // === Handlers ===
  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setNuevo((s) => ({ ...s, [field]: value ?? "" }));
  };

  const handleNum = (field) => (e) => {
    const { value } = e.target;
    setNuevo((s) => ({ ...s, [field]: value === "" ? 0 : Number(value) }));
  };

  const handleCheck01 = (field) => (e) => {
    setNuevo((s) => ({ ...s, [field]: e.target.checked ? 1 : 0 }));
  };

  const handleIvaChange = (value) => {
    // Guardamos string en UI; al enviar casteamos a número
    setNuevo((s) => ({ ...s, Iva: value ?? "" }));
  };

  const handleFecha = (field) => (e) => {
    setNuevo((s) => ({ ...s, [field]: e.target.value ?? "" }));
  };

  const handleImagen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    // Si necesitas guardar el file, guárdalo en otro estado o FormData al momento de enviar
  };

  const submit = () => {
    // Normalizamos definitivamente números/booleans para el backend
    const payload = {
      ...nuevo,
      Stock: n0(nuevo.Stock),
      StockMin: n0(nuevo.StockMin),
      Costo: n0(nuevo.Costo),
      Ganancia: n0(nuevo.Ganancia),
      PrecioPublico: n0(nuevo.PrecioPublico),
      Iva: nuevo.Iva === "" ? null : Number(nuevo.Iva),
      activo: b01(nuevo.activo),
      HabPrecioManual: b01(nuevo.HabPrecioManual),
      NoAplicaStock: b01(nuevo.NoAplicaStock),
      NoAplicarDescuento: b01(nuevo.NoAplicarDescuento),
      EmailPorBajoStock: b01(nuevo.EmailPorBajoStock),
      HabNroSerie: b01(nuevo.HabNroSerie),
      AplicaElab: b01(nuevo.AplicaElab),
      FechaElab: dateIso(nuevo.FechaElab) || null,
      AplicaVto: b01(nuevo.AplicaVto),
      FechaVto: dateIso(nuevo.FechaVto) || null,
      HabCostoDolar: b01(nuevo.HabCostoDolar),
      permitirModificarPrecio: b01(nuevo.permitirModificarPrecio),
    };
    onSave?.(payload);
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Crear artículo</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                value={nz(nuevo.Nombre)}
                onChange={handleChange("Nombre")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Código de barras"
                value={nz(nuevo.CodigoBarra)}
                onChange={handleChange("CodigoBarra")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Categoría"
                value={safeValue(nuevo.idCategoria, categorias, "idCategoria")}
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
                value={safeValue(nuevo.Iva, ivas, "Porcentaje")}
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
                value={safeValue(nuevo.idProveedor1, proveedores, "idProveedor")}
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
                value={safeValue(nuevo.idProveedor2, proveedores, "idProveedor")}
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
                  nuevo.idPromocionCantidad,
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
                value={Number(nuevo.Costo)}
                onChange={handleNum("Costo")}
                fullWidth
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Ganancia (%)"
                type="number"
                value={Number(nuevo.Ganancia)}
                onChange={handleNum("Ganancia")}
                fullWidth
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Precio público"
                type="number"
                value={Number(nuevo.PrecioPublico)}
                onChange={handleNum("PrecioPublico")}
                fullWidth
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Stock"
                type="number"
                value={Number(nuevo.Stock)}
                onChange={handleNum("Stock")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Stock mínimo"
                type="number"
                value={Number(nuevo.StockMin)}
                onChange={handleNum("StockMin")}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={9}>
              <TextField
                label="Descripción"
                value={nz(nuevo.Descripcion)}
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
                    checked={nuevo.HabPrecioManual === 1}
                    onChange={handleCheck01("HabPrecioManual")}
                  />
                }
                label="Precio en el momento de la venta"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nuevo.NoAplicaStock === 1}
                    onChange={handleCheck01("NoAplicaStock")}
                  />
                }
                label="No aplica stock"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nuevo.NoAplicarDescuento === 1}
                    onChange={handleCheck01("NoAplicarDescuento")}
                  />
                }
                label="No aplicar descuento"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nuevo.EmailPorBajoStock === 1}
                    onChange={handleCheck01("EmailPorBajoStock")}
                  />
                }
                label="Email por bajo stock"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nuevo.HabNroSerie === 1}
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
                    checked={nuevo.AplicaElab === 1}
                    onChange={handleCheck01("AplicaElab")}
                  />
                }
                label="Aplica fecha de elaboración"
              />
              <TextField
                label="Fecha Elaboración"
                type="date"
                value={nz(nuevo.FechaElab)}
                onChange={handleFecha("FechaElab")}
                fullWidth
                disabled={nuevo.AplicaElab !== 1}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nuevo.AplicaVto === 1}
                    onChange={handleCheck01("AplicaVto")}
                  />
                }
                label="Aplica fecha de vencimiento"
              />
              <TextField
                label="Fecha Vencimiento"
                type="date"
                value={nz(nuevo.FechaVto)}
                onChange={handleFecha("FechaVto")}
                fullWidth
                disabled={nuevo.AplicaVto !== 1}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nuevo.HabCostoDolar === 1}
                    onChange={handleCheck01("HabCostoDolar")}
                  />
                }
                label="Costo en USD"
              />
              <TextField
                label="Costo USD"
                value={nz(nuevo.CostoDolar)}
                onChange={handleChange("CostoDolar")}
                fullWidth
                disabled={nuevo.HabCostoDolar !== 1}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={nuevo.permitirModificarPrecio === 1}
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
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
