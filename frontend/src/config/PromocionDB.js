import axios from 'axios';

const API_URL = 'http://localhost:3000/promocion'; // Asegúrate de que la URL sea correcta

// Obtener todas las promociones
export const getAllPromociones = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("Respuesta del backend:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Obtener una promoción por ID
export const getPromocionById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("Promoción obtenida:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la promoción
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Crear una nueva promoción
export const createPromocion = async (nuevaPromocion) => {
    try {
        const response = await axios.post(API_URL, nuevaPromocion);
        console.log("Promoción creada:", response.data); // Agregado para ver los datos
        return response.data; // Retorna la promoción creada
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Actualizar una promoción
export const updatePromocion = async (id, promocionActualizada) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, promocionActualizada);
        console.log("Promoción actualizada:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la promoción:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Eliminar una promoción
export const deletePromocion = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        console.log("Promoción eliminada:", response.data); // Agregado para ver los datos
        return response.data; // Retorna un mensaje de éxito
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};
