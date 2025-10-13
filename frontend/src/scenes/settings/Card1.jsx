import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, TextField, Typography, IconButton, Avatar, Box, Grid, MenuItem, Select, Button, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import { tokens } from '../../theme';

const Card1 = ({isSidebarCollapsed}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        image: 'https://via.placeholder.com/80',
        name: 'Eliar Multirubro',
        tradeName: 'Nombre comercial',
        idType: 'CUIT',
        idNumber: '20402155168',
        taxCondition: 'Monotributo',
        startDate: '01/07/2018',
      });

      

      const handleSaveClick = () => {
        // Aquí puedes manejar el guardado de cambios (por ejemplo, enviando los datos a un servidor)
        console.log("Cambios guardados:", formData);
        setIsEditing(false); // Oculta los botones de edición
      };
    
      const handleCancelClick = () => {
        setIsEditing(false); // Regresa al estado no editado
      };

      const fileInputRef = useRef(null); // Crear una referencia para el input de archivo

      const handleEditClick = () => setIsEditing((prev) => !prev);


      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
      };

      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData((prevData) => ({ ...prevData, image: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      };
    

  return (
    <Box>
    <Typography variant="h3" fontWeight="bold" color={colors.text.primary} mt={2} ml={53} mb={1}> {/* Margen superior si lo necesitas */}
      Configurar empresa
      </Typography>
      <Typography variant="h5" color={colors.text.primary} mt={1} ml={53} mb={3}> {/* Margen superior si lo necesitas */}
      Personalizá la información de tu empresa.
      </Typography>

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
         title="Datos de Identificación"
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
          <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
              src={formData.image}
              alt="Identificación"
              sx={{
                width: 100,
                height: 100,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                bgcolor: '#e0e0e0',
              }}
            />
              {isEditing && (
                <IconButton
                  onClick={() => fileInputRef.current.click()} // Abrir el input de archivo al hacer clic en el ícono
                  sx={{ marginTop: 1, color: '#000000' }} // Ajustar el margen superior para un espaciado adecuado
                >
                  <AddAPhotoIcon />
                </IconButton>
                  
              )}  
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }} // Ocultar el input de archivo
                accept="image/*" // Aceptar solo imágenes
                onChange={handleImageChange}
              />
            </Box>
            <Grid container spacing={2}>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                  Nombre *
                </Typography>
                {isEditing ? (
                  <TextField
                    name="name"
                    value={formData.name}
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
                    {formData.name}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                  Nombre comercial
                </Typography>
                {isEditing ? (
                  <TextField
                    name="tradeName"
                    value={formData.tradeName}
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
                    {formData.tradeName}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                  Tipo de identificación *
                </Typography>
                {isEditing ? (
                 <Select
                 name="idType"
                 value={formData.idType}
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
                    {formData.idType}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                  Identificación *
                </Typography>
                {isEditing ? (
                  <TextField
                    name="idNumber"
                    value={formData.idNumber}
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
                    {formData.idNumber}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                  Condición de IVA *
                </Typography>
                {isEditing ? (
                  <Select
                    name="taxCondition"
                    value={formData.taxCondition}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    sx={{
                      marginTop: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: 5,
                      color: 'black',
                   '& .MuiSelect-icon': {
                     color: 'black', // Cambia el color del ícono aquí
                   },
                    }}
                    displayEmpty
                  >
                    <MenuItem value=""><em>Seleccione una condición</em></MenuItem>
                    <MenuItem value="Monotributo">Monotributo</MenuItem>
                    <MenuItem value="Responsable Inscripto">Responsable Inscripto</MenuItem>
                    <MenuItem value="Exento">Exento</MenuItem>
                  </Select>
                ) : (
                  <Typography variant="body1" color="#333">
                    {formData.taxCondition}
                  </Typography>
                )}
              </Grid>
  
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold" color="#333">
                  Fecha de inicio de actividades *
                </Typography>
                {isEditing ? (
                  <TextField
                    type="date"
                    name="startDate"
                    value={formData.startDate}
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
                    {formData.startDate}
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
    </Box>
  )
}

export default Card1