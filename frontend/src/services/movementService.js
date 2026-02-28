// src/services/movementService.js
import api from './api';

const BASE = '/movements';  // Asume endpoint /api/movements en backend; ajusta si es /account-movements o similar

export const getMovements = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error.response?.data || error.message;
  }
};

export const createMovement = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    throw error.response?.data || error.message;
  }
};

// Si necesitas update/delete, agrégalos similar a otros services