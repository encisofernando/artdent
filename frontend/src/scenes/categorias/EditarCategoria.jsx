import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid } from '@mui/material';
import { Catalog } from '../../services';

const EditarCategoria = ({ open, onClose, onEdited, categoria }) => {
  const [form, setForm] = useState({ idCategoria: null, Nombre: '', parent_id: null });

  useEffect(() => {
    if (categoria) setForm({ idCategoria: categoria.idCategoria, Nombre: categoria.Nombre, parent_id: categoria.parent_id ?? null });
  }, [categoria]);

  const change = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async () => {
    try {
      await Catalog.updateCategory(form.idCategoria, form);
      onEdited?.();
    } catch (e) {
      alert('No se pudo editar la categoría');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Categoría</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}><TextField name="Nombre" label="Nombre" fullWidth value={form.Nombre} onChange={change} /></Grid>
          <Grid item xs={12}><TextField name="parent_id" label="ID Padre (opcional)" fullWidth value={form.parent_id ?? ""} onChange={change} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancelar</Button>
        <Button onClick={submit} color="secondary">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditarCategoria;
