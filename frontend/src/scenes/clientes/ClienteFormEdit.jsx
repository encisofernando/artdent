import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Checkbox, FormControlLabel,
  Grid, Box, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { Customers } from '../../services';

const emptyData = {
  code: '',
  name: '',
  tax_id: '',
  tax_condition: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  credit_limit: 0,
  is_active: 1,
};

const ClienteFormEdit = ({ open, onClose, onClienteEditado, clienteEditado }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [formData, setFormData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  useEffect(() => {
    if (clienteEditado) {
      setFormData({
        code: clienteEditado.code || '',
        name: clienteEditado.name || '',
        tax_id: clienteEditado.tax_id || '',
        tax_condition: clienteEditado.tax_condition || '',
        email: clienteEditado.email || '',
        phone: clienteEditado.phone || '',
        address: clienteEditado.address || '',
        city: clienteEditado.city || '',
        state: clienteEditado.state || '',
        zip: clienteEditado.zip || '',
        credit_limit: clienteEditado.credit_limit ?? 0,
        is_active: clienteEditado.is_active ?? 1,
      });
    } else {
      setFormData(emptyData);
    }
  }, [clienteEditado]);

  const handleSubmitEditar = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        credit_limit: Number(formData.credit_limit || 0),
        is_active: formData.is_active ? 1 : 0,
      };
      await Customers.updateCustomer(clienteEditado.id, payload);
      setSnackbarMessage('Cliente editado con éxito');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onClienteEditado?.();
      onClose?.();
    } catch (error) {
      console.error('Error al editar cliente:', error);
      setSnackbarMessage(error?.response?.data?.message || 'Error al editar el cliente');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400], textAlign: 'center', fontSize: '1.5rem' }}>
          Modificar Cliente
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <Box p={3} borderRadius={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField name="code" label="Código" fullWidth margin="normal" value={formData.code} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={8}><TextField name="name" label="Nombre" fullWidth required margin="normal" value={formData.name} onChange={handleChange} /></Grid>

              <Grid item xs={12} sm={6}><TextField name="tax_id" label="CUIT/CUIL" fullWidth margin="normal" value={formData.tax_id} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="tax_condition" label="Condición IVA" fullWidth margin="normal" value={formData.tax_condition} onChange={handleChange} /></Grid>

              <Grid item xs={12} sm={6}><TextField name="email" label="Email" fullWidth margin="normal" value={formData.email} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="phone" label="Teléfono" fullWidth margin="normal" value={formData.phone} onChange={handleChange} /></Grid>

              <Grid item xs={12} sm={8}><TextField name="address" label="Dirección" fullWidth margin="normal" value={formData.address} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={4}><TextField name="zip" label="CP" fullWidth margin="normal" value={formData.zip} onChange={handleChange} /></Grid>

              <Grid item xs={12} sm={6}><TextField name="city" label="Ciudad" fullWidth margin="normal" value={formData.city} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField name="state" label="Provincia" fullWidth margin="normal" value={formData.state} onChange={handleChange} /></Grid>

              <Grid item xs={12} sm={6}><TextField name="credit_limit" label="Límite de Cuenta Corriente" type="number" fullWidth margin="normal" value={formData.credit_limit} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Checkbox checked={!!formData.is_active} onChange={handleChange} name="is_active" />}
                  label="Activo"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={onClose} color="error">Cancelar</Button>
          <Button onClick={handleSubmitEditar} color="secondary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Editar Cliente'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ClienteFormEdit;
