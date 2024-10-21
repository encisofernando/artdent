import axios from 'axios';

const API_URL = 'http://localhost:3000/provincias'; // Asegúrate de que la URL sea correcta

// Obtener todas las categorías
export const getAllProvincias = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("Respuesta del backend:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

