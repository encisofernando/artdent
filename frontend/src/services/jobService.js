// src/services/jobService.js
import api from './api';

const BASE = '/jobs';

export const getJobs = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    throw error.response?.data || error.message;
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener orden ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createJob = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear orden:', error);
    throw error.response?.data || error.message;
  }
};

export const updateJob = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar orden ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteJob = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar orden ${id}:`, error);
    throw error.response?.data || error.message;
  }
};