import axios from 'axios';
import { getIdBaseFromToken } from '../auth/auth';

const API_URL = 'http://localhost:3000/empresas'; // Asegúrate de que la URL sea correcta

// Obtener todas las empresas
export const getAllEmpresas = async () => {
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

        return response.data; // Retorna los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Obtener una empresa por ID
export const getEmpresaById = async (id) => {
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

        return response.data; // Retorna los datos de la empresa
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Crear una nueva empresa
export const createEmpresa = async (nuevaEmpresa) => {
    try {
        const response = await axios.post(API_URL, nuevaEmpresa);
        console.log("Empresa creada:", response.data); // Agregado para ver los datos
        return response.data; // Retorna la empresa creada
    } catch (error) {
        console.error('Error al guardar la empresa:', error.response.data);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Actualizar una empresa
export const updateEmpresa = async (id, formData) => {
    try {
        const token = localStorage.getItem('token'); // Obtiene el token del localStorage
        const idBase = getIdBaseFromToken(); // Obtiene el idBase del token

        formData.append('idBase', idBase); // Asegúrate de que idBase sea una cadena
        console.log("FormData antes del envío:", Object.fromEntries(formData.entries()));

        const response = await axios.put(`${API_URL}/${id}`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("Artículo actualizado:", response.data);
        return response.data; 

    } catch (error) {
      console.error("Error al actualizar la empresa:", error.response ? error.response.data : error.message);
      throw error;
    }
};


  

// Nota: No hay función para eliminar empresa en este servicio.

