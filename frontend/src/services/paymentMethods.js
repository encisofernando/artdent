import api from "./api";
import { unwrap } from "./utils";

export const list = () => unwrap(api.get("/payment-methods"));
export const get = (id) => unwrap(api.get(`/payment-methods/${id}`));
export const create = (payload) => unwrap(api.post("/payment-methods", payload));
export const update = (id, payload) => unwrap(api.put(`/payment-methods/${id}`, payload));
export const remove = (id) => unwrap(api.delete(`/payment-methods/${id}`));
