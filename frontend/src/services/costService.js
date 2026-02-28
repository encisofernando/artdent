// src/services/costService.js
import api from './api';

const BASE = '/costs';

export const getCosts = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener costos:', error);
    throw error.response?.data || error.message;
  }
};

export const getCostById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener costo ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createCost = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear costo:', error);
    throw error.response?.data || error.message;
  }
};

export const updateCost = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar costo ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteCost = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar costo ${id}:`, error);
    throw error.response?.data || error.message;
  }
};