// src/contexts/AuthContext.jsx
//
// Reemplaza el manejo manual de "isAuthenticated + localStorage"
// por un contexto de sesión basado en cookie (Sanctum).
//
// Uso desde cualquier componente:
//   const { user, login, logout, loading } = useAuth();
//
import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  // loading = true mientras verifica la sesión con el server al iniciar la app
  const [loading, setLoading] = useState(true);

  // ── Al montar: verificar si hay cookie de sesión activa ─────────────────
  // Reemplaza el viejo: !!localStorage.getItem("token")
  useEffect(() => {
    authService
      .checkSession()               // GET /api/auth/me
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  };

  const logout = async () => {
    setUser(null);
    await authService.logout();     // POST /api/auth/logout → redirige a /
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};