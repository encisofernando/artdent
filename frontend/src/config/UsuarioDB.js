import axios from 'axios';

const API_URL = 'http://localhost:3000/usuarios'; // Asegúrate de que la URL sea correcta

// Registrar un nuevo usuario
export const registerUsuario = async (nuevoUsuario) => {
    try {
        const response = await axios.post(`${API_URL}/register`, nuevoUsuario);
        console.log("Usuario registrado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna el usuario registrado
    } catch (error) {
        console.error('Error al registrar usuario:', error.response ? error.response.data : error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Iniciar sesión
export const login = async (credenciales) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credenciales);
        console.log("Usuario autenticado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos del usuario autenticado, incluyendo el token
    } catch (error) {
        console.error('Error al iniciar sesión:', error.response ? error.response.data : error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};


// Obtener un usuario por ID
export const getUsuarioById = async (idUsuario) => {
    const token = localStorage.getItem('token'); // Obtiene el token del local storage
    try {
        const response = await axios.get(`${API_URL}/${idUsuario}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Enviar el token de autenticación
            },
        });
        return response.data; // Retorna los datos del usuario
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        throw error; // Propagar el error para manejarlo en el componente
    }
};


