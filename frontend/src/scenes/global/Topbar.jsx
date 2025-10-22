// src/scenes/global/Topbar.jsx
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useContext, useEffect, useMemo, useState } from "react";
import { ColorModeContext } from "../../theme";
import { useLocation, useNavigate } from "react-router-dom";

// Services (barrel)
import {
  Companies,
  Products,
  Customers,
  Vendors,
} from "../../services";

const TOPBAR_HEIGHT = 64;

export default function Topbar({ setIsAuthenticated, onOpenSidebar, onLogout }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("token");
      setIsAuthenticated?.(false);
    }
    navigate("/");
  };

  // ===== Health panel state =====
  const [apiOk, setApiOk] = useState(null); // null | true | false
  const [latencyMs, setLatencyMs] = useState(null);
  const [label, setLabel] = useState("Empresa");
  const [count, setCount] = useState(null);
  const isDark = theme.palette.mode === "dark";

  const styles = useMemo(
    () => ({
      glassBg: isDark ? "rgba(15,23,42,.6)" : "rgba(255,255,255,.6)",
      glassBorder: isDark ? "1px solid rgba(148,163,184,.12)" : "1px solid rgba(0,0,0,.06)",
      chipBg: isDark ? "rgba(148,163,184,.12)" : "#fff",
      chipBorder: isDark ? "1px solid rgba(148,163,184,.18)" : "1px solid rgba(0,0,0,.06)",
    }),
    [isDark]
  );

  // ===== Route → Health task mapping =====
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setApiOk(null);
        setLatencyMs(null);
        setCount(null);

        const t0 = performance.now();

        // Decide qué medir según ruta
        if (pathname.startsWith("/ventas") || pathname.startsWith("/facturacion")) {
          setLabel("Productos");
          // Consulta liviana (trae 1 para verificar conexión)
          const rows = await Products.listProducts?.({ page: 1, per_page: 1 });
          const list = Array.isArray(rows) ? rows : (rows?.data ?? []);
          const t1 = performance.now();
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(t1 - t0));
            setCount(list.length);
          }
          return;
        }

        if (pathname.startsWith("/clientes")) {
          setLabel("Clientes");
          const res = await Customers.list?.({ page: 1, per_page: 1 });
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          const t1 = performance.now();
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(t1 - t0));
            setCount(list.length);
          }
          return;
        }

        if (pathname.startsWith("/articulos")) {
          setLabel("Productos");
          const rows = await Products.listProducts?.({ page: 1, per_page: 1 });
          const list = Array.isArray(rows) ? rows : (rows?.data ?? []);
          const t1 = performance.now();
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(t1 - t0));
            setCount(list.length);
          }
          return;
        }

        if (pathname.startsWith("/proveedores")) {
          setLabel("Proveedores");
          const res = await Vendors.list?.({ page: 1, per_page: 1 });
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          const t1 = performance.now();
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(t1 - t0));
            setCount(list.length);
          }
          return;
        }

        // Default: ping a empresa
        setLabel("Empresa");
        await Companies.get();
        const t1 = performance.now();
        if (!cancelled) {
          setApiOk(true);
          setLatencyMs(Math.round(t1 - t0));
          setCount(null);
        }
      } catch {
        if (!cancelled) {
          setApiOk(false);
          setLatencyMs(null);
          setCount(null);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        backdropFilter: "saturate(180%) blur(8px)",
        background: styles.glassBg,
        borderBottom: styles.glassBorder,
        height: TOPBAR_HEIGHT,
      }}
    >
      <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, gap: 1 }}>
        {/* Hamburguesa en móvil */}
        <IconButton
          onClick={onOpenSidebar}
          sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
          aria-label="abrir menú"
        >
          <MenuOutlinedIcon />
        </IconButton>

        {/* Mini Health Panel (reemplaza buscador) */}
        <Paper
          elevation={0}
          sx={{
            ml: { xs: 0, md: 1 },
            px: 1.25,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 2,
            bgcolor: styles.chipBg,
            border: styles.chipBorder,
            width: { xs: "100%", sm: 360 },
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor:
                apiOk === null
                  ? "warning.main"
                  : apiOk
                  ? "success.main"
                  : "error.main",
              flex: "0 0 auto",
            }}
          />
          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
            {label}: {apiOk === null ? "…" : apiOk ? "OK" : "Falla"}
          </Typography>
          {typeof count === "number" && (
            <Typography variant="caption" color="text.secondary" noWrap>
              • {count} ítem(s)
            </Typography>
          )}
          {typeof latencyMs === "number" && (
            <Typography variant="caption" color="text.secondary" noWrap>
              • {latencyMs} ms
            </Typography>
          )}
        </Paper>

        <Box sx={{ flexGrow: 1 }} />

        {/* Acciones */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>

        <IconButton onClick={() => navigate("/settings")}>
          <SettingsOutlinedIcon />
        </IconButton>

        <IconButton onClick={() => navigate("/profile")}>
          <PersonOutlinedIcon />
        </IconButton>

        <IconButton onClick={logout} title="Salir">
          <SettingsOutlinedIcon sx={{ transform: "rotate(90deg)" }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
