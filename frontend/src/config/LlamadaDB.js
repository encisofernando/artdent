import axios from 'axios';

const API_URL = 'http://localhost:3000/articulos'; // Asegúrate de que la URL sea correcta

// Obtener todos los artículos
export const getAllArticulos = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("Respuesta del backend:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Obtener un artículo por ID
export const getArticuloById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("Artículo obtenido:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos del artículo
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Crear un nuevo artículo
export const createArticulo = async (nuevoArticulo) => {
    try {
        const response = await axios.post(API_URL, nuevoArticulo);
        console.log("Artículo creado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna el artículo creado
    } catch (error) {
        console.error('Error al guardar artículo:', error.response.data);
    }
};



// Actualizar un artículo
export const updateArticulo = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, formData, {
            headers: {
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


