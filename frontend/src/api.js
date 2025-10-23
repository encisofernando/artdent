// src/api.js
import axios from "axios";

// En Vite, las variables vienen de import.meta.env y deben empezar con VITE_
// Definí VITE_API_URL en tu .env (ej.: VITE_API_URL=http://127.0.0.1:8000/api)
const API_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "https://api.artdent.com.ar/api"; // fallback por si falta la env

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// Adjunta token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper para deslogueo automático en 401
export const attach401Logout = (onLogout) => {
  api.interceptors.response.use(
    (r) => r,
    (error) => {
      if (error?.response?.status === 401) {
        onLogout?.();
      }
      return Promise.reject(error);
    }
  );
};

export default api;
