import api from "./api";
import { unwrap } from "./utils";

export const list = () => unwrap(api.get("/taxes"));
export const get = (id) => unwrap(api.get(`/taxes/${id}`));
export const create = (payload) => unwrap(api.post("/taxes", payload));
export const update = (id, payload) => unwrap(api.put(`/taxes/${id}`, payload));
export const remove = (id) => unwrap(api.delete(`/taxes/${id}`));
