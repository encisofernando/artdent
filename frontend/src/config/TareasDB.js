import axios from 'axios';

const API_URL = 'http://localhost:3000/tareas'; // Asegúrate de que la URL sea correcta

// Obtener todas las tareas
export const getAllTareas = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("Respuesta del backend:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener tareas:", error); // Muestra el error en la consola
        throw error; // Lanza el error para manejarlo en el componente
    }
};


// Asignar permisos a un usuario
export const asignarPermisos = async (idUsuario, permisos) => {
    try {
        const response = await axios.post(`${API_URL}/asignar-permisos`, { idUsuario, permisos });
        console.log("Respuesta al asignar permisos:", response.data);
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        console.error("Error al asignar permisos:", error);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Obtener permisos de un usuario
export const obtenerPermisos = async (idUsuario) => {
    try {
        const response = await axios.get(`${API_URL}/permisos/${idUsuario}`);
        console.log("Respuesta al obtener permisos:", response.data);
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        console.error("Error al obtener permisos:", error);
        throw error; // Lanza el error para manejarlo en el componente
    }
};