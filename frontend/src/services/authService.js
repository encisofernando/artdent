// src/services/authService.js
//
// ─── Refresh Token Rotation con Sanctum (Cookie-based SPA) ─────────────────────
//  Flujo: access_token en memoria + refresh_token en cookie httpOnly
//  Vida: access ~15min, refresh ~30 días
//  Refresh: proactivo (60s antes) + reactivo (401)
//  CSRF: GET /sanctum/csrf-cookie antes de cualquier POST
// ─────────────────────────────────────────────────────────────────────────────

import api from "./api";

// ─── Estado en memoria ────────────────────────────────────────────────────────
let _accessToken     = null;
let _tokenExpiry     = null;     // Date
let _refreshPromise  = null;     // Deduplica llamadas simultáneas
let _refreshTimer    = null;     // Timer proactivo

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
  if (_refreshTimer) {
    clearTimeout(_refreshTimer);
    _refreshTimer = null;
  }
};

/**
 * Programa refresh automático 60 segundos antes de expirar.
 * Si ya expiró o queda <60s, refresca inmediatamente.
 */
const _scheduleProactiveRefresh = () => {
  _clearTimer();
  if (!_tokenExpiry) return;

  const msLeft    = _tokenExpiry.getTime() - Date.now();
  const refreshIn = msLeft - 60_000;  // 1 min antes

  if (refreshIn <= 0) {
    doRefresh().catch(() => {});
    return;
  }

  _refreshTimer = setTimeout(() => {
    doRefresh().catch(() => {
      console.warn("[auth] Silent proactive refresh failed — next 401 will handle");
    });
  }, refreshIn);
};

/**
 * Obtiene CSRF token si no existe (necesario para POST con Sanctum)
 */
const ensureCsrf = async () => {
  if (!document.cookie.includes('XSRF-TOKEN')) {
    try {
      await api.get('/sanctum/csrf-cookie', { timeout: 5000 });
      console.debug('[auth] CSRF cookie obtenida');
    } catch (err) {
      console.error('[auth] Error obteniendo CSRF:', err);
      throw err;
    }
  }
};

/**
 * Realiza refresh. Deduplica si ya hay uno en curso.
 * Retorna nuevo token o lanza error.
 */
const doRefresh = async () => {
  if (_refreshPromise) return _refreshPromise;  // Deduplica

  // No intentar si no hay sesión previa
  if (!_accessToken || !_tokenExpiry) {
    console.warn('[auth] No hay sesión activa para refrescar');
    return null;
  }

  _refreshPromise = (async () => {
    try {
      await ensureCsrf();  // Siempre CSRF antes de POST
      const { data } = await api.post("/auth/refresh", {}, { timeout: 8000 });
      if (!data.access_token) throw new Error("Sin token en refresh.");
      setAccessToken(data.access_token, data.expires_at);
      console.debug('[auth] Refresh exitoso — nuevo token seteado');
      return data.access_token;
    } catch (err) {
      setAccessToken(null, null);
      if (err.response?.status === 401) {
        console.warn('[auth] Refresh token inválido o expirado (401) — redirigiendo a login');
      } else {
        console.error('[auth] Error en refresh:', err);
      }
      throw err;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
};

// ─── Interceptor 401 reactivo ─────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const cfg = err.config;

    // Evita loop infinito en login/refresh
    if (
      err.response?.status === 401 &&
      !cfg._retry &&
      !cfg.url?.includes("/auth/login") &&
      !cfg.url?.includes("/auth/refresh") &&
      !cfg.url?.includes("/sanctum/csrf-cookie")
    ) {
      cfg._retry = true;
      try {
        const newToken = await doRefresh();
        if (newToken) {
          cfg.headers["Authorization"] = `Bearer ${newToken}`;
          return api(cfg);  // Reintenta original
        }
      } catch (refreshErr) {
        console.warn('[auth] Refresh falló en interceptor — logout forzado');
        authService.logout();
      }
    }

    return Promise.reject(err);
  }
);

// ─── API pública ──────────────────────────────────────────────────────────────
const authService = {
  /**
   * Login: obtiene CSRF + tokens + setea estado
   */
  login: async ({ email, password }) => {
    await ensureCsrf();
    const { data } = await api.post("/auth/login", { email, password });
    if (!data.access_token) throw new Error(data?.message || "Sin token.");
    setAccessToken(data.access_token, data.expires_at);
    return data.user;
  },

  /**
   * Register: similar a login
   */
  register: async ({ name, email, password, password_confirmation }) => {
    await ensureCsrf();
    const { data } = await api.post("/auth/register", { name, email, password, password_confirmation });
    if (!data.access_token) throw new Error(data?.message || "Sin token.");
    setAccessToken(data.access_token, data.expires_at);
    return data.user;
  },

  /**
   * Logout: limpia todo y redirige
   */
  logout: async () => {
    _clearTimer();
    try {
      await ensureCsrf();
      await api.post("/auth/logout");
    } catch (err) {
      console.warn('[auth] Logout falló, pero limpiamos localmente');
    }
    setAccessToken(null, null);
    window.location.href = "/";
  },

  /**
   * checkSession: usado al montar la app (App.jsx o AuthContext)
   * Retorna user si hay sesión válida, null si no.
   */
  checkSession: async () => {
    // Caso 1: token en memoria válido
    if (_accessToken && _tokenExpiry && _tokenExpiry > new Date()) {
      try {
        const { data } = await api.get("/auth/me");
        return data?.user ?? null;
      } catch (err) {
        console.warn('[auth] /me falló con token en memoria — intentando refresh');
      }
    }

    // Caso 2: recarga → intenta refresh silencioso
    try {
      await doRefresh();
      const { data } = await api.get("/auth/me");
      return data?.user ?? null;
    } catch (err) {
      console.debug('[auth] No hay sesión activa (refresh falló)');
      return null;
    }
  },

  getToken:   () => _accessToken,
  isLoggedIn: () => !!_accessToken && (!_tokenExpiry || _tokenExpiry > new Date()),
};

export default authService;