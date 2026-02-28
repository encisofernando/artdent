// src/services/paymentService.js
//
// Pagos del módulo laboratorio → /api/lab-payments → PaymentController → tabla job_payments
// ⚠️  NO confundir con /api/payments (PaymentsController, e-commerce/compras)
//
import api from './api';

const BASE = '/lab-payments';

export const getPayments = async (params = {}) => {
  try {
    const response = await api.get(BASE, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    throw error.response?.data || error.message;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener pago ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createPayment = async (data) => {
  try {
    const response = await api.post(BASE, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear pago:', error);
    throw error.response?.data || error.message;
  }
};

export const updatePayment = async (id, data) => {
  try {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar pago ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deletePayment = async (id) => {
  try {
    await api.delete(`${BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar pago ${id}:`, error);
    throw error.response?.data || error.message;
  }
};