// src/services/clientService.js
import api from './api';

const BASE = '/clients';

export const getClients = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error.response?.data || error.message;
  }
};

export const getClientById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cliente ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createClient = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error.response?.data || error.message;
  }
};

export const updateClient = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cliente ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteClient = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar cliente ${id}:`, error);
    throw error.response?.data || error.message;
  }
};