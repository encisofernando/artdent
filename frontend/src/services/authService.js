
import api from "./api";
import { unwrap } from "./utils";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  const { token, user } = res.data;
  if (token) localStorage.setItem("token", token);
  return { token, user };
};

export const me = async () => unwrap(await api.get("/auth/me"));

export const logout = async () => {
  try { await api.post("/auth/logout"); } catch (_) {}
  localStorage.removeItem("token");
};

export const register = async (payload) => unwrap(await api.post("/auth/register", payload));

export const createPassword = async ({ token, password }) =>
  unwrap(await api.post("/auth/create-password", { token, password }));
