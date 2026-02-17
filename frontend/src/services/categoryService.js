import axios from "axios";

const API_BASE =
  import.meta?.env?.VITE_API_URL ||
  process.env?.REACT_APP_API_URL ||
  "https://api.artdent.com.ar/api"; // fallback

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listCategories(params = {}) {
  const res = await axios.get(`${API_BASE}/categories`, {
    params,
    headers: authHeaders(),
  });
  return res.data;
}

export async function createCategory(payload) {
  const res = await axios.post(`${API_BASE}/categories`, payload, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function updateCategory(id, payload) {
  const res = await axios.put(`${API_BASE}/categories/${id}`, payload, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function deleteCategory(id) {
  const res = await axios.delete(`${API_BASE}/categories/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
}
