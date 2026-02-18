// src/services/customers.ts
import api from "./api";
import { unwrap } from "./utils";

export type CustomerListParams = Record<string, any>;

export const list = (params: CustomerListParams = {}) =>
  unwrap(api.get("/customers", { params }));

export const get = (id: number | string) => unwrap(api.get(`/customers/${id}`));

export const create = (payload: any) => unwrap(api.post("/customers", payload));

export const update = (id: number | string, payload: any) =>
  unwrap(api.put(`/customers/${id}`, payload));

export const remove = (id: number | string) => unwrap(api.delete(`/customers/${id}`));
