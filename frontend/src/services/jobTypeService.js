// src/services/jobTypeService.js
import api from './api';

const BASE = '/job-types';

export const getJobTypes = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de trabajos:', error);
    throw error.response?.data || error.message;
  }
};

export const getJobTypeById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener tipo de trabajo ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createJobType = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear tipo de trabajo:', error);
    throw error.response?.data || error.message;
  }
};

export const updateJobType = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar tipo de trabajo ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteJobType = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar tipo de trabajo ${id}:`, error);
    throw error.response?.data || error.message;
  }
};