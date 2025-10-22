import api from "./api";
import { unwrap, toQueryString } from "./utils";

export const list = (params = {}) =>
  unwrap(api.get(`/customers?${toQueryString(params)}`));

export const get = (id) => unwrap(api.get(`/customers/${id}`));

export const create = (payload) => unwrap(api.post("/customers", payload));

export const update = (id, payload) => unwrap(api.put(`/customers/${id}`, payload));

export const remove = (id) => unwrap(api.delete(`/customers/${id}`));
