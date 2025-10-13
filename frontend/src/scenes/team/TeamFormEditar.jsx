// 📁 src/scenes/equipo/TeamFormEditar.jsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Grid, Box, CircularProgress, Snackbar, Alert, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { Documents, Tax, Roles, Geo, Employees } from '../../services';

const empleadoModificado = {
  Nombre: '', Apellido: '', NroDoc: '', TpDoc: '', idRol: '', CUIT: '', Tel1: '', Email1: '',
  Celular: '', Direccion: '', CodPostal: '', Barrio: '', Localidad: '', CondIVA: '', idProvincia: '',
  Provincia: '', Profesion: '', FechaNac: '', FechaIncAct: '', FechaBaja: '', Activo: 0, Comentarios: '',
  Rol: '', Password: '', confirmPassword: '', Imagen: '', ImagenUrl: ''
};

const TeamFormEditar = ({ open, onClose, onEmpleadoEditando, empleadoEditando }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [formData, setFormData] = useState(empleadoModificado);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [tiposDoc, setTiposDoc] = useState([]);
  const [condicionIva, setCondicionIva] = useState([]);
  const [roles, setRoles] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value, idRol: name === 'Rol' ? value : prevData.idRol }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try { setRoles(await Roles.listRoles()); } catch (e) {}
      try { setTiposDoc(await Documents.listDocTypes()); } catch (e) { setTiposDoc([]); }
      try { setCondicionIva(await Tax.listIvaConditions()); } catch (e) { setCondicionIva([]); }
      try { setProvincias(await Geo.listProvinces()); } catch (e) { setProvincias([]); }
    };
    if (open) { fetchData(); setFormData(empleadoModificado); }
  }, [open]);

  useEffect(() => {
    if (empleadoEditando) {
      const fechaBaja = empleadoEditando.FechaBaja ? new Date(empleadoEditando.FechaBaja) : null;
      const fechaNac = empleadoEditando.FechaNac ? new Date(empleadoEditando.FechaNac) : null;
      const fechaIncAct = empleadoEditando.FechaIncAct ? new Date(empleadoEditando.FechaIncAct) : null;
      setFormData({
        Nombre: empleadoEditando.Nombre || '', Apellido: empleadoEditando.Apellido || '',
        NroDoc: empleadoEditando.NroDoc || 0, TpDoc: empleadoEditando.TpDoc || '',
        idRol: empleadoEditando.idRol || '', CUIT: empleadoEditando.CUIT || 0,
        Tel1: empleadoEditando.Tel1 || 0, Email1: empleadoEditando.Email1 || '',
        Celular: empleadoEditando.Celular || 0, Direccion: empleadoEditando.Direccion || '',
        CodPostal: empleadoEditando.CodPostal || 0, Barrio: empleadoEditando.Barrio || '',
        Localidad: empleadoEditando.Localidad || '', CondIVA: empleadoEditando.CondIVA || '',
        idProvincia: empleadoEditando.idProvincia || '', Provincia: empleadoEditando.Provincia || '',
        Profesion: empleadoEditando.Profesion || '',
        FechaNac: fechaNac ? fechaNac.toISOString().split("T")[0] : null,
        FechaIncAct: fechaIncAct ? fechaIncAct.toISOString().split("T")[0] : null,
        FechaBaja: fechaBaja ? fechaBaja.toISOString().split("T")[0] : null,
        Activo: empleadoEditando.Activo || 0, Comentarios: empleadoEditando.Comentarios || '',
        Rol: empleadoEditando.Rol || '', Password: '', Imagen: empleadoEditando.Imagen || ''
      });
    } else {
      setFormData(empleadoModificado);
    }
  }, [empleadoEditando]);

  const handleCancel = () => { resetForm(); onClose(); };

  const handleSubmitEditar = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      if (image) payload.Imagen = image;
      await Employees.updateEmployee(empleadoEditando.idEmpleado || empleadoEditando.id, payload);
      setSnackbarMessage('Empleado editado con éxito'); setSnackbarSeverity('success'); setSnackbarOpen(true);
      resetForm(); onEmpleadoEditando(); onClose();
    } catch (error) {
      console.error('Error al editar empleado:', error);
      setSnackbarMessage('Error al editar el empleado'); setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const resetForm = () => setFormData(empleadoModificado);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) { setImage(file); setFormData((prev) => ({ ...prev, Imagen: file })); setImagePreview(URL.createObjectURL(file)); }
  };
  const handleImageRemove = () => { setImage(null); setImagePreview(null); };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400], textAlign: "center", fontSize: "1.5rem"}}>Modificar Empleado</DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <Box m="10px">
            <Box m="0px 0" p="20px" borderRadius="8px" sx={{ backgroundColor: colors.primary[400], "& .MuiFormControl-root": { mb: "20px" } }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Roles</InputLabel>
                    <Select name="Rol" value={formData.Rol || ''} onChange={(e) => {
                      const selectedRol = roles.find(p => (p.Nombre || p.name) === e.target.value);
                      if (selectedRol) setFormData((prev) => ({ ...prev, idRol: selectedRol.idRol || selectedRol.id, Rol: selectedRol.Nombre || selectedRol.name }));
                    }} fullWidth>
                      {(roles || []).map((rol) => (<MenuItem key={rol.idRol || rol.id} value={rol.Nombre || rol.name}>{rol.Nombre || rol.name}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}><TextField name="Nombre" label="Nombre" fullWidth margin="normal" value={formData.Nombre || ''} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}><TextField name="Apellido" label="Apellido" fullWidth margin="normal" value={formData.Apellido || ''} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select name="TpDoc" value={formData.TpDoc || ''} onChange={handleChange} fullWidth>
                      {(tiposDoc || []).map((tipo) => (<MenuItem key={tipo.idTipoDoc || tipo.id} value={tipo.idTipoDoc || tipo.id}>{tipo.Nombre || tipo.name}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}><TextField name="NroDoc" label="DNI" fullWidth margin="normal" value={formData.NroDoc || 0} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}><TextField name="CUIT" label="CUIT" fullWidth margin="normal" value={formData.CUIT || 0} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Condicion IVA</InputLabel>
                    <Select name="CondIVA" value={formData.CondIVA || ''} onChange={handleChange} fullWidth>
                      {(condicionIva || []).map((c) => (<MenuItem key={c.idCondIVA || c.id} value={c.Nombre || c.name}>{c.Nombre || c.name}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}><TextField name="Direccion" label="Dirección" fullWidth margin="normal" value={formData.Direccion || ''} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}><TextField name="CodPostal" label="Código Postal" fullWidth margin="normal" value={formData.CodPostal || 0} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}><TextField name="Barrio" label="Barrio" fullWidth margin="normal" value={formData.Barrio || ''} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField name="Localidad" label="Localidad" fullWidth margin="normal" value={formData.Localidad || ''} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Provincia</InputLabel>
                    <Select name="Provincia" value={formData.Provincia || ''} onChange={(e) => {
                      const selectedProvincia = provincias.find(p => (p.Nombre || p.name) === e.target.value);
                      if (selectedProvincia) setFormData((prev) => ({ ...prev, idProvincia: selectedProvincia.idProvincia || selectedProvincia.id, Provincia: selectedProvincia.Nombre || selectedProvincia.name }));
                    }} fullWidth>
                      {(provincias || []).map((p) => (<MenuItem key={p.idProvincia || p.id} value={p.Nombre || p.name}>{p.Nombre || p.name}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}><TextField name="Profesion" label="Profesión" fullWidth margin="normal" value={formData.Profesion || ''} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}><TextField name="Tel1" label="Teléfono" fullWidth margin="normal" value={formData.Tel1 || 0} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={3}><TextField name="Celular" label="Celular" fullWidth margin="normal" value={formData.Celular || 0} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField name="Email1" label="Email" fullWidth margin="normal" value={formData.Email1 || ''} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><TextField name="FechaNac" label="Fecha de Nacimiento" type="date" fullWidth margin="normal" value={formData.FechaNac || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} sm={6}><TextField name="FechaIncAct" label="Fecha de Inicio de Actividad" type="date" fullWidth margin="normal" value={formData.FechaIncAct || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} sm={6}><TextField name="FechaBaja" label="Fecha de Baja de Actividad" type="date" fullWidth margin="normal" value={formData.FechaBaja || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} sm={3} sx={{ mt: 1, ml: "50px" }}>
                  <Typography variant="h6">Foto del Empleado</Typography>
                  <Box display="flex" alignItems="center">
                    <Button variant="contained" component="label">Buscar Foto<input type="file" name="Imagen" hidden accept="image/*" onChange={handleImageChange} /></Button>
                    <Button variant="outlined" color="error" onClick={handleImageRemove} sx={{ ml: "10px" }}>Quitar Foto</Button>
                  </Box>
                  {imagePreview && (<Box mt={2}><Typography variant="subtitle1">Vista previa:</Typography><img src={imagePreview} alt="Vista previa" style={{ maxWidth: '50%', maxHeight: '500px' }} /></Box>)}
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel control={<Checkbox checked={Number(formData.Activo) === 1} onChange={(e) => setFormData({ ...formData, Activo: e.target.checked ? 1 : 0 })} />} label="Activo" />
                </Grid>
                <Grid item xs={12}><TextField name="Comentarios" label="Comentarios" fullWidth multiline rows={4} margin="normal" value={formData.Comentarios || ''} onChange={handleChange} /></Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={handleCancel} color="error">Cancelar</Button>
          <Button onClick={handleSubmitEditar} color="secondary" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Modificar Empleado'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
};

export default TeamFormEditar;
