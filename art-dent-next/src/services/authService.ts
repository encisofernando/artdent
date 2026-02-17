import api from "@/lib/api";
import { unwrap } from "./utils";

interface LoginResponse {
  token: string;
  user?: Record<string, unknown>;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

export const login = (email: string, password: string): Promise<LoginResponse> =>
  unwrap<LoginResponse>(api.post("/auth/login", { email, password })).then((data) => {
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  });

export const register = (payload: RegisterPayload): Promise<LoginResponse> =>
  unwrap<LoginResponse>(api.post("/auth/register", payload));

export const requestPasswordReset = (email: string) =>
  unwrap(api.post("/auth/forgot-password", { email }));

export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("artdent_token");
};

const authService = { login, register, logout, requestPasswordReset };
export default authService;
