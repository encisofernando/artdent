// src/App.jsx
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

import Layout from "./scenes/global/Layout";

// Páginas
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Clientes from "./scenes/clientes";
import CtaCte from "./scenes/clientes/resumen_cta";
import PagosCte from "./scenes/clientes/pagos";
import Calendar from "./scenes/calendar/calendar";
import Ventas from "./scenes/facturacion/FacturarPOS";
import Articulos from "./scenes/articulos";
import Settings from "./scenes/settings/Settings";
import Profile from "./scenes/profile/Profile";
import Categorias from "./scenes/categorias";
import NuevoEmpleado from "./scenes/team/TeamForm";
import Proveedores from "./scenes/proveedores";
import ProveedoresPagos from "./scenes/proveedores/pagos";
import ProveedoresCtaCte from "./scenes/proveedores/ctacte";
import Trabajos from "./scenes/jobs";
import TrabajosConsulta from "./scenes/jobs/consulta";
import Colaboradores from "./scenes/colaboradores/Colaboradores";
import Asistencias from "./scenes/colaboradores/Asistencias";
import Recibos from "./scenes/colaboradores/Recibos";

// Auth
import Login from "./login/Login";
import Register from "./login/Register";
import CrearContraseña from "./login/Crearcontraseña";

const ProtectedRoute = ({ children, isAuthenticated }) =>
  isAuthenticated ? children : <Navigate to="/" />;

export default function App() {
  const [theme, colorMode] = useMode();
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {isAuthenticated ? (
          <Layout setIsAuthenticated={setIsAuthenticated}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Settings /></ProtectedRoute>} />
              <Route path="/categorias" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Categorias /></ProtectedRoute>} />
              <Route path="/facturacion" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Ventas /></ProtectedRoute>} />
              <Route path="/articulos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Articulos /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Team /></ProtectedRoute>} />
              <Route path="/nuevoempleado" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NuevoEmpleado /></ProtectedRoute>} />
              <Route path="/proveedores/comprobantes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Proveedores /></ProtectedRoute>} />
              <Route path="/proveedores/pagos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProveedoresPagos /></ProtectedRoute>} />
              <Route path="/proveedores/ctacte" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProveedoresCtaCte /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Clientes /></ProtectedRoute>} />
              <Route path="/pagoscte" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PagosCte /></ProtectedRoute>} />
              <Route path="/ctacte" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CtaCte /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Invoices /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Calendar /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />
              <Route path="/trabajos/ingresar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Trabajos /></ProtectedRoute>} />
              <Route path="/trabajos/consultar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><TrabajosConsulta /></ProtectedRoute>} />
              <Route path="/colaboradores" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Colaboradores /></ProtectedRoute>} />
              <Route path="/colaboradores/asistencias" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Asistencias /></ProtectedRoute>} />
              <Route path="/colaboradores/recibos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Recibos /></ProtectedRoute>} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/forgot" element={<CrearContraseña setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}