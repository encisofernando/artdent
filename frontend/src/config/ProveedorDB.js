import axios from 'axios';

const API_URL = 'http://localhost:3000/proveedor'; // Asegúrate de que la URL sea correcta

// Obtener todos los proveedores

export const getAllProveedores = async () => {
    try {
      const response = await axios.get(API_URL); // Cambia esta URL según tu API
      return response.data; // Asegúrate de que tu API devuelva un array de proveedores
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error; // Propaga el error para que pueda ser manejado en el componente
    }
  };


// Obtener un proveedor por ID
export const getProveedorById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("Proveedor obtenido:", response.data); // Agregado para ver los datos
        return response.data; // Retorna los datos del proveedor
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Crear un nuevo proveedor
export const createProveedor = async (nuevoProveedor) => {
    try {
        const response = await axios.post(API_URL, nuevoProveedor);
        console.log("Proveedor creado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna el proveedor creado
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Actualizar un proveedor
export const updateProveedor = async (id, proveedorActualizado) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, proveedorActualizado);
        console.log("Proveedor actualizado:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar el proveedor:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Eliminar un proveedor
export const deleteProveedor = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        console.log("Proveedor eliminado:", response.data); // Agregado para ver los datos
        return response.data; // Retorna un mensaje de éxito
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};
