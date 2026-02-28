// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, Box, CircularProgress } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { useAuth } from "./contexts/AuthContext";

import Layout from "./scenes/global/Layout";
import PWAInstallPrompt from "./components/pwa/PWAInstallPrompt";

// ── Páginas ──────────────────────────────────────────────────────────────────
import Dashboard           from "./scenes/dashboard";
import Team                from "./scenes/team";
import Invoices            from "./scenes/invoices";
import Clientes            from "./scenes/clientes";
import CtaCte              from "./scenes/clientes/resumen_cta";
import PagosCte            from "./scenes/clientes/pagos";
import Calendar            from "./scenes/calendar/calendar";
import Ventas              from "./scenes/facturacion/FacturarPOS";
import Articulos           from "./scenes/articulos";
import Settings            from "./scenes/settings/Settings";
import Profile             from "./scenes/profile/Profile";
import Categorias          from "./scenes/categorias";
import NuevoEmpleado       from "./scenes/team/TeamForm";
import Proveedores         from "./scenes/proveedores";
import ProveedoresPagos    from "./scenes/proveedores/pagos";
import ProveedoresCtaCte   from "./scenes/proveedores/ctacte";
import Trabajos            from "./scenes/jobs";
import TrabajosConsulta    from "./scenes/jobs/consulta";
import Colaboradores       from "./scenes/colaboradores/Colaboradores";
import Asistencias         from "./scenes/colaboradores/Asistencias";
import Recibos             from "./scenes/colaboradores/Recibos";

// ── Laboratorio ──────────────────────────────────────────────────────────────
import LabNuevaOrden       from "./scenes/laboratorio/OrdenTrabajo/index";
import LabConsultaOrdenes  from "./scenes/laboratorio/OrdenTrabajo/consulta";
import LabClientes         from "./scenes/laboratorio/Clientes";
import LabCuentasCorrientes from "./scenes/laboratorio/CuentasCorrientes";
import LabAranceles        from "./scenes/laboratorio/Aranceles";
import LabCostos           from "./scenes/laboratorio/Costos";
import LabPagos            from "./scenes/laboratorio/Pagos";

// ── Auth pages ───────────────────────────────────────────────────────────────
import Login          from "./login/Login";
import Register       from "./login/Register";
import CrearContraseña from "./login/Crearcontraseña";

// ─── Pantalla de carga inicial (verifica sesión con el server) ───────────────
function LoadingScreen() {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0e1a24 0%, #111f2c 100%)",
    }}>
      <CircularProgress sx={{ color: "#397B9C" }} size={36} />
    </Box>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, colorMode] = useMode();

  // `loading` = true mientras AuthContext verifica la cookie de sesión con GET /api/auth/me
  // `user`    = objeto del usuario autenticado, o null
  // `logout`  = invalida la sesión en el server y redirige a /
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LoadingScreen />
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {user ? (
          /* ── Área protegida: Layout + todas las rutas ── */
          // `setIsAuthenticated` se mantiene como prop de Layout por
          // compatibilidad; al llamarlo hace logout via AuthContext.
          <Layout setIsAuthenticated={logout}>
            <Routes>
              <Route path="/"                          element={<Dashboard />} />
              <Route path="/settings"                  element={<Settings />} />
              <Route path="/categorias"                element={<Categorias />} />
              <Route path="/facturacion"               element={<Ventas />} />
              <Route path="/articulos"                 element={<Articulos />} />
              <Route path="/team"                      element={<Team />} />
              <Route path="/nuevoempleado"             element={<NuevoEmpleado />} />
              <Route path="/proveedores/comprobantes"  element={<Proveedores />} />
              <Route path="/proveedores/pagos"         element={<ProveedoresPagos />} />
              <Route path="/proveedores/ctacte"        element={<ProveedoresCtaCte />} />
              <Route path="/clientes"                  element={<Clientes />} />
              <Route path="/pagoscte"                  element={<PagosCte />} />
              <Route path="/ctacte"                    element={<CtaCte />} />
              <Route path="/invoices"                  element={<Invoices />} />
              <Route path="/calendar"                  element={<Calendar />} />
              <Route path="/profile"                   element={<Profile />} />
              <Route path="/trabajos/ingresar"         element={<Trabajos />} />
              <Route path="/trabajos/consultar"        element={<TrabajosConsulta />} />
              <Route path="/colaboradores"             element={<Colaboradores />} />
              <Route path="/colaboradores/asistencias" element={<Asistencias />} />
              <Route path="/colaboradores/recibos"     element={<Recibos />} />

              {/* ── Laboratorio ── */}
              <Route path="/laboratorio/ordenes"   element={<LabNuevaOrden />} />
              <Route path="/laboratorio/consulta"  element={<LabConsultaOrdenes />} />
              <Route path="/laboratorio/clientes"  element={<LabClientes />} />
              <Route path="/laboratorio/ctacte"    element={<LabCuentasCorrientes />} />
              <Route path="/laboratorio/aranceles" element={<LabAranceles />} />
              <Route path="/laboratorio/costos"    element={<LabCostos />} />
              <Route path="/laboratorio/pagos"     element={<LabPagos />} />

              {/* Cualquier ruta desconocida → dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        ) : (
          /* ── Área pública: login / registro ── */
          <Routes>
            <Route path="/"        element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot"   element={<CrearContraseña />} />
            {/* Cualquier ruta protegida sin sesión → login */}
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        )}

        {/* Banner PWA "Instalar app" — flotante, no bloquea nada */}
        <PWAInstallPrompt />

      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}