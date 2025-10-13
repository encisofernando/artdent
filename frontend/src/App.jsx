import { useState } from "react";
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
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Ventas from "./scenes/facturacion/Facturacion2";
import Articulos from "./scenes/articulos";
import Pruebas from "./scenes/pruebas/indexfacturacion";
import Login from "./login/Login";
import Register from "./login/Register";
import Settings from './scenes/settings/Settings';
import Profile from "./scenes/profile/Profile";
import Categorias from "./scenes/categorias";
import NuevoEmpleado from "./scenes/team/TeamForm";
import Proveedores from "./scenes/proveedores";
import CrearContraseña from "./login/Crearcontraseña";


const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token'); // Verifica si el token existe
  });

  return (
    <>
      {isAuthenticated ? (
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="app">
              {isSidebar && <Sidebar isSidebar={isSidebar} />}
              <main className="content">
                <Topbar setIsAuthenticated={setIsAuthenticated} setIsSidebar={setIsSidebar} />
                <Routes>
                  {/* Rutas protegidas */}
                  <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<Navigate to="/" />} /> {/* Redirige "/dashboard" a "/" */}
                  <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Settings /></ProtectedRoute>} />
                  <Route path="/categorias" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Categorias/></ProtectedRoute>} />
                  <Route path="/facturacion" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Ventas /></ProtectedRoute>} />
                  <Route path="/articulos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Articulos /></ProtectedRoute>} />
                  <Route path="/pruebas" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Pruebas /></ProtectedRoute>} />
                  <Route path="/team" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Team /></ProtectedRoute>} />
                  <Route path="/nuevoempleado" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NuevoEmpleado /></ProtectedRoute>} />
                  <Route path="/proveedores" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Proveedores /></ProtectedRoute>} />
                  <Route path="/clientes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Clientes /></ProtectedRoute>} />
                  <Route path="/invoices" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Invoices /></ProtectedRoute>} />
                  <Route path="/form" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Form /></ProtectedRoute>} />
                  <Route path="/bar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Bar /></ProtectedRoute>} />
                  <Route path="/pie" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Pie /></ProtectedRoute>} />
                  <Route path="/line" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Line /></ProtectedRoute>} />
                  <Route path="/faq" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FAQ /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Calendar /></ProtectedRoute>} />
                  <Route path="/geography" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Geography /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />

                </Routes>
              </main>
            </div>
          </ThemeProvider>
        </ColorModeContext.Provider>
      ) : (
        <div className="">
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/crearcontrasena" element={<CrearContraseña setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;
