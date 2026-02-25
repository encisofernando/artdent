// src/services/api.js
//
// ─── MIGRACIÓN: Bearer token → Sanctum httpOnly cookie ───────────────────────
//
// El browser envía automáticamente la cookie laravel_session en cada request
// gracias a `withCredentials: true`.
// Axios lee la cookie XSRF-TOKEN (NO httpOnly) y la adjunta como header
// X-XSRF-TOKEN en cada mutación (POST/PUT/PATCH/DELETE) automáticamente.
//
// Ya NO es necesario:
//   localStorage.setItem("token", ...)
//   api.defaults.headers.common["Authorization"] = `Bearer ${token}`
//
// ⚠️  PARA PRODUCCIÓN:
//   - Front (pos.artdent.com.ar) y back (api.artdent.com.ar) deben compartir
//     el dominio raíz artdent.com.ar.
//   - SESSION_DOMAIN=.artdent.com.ar en .env del backend.
//   - SESSION_SECURE_COOKIE=true (HTTPS obligatorio).
//   - SANCTUM_STATEFUL_DOMAINS=pos.artdent.com.ar en .env del backend.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// En desarrollo con el proxy de Vite (/api → localhost:8000/api), BASE_URL = ""
// En producción, setear VITE_API_URL=https://api.artdent.com.ar
const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,            // ← CRÍTICO: envía la session cookie
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // Sanctum lo usa para detectar SPA
  },
});

// ─── CSRF: pedir la cookie antes del primer POST/PUT/PATCH/DELETE ────────────
// Sanctum expone GET /sanctum/csrf-cookie que setea XSRF-TOKEN en el browser.
// Axios lo lee y añade X-XSRF-TOKEN como header automáticamente.

let csrfReady = false;

export const ensureCsrf = async () => {
  if (csrfReady) return;
  await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
  csrfReady = true;
};

// ─── Interceptor de request: obtener CSRF antes de mutaciones ───────────────
api.interceptors.request.use(async (config) => {
  const method = (config.method || "").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    await ensureCsrf();
  }
  return config;
});

// ─── Interceptor de response: manejar 401 (sesión expirada) ─────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      csrfReady = false; // resetear para el próximo login
      if (!window.location.pathname.includes("/login") &&
          window.location.pathname !== "/") {
        // Redirigir a raíz (App.jsx muestra Login cuando user = null)
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

export default api;