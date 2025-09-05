import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  List,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { getEmpresaById, updateEmpresa } from '../../config/EmpresaDB';
import { getAllCondicionIva } from '../../config/CondicionIVADB';
import { getAllRubros } from '../../config/RubrosDB';
import { getIdBaseFromToken } from '../../auth/auth';

const Settings = () => {
  const [formData, setFormData] = useState({
    RazonSocial: '',
    RptDir1: '',
    RptDir2: '',
    RptTel: '',
    CondIva: '',
    CUIT: '',
    NomComercial: '',
    IB: '',
    IniActividad: '',
    NombreRubro: '',
    Activo: true,
    Logo: null,
    AFIP_PEM: null,
    AFIP_CRT: null,
    AFIP_HabFE: false,
    AFIP_PuntoVenta: '',
    AFIP_VenceCRT: '',
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [condicionIva, setCondicionIva] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [searchRubro, setSearchRubro] = useState('');
  const [filteredRubros, setFilteredRubros] = useState([]);
  const [idEmpresa, setIdEmpresa] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idBase = getIdBaseFromToken();
        const empresa = await getEmpresaById(idBase);
    
        if (empresa) {
          setIdEmpresa(empresa.IdEmpresa);
          setFormData({
            RazonSocial: empresa.RazonSocial || '',
            RptDir1: empresa.RptDir1 || '',
            RptDir2: empresa.RptDir2 || '',
            RptTel: empresa.RptTel || '',
            CondIva: empresa.CondIva || '',
            CUIT: empresa.CUIT || '',
            NomComercial: empresa.NomComercial || '',
            IB: empresa.IB || '',
            IniActividad: empresa.IniActividad ? empresa.IniActividad.split('T')[0] : '',
            NombreRubro: empresa.NombreRubro || '',
            Activo: empresa.Activo !== undefined ? empresa.Activo : true,
            Logo: empresa.Logo || null,
            AFIP_PEM: empresa.AFIP_PEM || null,
            AFIP_CRT: empresa.AFIP_CRT || null,
            AFIP_HabFE: empresa.AFIP_HabFE || false,
            AFIP_PuntoVenta: empresa.AFIP_PuntoVenta || '',
            AFIP_VenceCRT: empresa.AFIP_VenceCRT ? empresa.AFIP_VenceCRT.split('T')[0] : '',
          });
          setSearchRubro(empresa.NombreRubro || '');
        } else {
          console.error('No se encontró la empresa para el idBase:', idBase);
          setSnackbarMessage('No se encontró la empresa.');
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Error al obtener la empresa:', error);
        setSnackbarMessage('Error al obtener los datos de la empresa.');
        setSnackbarOpen(true);
      }
    };

    const fetchCondicionIVA = async () => {
      try {
        const data = await getAllCondicionIva();
        setCondicionIva(data);
      } catch (error) {
        console.error('Error al obtener tipos de documento:', error);
        setSnackbarMessage('Error al obtener tipos de documento');
        setSnackbarOpen(true);
      }
    };

    const fetchRubros = async () => {
      try {
        const data = await getAllRubros();
        setRubros(data);
        setFilteredRubros(data);
      } catch (error) {
        console.error('Error al obtener rubros:', error);
        setSnackbarMessage('Error al obtener rubros');
        setSnackbarOpen(true);
      }
    };

    fetchCondicionIVA();
    fetchRubros();
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = rubros.filter((rubro) =>
      rubro.Nombre.toLowerCase().includes(searchRubro.toLowerCase())
    );
    setFilteredRubros(filtered);
  }, [searchRubro, rubros]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? e.target.files[0] : value,
    });
  };

  const handleRubroSelect = (rubro) => {
    setSearchRubro(rubro.Nombre);
    setFilteredRubros([]);
    setFormData({
      ...formData,
      NombreRubro: rubro.Nombre,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inicioActividad = formData.IniActividad ? new Date(formData.IniActividad) : null;
    const formattedFechaInicActividad = inicioActividad ? inicioActividad.toISOString().split("T")[0] : null; 
    const AFIP_VenceCRTFecha = formData.AFIP_VenceCRT ? new Date(formData.AFIP_VenceCRT) : null;
    const formattedAFIP_VenceCRT = AFIP_VenceCRTFecha ? AFIP_VenceCRTFecha.toISOString().split("T")[0] : null; 

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('RazonSocial', formData.RazonSocial);
      formDataToSend.append('RptDir1', formData.RptDir1);
      formDataToSend.append('RptDir2', formData.RptDir2);
      formDataToSend.append('RptTel', formData.RptTel);
      formDataToSend.append('CondIva', formData.CondIva);
      formDataToSend.append('CUIT', formData.CUIT);
      formDataToSend.append('NomComercial', formData.NomComercial);
      formDataToSend.append('IB', formData.IB);
      formDataToSend.append('IniActividad', formattedFechaInicActividad);
      formDataToSend.append('NombreRubro', formData.NombreRubro);
      formDataToSend.append('Activo', formData.Activo);
      formDataToSend.append('Logo', formData.Logo);
      formDataToSend.append('AFIP_PEM', formData.AFIP_PEM);
      formDataToSend.append('AFIP_CRT', formData.AFIP_CRT);
      formDataToSend.append('AFIP_HabFE', formData.AFIP_HabFE);
      formDataToSend.append('AFIP_PuntoVenta', formData.AFIP_PuntoVenta);
      formDataToSend.append('AFIP_VenceCRT', formattedAFIP_VenceCRT);
  
      await updateEmpresa(idEmpresa, formDataToSend);
      setSnackbarMessage('Configuraciones guardadas exitosamente');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      setSnackbarMessage('Error al guardar configuraciones');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1500,
        marginTop: 10,
        mx: 'auto',
        p: 3,
        backgroundColor: '#121212', // Color de fondo oscuro
        borderRadius: '15px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      <Typography variant="h5" component="h1" sx={{ mb: 2, color: '#fff' }}>
        Configuraciones
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Razón Social"
              name="RazonSocial"
              value={formData.RazonSocial || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Dirección"
              name="RptDir1"
              value={formData.RptDir1 || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Teléfono"
              name="RptTel"
              value={formData.RptTel || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel id="cond-iva-label" sx={{ color: '#bbb' }}>Condición IVA</InputLabel>
              <Select
                labelId="cond-iva-label"
                name="CondIva"
                value={formData.CondIva || ''}
                onChange={handleChange}
                sx={{ input: { color: '#fff' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
              >
                {condicionIva.map((cond) => (
                  <MenuItem key={cond.IdCondIva} value={cond.IdCondIva}>{cond.Nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="CUIT"
              name="CUIT"
              value={formData.CUIT || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Nombre Comercial"
              name="NomComercial"
              value={formData.NomComercial || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="IB"
              name="IB"
              value={formData.IB || ''}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Inicio de Actividad"
              name="IniActividad"
              type="date"
              value={formData.IniActividad || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Rubro"
              value={searchRubro}
              onChange={(e) => setSearchRubro(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2, input: { color: '#fff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  name="Activo"
                  checked={formData.Activo}
                  onChange={handleChange}
                  sx={{ color: '#1976d2', '&.Mui-checked': { color: '#1976d2' } }}
                />
              }
              label="Activo"
              sx={{ color: '#fff' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}>
              Guardar Configuración
            </Button>
          </Grid>
        </Grid>
      </form>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {/* Filtros y listados */}
      <Paper sx={{ mt: 3, p: 2, backgroundColor: '#1f1f1f', borderRadius: '10px' }}>
        <Typography variant="h6" component="h2" sx={{ color: '#fff' }}>Rubros</Typography>
        <TextField
          label="Buscar Rubro"
          value={searchRubro}
          onChange={(e) => setSearchRubro(e.target.value)}
          fullWidth
          sx={{ mb: 2, input: { color: '#ffffff' }, '& .MuiInputLabel-root': { color: '#bbb' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, }}
        />
        <List>
          {filteredRubros.map((rubro) => (
            <ListItemButton key={rubro.IdRubro} onClick={() => handleRubroSelect(rubro)}>
              <ListItemText primary={rubro.Nombre} sx={{ color: '#fff' }} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Settings;
