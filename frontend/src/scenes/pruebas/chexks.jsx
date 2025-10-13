import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, TextField, Typography, Box, Button, Grid, MenuItem, Select, FormControl, Checkbox, FormControlLabel, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import { getAllTareas } from '../../config/TareasDB'; // Asegúrate de que la ruta sea correcta
import { getAllRoles } from '../../config/RolesDB'; // Asegúrate de que la ruta sea correcta
import { createEmpleado } from '../../config/EmpleadoDB';

const TeamForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [formData, setFormData] = useState({
    Nombre: '',
    Apellido: '',
    Email1: '',
    idRol: '', // ID del rol
    Rol: '', // Nombre del rol
    Perfil: '',
    Imagen: null,
    ImagenUrl: ''
  });
  const [permissions, setPermissions] = useState({});
  const [tareas, setTareas] = useState([]);
  const [initialPermissions, setInitialPermissions] = useState({});
  const [roles, setRoles] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Para la vista previa de la imagen

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const tareasData = await getAllTareas();
        setTareas(tareasData);
      // Inicializa permisos
      const initialPermissions = tareasData.reduce((acc, tarea) => {
        acc[tarea.idTarea] = true; // Inicializa como true o false según tu necesidad
        return acc;
      }, {});
      setPermissions(initialPermissions); // Establece el estado de permisos
      setInitialPermissions(initialPermissions); // Guarda los permisos iniciales para reiniciar
      } catch (error) {
        console.error("Error al cargar las tareas:", error);
      }
    };

    const fetchRoles = async () => {
      try {
        const rolesData = await getAllRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error al cargar los roles:", error);
      }
    };

    fetchTareas();
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Verifica si el campo que se está actualizando es el idRol
    if (name === "idRol") {
      // Encuentra el rol seleccionado
      const selectedRole = roles.find(rol => rol.idRol === value);
      
      // Actualiza el estado con el idRol y el nombre del rol
      setFormData((prevData) => ({
        ...prevData,
        idRol: value, // Guarda el idRol
        Rol: selectedRole ? selectedRole.Nombre : '' // Guarda el nombre del rol
      }));
    } else {
      // Para otros campos, usa el comportamiento por defecto
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };
  
  

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    const tareaId = tareas.find(tarea => tarea.Nombre === name)?.idTarea; // Aquí asegúrate de que nombre sea único
    
    if (tareaId) {
      setPermissions(prevPermissions => ({
        ...prevPermissions,
        [tareaId]: checked // Actualiza solo el permiso correspondiente
      }));
    }
  };


  const resetForm = () => {
    console.log("Reseteando el formulario...");
    console.log("Datos del formulario antes del reset:", formData);
    console.log("Permisos antes del reset:", permissions);
    
    setFormData({
      Nombre: '',
      Apellido: '',
      Email1: '',
      idRol: '',
      Rol: '',
      Perfil: '',
      Imagen: null,
      ImagenUrl: ''
    });
    
    // Restablece los permisos a su estado inicial
    setPermissions(initialPermissions); // Asegúrate de que initialPermissions tenga los valores deseados
    console.log("Datos del formulario después del reset:", formData);
    console.log("Permisos después del reset:", permissions);
    
    // Resetea la imagen y la vista previa de la imagen
    setImage(null); 
    setImagePreview(null);
};


  const groupTareasByCategory = (tareas) => {
    return tareas.reduce((acc, tarea) => {
      const category = tarea.Nombre.split(' ')[0];
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tarea);
      return acc;
    }, {});
  };

  const tareasGrouped = groupTareasByCategory(tareas);

  // Manejar cambio de imagen
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setImage(file); // Guarda el objeto de archivo directamente
        setImagePreview(URL.createObjectURL(file)); // Genera una URL para la vista previa
    }
};
  
const handleImageRemove = () => {
  setImage(null);
  setImagePreview(null); // Limpia la vista previa
};

const handleCancel = () => {
  resetForm(); // Reinicia el formulario
};

const handleSaveClick = async () => {
  const { Imagen, Nombre, ...dataToSend } = formData;
  console.log("Datos a enviar:", formData);
  if (!formData.Nombre || !formData.Apellido || !formData.Email1 || !formData.idRol) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const permisosArray = tareas.map(tarea => ({
    idTarea: tarea.idTarea,
    Nombre: tarea.Nombre,
    permitido: permissions[tarea.idTarea] || false
  })).filter(p => p.idTarea !== null);



  console.log("Datos a guardar:", formData, permisosArray);
  const formDataToSend = new FormData();
  formDataToSend.append('Nombre', Nombre);
  formDataToSend.append('Apellido', dataToSend.Apellido);
  formDataToSend.append('Email1', dataToSend.Email1);
  formDataToSend.append('idRol', dataToSend.idRol);
  formDataToSend.append('Rol', dataToSend.Rol);
  formDataToSend.append('Perfil', dataToSend.Perfil);
  formDataToSend.append('permissions', JSON.stringify(permisosArray));

  // Agregar la imagen si existe
  if (image) {
    formDataToSend.append('Imagen', image);
} else if (dataToSend.ImagenUrl) {
  formDataToSend.append('Imagen', dataToSend.ImagenUrl); // La imagen actual ya existente
}
console.log("Datos a enviar:", formDataToSend);
for (const pair of formDataToSend.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
}

  try {
      await createEmpleado(formDataToSend);
      alert('Empleado creado con éxito');
      // Solo resetea el formulario después de que se haya guardado con éxito
      resetForm(); // Resetea el formulario aquí
  } catch (error) {
      console.error("Error al guardar el empleado:", error);
      if (error.response) {
          console.error("Datos de respuesta del error:", error.response.data);
          console.error("Código de estado del error:", error.response.status);
      } else {
          console.error("Error de red o de configuración:", error.message);
      }
  }
};





  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" ml="20px" mt="20px">
        <Header title="EMPLEADOS" subtitle="Nuevo empleado" />
      </Box>

      <Card sx={{
        maxWidth: 800,
        margin: 'auto',
        padding: 3,
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        borderRadius: 2,
        bgcolor: '#f5f5f5',
        position: 'relative',
        color: '#333',
      }}>
        <CardHeader title="Datos del Empleado"  sx={{ textAlign: 'center' }} titleTypographyProps={{ variant: 'h5', fontWeight: 'bold', color: '#333' }} />
        <CardContent>
          <Grid container spacing={2}>

 {/* Foto del artículo */}
<Grid item xs={12} sm={6} sx={{ mb: 1, ml: 1 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
        Foto del Usuario
    </Typography>
    <Box display="flex" alignItems="center">
        <Button   variant="outlined" color='info' component="label"  sx={{ 
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
                     }}>
            Buscar Foto
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>
        {imagePreview && ( // Renderiza el botón solo si hay una foto cargada
            <Button variant="outlined" color="error" sx={{ ml: 2,
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
           }} onClick={handleImageRemove}>
                Quitar Foto
            </Button>
        )}
    </Box>
    {imagePreview && (
        <Box mt={2}>
            <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color: 'black' }}>
                Vista previa:
            </Typography>
            <img src={imagePreview} alt="Vista previa" style={{ maxWidth: '50%', maxHeight: '500px' }} />
        </Box>
    )}
</Grid>




            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" color="#333">Nombre *</Typography>
              <TextField
                name="Nombre"
                value={formData.Nombre}
                onChange={handleChange}
                fullWidth
                margin="dense"
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: 5,
                }}
                InputProps={{
                  style: { color: 'black' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" color="#333">Apellidos *</Typography>
              <TextField
                name="Apellido"
                value={formData.Apellido}
                onChange={handleChange}
                fullWidth
                margin="dense"
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: 5,
                }}
                InputProps={{
                  style: { color: 'black' },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" fontWeight="bold" color="#333">Correo Electrónico *</Typography>
              <TextField
                name="Email1"
                value={formData.Email1}
                onChange={handleChange}
                fullWidth
                margin="dense"
                type="email"
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: 5,
                }}
                InputProps={{
                  style: { color: 'black' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
  <FormControl fullWidth variant="outlined">
    <Typography variant="body2" fontWeight="bold" color="#333">Rol/Cargo *</Typography>
    <Select
      name="idRol" // Cambia esto a idRol
      value={formData.idRol} // Asegúrate de que aquí esté idRol
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
          color: 'black',
        },
      }}
      displayEmpty
    >
      <MenuItem value=""><em>Seleccione un tipo</em></MenuItem>
      {roles.map((rol) => (
        <MenuItem key={rol.idRol} value={rol.idRol}>
          {rol.Nombre}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>


            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <Typography variant="body2" fontWeight="bold" color="#333">Perfil *</Typography>
                <Select
                  name="Perfil"
                  value={formData.Perfil}
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
                      color: 'black',
                    },
                  }}
                  displayEmpty
                >
                  <MenuItem value=""><em>Seleccione un perfil</em></MenuItem>
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Limitado">Limitado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Sección de permisos */}
          {formData.Perfil === 'Limitado' && (
            <Box mt={3}>
              <Typography variant="h6" color="#1d7e00" fontWeight="bold" textAlign="center">Permisos</Typography>

              {/* Mostrar las tareas agrupadas por categoría */}
              {Object.keys(tareasGrouped).map((category) => (
                <Box key={category} mt={2}>
                  <Typography variant="h6" color="#da5e39" fontWeight="bold">{category}</Typography>
                  {tareasGrouped[category].map((tarea) => (
                    <FormControlLabel
                      key={tarea.idTarea} // Asumiendo que cada tarea tiene un ID único
                      control={
                        <Checkbox
                          checked={permissions[tarea.idTarea] || false} // Mantener el estado basado en el estado de permisos
                          onChange={handlePermissionChange}
                          name={tarea.Nombre} // Suponiendo que el nombre de la tarea es único
                          sx={{
                            '& .MuiSvgIcon-root': {
                              border: '1px solid black', // Borde negro para el checkbox
                            },
                          }}
                        />
                      }
                      label={tarea.Nombre} // Cambia esto a lo que desees mostrar
                    />
                  ))}
                </Box>
              ))}
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end" marginTop={3}>
            <Button onClick={handleSaveClick} variant="outlined" color="secondary" startIcon={<CheckIcon />}  sx={{ mr: 2,
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
           }}>
              Crear empleado
            </Button>
            <Button onClick={handleCancel} variant="outlined" color="error" startIcon={<CancelIcon />}  sx={{
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
           }}>
              Cancelar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamForm;

