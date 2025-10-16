// src/services/financeService.js
import api from "./api";

export const createReceipt = async ({ sale_id, payment_method_id, amount, reference, receipt_date }) => {
  const { data } = await api.post("/receipts", { sale_id, payment_method_id, amount, reference, receipt_date });
  return data;
};

export const createPayment = async ({ purchase_id, payment_method_id, amount, reference, payment_date }) => {
  const { data } = await api.post("/payments", { purchase_id, payment_method_id, amount, reference, payment_date });
  return data;
};
