import axios from 'axios';
import { getIdBaseFromToken } from '../auth/auth'

const API_URL = 'http://localhost:3000/articulos'; // Asegúrate de que la URL sea correcta

// Obtener todos los artículos
export const getAllArticulos = async () => {
    try {
        const token = localStorage.getItem('token'); // Obtiene el token del localStorage
        const idBase = getIdBaseFromToken(); // Obtiene el idBase del token

        const response = await axios.get(`${API_URL}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                idBase // Envía idBase como un parámetro de consulta
            }
        });

        console.log("Artículos obtenidos:", response.data); // Para depuración
        return response.data; // Retorna los artículos obtenidos
    } catch (error) {
        console.error('Error al obtener artículos:', error.response ? error.response.data : error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Obtener un artículo por ID
export const getArticuloById = async (id) => {
    try {
        const token = localStorage.getItem('token'); // Obtiene el token del localStorage
        const idBase = getIdBaseFromToken(); // Obtiene el idBase del token

        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                idBase // Envía idBase como un parámetro de consulta
            }
        });

        console.log("Artículo obtenido:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos del artículo
    } catch (error) {
        console.error('Error al obtener el artículo:', error.response ? error.response.data : error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};


// Crear un nuevo artículo
export const createArticulo = async (formData) => {
    try {
        const token = localStorage.getItem('token'); // Obtiene el token del localStorage
        const idBase = getIdBaseFromToken(); // Obtiene el idBase del token

        // Agregar idBase a FormData
        formData.append('idBase', idBase);

        const response = await axios.post(API_URL, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // Asegúrate de establecer el tipo de contenido correcto
            }
        });

        console.log("Artículo creado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna el artículo creado
    } catch (error) {
        console.error('Error al guardar artículo:', error.response ? error.response.data : error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};




// Actualizar un artículo
export const updateArticulo = async (id, formData, idBase) => {
    // Agrega el idBase al formData
    

    try {
        const token = localStorage.getItem('token'); // Obtiene el token del localStorage
        const idBase = getIdBaseFromToken(); // Obtiene el idBase del token

        formData.append('idBase', idBase); // Asegúrate de que idBase sea una cadena

        const response = await axios.put(`${API_URL}/${id}`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("Artículo actualizado:", response.data);
        return response.data; 
    } catch (error) {
        console.error("Error al actualizar el artículo:", error.response ? error.response.data : error.message);
        throw error; // Maneja el error
    }
};


// Eliminar un artículo
export const deleteArticulo = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        console.log("Artículo eliminado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna un mensaje de éxito
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};


export const toggleArticulo = async (id) => {
    try {
        // Llama a la API para cambiar el estado de la articulo
        const response = await axios.patch(`${API_URL}/${id}/toggle`);
        return response.data; // Devuelve la respuesta de la API
    } catch (error) {
        console.error("Error al cambiar el estado de la articulo:", error);
        throw error; // Lanza el error para que pueda ser manejado en el componente
    }
};

