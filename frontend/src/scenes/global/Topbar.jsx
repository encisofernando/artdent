// src/scenes/global/Topbar.jsx
//
// Assets requeridos en src/assets/:
//   logo-artdent-color.png   →  "logo ART DENT.png"
//   logo-artdent-blanco.png  →  "logo ART DENT (blanco trans).png"

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
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";

import MenuOutlinedIcon           from "@mui/icons-material/MenuOutlined";
import LightModeOutlinedIcon      from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon       from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon  from "@mui/icons-material/NotificationsOutlined";
import LogoutOutlinedIcon         from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon          from "@mui/icons-material/PersonOutline";

import { useLocation, useNavigate } from "react-router-dom";
import { ColorModeContext }         from "../../theme";
import { Companies, Products, Customers } from "../../services";

import logoColor  from "../../assets/logo-artdent-color.png";
import logoBlanco from "../../assets/logo-artdent-blanco.png";

export const TOPBAR_HEIGHT = 64;

/* ─── Status dot helper ─── */
const StatusDot = ({ apiOk, latencyMs, label, isDark }) => {
  const color =
    apiOk === null  ? "#FFB020"  // pending  → warning
    : apiOk         ? "#5AAD9C"  // ok       → brand green
    :                 "#E63946"; // error    → red

  return (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 1.5,
      py: 0.6,
      borderRadius: "8px",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      userSelect: "none",
    }}>
      {/* Animated dot */}
      <Box sx={{
        width: 7, height: 7,
        borderRadius: "50%",
        bgcolor: color,
        flexShrink: 0,
        ...(apiOk === null && {
          animation: "pulseDot 1.5s ease-in-out infinite",
          "@keyframes pulseDot": {
            "0%,100%": { opacity: 1, transform: "scale(1)" },
            "50%":     { opacity: 0.4, transform: "scale(0.8)" },
          },
        }),
        ...(apiOk === true && {
          boxShadow: `0 0 6px ${alpha(color, 0.6)}`,
        }),
      }}/>

      <Typography sx={{
        fontSize: 12.5,
        fontWeight: 600,
        color: isDark ? "rgba(230,238,245,0.85)" : "rgba(26,32,44,0.75)",
        lineHeight: 1,
      }}>
        {label}
      </Typography>

      {latencyMs != null && (
        <Typography sx={{
          fontSize: 11,
          fontWeight: 700,
          color: isDark ? "rgba(172,214,206,0.7)" : "rgba(57,123,156,0.8)",
          lineHeight: 1,
        }}>
          {latencyMs}ms
        </Typography>
      )}
    </Box>
  );
};

/* ══════════════════════════════════════════════ */
export default function Topbar({ onOpenSidebar, setIsAuthenticated, onLogout }) {
  const theme    = useTheme();
  const isDark   = theme.palette.mode === "dark";
  const colorMode = useContext(ColorModeContext);
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const mdDown     = useMediaQuery(theme.breakpoints.down("md"));
  const smDown     = useMediaQuery(theme.breakpoints.down("sm"));
  const isNarrow   = useMediaQuery("(max-width: 900px)");
  const showHamburger = mdDown || isNarrow;

  const [apiOk, setApiOk]       = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [label, setLabel]       = useState("Sistema");

  const logout = () => {
    if (onLogout) { onLogout(); return; }
    localStorage.removeItem("token");
    localStorage.removeItem("artdent_token");
    setIsAuthenticated?.(false);
    navigate("/");
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setApiOk(null); setLatencyMs(null);
        const t0 = performance.now();

        if (pathname.startsWith("/facturacion") || pathname.startsWith("/invoices") || pathname.startsWith("/articulos")) {
          setLabel("Productos");
          await Products.listProducts?.({ page: 1, per_page: 1 });
        } else if (pathname.startsWith("/clientes") || pathname.startsWith("/ctacte") || pathname.startsWith("/pagoscte")) {
          setLabel("Clientes");
          await Customers.list?.({ page: 1, per_page: 1 });
        } else {
          setLabel("Sistema");
          await Companies.get?.();
        }

        if (!cancelled) { setApiOk(true); setLatencyMs(Math.round(performance.now() - t0)); }
      } catch {
        if (!cancelled) setApiOk(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [pathname]);

  // User data from localStorage
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  const userInitial = (user?.name || user?.email || "A")[0].toUpperCase();

  // Topbar surface color
  const bgSurface = isDark
    ? alpha(theme.palette.background.default, 0.92)
    : alpha(theme.palette.background.paper, 0.94);

  const iconColor = isDark ? "rgba(230,238,245,0.75)" : "rgba(26,32,44,0.65)";
  const iconHover = isDark ? "rgba(230,238,245,1)"    : "rgba(26,32,44,1)";

  /* ── Shared icon button style ── */
  const iconBtnSx = {
    color: iconColor,
    borderRadius: "8px",
    width: 36, height: 36,
    "&:hover": {
      color: iconHover,
      bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
    },
    "& svg": { fontSize: 20 },
    transition: "color .15s, background-color .15s",
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        height: TOPBAR_HEIGHT,
        zIndex: (t) => t.zIndex.drawer + 10,
        backdropFilter: "blur(14px)",
        backgroundColor: bgSurface,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
      }}
    >
      <Toolbar sx={{
        minHeight: `${TOPBAR_HEIGHT}px !important`,
        px: { xs: 1.5, sm: 2 },
        gap: 1,
        display: "flex",
        alignItems: "center",
      }}>

        {/* ── Hamburger (mobile/tablet) ── */}
        {showHamburger && (
          <IconButton
            onClick={() => onOpenSidebar?.()}
            sx={{ ...iconBtnSx, mr: 0.5 }}
            aria-label="Abrir menú"
          >
            <MenuOutlinedIcon />
          </IconButton>
        )}

        {/* ── Mobile logo (visible solo cuando el sidebar está oculto) ── */}
        {showHamburger && (
          <Box
            component="img"
            src={isDark ? logoBlanco : logoColor}
            alt="ArtDent"
            sx={{
              height: 32,
              width: "auto",
              objectFit: "contain",
              filter: isDark ? "brightness(0) invert(1)" : "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={() => navigate("/")}
          />
        )}

        {/* ── API Status (solo tablets+) ── */}
        {!smDown && (
          <StatusDot
            apiOk={apiOk}
            latencyMs={latencyMs}
            label={label}
            isDark={isDark}
          />
        )}

        <Box sx={{ flex: 1 }} />

        {/* ── Acciones ── */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Toggle dark/light */}
          <Tooltip title={isDark ? "Modo claro" : "Modo oscuro"} arrow>
            <IconButton onClick={colorMode.toggleColorMode} sx={iconBtnSx}>
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          {/* Notificaciones */}
          <Tooltip title="Notificaciones" arrow>
            <IconButton sx={iconBtnSx}>
              <NotificationsOutlinedIcon />
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Cerrar sesión" arrow>
            <IconButton onClick={logout} sx={iconBtnSx}>
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>

          {/* Divider visual */}
          <Box sx={{
            width: 1,
            height: 24,
            bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            mx: 0.5,
          }} />

          {/* Avatar / perfil */}
          <Tooltip title={user?.name || user?.email || "Perfil"} arrow>
            <Box
              onClick={() => navigate("/profile")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 0.75,
                py: 0.5,
                borderRadius: "8px",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                },
                transition: "background-color .15s",
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  background: "linear-gradient(135deg, #397B9C, #5AAD9C)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "Montserrat, sans-serif",
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </Avatar>

              {/* Nombre (solo en desktop amplio) */}
              {!smDown && user?.name && (
                <Box sx={{ lineHeight: 1.2, display: { xs: "none", lg: "block" } }}>
                  <Typography sx={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: isDark ? "rgba(230,238,245,0.9)" : "rgba(26,32,44,0.85)",
                    lineHeight: 1.2,
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {user.name}
                  </Typography>
                  {user?.role && (
                    <Typography sx={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      color: isDark ? "rgba(172,214,206,0.65)" : "rgba(57,123,156,0.75)",
                      lineHeight: 1.2,
                      textTransform: "capitalize",
                    }}>
                      {user.role}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}