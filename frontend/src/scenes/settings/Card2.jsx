import React, { useState } from 'react';
import { Card, CardContent, CardHeader, TextField, Typography, IconButton, Box, Grid, MenuItem, Select, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';



const Card2 = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        Direccion: 'Av. Dr. Néstor Kirchner 4935',
        Provincia: 'Formosa',
        Localidad: 'Pirane',
        Codigopostal: '3600',
        Telefono: 'Sin especificar',
        CodigoArea: '+54',
        Correoelectronico : 'Sin especificar',
        Sitioweb : 'Sin especificar',
      });

      const handleSaveClick = () => {
        // Aquí puedes manejar el guardado de cambios (por ejemplo, enviando los datos a un servidor)
        console.log("Cambios guardados:", formData);
        setIsEditing(false); // Oculta los botones de edición
      };
    
      const handleCancelClick = () => {
        setIsEditing(false); // Regresa al estado no editado
      };


      const handleEditClick = () => setIsEditing((prev) => !prev);


      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
      };

    

  return (
    <Card sx={{
        maxWidth: 800,
        margin: 'auto',
        padding: 3,
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        borderRadius: 2,
        bgcolor: '#f5f5f5', // Color de fondo del card
        position: 'relative',
        color: '#333', // Color de texto
      }}>
        <CardHeader
          title="Datos de contacto y ubicación"
          action={
            !isEditing && ( // Mostrar el ícono de editar solo si no está editando
              <IconButton onClick={handleEditClick} sx={{ position: 'absolute', top: 16, right: 16, color: '#ff9800' }}>
                <EditIcon />
              </IconButton>
            )
          } 
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold', color: '#333' }}
        />
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Direccion *
                </Typography>
                {isEditing ? (
                  <TextField
                    name="Direccion"
                    value={formData.Direccion}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    sx={{
                      width: '100%',
                      backgroundColor: '#ffffff', // Color de fondo del campo
                      borderRadius: 5,
                      color: 'black',
                    }}
                    InputProps={{
                      style: { color: 'black' },
                    }}
                  />
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Direccion}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Provincia *
                </Typography>
                {isEditing ? (
                 <Select
                 name="Provincia"
                 value={formData.Provincia}
                 onChange={handleChange}
                 fullWidth
                 margin="dense"
                 sx={{
                  marginTop: '8px',
                   width: '100%',
                   backgroundColor: '#ffffff',
                   borderRadius: 5,
                   color: 'black',
                   '& .MuiSelect-icon': {
                     color: 'black', // Cambia el color del ícono aquí
                   },
                 }}
                 displayEmpty
               >
                 <MenuItem value=""><em>Seleccione un tipo</em></MenuItem>
                 <MenuItem value="Formosa">Formosa</MenuItem>
                 <MenuItem value="Bs As">Bs As</MenuItem>
                 <MenuItem value="Entre rios">Entre rios</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Provincia}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Localidad *
                </Typography>
                {isEditing ? (
                 <Select
                 name="Localidad"
                 value={formData.Localidad}
                 onChange={handleChange}
                 fullWidth
                 margin="dense"
                 sx={{
                  marginTop: '8px',
                   width: '100%',
                   backgroundColor: '#ffffff',
                   borderRadius: 5,
                   color: 'black',
                   '& .MuiSelect-icon': {
                     color: 'black', // Cambia el color del ícono aquí
                   },
                 }}
                 displayEmpty
               >
                 <MenuItem value=""><em>Seleccione un tipo</em></MenuItem>
                 <MenuItem value="Apayerey">Apayerey</MenuItem>
                 <MenuItem value="Buena Vista">Buena Vista</MenuItem>
                 <MenuItem value="Pirane">Pirane</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Localidad}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Codigo Postal *
                </Typography>
                {isEditing ? (
                  <TextField
                    name="Codigopostal"
                    value={formData.Codigopostal}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    sx={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      borderRadius: 5,
                      color: 'black',
                    }}
                    InputProps={{
                      style: { color: 'black' },
                    }}
                  />
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Codigopostal}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                    Teléfono *
                </Typography>
                {isEditing ? (
                    <Grid container spacing={2} alignItems="center"> {/* Contenedor para el select y el input */}
                    <Grid item xs={4}> {/* Ajusta el tamaño del select según sea necesario */}
                        <Select
                        name="CodigoArea"
                        value={formData.CodigoArea} // Cambia a un nombre adecuado
                        onChange={handleChange}
                        fullWidth
                        margin="dense"
                        sx={{
                            marginTop: '8px',
                            backgroundColor: '#ffffff',
                            borderRadius: 5,
                            color: 'black',
                            '& .MuiSelect-icon': {
                            color: 'black',
                            },
                        }}
                        displayEmpty
                        >
                        <MenuItem value=""><em>Código de área</em></MenuItem>
                        <MenuItem value="+54">+54</MenuItem>
                        <MenuItem value="+22">+22</MenuItem>
                        <MenuItem value="+34">+34</MenuItem>
                        {/* Agrega más códigos de área según sea necesario */}
                        </Select>
                    </Grid>
                    <Grid item xs={8}> {/* Ajusta el tamaño del input según sea necesario */}
                        <TextField
                        name="Telefono" // Cambia a un nombre adecuado
                        value={formData.Telefono} // Cambia a un nombre adecuado
                        onChange={handleChange}
                        fullWidth
                        margin="dense"
                        sx={{
                            marginTop: '8px',
                            backgroundColor: '#ffffff',
                            borderRadius: 5,
                            color: 'black',
                        }}
                        InputProps={{
                            style: { color: 'black' },
                        }}
                        placeholder="Número de teléfono"
                        />
                    </Grid>
                    </Grid>
                ) : (
                    <Typography variant="body1" color="#333">
                    {`${formData.CodigoArea} ${formData.Telefono}`} {/* Muestra el teléfono completo */}
                    </Typography>
                )}
                </Grid>

  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Correo electrónico *
                </Typography>
                {isEditing ? (
                  <TextField
                    name="Correoelectronico"
                    value={formData.Correoelectronico}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    sx={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      borderRadius: 5,
                      color: 'black',
                    }}
                    InputProps={{
                      style: { color: 'black' },
                    }}
                  />
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Correoelectronico}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Sitio web *
                </Typography>
                {isEditing ? (
                  <TextField
                    name="Sitioweb"
                    value={formData.Sitioweb}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    sx={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      borderRadius: 5,
                      color: 'black',
                    }}
                    InputProps={{
                      style: { color: 'black' },
                    }}
                  />
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Sitioweb}
                  </Typography>
                )}
              </Grid>

            </Grid>
          </Box>

        {/* Botones de guardar y cancelar, aparecen cuando isEditing es true */}
        {isEditing && (
          <Box display="flex" justifyContent="flex-end" marginTop={3}>
            <Button onClick={handleSaveClick} variant="contained" color="secondary" startIcon={<CheckIcon />} sx={{ marginRight: 1 }}>
              Guardar cambios
            </Button>
            <Button onClick={handleCancelClick} variant="outlined" color="error" startIcon={<CancelIcon />}>
              Cancelar
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default Card2