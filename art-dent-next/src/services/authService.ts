import api from "./api";
import { unwrap } from "./utils";

export type LoginResponse = {
  token?: string;
  access_token?: string;
  user?: unknown;
  [k: string]: unknown;
};

export const login = (email: string, password: string) =>
  unwrap<LoginResponse>(api.post("/auth/login", { email, password })).then(
    (data) => {
      const token = data?.token ?? (data as any)?.access_token;
      if (typeof window !== "undefined" && token) {
        // Compat: CRM histórico usa 'token'
        localStorage.setItem("token", String(token));
      }
      return data;
    }
  );

export const register = <T = unknown>(payload: Record<string, unknown>) =>
  unwrap<T>(api.post("/auth/register", payload));

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("artdent_token");
  }
};

const _default = { login, register, logout };
export default _default;
