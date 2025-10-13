// 📁 src/services/customerService.js
import api from "./api";
import { unwrap, toQueryString } from "./utils";

// Listado con querystring opcional (paginación, búsqueda, etc.)
export const listCustomers = async (params = {}) => {
  const qs = toQueryString(params);
  return unwrap(await api.get(`/customers${qs ? `?${qs}` : ""}`));
};

export const getCustomer = async (id) => unwrap(await api.get(`/customers/${id}`));

export const createCustomer = async (payload) => unwrap(await api.post("/customers", payload));

export const updateCustomer = async (id, payload) => unwrap(await api.put(`/customers/${id}`, payload));

export const deleteCustomer = async (id) => unwrap(await api.delete(`/customers/${id}`));
