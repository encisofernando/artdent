// ===== TOPBAR - REEMPLAZO COMPLETO =====
// Reemplazar TODO el contenido de Topbar.jsx con este código

import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Paper,
  Typography,
  useTheme,
  Avatar,
  Chip,
  Stack,
  Tooltip,
  alpha,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PendingIcon from "@mui/icons-material/Pending";
import SpeedIcon from "@mui/icons-material/Speed";
import { useContext, useEffect, useMemo, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { useLocation, useNavigate } from "react-router-dom";
import { Companies, Products, Customers, Vendors } from "../../services";

const TOPBAR_HEIGHT = 64;

export default function Topbar({ setIsAuthenticated, onOpenSidebar, onLogout }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const [apiOk, setApiOk] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [label, setLabel] = useState("Sistema");
  const [count, setCount] = useState(null);

  const isDark = theme.palette.mode === 'dark';

  const logout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("token");
      localStorage.removeItem("artdent_token");
      setIsAuthenticated?.(false);
    }
    navigate("/");
  };

  // Health check
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setApiOk(null);
        const t0 = performance.now();

        if (pathname.startsWith("/ventas") || pathname.startsWith("/facturacion")) {
          setLabel("Productos");
          const rows = await Products.listProducts?.({ page: 1, per_page: 1 });
          const list = Array.isArray(rows) ? rows : (rows?.data ?? []);
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(performance.now() - t0));
            setCount(list.length);
          }
        } else if (pathname.startsWith("/clientes")) {
          setLabel("Clientes");
          const res = await Customers.list?.({ page: 1, per_page: 1 });
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(performance.now() - t0));
            setCount(list.length);
          }
        } else {
          setLabel("Sistema");
          await Companies.get();
          if (!cancelled) {
            setApiOk(true);
            setLatencyMs(Math.round(performance.now() - t0));
          }
        }
      } catch {
        if (!cancelled) setApiOk(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [pathname]);

  const statusConfig = useMemo(() => {
    if (apiOk === null) {
      return {
        icon: <PendingIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.warning.main,
        label: "Verificando"
      };
    }
    if (apiOk) {
      return {
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.success.main,
        label: "Conectado"
      };
    }
    return {
      icon: <ErrorIcon sx={{ fontSize: 16 }} />,
      color: theme.palette.error.main,
      label: "Error"
    };
  }, [apiOk, theme.palette]);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        backdropFilter: "blur(12px)",
        background: isDark
          ? alpha(colors.primary[700], 0.8)
          : alpha('#fff', 0.9),
        borderBottom: `1px solid ${colors.outline}`,
        height: TOPBAR_HEIGHT,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, gap: { xs: 0.5, sm: 1.5 }, px: { xs: 1, sm: 2 } }}>
        {/* Menu móvil */}
        <IconButton
          onClick={onOpenSidebar}
          sx={{ 
            display: { xs: 'inline-flex', md: 'none' },
            color: isDark ? '#fff' : colors.grey[100],
          }}
        >
          <MenuOutlinedIcon />
        </IconButton>

        {/* Panel de Estado */}
        <Paper
          elevation={0}
          sx={{
            ml: { xs: 0, md: 1 },
            px: { xs: 1, sm: 2 },
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderRadius: 3,
            bgcolor: isDark ? colors.primary[500] : '#fff',
            border: `2px solid ${isDark ? colors.primary[400] : colors.outline}`,
            width: { xs: "auto", sm: "auto", md: 360 },
            boxShadow: isDark 
              ? '0 4px 12px rgba(0,0,0,0.2)'
              : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: statusConfig.color,
              animation: apiOk === null ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
            }}
          />
          
          <Stack direction="row" alignItems="center" spacing={1} flex={1} minWidth={0}>
            <Typography 
              variant="body2" 
              noWrap 
              sx={{ 
                fontWeight: 700,
                color: isDark ? '#fff' : colors.grey[100],
                fontSize: 14,
              }}
            >
              {label}
            </Typography>
            
            {latencyMs && (
              <Chip
                icon={<SpeedIcon sx={{ fontSize: 12 }} />}
                label={`${latencyMs}ms`}
                size="small"
                sx={{
                  height: 22,
                  bgcolor: isDark 
                    ? alpha('#fff', 0.15)
                    : colors.grey[700],
                  color: isDark ? '#fff' : colors.grey[100],
                  fontWeight: 600,
                  fontSize: 11,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
            )}
          </Stack>

          {statusConfig.icon}
        </Paper>

        <Box sx={{ flexGrow: 1 }} />

        {/* Acciones */}
        <Stack direction="row" spacing={1}>
          <Tooltip title={isDark ? "Modo Claro" : "Modo Oscuro"}>
            <IconButton 
              onClick={colorMode.toggleColorMode}
              sx={{ color: isDark ? '#fff' : colors.grey[100] }}
            >
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton sx={{ color: isDark ? '#fff' : colors.grey[100] }}>
              <NotificationsOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Configuración">
            <IconButton 
              onClick={() => navigate("/settings")}
              sx={{ 
                color: isDark ? '#fff' : colors.grey[100],
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              <SettingsOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cerrar Sesión">
            <IconButton
              onClick={logout}
              sx={{ color: isDark ? '#fff' : colors.grey[100] }}
            >
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: colors.greenAccent[500],
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={() => navigate("/profile")}
          >
            A
          </Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}