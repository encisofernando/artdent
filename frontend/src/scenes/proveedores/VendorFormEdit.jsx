import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Checkbox, FormControlLabel, Snackbar, Alert
} from "@mui/material";
import { Vendors } from "../../services";

const empty = {
  idProveedor: null,
  name: "",
  tax_id: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  is_active: 1,
};

const VendorFormEdit = ({ open, onClose, onEdited, proveedorEditado }) => {
  const [form, setForm] = useState(empty);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    if (proveedorEditado) setForm(proveedorEditado);
    else setForm(empty);
  }, [proveedorEditado]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }));
  };

  const submit = async () => {
    try {
      await Vendors.updateVendor(form.idProveedor, form);
      setSnack({ open: true, msg: "Proveedor editado", sev: "success" });
      onEdited?.();
    } catch (e) {
      setSnack({ open: true, msg: "Error al editar", sev: "error" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Modificar Proveedor</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={8}><TextField name="name" value={form.name} onChange={change} fullWidth label="Razón Social" /></Grid>
          <Grid item xs={12} sm={4}><TextField name="tax_id" value={form.tax_id} onChange={change} fullWidth label="CUIT" /></Grid>
          <Grid item xs={12} sm={6}><TextField name="email" value={form.email} onChange={change} fullWidth label="Email" /></Grid>
          <Grid item xs={12} sm={6}><TextField name="phone" value={form.phone} onChange={change} fullWidth label="Teléfono" /></Grid>
          <Grid item xs={12} sm={8}><TextField name="address" value={form.address} onChange={change} fullWidth label="Dirección" /></Grid>
          <Grid item xs={12} sm={4}><TextField name="zip" value={form.zip} onChange={change} fullWidth label="CP" /></Grid>
          <Grid item xs={12} sm={6}><TextField name="city" value={form.city} onChange={change} fullWidth label="Ciudad" /></Grid>
          <Grid item xs={12} sm={6}><TextField name="state" value={form.state} onChange={change} fullWidth label="Provincia" /></Grid>
          <Grid item xs={12}><FormControlLabel control={<Checkbox checked={!!form.is_active} onChange={change} name="is_active" />} label="Activo" /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancelar</Button>
        <Button onClick={submit} color="secondary">Guardar</Button>
      </DialogActions>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.sev} onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Dialog>
  );
};

export default VendorFormEdit;