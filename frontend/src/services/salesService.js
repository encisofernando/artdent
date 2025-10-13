// 📁 src/services/salesService.js
import api from "./api";
import { unwrap } from "./utils";

/**
 * Estructura esperada por el backend (según SQL):
 *  - sales: id, customer_id, sale_date, subtotal, discount_total, tax_total, total, observations
 *  - sale_items: sale_id, product_id, qty, unit_price, discount, tax_id | tax_rate, tax_amount, line_total
 *  - receipts: sale_id, payment_method_id, amount, receipt_date, reference
 */

export const listSales = async (params = {}) => unwrap(await api.get("/sales", { params }));

export const getSale = async (id) => unwrap(await api.get(`/sales/${id}`));

export const createSale = async (payload) => unwrap(await api.post("/sales", payload));

export const updateSale = async (id, payload) => unwrap(await api.put(`/sales/${id}`, payload));

export const cancelSale = async (id) => unwrap(await api.post(`/sales/${id}/cancel`));

/**
 * Registra cobros por la venta (recibos). Intenta endpoint bulk y si no existe,
 * cae a crear uno por uno en /receipts.
 */
export const registerReceipts = async (saleId, receipts = []) => {
  if (!receipts.length) return [];
  try {
    const res = await api.post(`/sales/${saleId}/receipts`, { receipts });
    return unwrap(res);
  } catch (e) {
    // fallback unitario
    const results = [];
    for (const r of receipts) {
      const body = { ...r, sale_id: saleId };
      const res = await api.post(`/receipts`, body);
      results.push(unwrap(res));
    }
    return results;
  }
};

export const deleteReceipt = async (id) => unwrap(await api.delete(`/receipts/${id}`));
