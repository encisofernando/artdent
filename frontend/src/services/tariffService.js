// src/services/tariffService.js
import api from './api';

const BASE = '/tariffs';

export const getTariffs = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener aranceles:', error);
    throw error.response?.data || error.message;
  }
};

export const getTariffById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener arancel ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createTariff = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear arancel:', error);
    throw error.response?.data || error.message;
  }
};

export const updateTariff = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar arancel ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteTariff = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar arancel ${id}:`, error);
    throw error.response?.data || error.message;
  }
};