// src/scenes/global/Topbar.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Tooltip,
  Avatar,
  Chip,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PendingIcon from "@mui/icons-material/Pending";
import SpeedIcon from "@mui/icons-material/Speed";

import { useLocation, useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../theme";
import { Companies, Products, Customers } from "../../services";

const TOPBAR_HEIGHT = 64;

const safeAlpha = (color, value, fallback = "#000") => {
  if (typeof color !== "string" || !color.trim()) return alpha(fallback, value);
  return alpha(color, value);
};

export default function Topbar({ onOpenSidebar, setIsAuthenticated, onLogout }) {
  const theme = useTheme();

  // Breakpoints
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  // Fallback robusto
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const showHamburger = mdDown || isNarrow;

  const isDark = theme.palette.mode === "dark";
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [apiOk, setApiOk] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [label, setLabel] = useState("Sistema");

  const logout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("token");
      localStorage.removeItem("artdent_token");
      setIsAuthenticated?.(false);
    }
    navigate("/");
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setApiOk(null);
        setLatencyMs(null);

        const t0 = performance.now();

        if (
          pathname.startsWith("/facturacion") ||
          pathname.startsWith("/invoices") ||
          pathname.startsWith("/articulos")
        ) {
          setLabel("Productos");
          await Products.listProducts?.({ page: 1, per_page: 1 });
        } else if (
          pathname.startsWith("/clientes") ||
          pathname.startsWith("/ctacte") ||
          pathname.startsWith("/pagoscte")
        ) {
          setLabel("Clientes");
          await Customers.list?.({ page: 1, per_page: 1 });
        } else {
          setLabel("Sistema");
          await Companies.get?.();
        }

        if (!cancelled) {
          setApiOk(true);
          setLatencyMs(Math.round(performance.now() - t0));
        }
      } catch {
        if (!cancelled) setApiOk(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const status = useMemo(() => {
    if (apiOk === null) {
      return {
        icon: <PendingIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.warning.main,
      };
    }
    if (apiOk) {
      return {
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.success.main,
      };
    }
    return {
      icon: <ErrorIcon sx={{ fontSize: 16 }} />,
      color: theme.palette.error.main,
    };
  }, [apiOk, theme.palette.error.main, theme.palette.success.main, theme.palette.warning.main]);

  const appBarBg = safeAlpha(
    isDark ? theme.palette.background.default : theme.palette.background.paper,
    0.86,
    isDark ? "#101318" : "#ffffff"
  );

  const textColor = isDark ? theme.palette.common.white : theme.palette.text.primary;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        height: TOPBAR_HEIGHT,
        zIndex: (t) => t.zIndex.drawer + 10,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(12px)",
        backgroundColor: appBarBg,
      }}
    >
      <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, px: { xs: 1, sm: 2 }, gap: 1 }}>
        {/* Botón menú: mobile/tablet */}
        {showHamburger && (
          <IconButton
            onClick={() => onOpenSidebar?.()}
            sx={{ color: textColor }}
            aria-label="Abrir menú"
          >
            <MenuOutlinedIcon />
          </IconButton>
        )}

        {/* Estado: NO mostrar en mobile (smDown) */}
        {!smDown && (
          <Paper
            elevation={0}
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: safeAlpha(isDark ? "#fff" : "#000", isDark ? 0.06 : 0.04, "#000"),
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 260,
              maxWidth: 360,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: status.color,
                ...(apiOk === null && {
                  animation: "pulse 1.6s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%,100%": { opacity: 1 },
                    "50%": { opacity: 0.45 },
                  },
                }),
              }}
            />

            <Typography noWrap sx={{ fontSize: 13, fontWeight: 800, color: textColor, flex: 1 }}>
              {label}
            </Typography>

            {latencyMs != null && (
              <Chip
                icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                label={`${latencyMs}ms`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 800,
                  bgcolor: safeAlpha(isDark ? "#fff" : "#000", 0.12, "#000"),
                  color: textColor,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            )}

            {status.icon}
          </Paper>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Acciones */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={isDark ? "Modo claro" : "Modo oscuro"}>
            <IconButton onClick={colorMode.toggleColorMode} sx={{ color: textColor }}>
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton sx={{ color: textColor }}>
              <NotificationsOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cerrar sesión">
            <IconButton onClick={logout} sx={{ color: textColor }}>
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                ml: 0.5,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 800,
                cursor: "pointer",
              }}
              onClick={() => navigate("/profile")}
            >
              A
            </Avatar>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}