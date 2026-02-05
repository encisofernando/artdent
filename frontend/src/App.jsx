import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, Box, useMediaQuery, useTheme } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

// Layout
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_WIDTH } from "./scenes/global/Sidebar";
import Topbar from "./scenes/global/Topbar";

// Páginas
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Clientes from "./scenes/clientes";
import CtaCte from "./scenes/clientes/resumen_cta";
import PagosCte from "./scenes/clientes/pagos";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import Ventas from "./scenes/facturacion/FacturarPOS";
import Articulos from "./scenes/articulos";
import Pruebas from "./scenes/pruebas/indexfacturacion";
import Settings from "./scenes/settings/Settings";
import Profile from "./scenes/profile/Profile";
import Categorias from "./scenes/categorias";
import NuevoEmpleado from "./scenes/team/TeamForm";
import Proveedores from "./scenes/proveedores";
import ProveedoresPagos from "./scenes/proveedores/pagos";
import ProveedoresCtaCte from "./scenes/proveedores/ctacte";
import Trabajos from "./scenes/jobs";
import TrabajosConsulta from "./scenes/jobs/consulta";
// Colaboradores
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
  const muiTheme = useTheme(); // este useTheme se poblará después del ThemeProvider
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  // Estado del sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ⚠️ useMediaQuery necesita un theme, así que lo calculamos *dentro* del ThemeProvider.
  // Por eso hacemos un render condicional: primero provider, luego todo lo demás.
  const AppShell = () => {
    const t = useTheme();
    const mdDown = useMediaQuery(t.breakpoints.down("md"));

    // offset del contenido (desktop)
    const contentLeftOffset = useMemo(() => {
      if (mdDown) return 0;
      return isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;
    }, [mdDown, isCollapsed]);

    return isAuthenticated ? (
      <>
        {/* Sidebar fijo en desktop / Drawer en móvil */}
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Contenedor principal desplazado */}
        <Box
          sx={{
            ml: { md: `${contentLeftOffset}px` },
            minHeight: "100vh",
            transition: "margin-left .2s ease",
          }}
        >
          <Topbar
            setIsAuthenticated={setIsAuthenticated}
            onOpenSidebar={() => setMobileOpen(true)}
          />

          <Box component="main" sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard" element={<Navigate to="/" />} />

              <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Settings /></ProtectedRoute>} />
              <Route path="/categorias" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Categorias /></ProtectedRoute>} />
              <Route path="/facturacion" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Ventas /></ProtectedRoute>} />
              <Route path="/articulos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Articulos /></ProtectedRoute>} />
              <Route path="/pruebas" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Pruebas /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Team /></ProtectedRoute>} />
              <Route path="/nuevoempleado" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NuevoEmpleado /></ProtectedRoute>} />
              <Route path="/proveedores/comprobantes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Proveedores /></ProtectedRoute>} />
              <Route path="/proveedores/pagos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProveedoresPagos /></ProtectedRoute>} />
              <Route path="/proveedores/ctacte" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProveedoresCtaCte /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Clientes /></ProtectedRoute>} />
              <Route path="/pagoscte" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PagosCte /></ProtectedRoute>} />
              <Route path="/ctacte" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CtaCte /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Invoices /></ProtectedRoute>} />
              <Route path="/form" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Form /></ProtectedRoute>} />
              <Route path="/bar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Bar /></ProtectedRoute>} />
              <Route path="/pie" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Pie /></ProtectedRoute>} />
              <Route path="/line" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Line /></ProtectedRoute>} />
              <Route path="/faq" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FAQ /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Calendar /></ProtectedRoute>} />
              <Route path="/geography" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Geography /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />
              <Route path="/trabajos/ingresar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Trabajos /></ProtectedRoute>} />
              <Route path="/trabajos/consultar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><TrabajosConsulta /></ProtectedRoute>} />
              {/* Colaboradores */}
              <Route path="/colaboradores" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Colaboradores /></ProtectedRoute>} />
              <Route path="/colaboradores/asistencias" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Asistencias /></ProtectedRoute>} />
              <Route path="/colaboradores/recibos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Recibos /></ProtectedRoute>} />

            </Routes>
          </Box>
        </Box>
      </>
    ) : (
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/crearcontrasena" element={<CrearContraseña setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppShell />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
