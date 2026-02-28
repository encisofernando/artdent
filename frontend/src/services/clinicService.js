// src/services/clinicService.js
// Servicio para la tabla 'clinics' (clientes del laboratorio)
import api from './api';

const BASE = '/clinics';

export const getClinics = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener clínicas:', error);
    throw error.response?.data || error.message;
  }
};

export const getClinicById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener clínica ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createClinic = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear clínica:', error);
    throw error.response?.data || error.message;
  }
};

export const updateClinic = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar clínica ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteClinic = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar clínica ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Alias para compatibilidad con código existente que usa "clients"
export const getClients = getClinics;
export const getClientById = getClinicById;
export const createClient = createClinic;
export const updateClient = updateClinic;
export const deleteClient = deleteClinic;