// src/services/salesHubService.js
import api from "./api";

const unwrapRows = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.data)) return d.data;
  return d?.data ?? d?.data ?? [];
};

export const listSalesHub = async (params = {}) => {
  const res = await api.get("/sales-hub", { params });
  const data = res?.data?.data ?? unwrapRows(res);
  const meta = res?.data?.meta ?? null;
  return { data, meta };
};

export const getSalesHub = async (source, id) => {
  const res = await api.get(`/sales-hub/${source}/${id}`);
  return res?.data;
};

export const updateSalesHub = async (source, id, payload) => {
  const res = await api.put(`/sales-hub/${source}/${id}`, payload);
  return res?.data;
};

export const cancelSalesHub = async (source, id) => {
  const res = await api.post(`/sales-hub/${source}/${id}/cancel`);
  return res?.data;
};
