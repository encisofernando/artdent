import axios from "axios";

// Si existe VITE_API_URL, se usa. Caso contrario, se usa localhost.
const BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
    : "http://localhost:8000/api").trim();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Adjuntar token si existe (Laravel Sanctum - Bearer)
api.interceptors.request.use((config) => {
  // Compat: e-commerce usa 'artdent_token'; CRM histórico usa 'token'
  const token = localStorage.getItem("artdent_token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401, limpiamos token para evitar loops.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("artdent_token");
      // No forzamos redirect acá para no romper flujos; la UI puede decidir.
    }
    return Promise.reject(err);
  }
);

export default api;
