// src/services/authService.js
import api from "./api";

// Registro de usuario
const register = async ({ name, email, password, password_confirmation }) => {
  const { data } = await api.post("/auth/register", {
    name, email, password, password_confirmation,
  });
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
};

// Inicio de sesión
const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
};

// Obtener perfil del usuario autenticado
const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

// Cerrar sesión
const logout = async () => {
  try { await api.post("/auth/logout"); } catch {}
  localStorage.removeItem("token");
};

// 🆕 Solicitar recuperación de contraseña (envía email con token)
const requestPasswordReset = async (email) => {
  const { data } = await api.post("/auth/password/forgot", { email });
  return data;
};

// 🆕 Crear nueva contraseña con token
const createPassword = async ({ token, password }) => {
  const { data } = await api.post("/auth/password/create", { token, password });
  return data;
};

export default {
  register,
  login,
  me,
  logout,
  requestPasswordReset,
  createPassword,
};
