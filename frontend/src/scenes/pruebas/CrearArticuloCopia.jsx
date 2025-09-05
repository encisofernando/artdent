import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const Settings = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('https://via.placeholder.com/150'); // Imagen por defecto
  const [cuit, setCuit] = useState("CUIT"); // Estado para el CUIT

  const empresaData = {
    nombre: "Eliar Multirubro",
    nombreComercial: "Sin especificar",
    tipoIdentificacion: "CUIT",
    identificacion: "20402155168",
    condicionIVA: "Monotributo",
    fechaInicioActividades: "01/07/2018",
    direccion: "Av. Dr. Néstor Kirchner 4935",
    provincia: "Formosa",
    localidad: "Formosa",
    codigoPostal: "3600",
    telefono: "Sin especificar",
    correoElectronico: "Sin especificar",
    sitioWeb: "Sin especificar",
  };

  const datosAdicionales = {
    condicionIIBB: "Local (Provincial o CABA)",
    numeroIIBB: "607300",
    numeroEmpleados: "1 a 10",
    moneda: "ARS - Argentina Peso",
    sector: "Sin especificar",
    precisionDecimal: "2",
    separadorDecimal: ". (Punto)",
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSnackbarMessage('Cambios guardados con éxito');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 1500, marginTop: 10, mx: 'auto', p: 3, backgroundColor: '#f7f7f7', borderRadius: '8px', boxShadow: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2, color: '#3f51b5', fontWeight: 'bold', textAlign: 'center' }}>
        Configuraciones de Empresa
      </Typography>

      {/* Datos de identificación */}
      <Card sx={{ mb: 4, backgroundColor: '#ffffff', color: 'black', borderRadius: '8px', boxShadow: 1 }}>
        <CardHeader
          title="Datos de Identificación"
          action={
            <Button variant="contained" color="primary" size="small" onClick={handleEditClick}>
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  style={{ width: '150px', height: '150px', borderRadius: '8px', marginBottom: '10px', objectFit: 'cover', border: '1px solid #ccc' }}
                />
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <IconButton color="primary" component="span" sx={{ position: 'absolute' }}>
                  <PhotoCamera />
                </IconButton>
              </label>
            </Grid>
            <Grid item xs={12} sm={8}>
              {Object.entries(empresaData).filter(([key]) => !['direccion', 'provincia', 'localidad', 'codigoPostal', 'telefono', 'correoElectronico', 'sitioWeb'].includes(key)).map(([key, value]) => (
                <Grid item xs={12} key={key}>
                  {key === 'tipoIdentificacion' && isEditing ? (
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel>Tipo de Identificación</InputLabel>
                      <Select
                        value={cuit}
                        onChange={(e) => setCuit(e.target.value)} // Actualizar estado del CUIT
                        label="Tipo de Identificación"
                      >
                        <MenuItem value="CUIT">CUIT</MenuItem>
                        <MenuItem value="CUIL">CUIL</MenuItem>
                        <MenuItem value="DNI">DNI</MenuItem>
                        <MenuItem value="Otro">Otro</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body1" sx={{ mb: 2, color: 'black' }}>
                      <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {key === 'tipoIdentificacion' ? cuit : value}
                    </Typography>
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Datos de contacto y ubicación */}
      <Card sx={{ mb: 4, backgroundColor: '#ffffff', color: 'black', borderRadius: '8px', boxShadow: 1 }}>
        <CardHeader
          title="Datos de Contacto y Ubicación"
          action={
            <Button variant="contained" color="primary" size="small" onClick={handleEditClick}>
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                {Object.entries(empresaData).filter(([key]) => ['direccion', 'provincia', 'localidad', 'codigoPostal', 'telefono', 'correoElectronico', 'sitioWeb'].includes(key)).map(([key, value]) => (
                  <Grid item xs={4} key={key}>
                    {isEditing ? (
                      <TextField
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        value={value}
                        fullWidth
                        onChange={(e) => {
                          empresaData[key] = e.target.value; // Actualizar valor en modo de edición
                        }}
                        sx={{
                          mb: 2,
                          '& .MuiInputBase-input': { color: 'black' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black',
                            },
                            '&:hover fieldset': {
                              borderColor: 'black',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'black',
                          },
                          backgroundColor: 'white',
                        }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ mb: 2, color: 'black' }}>
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {value}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Datos adicionales */}
      <Card sx={{ mb: 4, backgroundColor: '#ffffff', color: 'black', borderRadius: '8px', boxShadow: 1 }}>
        <CardHeader
          title="Datos Adicionales"
          action={
            <Button variant="contained" color="primary" size="small" onClick={handleEditClick}>
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                {Object.entries(datosAdicionales).map(([key, value]) => (
                  <Grid item xs={4} key={key}>
                    {isEditing ? (
                      <TextField
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        value={value}
                        fullWidth
                        onChange={(e) => {
                          datosAdicionales[key] = e.target.value; // Actualizar valor en modo de edición
                        }}
                        sx={{
                          mb: 2,
                          '& .MuiInputBase-input': { color: 'black' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black',
                            },
                            '&:hover fieldset': {
                              borderColor: 'black',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'black',
                          },
                          backgroundColor: 'white',
                        }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ mb: 2, color: 'black' }}>
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {value}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
