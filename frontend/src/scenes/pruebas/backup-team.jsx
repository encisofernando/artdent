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

const Settings = ( ) => { // Asegúrate de recibir idBase como props
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

 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idBase = getIdBaseFromToken(); // Obtener el idBase del usuario
        const empresa = await getEmpresaById(idBase); // Pasar idBase a la función
  
        // Verificar si se encontró la empresa
        if (empresa) {
          setFormData({
            RazonSocial: empresa.RazonSocial || '',
            RptDir1: empresa.RptDir1 || '',
            RptDir2: empresa.RptDir2 || '',
            RptTel: empresa.RptTel || '',
            CondIva: empresa.CondIva || '',
            CUIT: empresa.CUIT || '',
            NomComercial: empresa.NomComercial || '',
            IB: empresa.IB || '',
            IniActividad: empresa.IniActividad || '',
            NombreRubro: empresa.NombreRubro || '',
            Activo: empresa.Activo !== undefined ? empresa.Activo : true,
            Logo: empresa.Logo || null,
            AFIP_PEM: empresa.AFIP_PEM || null,
            AFIP_CRT: empresa.AFIP_CRT || null,
            AFIP_HabFE: empresa.AFIP_HabFE || false,
            AFIP_PuntoVenta: empresa.AFIP_PuntoVenta || '',
            AFIP_VenceCRT: empresa.AFIP_VenceCRT || '',
          });
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
  
    // Ejecutar las funciones para obtener datos
    fetchCondicionIVA();
    fetchRubros();
    fetchData();
  }, []); // Ejecutar cuando el componente se monta
  
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEmpresa(formData);
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
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
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Código Postal + Provincia"
              name="RptDir2"
              value={formData.RptDir2 || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Número Celular"
              name="RptTel"
              value={formData.RptTel || 0}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth required sx={{ mb: 2 }}>
  <InputLabel>Condición IVA</InputLabel>
  <Select
    name="CondIva"
    value={formData.CondIva || ''}
    onChange={handleChange}
  >
    {condicionIva.map((condicion) => (
      <MenuItem key={condicion.idCondIVA} value={condicion.idCondIVA}>
        {condicion.Nombre}
      </MenuItem>
    ))}
  </Select>
</FormControl>

          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="CUIT"
              name="CUIT"
              value={formData.CUIT || 0}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Nombre del Comercio"
              name="NomComercial"
              value={formData.NomComercial || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Ingresos Brutos"
              name="IB"
              value={formData.IB || 0}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
  <TextField
    label="Rubro de la Empresa"
    value={searchRubro} // El valor actual del input
    onChange={(e) => setSearchRubro(e.target.value)} // Actualiza el valor al escribir
    fullWidth
    required
    sx={{ mb: 2 }}
  />
  {/* Mostrar coincidencias filtradas */}
  {searchRubro && filteredRubros.length > 0 && searchRubro !== filteredRubros[0]?.Nombre && (
  <Paper elevation={3} sx={{ maxHeight: 200, overflowY: 'auto', position: 'absolute', zIndex: 2 }}>
    <List>
      {filteredRubros.map((rubro) => (
        <ListItemButton key={rubro.idRubro} onClick={() => handleRubroSelect(rubro)}>
          <ListItemText primary={rubro.Nombre} />
        </ListItemButton>
      ))}
    </List>
  </Paper>
)}

</Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Logo"
              name="Logo"
              type="file"
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                name="AFIP_HabFE"
                checked={Boolean(formData.AFIP_HabFE)}
                onChange={handleChange}
                color="primary"
            />
            
              }
              label="Habilitar Facturación Electrónica"
              sx={{ color: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Adjuntar Clave Privada"
              name="AFIP_PEM"
              type="file"
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Adjuntar Certificado CRT de Afip"
              name="AFIP_CRT"
              type="file"
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Punto de Venta de Afip"
              name="AFIP_PuntoVenta"
              value={formData.AFIP_PuntoVenta || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Fecha de Vencimiento del Certificado CRT"
              name="AFIP_VenceCRT"
              type="date"
              value={formData.AFIP_VenceCRT || ''}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#115293',
            },
          }}
        >
          Guardar Configuraciones
        </Button>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
