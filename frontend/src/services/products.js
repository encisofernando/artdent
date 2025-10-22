import api from "./api";
import { unwrap, toQueryString } from "./utils";

export const list = (params = {}) =>
  unwrap(api.get(`/products?${toQueryString(params)}`));

export const get = (id) => unwrap(api.get(`/products/${id}`));
export const create = (payload) => unwrap(api.post("/products", payload));
export const update = (id, payload) => unwrap(api.put(`/products/${id}`, payload));
export const remove = (id) => unwrap(api.delete(`/products/${id}`));

export const stockByProduct = (id) => unwrap(api.get(`/products/${id}/stock`));
export const stockSummary = () => unwrap(api.get(`/stock/summary`));
