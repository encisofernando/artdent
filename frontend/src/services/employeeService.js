// 📁 src/services/employeeService.js
import api from "./api";
import { unwrap, toQueryString } from "./utils";

export const listEmployees = async (params = {}) => {
  const qs = toQueryString(params);
  return unwrap(await api.get(`/employees${qs ? `?${qs}` : ""}`));
};

export const getEmployee = async (id) => unwrap(await api.get(`/employees/${id}`));

export const createEmployee = async (formData) => {
  // admite FormData (multipart) o JSON
  const headers = formData instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
  return unwrap(await api.post("/employees", formData, { headers }));
};

export const updateEmployee = async (id, payload) => {
  const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
  return unwrap(await api.post(`/employees/${id}?_method=PUT`, payload, { headers }));
};

export const deleteEmployee = async (id) => unwrap(await api.delete(`/employees/${id}`));

export const toggleActive = async (id) => {
  try {
    return unwrap(await api.post(`/employees/${id}/toggle-active`));
  } catch (e) {
    // fallback: si no hay endpoint específico, intenta soft delete/restore
    try {
      const emp = await getEmployee(id);
      if (emp?.deleted_at) {
        return unwrap(await api.post(`/employees/${id}/restore`));
      }
      await deleteEmployee(id);
      return { ok: true };
    } catch (err) {
      throw e;
    }
  }
};
