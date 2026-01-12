import axios from "axios";

// Detecta automáticamente la URL de la API.
// Prioridad:
// 1) VITE_API_URL (recomendado)
// 2) Según el modo de Vite: prod -> https://api.artdent.com.ar/api, dev -> http://localhost:8000/api
const BASE_URL = (() => {
  const envUrl = import.meta?.env?.VITE_API_URL;
  if (envUrl && typeof envUrl === "string") {
    return envUrl.replace(/\/+$/, "");
  }

  const isProd = !!import.meta?.env?.PROD;
  return isProd ? "https://api.artdent.com.ar/api" : "http://localhost:8000/api";
})();

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
