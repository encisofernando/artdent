import api from "./api";
import { unwrap } from "./utils";

export const list = () => unwrap(api.get("/purchases"));
export const get = (id) => unwrap(api.get(`/purchases/${id}`));
export const create = (payload) => unwrap(api.post("/purchases", payload));
