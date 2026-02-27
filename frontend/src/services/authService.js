// src/services/authService.js
//
// ─── Refresh Token Rotation ───────────────────────────────────────────────────
//
//  ┌─────────────────────────────────────────────────────────┐
//  │  access_token   → RAM (variable JS)    vida: 15 min     │
//  │  refresh_token  → cookie httpOnly      vida: 30 días    │
//  └─────────────────────────────────────────────────────────┘
//
//  FLUJO COMPLETO:
//   1. login()       → servidor: access_token en JSON + cookie httpOnly
//   2. requests      → Bearer {access_token} en header automáticamente
//   3. token expira  → proactive refresh 1 min antes (timer)
//   4. 401 recibido  → interceptor reactivo: refresca y reintenta
//   5. refresh ok    → nuevo par de tokens, request original transparente
//   6. logout()      → servidor invalida DB + borra cookie
//
//  El usuario NUNCA ve el login de nuevo mientras tenga actividad
//  dentro de los 30 días de vida del refresh token.
// ─────────────────────────────────────────────────────────────────────────────

import api from "./api";

// ─── Estado en memoria ────────────────────────────────────────────────────────
let _accessToken     = null;
let _tokenExpiry     = null;    // Date
let _refreshPromise  = null;    // deduplicar llamadas simultáneas
let _refreshTimer    = null;    // proactive refresh timer

// ─── Helpers internos ─────────────────────────────────────────────────────────

const setAccessToken = (token, expiresAt) => {
  _accessToken = token;
  _tokenExpiry = expiresAt ? new Date(expiresAt) : null;

  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    _scheduleProactiveRefresh();
  } else {
    delete api.defaults.headers.common["Authorization"];
    _clearTimer();
  }
};

const _clearTimer = () => {
  if (_refreshTimer) { clearTimeout(_refreshTimer); _refreshTimer = null; }
};

/**
 * Programa un refresh automático 60s antes de que expire el access token.
 * Si el token ya expiró o expira en < 60s, refresca inmediatamente.
 */
const _scheduleProactiveRefresh = () => {
  _clearTimer();
  if (!_tokenExpiry) return;

  const msLeft    = _tokenExpiry.getTime() - Date.now();
  const refreshIn = msLeft - 60_000;

  if (refreshIn <= 0) {
    doRefresh().catch(() => {});
    return;
  }

  _refreshTimer = setTimeout(() => {
    doRefresh().catch(() => {
      console.warn("[auth] Silent refresh failed — interceptor will handle next 401");
    });
  }, refreshIn);
};

/**
 * Llama POST /auth/refresh.
 * Si hay un refresh en curso, devuelve la misma promesa (no lanza otro).
 */
const doRefresh = () => {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = api.post("/auth/refresh")
    .then(({ data }) => {
      setAccessToken(data.access_token, data.expires_at);
      return data.access_token;
    })
    .catch((err) => {
      setAccessToken(null, null);
      throw err;
    })
    .finally(() => { _refreshPromise = null; });

  return _refreshPromise;
};

// ─── Interceptor 401 reactivo ─────────────────────────────────────────────────
// Se registra UNA sola vez al importar este módulo.
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const cfg = err.config;

    if (
      err.response?.status === 401 &&
      !cfg._retry &&
      !cfg.url?.includes("/auth/login") &&
      !cfg.url?.includes("/auth/refresh")
    ) {
      cfg._retry = true;
      try {
        const newToken = await doRefresh();
        cfg.headers["Authorization"] = `Bearer ${newToken}`;
        return api(cfg);           // reintentar request original
      } catch {
        if (window.location.pathname !== "/") window.location.href = "/";
      }
    }

    return Promise.reject(err);
  }
);

// ─── API pública ──────────────────────────────────────────────────────────────
const authService = {

  login: async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (!data.access_token) throw new Error(data?.message || "Sin token.");
    setAccessToken(data.access_token, data.expires_at);
    return data.user;
  },

  register: async ({ name, email, password, password_confirmation }) => {
    const { data } = await api.post("/auth/register", { name, email, password, password_confirmation });
    if (!data.access_token) throw new Error(data?.message || "Sin token.");
    setAccessToken(data.access_token, data.expires_at);
    return data.user;
  },

  logout: async () => {
    _clearTimer();
    try { await api.post("/auth/logout"); } catch { /* igual limpiamos */ }
    setAccessToken(null, null);
    window.location.href = "/";
  },

  /**
   * Llamado al arrancar la app (ej: en App.jsx o AuthContext).
   * Intenta restaurar la sesión via cookie httpOnly sin pedirle nada al usuario.
   */
  checkSession: async () => {
    // Caso 1: el tab nunca se cerró, el token sigue en RAM y es válido
    if (_accessToken && _tokenExpiry && _tokenExpiry > new Date()) {
      try {
        const { data } = await api.get("/auth/me");
        return data?.user ?? null;
      } catch {
        setAccessToken(null, null);
        return null;
      }
    }

    // Caso 2: recarga de página o nuevo tab → intentar refresh silencioso
    try {
      await doRefresh();
      const { data } = await api.get("/auth/me");
      return data?.user ?? null;
    } catch {
      return null;   // cookie expirada o no existe → mostrar login
    }
  },

  getToken:   () => _accessToken,
  isLoggedIn: () => !!_accessToken && (!_tokenExpiry || _tokenExpiry > new Date()),
};

export default authService;