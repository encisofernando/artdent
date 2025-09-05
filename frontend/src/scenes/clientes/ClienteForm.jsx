import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme'; // Asegúrate de que la ruta sea correcta
import { getAllClientes, createCliente } from '../../config/ClienteDB';
import { getAllTipoDoc } from '../../config/TipoDocDB';
import { getAllCondicionIva } from '../../config/CondicionIVADB';
import { getAllProvincias } from '../../config/ProvinciaDB';

const initialFormData = {
  Nombre: '', // Cambiado a mayúscula para coincidir con el backend
  Apellido: '',
  NroDoc: '',
  TpDoc: '', // ID del tipo de documento
  CUIT: '',
  Tel1: '',
  Email1: '',
  Celular: '',
  Direccion: '',
  CodPostal: '',
  Barrio: '',
  Localidad: '',
  CondIVA: '',
  idProvincia: '', // ID de la provincia
  Provincia: '',
  ActividadComercial: '',
  Profesion: '',
  FechaNac: '', // Asegúrate de enviar la fecha en el formato correcto
  FechaInicioAct: '',
  Activo: false, // Cambiado a mayúscula
  CC: false,
  CC_Bloq: false,
  Comentarios: '',
};

const ClienteForm = ({ open, onClose, onCreate }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [clientes, setClientes] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]); // Estado para tipos de documentos
  const [condicionIva, setCondicionIva] = useState([]); // Estado para tipos de documentos

  const [provincias, setProvincias] = useState([]); // Estado para tipos de documentos



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getAllClientes();
        setClientes(data);
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
        setSnackbarMessage('Error al obtener clientes');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    const fetchTiposDoc = async () => {
      try {
        const data = await getAllTipoDoc();
        setTiposDoc(data); // Guarda los tipos de documento en el estado
     
        
      } catch (error) {
        console.error('Error al obtener tipos de documento:', error);
        setSnackbarMessage('Error al obtener tipos de documento');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    const fetchCondicionIVA = async () => {
      try {
        const data = await getAllCondicionIva();
        setCondicionIva(data); // Guarda los tipos de documento en el estado
   
      } catch (error) {
        console.error('Error al obtener tipos de documento:', error);
        setSnackbarMessage('Error al obtener tipos de documento');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    const fetchProvincias = async () => {
      try {
        const data = await getAllProvincias();
        setProvincias(data); // Guarda los tipos de documento en el estado
      } catch (error) {
        console.error('Error al obtener tipos de documento:', error);
        setSnackbarMessage('Error al obtener tipos de documento');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    if (open) {
      fetchClientes();
      fetchTiposDoc(); // Llama a la función para obtener los tipos de documento
      fetchProvincias();
      fetchCondicionIVA();
      setFormData(initialFormData); // Reinicia el formulario al abrir el diálogo
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const clienteCreado = await createCliente(formData);
      console.log(clienteCreado); // Agrega esto para depurar
      onCreate(clienteCreado);
      setSnackbarMessage('Cliente creado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error al crear el cliente:', error); // Esto también puede ayudar a depurar
      setSnackbarMessage(error.response?.data?.message || 'Error al crear el cliente');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      onClose();
    }
  };
  

  

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  
  return (
    <>
         <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ backgroundColor: colors.primary[400], textAlign: "center", fontSize: "1.5rem"}}>Alta de Cliente</DialogTitle>
          <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
            <Box p={3} borderRadius={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="Nombre"
                    label="Nombre"
                    fullWidth
                    margin="normal"
                    value={formData.Nombre}
                    onChange={handleChange}
                  />
                
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="Apellido"
                    label="Apellido"
                    fullWidth
                    margin="normal"
                    value={formData.Apellido}
                    onChange={handleChange}
                  />
                </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    name="TpDoc"
                    value={formData.TpDoc}
                    onChange={handleChange}
                    fullWidth
                  >
                    {tiposDoc.map((tipo) => (
                      <MenuItem key={tipo.idTipoDoc} value={tipo.idTipoDoc}>
                        {tipo.Nombre} {/* Muestra el nombre del tipo de documento */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="NroDoc"
                  label="DNI"
                  fullWidth
                  margin="normal"
                  value={formData.NroDoc}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="CUIT"
                  label="CUIT"
                  fullWidth
                  margin="normal"
                  value={formData.CUIT}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                  <InputLabel>Condicion IVA</InputLabel>
                  <Select
                    name="CondIVA"
                    value={formData.CondIVA}
                    onChange={handleChange}
                    fullWidth
                  >
                    {condicionIva.map((condicion) => (
                      <MenuItem key={condicion.idCondIVA} value={condicion.Nombre}>
                        {condicion.Nombre} {/* Muestra el nombre del tipo de documento */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Direccion"
                  label="Dirección"
                  fullWidth
                  margin="normal"
                  value={formData.Direccion}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="CodPostal"
                  label="Código Postal"
                  fullWidth
                  margin="normal"
                  value={formData.CodPostal}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Barrio"
                  label="Barrio"
                  fullWidth
                  margin="normal"
                  value={formData.Barrio}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Localidad"
                  label="Localidad"
                  fullWidth
                  margin="normal"
                  value={formData.Localidad}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Provincia</InputLabel>
                  <Select
                    name="Provincia"
                    value={formData.Provincia}
                    onChange={(e) => {
                      const selectedProvincia = provincias.find(p => p.Nombre === e.target.value);
                      setFormData({
                        ...formData,
                        idProvincia: selectedProvincia.idProvincia,
                        Provincia: selectedProvincia.Nombre
                      });
                    }}
                    fullWidth
                  >
                    {provincias.map((provincia) => (
                      <MenuItem key={provincia.idProvincia} value={provincia.Nombre}>
                        {provincia.Nombre} {/* Muestra el nombre de la provincia */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="ActividadComercial"
                  label="Actividad Comercial"
                  fullWidth
                  margin="normal"
                  value={formData.ActividadComercial}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Profesion"
                  label="Profesión"
                  fullWidth
                  margin="normal"
                  value={formData.Profesion}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Tel1"
                  label="Teléfono"
                  fullWidth
                  margin="normal"
                  value={formData.Tel1}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Celular"
                  label="Celular"
                  fullWidth
                  margin="normal"
                  value={formData.Celular}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Email1"
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={formData.Email1}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="FechaNac"
                  label="Fecha de Nacimiento"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={formData.FechaNac}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="FechaInicioAct"
                  label="Fecha de inicio de actividad"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={formData.FechaInicioAct}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.CC}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          CC: checked, // Establece a true si está marcado
                          CC_Bloq: !checked ? formData.CC_Bloq : false, // Desmarcar el otro checkbox
                        });
                      }}
                    />
                  }
                  label="Habilitar Cuenta Corriente"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.CC_Bloq}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          CC_Bloq: checked, // Establece a true si está marcado
                          CC: !checked ? formData.CC : false, // Desmarcar el otro checkbox
                        });
                      }}
                    />
                  }
                  label="Sin Cuenta Corriente"
                />
              </Grid>

              <Grid item xs={12}>
              <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.Activo === 1}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              Activo: e.target.checked ? 1 : 0,
                            })
                          }
                        />
                      }
                      label="Activo"
                    />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Comentarios"
                  label="Comentarios"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  value={formData.Comentarios}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={onClose} color="error">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="secondary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Crear Cliente'}
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

export default ClienteForm;
