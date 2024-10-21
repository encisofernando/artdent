import axios from 'axios';

const API_URL = 'http://localhost:3000/categoria'; // Asegúrate de que la URL sea correcta

// Obtener todas las categorías
export const getAllCategorias = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("Respuesta del backend:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Obtener una categoría por ID
export const getCategoriaById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("Categoría obtenida:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la categoría
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Crear una nueva categoría
export const createCategoria = async (nuevaCategoria) => {
    try {
        const response = await axios.post(API_URL, nuevaCategoria);
        console.log("Categoría creada:", response.data); // Agregado para ver los datos
        return response.data; // Retorna la categoría creada
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Actualizar una categoría
export const updateCategoria = async (id, categoriaActualizada) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, categoriaActualizada);
        console.log("Categoría actualizada:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la categoría:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Eliminar una categoría
export const deleteCategoria = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        console.log("Categoría eliminada:", response.data); // Agregado para ver los datos
        return response.data; // Retorna un mensaje de éxito
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};
