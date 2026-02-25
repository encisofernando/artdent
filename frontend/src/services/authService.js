// src/services/authService.js
//
// ─── MIGRACIÓN: Bearer token en localStorage → Sanctum cookie session ────────
//
// Este archivo reemplaza el authService anterior que guardaba el token en
// localStorage. Ahora la sesión vive en una cookie httpOnly gestionada por
// el servidor (Laravel Sanctum).
//
// ⚠️  REQUISITO EN AUTHCONTROLLER.PHP:
//     El método login() del AuthController debe llamar a Auth::login($user)
//     ADEMÁS de devolver el token (si querés mantener compat con Bearer).
//     Eso crea la sesión de server side y setea la laravel_session cookie.
//
//     Ejemplo mínimo en AuthController::login():
//       $user = User::where('email', $request->email)->first();
//       if (!$user || !Hash::check($request->password, $user->password)) {
//           return response()->json(['message' => 'Credenciales incorrectas'], 401);
//       }
//       Auth::login($user);                      // ← AÑADIR ESTA LÍNEA
//       $token = $user->createToken('spa')->plainTextToken;
//       return response()->json(['token' => $token, 'user' => $user]);
//
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import api, { ensureCsrf } from "./api";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const authService = {
  /**
   * Login con email + password.
   *
   * Flujo:
   *  1. GET  /sanctum/csrf-cookie  → setea XSRF-TOKEN cookie
   *  2. POST /api/auth/login       → AuthController valida credenciales,
   *                                  llama Auth::login($user),
   *                                  devuelve { token, user }
   *  3. GET  /api/auth/me          → verifica sesión y devuelve user fresco
   *
   * Retorna el objeto user.
   */
  login: async ({ email, password }) => {
    // Paso 1: obtener cookie CSRF (Sanctum la setea en el browser)
    await ensureCsrf();

    // Paso 2: POST al AuthController de este proyecto
    // (ruta: POST /api/auth/login en api.php)
    await api.post("/auth/login", { email, password });

    // Paso 3: verificar sesión activa y obtener datos del usuario
    const res = await api.get("/auth/me");
    return res.data?.user ?? res.data;
  },

  /**
   * Registro de nuevo usuario.
   * Ruta: POST /api/auth/register en api.php
   */
  register: async ({ name, email, password, password_confirmation }) => {
    await ensureCsrf();

    await api.post("/auth/register", {
      name, email, password, password_confirmation,
    });

    const res = await api.get("/auth/me");
    return res.data?.user ?? res.data;
  },

  /**
   * Cierra la sesión en el servidor e invalida la cookie.
   * Ruta: POST /api/auth/logout en api.php
   */
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      // Redirigir al login pase lo que pase
      window.location.href = "/";
    }
  },

  /**
   * Verifica si hay sesión activa (cookie válida en el server).
   * Se llama al montar la app (reemplaza el "check token en localStorage").
   * Retorna el user o null.
   *
   * Ruta: GET /api/auth/me en api.php
   */
  checkSession: async () => {
    try {
      const res = await api.get("/auth/me");
      return res.data?.user ?? res.data ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Cambio de contraseña autenticado.
   * (Podés implementar el endpoint en AuthController si lo necesitás)
   */
  changePassword: async ({ current_password, password, password_confirmation }) => {
    const res = await api.put("/auth/password", {
      current_password, password, password_confirmation,
    });
    return res.data;
  },
};

export default authService;