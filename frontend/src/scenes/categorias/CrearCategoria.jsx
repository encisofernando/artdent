import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid } from '@mui/material';
import { Catalog } from '../../services';

const CrearCategoria = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({ Nombre: '', parent_id: null });

  const change = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async () => {
    try {
      await Catalog.createCategory(form);
      onCreated?.();
    } catch (e) {
      alert('No se pudo crear la categoría');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nueva Categoría</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}><TextField name="Nombre" label="Nombre" fullWidth value={form.Nombre} onChange={change} /></Grid>
          <Grid item xs={12}><TextField name="parent_id" label="ID Padre (opcional)" fullWidth value={form.parent_id ?? ""} onChange={change} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancelar</Button>
        <Button onClick={submit} color="secondary">Crear</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearCategoria;
