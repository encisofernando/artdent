// src/services/api.js
//
// ─── Instancia Axios para ARTDENT ─────────────────────────────────────────────
//
//  baseURL:
//    - Local:      VITE_API_URL=""  → rutas relativas → Vite proxy → Laravel :8000
//    - Producción: VITE_API_URL="https://api.artdent.com.ar" → directo al backend
//
//  Interceptor de request:
//    Garantiza que toda llamada lleve el prefijo /api/ exactamente una vez,
//    excepto /sanctum/* que no va bajo /api/ (es una ruta Laravel raíz).
//
//  Interceptor de response: NO definido aquí.
//    authService.js registra el suyo propio (retry 401 + refresh token).
//    Dos interceptores de response para 401 se pisan — uno solo.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// Solo el origen, sin path. Vacío en local → rutas relativas → proxy de Vite.
const ORIGIN = import.meta.env.VITE_API_URL ?? "";

const api = axios.create({
  baseURL:         ORIGIN,
  withCredentials: true,        // CRÍTICO: envía cookies de sesión Sanctum
  timeout:         15_000,
  headers: {
    "Content-Type":     "application/json",
    Accept:             "application/json",
    "X-Requested-With": "XMLHttpRequest",  // Marca la request como AJAX (Sanctum lo usa)
  },
});

// ── Request interceptor: normaliza URLs ──────────────────────────────────────
//
//  Rutas de Sanctum  → NO prefijadas  →  /sanctum/csrf-cookie
//  Todo lo demás     → prefijadas     →  /api/auth/login, /api/products, etc.
//
//  Ejemplos:
//    api.get("/auth/me")           →  /api/auth/me            ✅
//    api.post("/auth/login")       →  /api/auth/login         ✅
//    api.get("/sanctum/csrf-cookie") →  /sanctum/csrf-cookie  ✅ (sin /api/)
//    api.get("/api/products")      →  /api/products           ✅ (no duplica)
//
api.interceptors.request.use((config) => {
  const url = config.url ?? "";

  const alreadyPrefixed = url.startsWith("/api/")  || url.startsWith("api/");
  const isSanctum       = url.startsWith("/sanctum") || url.startsWith("sanctum");

  if (!alreadyPrefixed && !isSanctum) {
    config.url = `/api/${url.replace(/^\//, "")}`;
  }

  return config;
});

export default api;