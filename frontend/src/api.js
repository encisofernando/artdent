import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // definido en .env
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const attach401Logout = (onLogout) => {
  api.interceptors.response.use(
    (r) => r,
    (error) => {
      if (error?.response?.status === 401) {
        onLogout?.();
      }
      return Promise.reject(error);
    }
  );
};

export default api;
