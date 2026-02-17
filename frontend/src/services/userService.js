// 📁 src/services/userService.js
import api from "./api";
import { unwrap, toQueryString } from "./utils";

// === Usuarios (cuentas del sistema) ===

export const listUsers = (params = {}) =>
  unwrap(api.get(`/users?${toQueryString(params)}`));

export const getUser = (id) => unwrap(api.get(`/users/${id}`));

export const createUser = (payload) => unwrap(api.post(`/users`, payload));

export const updateUser = (id, payload) => unwrap(api.put(`/users/${id}`, payload));

export const deleteUser = (id) => unwrap(api.delete(`/users/${id}`));

export const toggleUserActive = async (id, currentActive) =>
  updateUser(id, { is_active: currentActive ? 0 : 1 });
