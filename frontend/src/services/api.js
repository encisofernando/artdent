import axios from "axios";

// Detecta automáticamente la URL de producción o fallback
const BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
    : "https://api.artdent.com.ar/api");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// (Opcional) adjuntar token si tenés login con bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
