import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Avatar, CardActionArea, Grid, Button, Box, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { getUserIdFromToken, getIdRolFromToken, getIdEmpleadoFromToken } from '../../auth/auth';
import { Users, Employees } from '../../services';

const Profile = () => {
  const theme = useTheme();
  
  const idUsuario = getUserIdFromToken();
  const idRol = getIdRolFromToken();
  const idEmpleado = getIdEmpleadoFromToken();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let data;
        if (Number(idRol) === 1 && idUsuario) {
          data = await Users.getUser(idUsuario);
        } else if (idEmpleado) {
          data = await Employees.getEmployee(idEmpleado);
        }
        setProfileData(data);
      } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [idUsuario, idRol, idEmpleado]);

  if (loading) return <Typography align="center">Cargando...</Typography>;
  if (!profileData) return <Typography align="center">No se encontraron datos del perfil.</Typography>;

  const calcularExperiencia = (fechaIncAct) => {
    if (!fechaIncAct) return { years: 0, months: 0, days: 0 };
    const fechaInicio = new Date(fechaIncAct);
    if (isNaN(fechaInicio.getTime())) return { years: 0, months: 0, days: 0 };
    const fechaActual = new Date();
    let years = fechaActual.getFullYear() - fechaInicio.getFullYear();
    let months = fechaActual.getMonth() - fechaInicio.getMonth();
    let days = fechaActual.getDate() - fechaInicio.getDate();
    if (days < 0) { months--; const lastMonth = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0); days += lastMonth.getDate(); }
    if (months < 0) { years--; months += 12; }
    return { years, months, days };
  };
  const { years, months, days } = calcularExperiencia(profileData.FechaIncAct);

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <Card sx={{ maxWidth: 600, borderRadius: '16px', boxShadow: 5, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: 8 }, backgroundColor: theme.palette.background.default, padding: '20px' }}>
        <CardActionArea>
          <CardContent>
            <Box display="flex" justifyContent="center" mt={2}>
              <Avatar alt="Profile Picture" src={profileData.Imagen || profileData.image_url || "https://via.placeholder.com/150"} sx={{ width: 150, height: 150 }} component={motion.div} whileHover={{ scale: 1.1 }} />
            </Box>
            <Typography variant="h4" component="div" align="center" sx={{ mt: 2, color: theme.palette.primary.main }}>
              {profileData.Nombre || profileData.name || "Nombre no disponible"}
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: theme.palette.text.primary }}>
              {profileData.Rol || profileData.role_name || "Cargo no disponible"}
            </Typography>
            <Typography variant="subtitle2" align="center" sx={{ color: theme.palette.secondary.main }}>
              {profileData.NomComercial || profileData.company_name || "Empresa no disponible"}
            </Typography>

            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', mb: 2 }}>
              "{profileData.Comentarios || profileData.notes || 'Descripción no disponible'}"
            </Typography>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Email:</strong> {profileData.Email || profileData.Email1 || profileData.email || "Email no disponible"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Teléfono:</strong> {profileData.Celular || profileData.Tel1 || profileData.phone || "Teléfono no disponible"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Ubicación:</strong> {profileData.Direccion || profileData.address || "Ubicación no disponible"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Experiencia:</strong> {years > 0 ? `${years} años, ${months} meses y ${days} días` : "0+ años"}
                </Typography>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="center" mt={3}>
              <Button variant="contained" color="primary" component={motion.div} whileHover={{ scale: 1.2, backgroundColor: theme.palette.secondary.main }} whileTap={{ scale: 0.95 }} sx={{ px: 5 }}>
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
