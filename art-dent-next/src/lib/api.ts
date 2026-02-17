import axios from "axios";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.artdent.com.ar/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

// Adjuntar Bearer token (compat: artdent_token | token)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("artdent_token") ||
      localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Limpiar token en 401 para evitar loops
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("artdent_token");
    }
    return Promise.reject(err);
  }
);

export default api;
