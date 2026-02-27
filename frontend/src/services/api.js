// src/services/api.js

import axios from "axios";

// Solo el ORIGEN — sin /api
// El interceptor de request lo agrega automáticamente a cada llamada.
const ORIGIN = import.meta.env.VITE_API_URL ?? "";

const api = axios.create({
  baseURL: ORIGIN,          // "https://api.artdent.com.ar"  (sin /api)
  withCredentials: true,
  headers: {
    "Content-Type":     "application/json",
    Accept:             "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ── Request interceptor: garantiza que toda llamada lleve /api/ ──────────────
//
// Problema que resuelve:
//   axios.create({ baseURL: "https://host/api" }) + api.get("/users")
//   → axios ignora el path del baseURL cuando la URL empieza con "/"
//   → resultado: https://host/users   ← incorrecto
//
// Con este interceptor:
//   api.get("/users")         → https://host/api/users   ✅
//   api.get("/api/users")     → https://host/api/users   ✅  (no duplica)
//   api.get("auth/refresh")   → https://host/api/auth/refresh  ✅
//
api.interceptors.request.use((config) => {
  const url = config.url ?? "";

  if (!url.startsWith("/api") && !url.startsWith("api")) {
    config.url = `/api/${url.replace(/^\//, "")}`;
  }

  return config;
});

// ⚠️  Sin interceptors de response aquí.
//     authService.js registra el suyo (retry con refresh token).
//     Dos interceptores 401 se pisan entre sí.

export default api;