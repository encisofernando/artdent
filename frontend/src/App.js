// App.js
import { useEffect, useCallback, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Clientes from "./scenes/clientes";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import Ventas from "./scenes/facturacion/Facturacion2";
import Articulos from "./scenes/articulos";
import Pruebas from "./scenes/pruebas/indexfacturacion";
import Login from "./login/Login";
import Register from "./login/Register";
import Settings from "./scenes/settings/Settings";
import Profile from "./scenes/profile/Profile";
import Categorias from "./scenes/categorias";
import NuevoEmpleado from "./scenes/team/TeamForm";
import Proveedores from "./scenes/proveedores";
import CrearContraseña from "./login/Crearcontraseña";

import { CssBaseline, ThemeProvider, Box, useMediaQuery } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

const ProtectedRoute = ({ children, isAuthenticated }) =>
  isAuthenticated ? children : <Navigate to="/" replace />;

function App() {
  const [theme, colorMode] = useMode();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")
  );

  const handleLogin = useCallback((token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setIsAuthenticated(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ====== Responsive Sidebar state ======
  const mdDown = useMediaQuery("(max-width:900px)"); // ~ MUI md
  const [mobileOpen, setMobileOpen] = useState(false); // Drawer en móvil
  const [isCollapsed, setIsCollapsed] = useState(false); // Colapsar en desktop
  const sidebarWidth = isCollapsed ? 80 : 260;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {isAuthenticated ? (
          <Box display="flex">
            {/* Sidebar:
                - en móvil se muestra en Drawer controlado por mobileOpen
                - en desktop queda fijo y colapsable */}
            <Sidebar
              mobileOpen={mobileOpen}
              onClose={() => setMobileOpen(false)}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />

            {/* Contenido */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: "100vh",
                ml: mdDown ? 0 : `${sidebarWidth}px`,
                transition: "margin-left .2s ease",
                px: { xs: 1, sm: 2, md: 3 },
              }}
            >
              <Topbar
                setIsAuthenticated={setIsAuthenticated}
                onOpenSidebar={() => setMobileOpen(true)}
                onLogout={handleLogout}
              />

              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categorias"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Categorias />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/facturacion"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Ventas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/articulos"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Articulos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pruebas"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Pruebas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Team />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nuevoempleado"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <NuevoEmpleado />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/proveedores"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Proveedores />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Clientes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Invoices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/form"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Form />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bar"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Bar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pie"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Pie />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/line"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Line />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faq"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <FAQ />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/geography"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Geography />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
          </Box>
        ) : (
          <Box className="auth">
            <Routes>
              <Route
                path="/"
                element={
                  <Login
                    onLogin={handleLogin}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                }
              />
              <Route
                path="/register"
                element={
                  <Register
                    onLogin={handleLogin}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                }
              />
              <Route
                path="/crearcontrasena"
                element={
                  <CrearContraseña
                    onLogin={handleLogin}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
