// src/services/salesService.js
import api from "./api";

/** Unwrap helpers */
const unwrap = (res) => res?.data?.data ?? res?.data ?? res;
const unwrapRows = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

/**
 * Listar ventas con filtros
 */
export const listSales = async (params = {}) => {
  const res = await api.get("/sales", { params });
  return unwrapRows(res);
};

/**
 * Obtener detalle de una venta
 */
export const getSale = async (id) => {
  const res = await api.get(`/sales/${id}`);
  return unwrap(res);
};

/**
 * Crear nueva venta
 * 
 * Payload esperado:
 * {
 *   warehouse_id: number,
 *   customer_id?: number,
 *   sale_date?: string (ISO),
 *   observations?: string,
 *   payment_method?: string,
 *   payment_reference?: string,
 *   items: [
 *     {
 *       product_id: number,
 *       qty: number,
 *       unit_price: number,
 *       tax_rate?: number (0-100),
 *       discount?: number
 *     }
 *   ]
 * }
 */
export const createSale = async (payload) => {
  const res = await api.post("/sales", payload);
  return unwrap(res);
};

/**
 * Actualizar venta (solo en estado draft)
 */
export const updateSale = async (id, payload) => {
  const res = await api.put(`/sales/${id}`, payload);
  return unwrap(res);
};

/**
 * Cancelar venta (revierte stock)
 */
export const cancelSale = async (id) => {
  const res = await api.post(`/sales/${id}/cancel`);
  return unwrap(res);
};

/**
 * Obtener estadísticas de ventas
 */
export const getStats = async () => {
  const res = await api.get("/sales/stats");
  return unwrap(res);
};

/**
 * Registrar recibos/cobros por la venta
 * 
 * @param {number} saleId 
 * @param {Array} receipts - [{payment_method_id, amount, receipt_date, reference}]
 * @returns 
 */
export const registerReceipts = async (saleId, receipts = []) => {
  if (!receipts.length) return [];
  
  try {
    const res = await api.post(`/sales/${saleId}/receipts`, { receipts });
    return unwrap(res);
  } catch (e) {
    // Fallback: crear uno por uno si el endpoint bulk no existe
    const results = [];
    for (const receipt of receipts) {
      const body = { ...receipt, sale_id: saleId };
      const res = await api.post("/receipts", body);
      results.push(unwrap(res));
    }
    return results;
  }
};

/**
 * Eliminar recibo
 */
export const deleteReceipt = async (id) => {
  const res = await api.delete(`/receipts/${id}`);
  return unwrap(res);
};

/**
 * Generar reporte de ventas
 */
export const generateReport = async (params = {}) => {
  const res = await api.get("/sales/report", { params });
  return unwrap(res);
};
