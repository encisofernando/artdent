import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  InputBase,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useContext } from "react";
import { ColorModeContext } from "../../theme";
import { useNavigate } from "react-router-dom";

const TOPBAR_HEIGHT = 64;

export default function Topbar({ setIsAuthenticated, onOpenSidebar, onLogout }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const logout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("token");
      setIsAuthenticated?.(false);
    }
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        backdropFilter: "saturate(180%) blur(8px)",
        background:
          theme.palette.mode === "dark"
            ? "rgba(15, 23, 42, .6)"
            : "rgba(255,255,255,.6)",
        borderBottom:
          theme.palette.mode === "dark"
            ? "1px solid rgba(148,163,184,.12)"
            : "1px solid rgba(0,0,0,.06)",
        height: TOPBAR_HEIGHT,
      }}
    >
      <Toolbar sx={{ minHeight: TOPBAR_HEIGHT }}>
        {/* Hamburguesa en móvil */}
        <IconButton
          onClick={onOpenSidebar}
          sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
          aria-label="abrir menú"
        >
          <MenuOutlinedIcon />
        </IconButton>

        {/* Buscador */}
        <Box
          sx={{
            ml: { xs: 0, md: 1 },
            px: 1.5,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 2,
            bgcolor:
              theme.palette.mode === "dark" ? "rgba(148,163,184,.12)" : "#ffffff",
            border:
              theme.palette.mode === "dark"
                ? "1px solid rgba(148,163,184,.18)"
                : "1px solid rgba(0,0,0,.06)",
            width: { xs: "100%", sm: 360 },
          }}
        >
          <SearchIcon fontSize="small" />
          <InputBase placeholder="Buscar" fullWidth />
        </Box>

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
