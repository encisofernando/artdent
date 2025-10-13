import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, TextField, Typography, Box, Button, Grid, MenuItem, Select, FormControl, Checkbox, FormControlLabel } from '@mui/material';
import Header from '../../components/Header';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import { Tasks, Roles, Employees } from '../../services';

const TeamForm = () => {
  const [formData, setFormData] = useState({
    Nombre: '', Apellido: '', Email1: '',
    idRol: '', Rol: '', Perfil: '',
    Imagen: null, ImagenUrl: ''
  });
  const [permissions, setPermissions] = useState({});
  const [tareas, setTareas] = useState([]);
  const [initialPermissions, setInitialPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tareasData = await Tasks.listTasks();
        setTareas(tareasData);
        const init = (tareasData || []).reduce((acc, t) => {
          acc[t.idTarea || t.id] = true;
          return acc;
        }, {});
        setPermissions(init);
        setInitialPermissions(init);
      } catch (e) {}
      try { setRoles(await Roles.listRoles()); } catch (e) {}
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "idRol") {
      const selectedRole = roles.find(rol => rol.idRol === value);
      setFormData((prev) => ({ ...prev, idRol: value, Rol: selectedRole ? selectedRole.Nombre : '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    const tarea = tareas.find(t => (t.Nombre || t.name) === name);
    if (tarea) {
      setPermissions(prev => ({ ...prev, [tarea.idTarea || tarea.id]: checked }));
    }
  };

  const resetForm = () => {
    setFormData({ Nombre: '', Apellido: '', Email1: '', idRol: '', Rol: '', Perfil: '', Imagen: null, ImagenUrl: '' });
    setPermissions(initialPermissions);
    setImage(null);
  };

  const groupTareasByCategory = (tareas) =>
    (tareas || []).reduce((acc, tarea) => {
      const key = (tarea.Nombre || tarea.name || "General").split(' ')[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(tarea);
      return acc;
    }, {});

  const tareasGrouped = groupTareasByCategory(tareas);

  const handleSaveClick = async () => {
    if (!formData.Nombre || !formData.Apellido || !formData.Email1 || !formData.idRol) {
      alert("Por favor, complete todos los campos obligatorios."); return;
    }
    const permisosArray = (tareas || []).map(t => ({
      idTarea: t.idTarea || t.id,
      Nombre: t.Nombre || t.name,
      permitido: permissions[t.idTarea || t.id] || false
    }));

    const fd = new FormData();
    fd.append('Nombre', formData.Nombre);
    fd.append('Apellido', formData.Apellido);
    fd.append('Email1', formData.Email1);
    fd.append('idRol', formData.idRol);
    fd.append('Rol', formData.Rol);
    fd.append('Perfil', formData.Perfil);
    fd.append('permissions', JSON.stringify(permisosArray));
    if (image) fd.append('Imagen', image);

    try {
      await Employees.createEmployee(fd);
      alert('Empleado creado con éxito');
      resetForm();
    } catch (error) {
      console.error("Error al guardar el empleado:", error);
      alert("No se pudo crear el empleado");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" ml="20px" mt="20px">
        <Header title="EMPLEADOS" subtitle="Nuevo empleado" />
      </Box>

      <Card sx={{ maxWidth: 800, margin: 'auto', padding: 3, borderRadius: 2 }}>
        <CardHeader title="Datos del Empleado" sx={{ textAlign: 'center' }} titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }} />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">Nombre *</Typography>
              <TextField name="Nombre" value={formData.Nombre} onChange={handleChange} fullWidth margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold">Apellidos *</Typography>
              <TextField name="Apellido" value={formData.Apellido} onChange={handleChange} fullWidth margin="dense" />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" fontWeight="bold">Correo Electrónico *</Typography>
              <TextField name="Email1" value={formData.Email1} onChange={handleChange} fullWidth margin="dense" type="email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <Typography variant="body2" fontWeight="bold">Rol/Cargo *</Typography>
                <Select name="idRol" value={formData.idRol} onChange={handleChange} fullWidth margin="dense" displayEmpty>
                  <MenuItem value=""><em>Seleccione un tipo</em></MenuItem>
                  {(roles || []).map((rol) => (<MenuItem key={rol.idRol} value={rol.idRol}>{rol.Nombre || rol.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <Typography variant="body2" fontWeight="bold">Perfil *</Typography>
                <Select name="Perfil" value={formData.Perfil} onChange={handleChange} fullWidth margin="dense" displayEmpty>
                  <MenuItem value=""><em>Seleccione un perfil</em></MenuItem>
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Limitado">Limitado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {formData.Perfil === 'Limitado' && (
            <Box mt={3}>
              <Typography variant="h6" fontWeight="bold" textAlign="center">Permisos</Typography>
              {Object.keys(tareasGrouped).map((category) => (
                <Box key={category} mt={2}>
                  <Typography variant="h6" fontWeight="bold">{category}</Typography>
                  {tareasGrouped[category].map((tarea) => (
                    <FormControlLabel key={tarea.idTarea || tarea.id} control={
                      <Checkbox checked={permissions[tarea.idTarea || tarea.id] || false} onChange={handlePermissionChange} name={tarea.Nombre || tarea.name} />}
                      label={tarea.Nombre || tarea.name}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button onClick={handleSaveClick} variant="outlined" color="secondary" startIcon={<CheckIcon />} sx={{ mr: 2 }}>Crear empleado</Button>
            <Button onClick={resetForm} variant="outlined" color="error" startIcon={<CancelIcon />}>Cancelar</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamForm;
