// src/services/movementService.js
import api from "./api";

const BASE = "/movements";

export const getMovements = async (params = {}) => {
  const response = await api.get(BASE, { params });
  return response.data;
};

export const createMovement = async (data) => {
  const response = await api.post(BASE, data);
  return response.data;
};