import axios, { AxiosError } from "axios";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
    : "https://api.artdent.com.ar/api"
);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Adjuntar token si existe (Laravel Sanctum - Bearer)
api.interceptors.request.use((config) => {
  // En Next, este archivo puede importarse en SSR sin querer.
  // Pero como esto es para client-side (localStorage), lo protegemos.
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("artdent_token") || localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Si el backend responde 401, limpiamos token para evitar loops.
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (typeof window !== "undefined") {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("artdent_token");
        // Sin redirect; la UI decide
      }
    }
    return Promise.reject(err);
  }
);

export default api;
