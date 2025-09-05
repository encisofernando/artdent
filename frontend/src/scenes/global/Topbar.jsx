import {
  Box,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useNavigate } from "react-router-dom";

const Topbar = ({ setIsAuthenticated, onOpenSidebar, onLogout }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfileClick = () => { handleMenuClose(); navigate("/profile"); };
  const handleLogout = () => {
    if (onLogout) onLogout();                // usa el callback centralizado
    else {
      localStorage.removeItem('token');      // fallback
      setIsAuthenticated?.(false);
    }
    navigate('/');
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={1.5}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "background.default",
        borderBottom: `1px solid ${colors.grey[800]}20`,
      }}
    >
      {/* Izquierda: hamburguesa (móvil) + búsqueda (md+) */}
      <Box display="flex" alignItems="center" gap={1}>
        {mdDown && (
          <IconButton onClick={onOpenSidebar} aria-label="Abrir menú">
            <MenuOutlinedIcon />
          </IconButton>
        )}

        <Box
          display={{ xs: "none", sm: "none", md: "flex" }}
          alignItems="center"
          sx={{
            backgroundColor: colors.primary[400],
            borderRadius: "8px",
            pl: 1,
            width: { md: 280, lg: 360 },
          }}
        >
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Buscar" />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Derecha: acciones */}
      <Box display="flex" alignItems="center">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton onClick={() => navigate("/settings")}>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleMenuOpen}>
          <PersonOutlinedIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleProfileClick} sx={{ "&:hover": { backgroundColor: colors.primary[100] } }}>
            <PersonOutlinedIcon sx={{ mr: 1 }} />
            <Typography variant="body1">Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ "&:hover": { backgroundColor: colors.primary[100] } }}>
            <ExitToAppIcon sx={{ mr: 1 }} />
            <Typography variant="body1">Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
