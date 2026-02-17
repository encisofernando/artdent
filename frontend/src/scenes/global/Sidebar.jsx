// src/scenes/global/Sidebar.jsx - COMPLETAMENTE NUEVO Y PROFESIONAL
import { useEffect, useState, useMemo } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { tokens } from "../../theme";

// Iconos
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BadgeIcon from "@mui/icons-material/Badge";
import WorkIcon from "@mui/icons-material/Work";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Iconos secundarios
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ArticleIcon from "@mui/icons-material/Article";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";

export const SIDEBAR_WIDTH = 280;
export const COLLAPSED_WIDTH = 80;

const Sidebar = ({ mobileOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({});
  const [popupMenu, setPopupMenu] = useState(null); // Para menú flotante en modo colapsado
  const [popupMenuItems, setPopupMenuItems] = useState([]); // Items del menú flotante

  // Colores del sidebar
  const sidebarColors = useMemo(
    () => ({
      bg: isDark ? colors.primary[800] : '#fff',
      text: isDark ? colors.grey[100] : colors.grey[100],
      textSecondary: isDark ? colors.grey[300] : colors.grey[400],
      hover: isDark ? alpha(colors.primary[700], 0.6) : alpha(colors.grey[900], 0.8),
      active: isDark ? colors.primary[600] : colors.greenAccent[500],
      activeText: '#fff',
      border: isDark ? alpha('#fff', 0.08) : colors.outline,
      expandBg: isDark ? alpha(colors.primary[700], 0.4) : alpha(colors.grey[900], 0.5),
    }),
    [isDark, colors]
  );

  const handleToggle = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handlePopupOpen = (event, item) => {
    setPopupMenu(event.currentTarget);
    setPopupMenuItems(item.children || []);
  };

  const handlePopupClose = () => {
    setPopupMenu(null);
    setPopupMenuItems([]);
  };

  const isActive = (path) => location.pathname === path;

  // Auto-expandir según ruta
  useEffect(() => {
    if (location.pathname.startsWith("/facturacion") || location.pathname.startsWith("/invoices") || location.pathname.startsWith("/articulos")) {
      setOpenMenus((prev) => ({ ...prev, ventas: true }));
    }
    if (location.pathname.startsWith("/clientes")) {
      setOpenMenus((prev) => ({ ...prev, clientes: true }));
    }
    if (location.pathname.startsWith("/proveedores")) {
      setOpenMenus((prev) => ({ ...prev, proveedores: true }));
    }
    if (location.pathname.startsWith("/colaboradores")) {
      setOpenMenus((prev) => ({ ...prev, colaboradores: true }));
    }
    if (location.pathname.startsWith("/trabajos")) {
      setOpenMenus((prev) => ({ ...prev, trabajos: true }));
    }
    if (location.pathname.startsWith("/team") || location.pathname.startsWith("/settings") || location.pathname.startsWith("/categorias")) {
      setOpenMenus((prev) => ({ ...prev, administracion: true }));
    }

    if (mdDown && onClose) onClose();
  }, [location.pathname, mdDown, onClose]);

  // Estructura del menú
  const menuItems = [
    {
      title: "Panel General",
      icon: <HomeOutlinedIcon />,
      path: "/",
    },
    {
      title: "Ventas",
      icon: <LocalAtmIcon />,
      key: "ventas",
      children: [
        { title: "Nueva Venta", icon: <AddShoppingCartIcon />, path: "/facturacion" },
        { title: "Lista de Ventas", icon: <ListAltIcon />, path: "/invoices" },
        { title: "Artículos", icon: <ArticleIcon />, path: "/articulos" },
      ],
    },
    {
      title: "Clientes",
      icon: <PeopleOutlinedIcon />,
      key: "clientes",
      children: [
        { title: "Lista de Clientes", icon: <AccessibilityIcon />, path: "/clientes" },
        { title: "Cta Cte", icon: <AccountBalanceWalletIcon />, path: "/ctacte" },
        { title: "Pagos", icon: <PersonAddAlt1Icon />, path: "/pagoscte" },
      ],
    },
    {
      title: "Proveedores",
      icon: <AddBusinessIcon />,
      key: "proveedores",
      children: [
        { title: "Comprobantes", icon: <ReceiptLongIcon />, path: "/proveedores/comprobantes" },
        { title: "Pagos", icon: <AccountBalanceWalletIcon />, path: "/proveedores/pagos" },
        { title: "CtaCte", icon: <AccountBalanceWalletIcon />, path: "/proveedores/ctacte" },
      ],
    },
    {
      title: "Colaboradores",
      icon: <BadgeIcon />,
      key: "colaboradores",
      children: [
        { title: "Lista", icon: <GroupsIcon />, path: "/colaboradores" },
        { title: "Asistencias", icon: <AccessTimeIcon />, path: "/colaboradores/asistencias" },
        { title: "Recibos", icon: <ReceiptLongIcon />, path: "/colaboradores/recibos" },
      ],
    },
    {
      title: "Trabajos",
      icon: <WorkIcon />,
      key: "trabajos",
      children: [
        { title: "Ingresar", icon: <AddCircleOutlineIcon />, path: "/trabajos/ingresar" },
        { title: "Consultar", icon: <SearchIcon />, path: "/trabajos/consultar" },
      ],
    },
    {
      title: "Estadísticas",
      icon: <SignalCellularAltIcon />,
      key: "estadisticas",
    },
    {
      title: "Reportes",
      icon: <AnalyticsIcon />,
      key: "reportes",
    },
    {
      title: "Operaciones",
      icon: <ManageSearchIcon />,
      key: "operaciones",
    },
    {
      title: "Administración",
      icon: <TuneIcon />,
      key: "administracion",
      children: [
        { title: "Categorías", icon: <CategoryIcon />, path: "/categorias" },
        { title: "Usuarios", icon: <PersonIcon />, path: "/team" },
        { title: "Empresa", icon: <ApartmentIcon />, path: "/settings" },
      ],
    },
  ];

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.key];
    const isItemActive = item.path && isActive(item.path);

    if (hasChildren) {
      return (
        <Box key={item.key}>
          <ListItemButton
            onClick={() => handleToggle(item.key)}
            sx={{
              py: 1.5,
              px: 2,
              mx: 1.5,
              my: 0.5,
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: sidebarColors.hover,
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: sidebarColors.text }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 600,
                color: sidebarColors.text,
              }}
            />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List
              disablePadding
              sx={{
                bgcolor: sidebarColors.expandBg,
                mx: 1.5,
                mb: 1,
                borderRadius: 2,
                py: 1,
              }}
            >
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        </Box>
      );
    }

    const content = (
      <ListItemButton
        component={item.path ? Link : "div"}
        to={item.path || undefined}
        sx={{
          py: level > 0 ? 1 : 1.5,
          px: 2,
          mx: level > 0 ? 1 : 1.5,
          my: 0.5,
          borderRadius: 2,
          bgcolor: isItemActive ? sidebarColors.active : "transparent",
          color: isItemActive ? sidebarColors.activeText : sidebarColors.text,
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: isItemActive ? sidebarColors.active : sidebarColors.hover,
            transform: "translateX(4px)",
          },
          ...(isItemActive && {
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.3)"
              : "0 4px 12px rgba(79,178,134,0.25)",
          }),
        }}
      >
        {item.icon && (
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isItemActive ? sidebarColors.activeText : sidebarColors.text,
            }}
          >
            {item.icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            fontSize: level > 0 ? 13 : 14,
            fontWeight: isItemActive ? 700 : level > 0 ? 500 : 600,
            color: isItemActive ? sidebarColors.activeText : sidebarColors.text,
          }}
        />
        {level > 0 && <ChevronRightIcon sx={{ fontSize: 16, opacity: 0.5 }} />}
      </ListItemButton>
    );

    return <Box key={item.key || item.path}>{content}</Box>;
  };

  const drawerContent = (
    <Box
      sx={{
        width: mdDown ? SIDEBAR_WIDTH : (isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH),
        height: "100vh",
        bgcolor: sidebarColors.bg,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${sidebarColors.border}`,
        boxShadow: isDark
          ? "4px 0 12px rgba(0,0,0,0.3)"
          : "4px 0 12px rgba(0,0,0,0.08)",
        transition: "width 0.3s ease",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${sidebarColors.border}`,
          minHeight: 64,
        }}
      >
        {(!isCollapsed || mdDown) && (
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              color: sidebarColors.text,
              letterSpacing: -0.5,
            }}
          >
            ARTDENT
          </Typography>
        )}
        <IconButton
          onClick={() => mdDown ? onClose() : setIsCollapsed(!isCollapsed)}
          sx={{
            color: sidebarColors.text,
            display: { xs: "flex", md: "flex" },
          }}
        >
          <MenuOutlinedIcon />
        </IconButton>
      </Box>

      {/* Menu List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          py: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDark ? alpha("#fff", 0.2) : colors.grey[600],
            borderRadius: "3px",
            "&:hover": {
              background: isDark ? alpha("#fff", 0.3) : colors.grey[500],
            },
          },
        }}
      >
        <List disablePadding>
          {(isCollapsed && !mdDown) ? (
            // Modo colapsado: Todos los iconos con popup para submenús
            <>
              {menuItems.map((item) => {
                if (!item.icon) return null;
                const hasChildren = item.children && item.children.length > 0;
                const isItemActive = item.path && isActive(item.path);
                
                return (
                  <Tooltip key={item.key || item.path} title={item.title} placement="right" arrow>
                    <ListItemButton
                      component={!hasChildren && item.path ? Link : "div"}
                      to={!hasChildren && item.path ? item.path : undefined}
                      onClick={(e) => hasChildren ? handlePopupOpen(e, item) : undefined}
                      sx={{
                        py: 1.5,
                        px: 2,
                        mx: 1,
                        my: 0.5,
                        borderRadius: 2,
                        bgcolor: isItemActive ? sidebarColors.active : "transparent",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: isItemActive ? sidebarColors.active : sidebarColors.hover,
                        },
                        ...(isItemActive && {
                          boxShadow: isDark
                            ? "0 4px 12px rgba(0,0,0,0.3)"
                            : "0 4px 12px rgba(79,178,134,0.25)",
                        }),
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          color: isItemActive ? sidebarColors.activeText : sidebarColors.text,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                );
              })}
              
              {/* Menú Popup para submenús */}
              <Menu
                anchorEl={popupMenu}
                open={Boolean(popupMenu)}
                onClose={handlePopupClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: {
                    ml: 1,
                    minWidth: 200,
                    bgcolor: sidebarColors.bg,
                    border: `1px solid ${sidebarColors.border}`,
                    boxShadow: isDark
                      ? "0 8px 24px rgba(0,0,0,0.4)"
                      : "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {popupMenuItems.map((child) => {
                  const isChildActive = child.path && isActive(child.path);
                  return (
                    <MenuItem
                      key={child.path || child.title}
                      component={child.path ? Link : "div"}
                      to={child.path || undefined}
                      onClick={handlePopupClose}
                      sx={{
                        py: 1.5,
                        px: 2,
                        gap: 1.5,
                        bgcolor: isChildActive ? sidebarColors.active : "transparent",
                        color: isChildActive ? sidebarColors.activeText : sidebarColors.text,
                        "&:hover": {
                          bgcolor: isChildActive ? sidebarColors.active : sidebarColors.hover,
                        },
                      }}
                    >
                      {child.icon && (
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            color: isChildActive ? sidebarColors.activeText : sidebarColors.text,
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                      )}
                      <Typography variant="body2" sx={{ fontWeight: isChildActive ? 700 : 500 }}>
                        {child.title}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          ) : (
            // Modo expandido: menú completo (siempre en móvil)
            menuItems.map((item) => renderMenuItem(item))
          )}
        </List>
      </Box>

      {/* Footer */}
      {(!isCollapsed || mdDown) && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${sidebarColors.border}`,
            textAlign: "center",
          }}
        >
          <Chip
            label="v1.0.0"
            size="small"
            sx={{
              bgcolor: sidebarColors.active,
              color: "#fff",
              fontWeight: 600,
              fontSize: 10,
            }}
          />
        </Box>
      )}
    </Box>
  );

  // Renderizado condicional: Drawer en móvil, Box fijo en desktop
  if (mdDown) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Fijo en desktop
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        zIndex: 1200,
        transition: "width 0.3s ease",
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;