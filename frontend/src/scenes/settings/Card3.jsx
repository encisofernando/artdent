import React, { useState } from 'react';
import { Card, CardContent, CardHeader, TextField, Typography, IconButton, Box, Grid, MenuItem, Select, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';




const Card3 = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        CondicionIIBB: 'CUIT', // Cambiar a un valor válido
        NumerodeIIBB: '607300',
        Numerodeempleados: '1 a 10',
        Moneda: 'ARS - Argentina Peso',
        Sector: 'Sin especificar',
        Precisiondecimal: '2',
        Separadordecimal: '. (Punto)',
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
        marginBottom: 5, // Margen inferior de 2 (puedes ajustar el valor)
      }}>
        <CardHeader
          title="Datos adicionales"
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
          <Box display="flex" alignItems="flex-start"  gap={3}>
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Condición IIBB*
                </Typography>
                {isEditing ? (
                 <Select
                 name="CondicionIIBB"
                 value={formData.CondicionIIBB}
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
                 <MenuItem value="CUIT">CUIT</MenuItem>
                 <MenuItem value="DNI">DNI</MenuItem>
                 <MenuItem value="Pasaporte">Pasaporte</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.CondicionIIBB}
                  </Typography>
                )}
              </Grid>


              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Número de IIBB*
                </Typography>
                {isEditing ? (
                  <TextField
                    name="NumerodeIIBB"
                    value={formData.NumerodeIIBB}
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
                    {formData.NumerodeIIBB}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Número de empleados *
                </Typography>
                {isEditing ? (
                 <Select
                 name="Numerodeempleados"
                 value={formData.Numerodeempleados}
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
                <MenuItem value="1 a 10">1 a 10</MenuItem>
                <MenuItem value="11 a 50">11 a 50</MenuItem>
                <MenuItem value="51 a 100">51 a 100</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Numerodeempleados}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Moneda*
                </Typography>
                {isEditing ? (
                 <Select
                 name="Moneda"
                 value={formData.Moneda}
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
                    <MenuItem value="ARS - Argentina Peso">ARS - Argentina Peso</MenuItem>
                    <MenuItem value="USD - Dólar">USD - Dólar</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Moneda}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Sector *
                </Typography>
                {isEditing ? (
                 <Select
                 name="Sector"
                 value={formData.Sector}
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
                    <MenuItem value="Sin especificar">Sin especificar</MenuItem>
                    <MenuItem value="Sector 1">Sector 1</MenuItem>
                    <MenuItem value="Sector 2">Sector 2</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Sector}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Precisión decimal*
                </Typography>
                {isEditing ? (
                 <Select
                 name="Precisiondecimal"
                 value={formData.Precisiondecimal}
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
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Precisiondecimal}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                Separador decimal
                </Typography>
                {isEditing ? (
                 <Select
                 name="Separadordecimal"
                 value={formData.Separadordecimal}
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
                        <MenuItem value=". (Punto)">. (Punto)</MenuItem>
                        <MenuItem value=", (Coma)">, (Coma)</MenuItem>
               </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.Separadordecimal}
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

export default Card3