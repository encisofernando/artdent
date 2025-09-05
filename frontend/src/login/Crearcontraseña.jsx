import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Importa useLocation
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { crearContraseña } from '../config/EmpleadoDB';

const CrearContraseña = ({ setIsAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    
    // Obtén el token de la URL
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const token = params.get('token'); // Obtén el token

    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (password !== confirmPassword) {
          setErrorMessage('Las contraseñas no coinciden');
          return;
      }
  
      try {
          const response = await crearContraseña({ token, nuevaContraseña: password });
          console.log('Respuesta de crear contraseña:', response);
  
          // Manejo del mensaje de éxito
          if (response && response.message) {
              setSuccessMessage(response.message);
              navigate('/');
          } else {
              setErrorMessage('Error al crear la contraseña');
          }
      } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error al crear la contraseña';
          setErrorMessage(errorMessage); // Mensaje adecuado
      }
  };
  
  
  

    return (
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f1327, #2e3844, #143f52)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <Container component="main" maxWidth="xs">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(6, 21, 41, 0.945)',
                backdropFilter: 'blur(10px)',
                padding: '40px 30px',
                borderRadius: '15px',
                boxShadow: '0 8px 30px rgb(0, 0, 0)',
                width: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1.8rem',
                  letterSpacing: '0.05em',  
                }}
              >
                Crear Contraseña
              </Typography>
              {errorMessage && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}
              {successMessage && (
                <Typography color="success" sx={{ mt: 2 }}>
                  {successMessage}
                </Typography>
              )}
              <Box component="form" noValidate sx={{ mt: 2, width: '100%' }} onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Nueva Contraseña"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  InputLabelProps={{
                    style: { color: '#fff' },
                    shrink: true,
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  sx={{
                    input: { color: '#fff' },
                    borderRadius: '30px',
                    fieldset: { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&:hover fieldset': { borderColor: '#fff' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  InputLabelProps={{
                    style: { color: '#fff' },
                    shrink: true,
                  }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  sx={{
                    input: { color: '#fff' },
                    borderRadius: '30px',
                    fieldset: { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&:hover fieldset': { borderColor: '#fff' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    color: '#000',
                    backgroundColor: '#ffffff',
                    padding: '6px 0',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    borderRadius: '30px',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#e2dbdb',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Crear Contraseña
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
    );
};

export default CrearContraseña;
