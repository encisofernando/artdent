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
import { tokens } from '../../theme';
import { updateCliente } from '../../config/ClienteDB';
import { getAllTipoDoc } from '../../config/TipoDocDB';
import { getAllCondicionIva } from '../../config/CondicionIVADB';
import { getAllProvincias } from '../../config/ProvinciaDB';


const clienteModificado = {
  Nom1: '', // Cambiado a mayúscula para coincidir con el backend
  Nom2: '',
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

const ClienteFormEdit = ({ open, onClose, onClienteEditado, clienteEditado }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [formData, setFormData] = useState(clienteModificado);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [tiposDoc, setTiposDoc] = useState([]); // Estado para tipos de documentos
  const [condicionIva, setCondicionIva] = useState([]); // Estado para tipos de documentos
  const [provincias, setProvincias] = useState([]); // Estado para tipos de documentos



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
      idRol: name === 'Rol' ? value : prevData.idRol, // Actualiza idRol solo si es el campo Rol
    }));
  };

  useEffect(() => {

    

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
    
      fetchTiposDoc(); // Llama a la función para obtener los tipos de documento
      fetchProvincias();
      fetchCondicionIVA();
      setFormData(clienteModificado); // Reinicia el formulario al abrir el diálogo
    }
  }, [open]);

  useEffect(() => {
    if (clienteModificado) {  // Verificar si articuloEditando no es null


      
      const fechaNac = clienteEditado.FechaNac ? new Date(clienteEditado.FechaNac) : null;
      const formattedFechaNac = fechaNac ? fechaNac.toISOString().split("T")[0] : null; // Cambia a null
      
      const fechaInicioAct = clienteEditado.FechaInicioAct ? new Date(clienteEditado.FechaInicioAct) : null;
      const formattedFechaInicioAct = fechaInicioAct ? fechaInicioAct.toISOString().split("T")[0] : null; // Cambia a null
      
      // Cargar los valores del artículo seleccionado para editar
      setFormData({
        Nom1: clienteEditado.Nom1 || '',
        Nom2: clienteEditado.Nom2 || '',
        NroDoc: clienteEditado.NroDoc || 0,
        TpDoc: clienteEditado.TpDoc || '',
        CUIT: clienteEditado.CUIT || 0,
        Tel1: clienteEditado.Tel1 || 0,
        Email1: clienteEditado.Email1 || '',
        Celular: clienteEditado.Celular || 0,
        Direccion: clienteEditado.Direccion || '',
        CodPostal: clienteEditado.CodPostal || 0,
        Barrio: clienteEditado.Barrio || '',
        Localidad: clienteEditado.Localidad || '',
        CondIVA: clienteEditado.CondIVA || '',
        idProvincia: clienteEditado.idProvincia || '',
        Provincia: clienteEditado.Provincia || '',
        Profesion: clienteEditado.Profesion || '',
        FechaNac: formattedFechaNac || null,
        FechaInicioAct: formattedFechaInicioAct || null,
        Activo: clienteEditado.Activo || 0,
        Comentarios: clienteEditado.Comentarios|| '',    
    });
      
    
    } else {
      // Opcionalmente puedes resetear articuloModificado si articuloEditando es null
      setFormData({
        // Valores predeterminados para un nuevo artículo
        Nom1: '', // Cambiado a mayúscula para coincidir con el backend
        Nom2: '',
        NroDoc: '',
        TpDoc: '', // ID del tipo de documento
        idRol: '',
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
        Profesion: '',
        FechaNac: '', // Asegúrate de enviar la fecha en el formato correcto
        FechaInicioAct: '',
        Activo: false, // Cambiado a mayúscula
        Comentarios: '',
      });
     
    }
  }, [clienteEditado]);

  const handleCancel = () => {
    resetForm(); // Reinicia el formulario
    onClose(); // Cierra el diálogo
  };

  const handleSubmitEditar = async () => {
    setLoading(true); // Activa el estado de carga

    try {
        // Crear un objeto con los datos que se enviarán
        const clienteActualizado = {
            Nom1: formData.Nom1,
            Nom2: formData.Nom2,
            NroDoc: formData.NroDoc,
            TpDoc: formData.TpDoc,
            CUIT: formData.CUIT,
            Tel1: formData.Tel1,
            Email1: formData.Email1,
            Celular: formData.Celular,
            Direccion: formData.Direccion,
            CodPostal: formData.CodPostal,
            Barrio: formData.Barrio,
            Localidad: formData.Localidad,
            CondIVA: formData.CondIVA,
            Provincia: formData.Provincia,
            idProvincia: formData.idProvincia,
            Profesion: formData.Profesion,
            FechaNac: formData.FechaNac ? new Date(formData.FechaNac).toISOString().split("T")[0] : null,
            FechaInicioAct: formData.FechaInicioAct ? new Date(formData.FechaInicioAct).toISOString().split("T")[0] : null,
            Activo: formData.Activo,
            Comentarios: formData.Comentarios,
        };



        // Llamada a la función para actualizar el empleado en la base de datos
        await updateCliente(clienteEditado.idCliente, clienteActualizado);

        // Mostrar notificación de éxito
        setSnackbarMessage('Empleado editado con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // Limpiar formulario y cerrar el diálogo
        resetForm();
        onClienteEditado(); // Notificar el éxito de la edición
        onClose(); // Cerrar el diálogo

    } catch (error) {
        console.error('Error al editar empleado:', error);
        setSnackbarMessage('Error al editar el empleado');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    } finally {
        setLoading(false); // Desactiva el estado de carga
    }
};

  
  const resetForm = () => {
    setFormData({
      Nom1: '', // Cambiado a mayúscula para coincidir con el backend
      Nom2: '',
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
      Profesion: '',
      FechaNac: '', // Asegúrate de enviar la fecha en el formato correcto
      FechaInicioAct: '',
      Activo: false, // Cambiado a mayúscula
      Comentarios: '',
    });
    
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  
  
  

  
  return (
    <>
       <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ backgroundColor: colors.primary[400], textAlign: "center", fontSize: "1.5rem"}}>Modificar </DialogTitle>
          <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <Box p={3} borderRadius={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Nom1"
                  label="Nombre"
                  fullWidth
                  margin="normal"
                  value={formData.Nom1  || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Nom2"
                  label="Apellido"
                  fullWidth
                  margin="normal"
                  value={formData.Nom2  || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
  name="TpDoc"
  value={formData.TpDoc || ''}
  onChange={handleChange}
  fullWidth
>
  {tiposDoc.map((tipo) => (
    <MenuItem key={tipo.idTipoDoc} value={tipo.idTipoDoc}>
      {tipo.Nombre}
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
                  value={formData.NroDoc || 0}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="CUIT"
                  label="CUIT"
                  fullWidth
                  margin="normal"
                  value={formData.CUIT || 0}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                  <InputLabel>Condicion IVA</InputLabel>
                  <Select
                    name="CondIVA"
                    value={formData.CondIVA || ''}
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
                  value={formData.Direccion  || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="CodPostal"
                  label="Código Postal"
                  fullWidth
                  margin="normal"
                  value={formData.CodPostal || 0}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Barrio"
                  label="Barrio"
                  fullWidth
                  margin="normal"
                  value={formData.Barrio  || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Localidad"
                  label="Localidad"
                  fullWidth
                  margin="normal"
                  value={formData.Localidad  || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Provincia</InputLabel>
                  <Select
                    name="Provincia"
                    value={formData.Provincia  || ''}
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
                  value={formData.ActividadComercial  || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Profesion"
                  label="Profesión"
                  fullWidth
                  margin="normal"
                  value={formData.Profesion  || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Tel1"
                  label="Teléfono"
                  fullWidth
                  margin="normal"
                  value={formData.Tel1  || 0}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="Celular"
                  label="Celular"
                  fullWidth
                  margin="normal"
                  value={formData.Celular  || 0}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Email1"
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={formData.Email1  || ''}
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
                  value={formData.FechaNac  || ''}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="FechaInicioAct"
                  label="Fecha de Inicio de Actividad"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={formData.FechaInicioAct  || ''}
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
                  value={formData.Comentarios  || ''}
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
          <Button onClick={handleSubmitEditar} color="secondary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Editar Cliente'}
          </Button>
        </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
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
