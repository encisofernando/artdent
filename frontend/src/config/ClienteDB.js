import axios from 'axios';

const API_URL = 'http://localhost:3000/clientes'; // Asegúrate de que la URL sea correcta

// Obtener todos los clientes
export const getAllClientes = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("Respuesta del backend:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Obtener un cliente por ID
export const getClienteById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("Cliente obtenido:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos del cliente
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Crear un nuevo cliente
export const createCliente = async (nuevoCliente) => {
    try {
        const response = await axios.post(API_URL, nuevoCliente);
        console.log("Cliente creado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna el cliente creado
    } catch (error) {
        console.error('Error al guardar cliente:', error.response.data);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Actualizar un cliente
export const updateCliente = async (id, clienteActualizado) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, clienteActualizado);
        console.log("Cliente actualizado:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar el cliente:", error.response ? error.response.data : error.message);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Eliminar un cliente
export const deleteCliente = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        console.log("Cliente eliminado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna un mensaje de éxito
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};
