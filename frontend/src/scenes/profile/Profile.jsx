import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Avatar, CardActionArea, Grid, Button, Box, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { getUserIdFromToken, getIdRolFromToken, getIdEmpleadoFromToken } from '../../auth/auth';
import { getUsuarioById } from '../../config/UsuarioDB'; // Asegúrate de importar tu función para obtener usuarios
import { getEmpleadoById } from '../../config/EmpleadoDB'; // Asegúrate de importar tu función para obtener empleados

const Profile = () => {
  const theme = useTheme();
  
  const idUsuario = getUserIdFromToken();
  console.log('id usuario: ', idUsuario)
  const idRol = getIdRolFromToken();
  console.log('id rol: ', idRol)

  const idEmpleado = getIdEmpleadoFromToken();
  console.log('id Empleado: ', idEmpleado)


  const [profileData, setProfileData] = useState(null); // Estado para almacenar los datos del perfil
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let data;
        // Si el rol es 1, solo traemos datos del usuario
        if (idRol === 1) {
          data = await getUsuarioById(idUsuario); // Obtener datos del usuario
        } else {
          data = await getEmpleadoById(idEmpleado); // Obtener datos del empleado
        }
        setProfileData(data); // Guardar los datos en el estado
      } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
      } finally {
        setLoading(false); // Terminar la carga
      }
    };

    fetchProfileData();
  }, [idUsuario, idRol, idEmpleado]); // Dependencias del useEffect

  // Si los datos están cargando, mostrar un mensaje de carga
  if (loading) {
    return <Typography align="center">Cargando...</Typography>;
  }

  // Si no se encontraron datos, mostrar un mensaje
  if (!profileData) {
    return <Typography align="center">No se encontraron datos del perfil.</Typography>;
  }

// Función para calcular la experiencia
 // Función para calcular la experiencia en años, meses y días
 const calcularExperiencia = (fechaIncAct) => {
  if (!fechaIncAct) return { years: 0, months: 0, days: 0 }; // Si no hay fecha, retorna 0

  const fechaInicio = new Date(fechaIncAct); // Convertir a objeto Date

  // Verifica si la fecha es válida
  if (isNaN(fechaInicio.getTime())) {
      console.error('Fecha inválida:', fechaIncAct);
      return { years: 0, months: 0, days: 0 }; // Retorna 0 si la fecha no es válida
  }

  const fechaActual = new Date(); // Fecha actual

  // Calcular la diferencia en años
  let years = fechaActual.getFullYear() - fechaInicio.getFullYear();
  let months = fechaActual.getMonth() - fechaInicio.getMonth();
  let days = fechaActual.getDate() - fechaInicio.getDate();

  // Ajustar los meses y años si es necesario
  if (days < 0) {
      months--;
      const lastMonth = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0); // Último día del mes anterior
      days += lastMonth.getDate(); // Agregar los días del mes anterior
  }

  if (months < 0) {
      years--;
      months += 12; // Aumentar meses al rango correcto
  }

  return { years, months, days }; // Retornar años, meses y días
};

const { years, months, days } = calcularExperiencia(profileData.FechaIncAct);


  // Renderizar el perfil con datos dinámicos
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}
    >
      <Card 
        sx={{
          maxWidth: 600,
          borderRadius: '16px',
          boxShadow: 5,
          transition: 'transform 0.3s',
          '&:hover': { transform: 'scale(1.05)', boxShadow: 8 },
          backgroundColor: theme.palette.background.default,
          padding: '20px',
        }}
      >
        <CardActionArea>
          <CardContent>
            <Box display="flex" justifyContent="center" mt={2}>
              <Avatar 
                alt="Profile Picture" 
                src={profileData.Imagen || "https://via.placeholder.com/150"} // Asumiendo que 'imagen' es una propiedad de tu objeto de perfil
                sx={{ width: 150, height: 150 }}
                component={motion.div}
                whileHover={{ scale: 1.1 }}
              />
            </Box>
            <Typography variant="h4" component="div" align="center" sx={{ marginTop: 2, color: theme.palette.primary.main }}>
              {profileData.Nombre || "Nombre no disponible"}
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: theme.palette.text.primary }}>
              {profileData.Rol || "Cargo no disponible"}
            </Typography>
            <Typography variant="subtitle2" align="center" sx={{ color: theme.palette.secondary.main }}>
              {profileData.NomComercial || "Empresa no disponible"}
            </Typography>
            
            <Divider sx={{ marginY: 3 }} />
            <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', marginBottom: 2 }}>
              "{profileData.Comentarios || 'Descripción no disponible'}"
            </Typography>

            <Grid container spacing={2} sx={{ marginTop: 3 }}>
              <Grid item xs={6}>
              <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                <strong>
                  {profileData.idRol === 1 ? 'Email:' : 'Email1:'} {/* Asegúrate de usar el valor correcto para idRol */}
                </strong> 
                {profileData.idRol === 1 ? profileData.Email || "Email no disponible" : profileData.Email1 || "Email1 no disponible"}
              </Typography>

              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Teléfono:</strong> {profileData.Celular || "Teléfono no disponible"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Ubicación:</strong> {profileData.Direccion || "Ubicación no disponible"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
              <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Experiencia:</strong> {years > 0 ? `${years} años, ${months} meses y ${days} días` : "0+ años"}
              </Typography>
              </Grid>
            </Grid>

         

            <Box display="flex" justifyContent="center" mt={3}>
              <Button 
                variant="contained" 
                color="primary"
                component={motion.div}
                whileHover={{ scale: 1.2, backgroundColor: theme.palette.secondary.main }}
                whileTap={{ scale: 0.95 }}
                sx={{ paddingX: 5 }}
              >
                Modificar
              </Button>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
};

export default Profile;
