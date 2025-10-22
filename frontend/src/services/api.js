import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Opcional: logout si 401/419
    if (err?.response?.status === 401) {
      // localStorage.removeItem("token"); // si querés: redirigir a login
    }
    return Promise.reject(err);
  }
);

export default api;
