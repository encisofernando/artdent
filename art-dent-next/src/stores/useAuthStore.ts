"use client";
import { create } from "zustand";
import { clearAuth } from "@/lib/auth";

interface User {
  id?:    number | string;
  name?:  string;
  email?: string;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  token:           string | null;
  user:            User | null;
  _hydrated:       boolean;

  hydrate:  () => void;
  setAuth:  (token: string, user?: User) => void;
  setUser:  (user: User) => void;
  logout:   () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  token:           null,
  user:            null,
  _hydrated:       false,

  // Llamar en el cliente para leer localStorage
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("artdent_token") ||
      localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    set({ isAuthenticated: !!token, token, user, _hydrated: true });
  },

  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
    }
    set({ isAuthenticated: true, token, user: user ?? null });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    clearAuth();
    set({ isAuthenticated: false, token: null, user: null });
  },
}));
