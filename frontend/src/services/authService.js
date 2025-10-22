import api from "./api";
import { unwrap } from "./utils";

export const login = (email, password) =>
  unwrap(api.post("/auth/login", { email, password })).then((data) => {
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  });

export const register = (payload) => unwrap(api.post("/auth/register", payload));

export const logout = () => {
  localStorage.removeItem("token");
};

const _default = { login, register, logout };
export default _default;
