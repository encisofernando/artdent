import axios from 'axios';

const API_URL = 'http://localhost:3000/empleados'; // Actualiza la URL para apuntar a la ruta correcta

// Obtener permisos de un usuario específico
export const getUserPermissions = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}/permisos`); // Cambia la ruta según lo que hayas definido
        console.log("Permisos del usuario:", response.data); // Ver los datos en la consola
        return response.data; // Retorna los permisos
    } catch (error) {
        console.error("Error al obtener permisos:", error);
        throw error;
    }
};