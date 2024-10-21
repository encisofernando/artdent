import axios from 'axios';

const API_URL = 'http://localhost:3000/iva'; // Asegúrate de que la URL sea correcta

// Obtener todos los registros de IVA
export const getAllIvas = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("Respuesta del backend:", response.data); // Ver los datos recibidos
        return response.data; // Retorna los datos de los IVAs
    } catch (error) {
        throw error; // Maneja el error
    }
};

// Obtener un registro de IVA por ID
export const getIvaById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("IVA obtenido:", response.data); // Ver los datos recibidos
        return response.data; // Retorna los datos del IVA
    } catch (error) {
        throw error; // Maneja el error
    }
};

// Crear un nuevo registro de IVA
export const createIva = async (nuevoIva) => {
    try {
        const response = await axios.post(API_URL, nuevoIva);
        console.log("IVA creado:", response.data); // Ver los datos recibidos
        return response.data; // Retorna el IVA creado
    } catch (error) {
        throw error; // Maneja el error
    }
};

// Actualizar un registro de IVA
export const updateIva = async (id, ivaActualizado) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, ivaActualizado);
        console.log("IVA actualizado:", response.data); // Ver los datos recibidos
        return response.data; // Retorna el IVA actualizado
    } catch (error) {
        console.error("Error al actualizar el IVA:", error.response ? error.response.data : error.message);
        throw error; // Maneja el error
    }
};

// Eliminar un registro de IVA
export const deleteIva = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        console.log("IVA eliminado:", response.data); // Ver los datos recibidos
        return response.data; // Retorna un mensaje de éxito
    } catch (error) {
        throw error; // Maneja el error
    }
};
