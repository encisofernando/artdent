import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Collapse,
} from '@mui/material';
import { tokens } from '../../theme';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { getAllTareas } from '../../config/TareasDB'; // Importa el servicio de tareas

// Datos estáticos de ejemplo
const roles = [
  { idRol: 1, Nombre: 'Administrador' },
  { idRol: 2, Nombre: 'Editor' },
  { idRol: 3, Nombre: 'Lector' },
];

const Permisos = ({ open, onClose, onSave }) => {
  const [tasks, setTasks] = useState([]); // Estado para almacenar las tareas del backend
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Obtener tareas desde el backend
  const fetchTasks = async () => {
    try {
      const data = await getAllTareas(); // Llamada al backend
      setTasks(data); // Guardar las tareas obtenidas en el estado
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    }
  };

  useEffect(() => {
    fetchTasks(); // Llama a la función al montar el componente
  }, []);

  const handleTogglePermission = (roleId, taskId) => {
    setSelectedPermissions((prevPermissions) => {
      const newPermissions = { ...prevPermissions };

      if (!newPermissions[roleId]) {
        newPermissions[roleId] = [];
      }

      if (newPermissions[roleId].includes(taskId)) {
        newPermissions[roleId] = newPermissions[roleId].filter((id) => id !== taskId);
      } else {
        newPermissions[roleId] = [...newPermissions[roleId], taskId];
      }

      return newPermissions;
    });
  };

  const handleSave = () => {
    onSave(selectedPermissions);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ backgroundColor: colors.primary[400], textAlign: "center", fontSize: "1.5rem", color: colors.grey[100] }}>
        Asignar permisos a roles
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: colors.primary[500], padding: '16px' }}>
        <Grid container spacing={2}>
          {roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role.idRol}>
              <Card variant="outlined" sx={{
                backgroundColor: colors.grey[900],
                border: `1px solid ${colors.grey[600]}`,
                transition: '0.3s',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 20 }
              }}>
                <CardContent sx={{ color: colors.grey[100] }}>
                  <Typography variant="h6" gutterBottom>
                    {role.Nombre}
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: colors.grey[600] }} />
                  <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                    {tasks.map((task) => (
                      <Collapse in={true} key={`${role.idRol}-${task.idTarea}`} timeout={500}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedPermissions[role.idRol]?.includes(task.idTarea) || false}
                              onChange={() => handleTogglePermission(role.idRol, task.idTarea)}
                              sx={{
                                color: colors.grey[400],
                                '&.Mui-checked': {
                                  color: '#4CAF50',
                                  '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  },
                                },
                              }}
                            />
                          }
                          label={<Typography variant="body2" style={{ color: colors.grey[300] }}>{task.Nombre}</Typography>}
                          sx={{ mb: 1 }}
                        />
                      </Collapse>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
        <Button startIcon={<CancelIcon />} onClick={handleClose} color="error" variant="contained" sx={{ mt: 2 }}>
          Cancelar
        </Button>
        <Button startIcon={<SaveIcon />} onClick={handleSave} color="secondary" variant="contained" sx={{ mt: 2 }}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Permisos;
