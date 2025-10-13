// 📁 src/scenes/equipo/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Avatar, CardActionArea, Grid, Button, Box, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Employees, Users } from '../../services';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const theme = useTheme();
  const token = localStorage.getItem("token");
  let idUsuario = null, idRol = null, idEmpleado = null;
  try {
    const decoded = token ? jwtDecode(token) : null;
    idUsuario = decoded?.id || decoded?.user_id || null;
    idRol = decoded?.idRol || decoded?.role_id || decoded?.role || null;
    idEmpleado = decoded?.idEmpleado || decoded?.employee_id || null;
  } catch {}

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let data;
        if (Number(idRol) === 1 && idUsuario) data = await Users.getUser(idUsuario);
        else if (idEmpleado) data = await Employees.getEmployee(idEmpleado);
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
    const now = new Date();
    let years = now.getFullYear() - fechaInicio.getFullYear();
    let months = now.getMonth() - fechaInicio.getMonth();
    let days = now.getDate() - fechaInicio.getDate();
    if (days < 0) { months--; const lm = new Date(now.getFullYear(), now.getMonth(), 0); days += lm.getDate(); }
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
              <Avatar alt="Profile Picture" src={profileData.Imagen || "https://via.placeholder.com/150"} sx={{ width: 150, height: 150 }} component={motion.div} whileHover={{ scale: 1.1 }} />
            </Box>
            <Typography variant="h4" component="div" align="center" sx={{ mt: 2, color: theme.palette.primary.main }}>
              {profileData.Nombre || "Nombre no disponible"}
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: theme.palette.text.primary }}>
              {profileData.Rol || "Cargo no disponible"}
            </Typography>
            <Typography variant="subtitle2" align="center" sx={{ color: theme.palette.secondary.main }}>
              {profileData.NomComercial || "Empresa no disponible"}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', mb: 2 }}>
              "{profileData.Comentarios || 'Descripción no disponible'}"
            </Typography>
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Email:</strong> {profileData.Email || profileData.Email1 || "Email no disponible"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary }}>
                  <strong>Teléfono:</strong> {profileData.Celular || profileData.Tel1 || "Teléfono no disponible"}
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
