// src/components/auth/ProtectedRoute.jsx
//
// Reemplaza el guard viejo que leía el token de localStorage.
// Ahora usa el AuthContext para saber si hay sesión.
//
import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Mientras verifica la sesión con el server → spinner
  if (loading) {
    return (
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", bgcolor: "#0F1F2A",
      }}>
        <CircularProgress sx={{ color: "#397B9C" }} />
      </Box>
    );
  }

  // Sin sesión → redirigir al login
  if (!user) return <Navigate to="/login" replace />;

  // Sesión activa → renderizar la ruta protegida
  return <Outlet />;
}