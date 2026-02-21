// src/scenes/global/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Divider,
  IconButton,
  Popover,
  MenuItem,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Icons
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

// Sub-icons
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

export const SIDEBAR_WIDTH = 288;
export const COLLAPSED_WIDTH = 76;

export default function Sidebar({
  mobileOpen,
  onClose, // cierra Drawer en mobile
  isCollapsed,
  setIsCollapsed,
}) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile detection robusto (breakpoint + fallback)
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const narrow = useMediaQuery("(max-width: 900px)");
  const isMobile = mdDown || narrow;

  // Submenús en modo expandido
  const [openMenus, setOpenMenus] = useState({});

  // Popover para modo colapsado (solo desktop)
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverParent, setPopoverParent] = useState(null);

  const palette = useMemo(() => {
    const isDark = theme.palette.mode === "dark";
    return {
      isDark,
      bg: isDark ? theme.palette.background.default : theme.palette.background.paper,
      text: isDark ? theme.palette.grey[100] : theme.palette.grey[900],
      textMuted: isDark ? theme.palette.grey[400] : theme.palette.grey[600],
      border: alpha(isDark ? "#fff" : "#000", 0.08),
      hover: alpha(isDark ? "#fff" : "#000", isDark ? 0.06 : 0.05),
      activeBg: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.12),
      activeText: isDark ? "#fff" : theme.palette.grey[900],
      expandBg: alpha(isDark ? "#fff" : "#000", isDark ? 0.04 : 0.03),
    };
  }, [theme]);

  const menuItems = useMemo(
    () => [
      { title: "Panel General", icon: <HomeOutlinedIcon />, path: "/" },

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

      { title: "Estadísticas", icon: <SignalCellularAltIcon />, path: "/estadisticas" },
      { title: "Reportes", icon: <AnalyticsIcon />, path: "/reportes" },
      { title: "Operaciones", icon: <ManageSearchIcon />, path: "/operaciones" },

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
    ],
    []
  );

  const isActive = (path) => (path ? location.pathname === path : false);

  const toggleMenu = (key) => setOpenMenus((p) => ({ ...p, [key]: !p[key] }));

  const closeCollapsedPopover = () => {
    setPopoverAnchor(null);
    setPopoverParent(null);
  };

  const openCollapsedPopover = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setPopoverAnchor(e.currentTarget);
    setPopoverParent(item);
  };

  // Auto-expand por ruta + cierres en cambios de ruta
  useEffect(() => {
    const p = location.pathname;

    const next = {};
    if (p.startsWith("/facturacion") || p.startsWith("/invoices") || p.startsWith("/articulos")) next.ventas = true;
    if (p.startsWith("/clientes") || p.startsWith("/ctacte") || p.startsWith("/pagoscte")) next.clientes = true;
    if (p.startsWith("/proveedores")) next.proveedores = true;
    if (p.startsWith("/colaboradores")) next.colaboradores = true;
    if (p.startsWith("/trabajos")) next.trabajos = true;
    if (p.startsWith("/team") || p.startsWith("/settings") || p.startsWith("/categorias")) next.administracion = true;

    setOpenMenus((prev) => ({ ...prev, ...next }));

    // Mobile: cerrar Drawer al navegar
    if (isMobile && onClose) onClose();

    // Cerrar popover (desktop colapsado) al navegar
    closeCollapsedPopover();
  }, [location.pathname]); // intencional: solo por navegación

  // Si estamos en mobile, jamás usar popover y no tiene sentido "colapsar"
  useEffect(() => {
    if (isMobile) closeCollapsedPopover();
  }, [isMobile]);

  const width = isMobile ? SIDEBAR_WIDTH : isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const ExpandedItem = ({ item, level = 0 }) => {
    const hasChildren = !!item.children?.length;
    const active = !!item.path && isActive(item.path);

    const baseSx = {
      mx: 1.5,
      my: 0.5,
      borderRadius: 2,
      px: 1.75,
      py: level ? 1.0 : 1.15,
      transition: "background-color .15s ease, transform .15s ease",
      color: palette.text,
      "&:hover": { bgcolor: palette.hover, transform: "translateX(2px)" },
    };

    if (hasChildren) {
      const open = !!openMenus[item.key];
      return (
        <Box key={item.key}>
          <ListItemButton onClick={() => toggleMenu(item.key)} sx={baseSx}>
            <ListItemIcon sx={{ minWidth: 38, color: palette.text }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{ fontSize: 13.5, fontWeight: 800 }}
            />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ mx: 1.5, mb: 0.75, borderRadius: 2, bgcolor: palette.expandBg, py: 0.75 }}>
              <List disablePadding>
                {item.children.map((c) => (
                  <ExpandedItem key={c.path || c.title} item={c} level={level + 1} />
                ))}
              </List>
            </Box>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItemButton
        key={item.path || item.title}
        component={item.path ? Link : "div"}
        to={item.path || undefined}
        sx={{
          ...baseSx,
          pl: level ? 4.25 : 1.75,
          bgcolor: active ? palette.activeBg : "transparent",
          "&:hover": { bgcolor: active ? palette.activeBg : palette.hover, transform: "translateX(2px)" },
        }}
      >
        {item.icon && <ListItemIcon sx={{ minWidth: 38, color: palette.text }}>{item.icon}</ListItemIcon>}
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            fontSize: level ? 13 : 13.5,
            fontWeight: active ? 900 : level ? 700 : 800,
            color: active ? palette.activeText : palette.text,
          }}
        />
      </ListItemButton>
    );
  };

  const Content = (
    <Box
      sx={{
        width,
        height: "100%",
        bgcolor: palette.bg,
        borderRight: `1px solid ${palette.border}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 64,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {(!isCollapsed || isMobile) ? (
          <Box sx={{ pl: 0.5 }}>
            <Typography sx={{ fontWeight: 900, letterSpacing: -0.5, color: palette.text }}>
              ARTDENT
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: palette.textMuted, mt: -0.25 }}>
              Back Office
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: 1 }} />
        )}

        <IconButton
          onClick={() => {
            // Mobile: cerrar Drawer. Desktop: colapsar/expandir.
            if (isMobile) onClose?.();
            else setIsCollapsed?.(!isCollapsed);
          }}
          sx={{ color: palette.text }}
          aria-label={isMobile ? "Cerrar menú" : "Colapsar menú"}
        >
          <MenuOutlinedIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: palette.border }} />

      {/* List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 1,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(palette.isDark ? "#fff" : "#000", 0.18),
            borderRadius: 6,
          },
        }}
      >
        <List disablePadding>
          {/* Desktop colapsado: iconos + popover */}
          {!isMobile && isCollapsed ? (
            <>
              {menuItems.map((item) => {
                const hasChildren = !!item.children?.length;
                const active = !!item.path && isActive(item.path);

                return (
                  <Box key={item.key || item.path || item.title} sx={{ mx: 1, my: 0.5 }}>
                    <ListItemButton
                      component={!hasChildren && item.path ? Link : "button"}
                      to={!hasChildren && item.path ? item.path : undefined}
                      type={!hasChildren && item.path ? undefined : "button"}
                      onClick={(e) => {
                        if (hasChildren) openCollapsedPopover(e, item);
                      }}
                      sx={{
                        borderRadius: 2,
                        height: 46,
                        justifyContent: "center",
                        bgcolor: active ? palette.activeBg : "transparent",
                        "&:hover": { bgcolor: active ? palette.activeBg : palette.hover },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, color: active ? palette.activeText : palette.text }}>
                        {item.icon}
                      </ListItemIcon>
                    </ListItemButton>
                  </Box>
                );
              })}

              <Popover
                open={Boolean(popoverAnchor && popoverParent)}
                anchorEl={popoverAnchor}
                onClose={closeCollapsedPopover}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    ml: 1,
                    minWidth: 240,
                    bgcolor: palette.bg,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: palette.isDark
                      ? "0 12px 30px rgba(0,0,0,.45)"
                      : "0 12px 30px rgba(0,0,0,.18)",
                  },
                }}
              >
                <Box sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${palette.border}` }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 900, color: palette.text }}>
                    {popoverParent?.title}
                  </Typography>
                </Box>

                <Box sx={{ py: 0.5 }}>
                  {(popoverParent?.children || []).map((child) => {
                    const active = !!child.path && isActive(child.path);

                    return (
                      <MenuItem
                        key={child.path || child.title}
                        onClick={() => {
                          closeCollapsedPopover();
                          if (child.path) navigate(child.path);
                        }}
                        sx={{
                          py: 1.1,
                          px: 1.5,
                          gap: 1.25,
                          bgcolor: active ? palette.activeBg : "transparent",
                          "&:hover": { bgcolor: active ? palette.activeBg : palette.hover },
                          color: palette.text,
                        }}
                      >
                        {child.icon && (
                          <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
                            {child.icon}
                          </ListItemIcon>
                        )}
                        <Typography sx={{ fontSize: 13.5, fontWeight: active ? 900 : 750 }}>
                          {child.title}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Box>
              </Popover>
            </>
          ) : (
            // Mobile y desktop expandido
            menuItems.map((item) => <ExpandedItem key={item.key || item.path || item.title} item={item} />)
          )}
        </List>
      </Box>

      <Divider sx={{ borderColor: palette.border }} />

      {/* Footer (no en colapsado desktop) */}
      {(!isCollapsed || isMobile) && (
        <Box sx={{ p: 1.5 }}>
          <Typography sx={{ fontSize: 11.5, color: palette.textMuted }}>
            © {new Date().getFullYear()} ARTDENT
          </Typography>
        </Box>
      )}
    </Box>
  );

  // MOBILE: Drawer (esto es lo que debe abrir)
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            bgcolor: palette.bg,
          },
        }}
      >
        {Content}
      </Drawer>
    );
  }

  // DESKTOP: fijo
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width,
        zIndex: 1200,
      }}
    >
      {Content}
    </Box>
  );
}