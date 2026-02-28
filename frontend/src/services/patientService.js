// src/services/patientService.js
import api from './api';

const BASE = '/patients';

export const getPatients = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    throw error.response?.data || error.message;
  }
};

export const getPatientById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener paciente ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createPatient = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear paciente:', error);
    throw error.response?.data || error.message;
  }
};

export const updatePatient = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar paciente ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deletePatient = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar paciente ${id}:`, error);
    throw error.response?.data || error.message;
  }
};