// src/services/authService.js
import api from "./api";

const register = async ({ name, email, password, password_confirmation }) => {
  const { data } = await api.post("/auth/register", {
    name, email, password, password_confirmation,
  });
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
};

const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
};

const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

const logout = async () => {
  try { await api.post("/auth/logout"); } catch {}
  localStorage.removeItem("token");
};

export default { register, login, me, logout };
