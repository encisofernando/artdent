// src/scenes/global/Sidebar.jsx
//
// Assets requeridos en src/assets/:
//   logo-artdent-color.png   →  "logo ART DENT.png"
//   logo-artdent-blanco.png  →  "logo ART DENT (blanco trans).png"
//   logo-artdent-icon.png    →  "ad azul.png"  (solo ícono, para colapsado)

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
  Tooltip,
  Popover,
  MenuItem,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Icons
import HomeOutlinedIcon       from "@mui/icons-material/HomeOutlined";
import ChevronLeftIcon        from "@mui/icons-material/ChevronLeft";
import MenuOutlinedIcon       from "@mui/icons-material/MenuOutlined";
import LocalAtmIcon           from "@mui/icons-material/LocalAtm";
import PeopleOutlinedIcon     from "@mui/icons-material/PeopleOutlined";
import AddBusinessIcon        from "@mui/icons-material/AddBusiness";
import BadgeIcon              from "@mui/icons-material/Badge";
import WorkIcon               from "@mui/icons-material/Work";
import SignalCellularAltIcon  from "@mui/icons-material/SignalCellularAlt";
import AnalyticsIcon          from "@mui/icons-material/Analytics";
import ManageSearchIcon       from "@mui/icons-material/ManageSearch";
import TuneIcon               from "@mui/icons-material/Tune";
import ExpandLess             from "@mui/icons-material/ExpandLess";
import ExpandMore             from "@mui/icons-material/ExpandMore";

// Sub-icons
import AddShoppingCartIcon    from "@mui/icons-material/AddShoppingCart";
import ListAltIcon            from "@mui/icons-material/ListAlt";
import ArticleIcon            from "@mui/icons-material/Article";
import AccessibilityIcon      from "@mui/icons-material/Accessibility";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonAddAlt1Icon      from "@mui/icons-material/PersonAddAlt1";
import ReceiptLongIcon        from "@mui/icons-material/ReceiptLong";
import GroupsIcon             from "@mui/icons-material/Groups";
import AccessTimeIcon         from "@mui/icons-material/AccessTime";
import AddCircleOutlineIcon   from "@mui/icons-material/AddCircleOutline";
import SearchIcon             from "@mui/icons-material/Search";
import CategoryIcon           from "@mui/icons-material/Category";
import PersonIcon             from "@mui/icons-material/Person";
import ApartmentIcon          from "@mui/icons-material/Apartment";

import logoColor  from "../../assets/logo-artdent-color.png";
import logoBlanco from "../../assets/logo-artdent-blanco.png";
import logoIcon   from "../../assets/logo-artdent-icon.png";

export const SIDEBAR_WIDTH    = 272;
export const COLLAPSED_WIDTH  = 72;

/* ─── Nav structure ─── */
const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { title: "Panel General", icon: <HomeOutlinedIcon />, path: "/" },
    ],
  },
  {
    label: "Gestión",
    items: [
      {
        title: "Ventas", icon: <LocalAtmIcon />, key: "ventas",
        children: [
          { title: "Nueva Venta",      icon: <AddShoppingCartIcon />, path: "/facturacion" },
          { title: "Lista de Ventas",  icon: <ListAltIcon />,         path: "/invoices" },
          { title: "Artículos",        icon: <ArticleIcon />,         path: "/articulos" },
        ],
      },
      {
        title: "Clientes", icon: <PeopleOutlinedIcon />, key: "clientes",
        children: [
          { title: "Lista de Clientes", icon: <AccessibilityIcon />,      path: "/clientes" },
          { title: "Cta. Cte.",         icon: <AccountBalanceWalletIcon />, path: "/ctacte" },
          { title: "Pagos",             icon: <PersonAddAlt1Icon />,       path: "/pagoscte" },
        ],
      },
      {
        title: "Proveedores", icon: <AddBusinessIcon />, key: "proveedores",
        children: [
          { title: "Comprobantes", icon: <ReceiptLongIcon />,         path: "/proveedores/comprobantes" },
          { title: "Pagos",        icon: <AccountBalanceWalletIcon />, path: "/proveedores/pagos" },
          { title: "Cta. Cte.",    icon: <AccountBalanceWalletIcon />, path: "/proveedores/ctacte" },
        ],
      },
      {
        title: "Colaboradores", icon: <BadgeIcon />, key: "colaboradores",
        children: [
          { title: "Lista",       icon: <GroupsIcon />,     path: "/colaboradores" },
          { title: "Asistencias", icon: <AccessTimeIcon />, path: "/colaboradores/asistencias" },
          { title: "Recibos",     icon: <ReceiptLongIcon />, path: "/colaboradores/recibos" },
        ],
      },
      {
        title: "Trabajos", icon: <WorkIcon />, key: "trabajos",
        children: [
          { title: "Ingresar",  icon: <AddCircleOutlineIcon />, path: "/trabajos/ingresar" },
          { title: "Consultar", icon: <SearchIcon />,           path: "/trabajos/consultar" },
        ],
      },
    ],
  },
  {
    label: "Análisis",
    items: [
      { title: "Estadísticas", icon: <SignalCellularAltIcon />, path: "/estadisticas" },
      { title: "Reportes",     icon: <AnalyticsIcon />,         path: "/reportes" },
      { title: "Operaciones",  icon: <ManageSearchIcon />,      path: "/operaciones" },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        title: "Administración", icon: <TuneIcon />, key: "administracion",
        children: [
          { title: "Categorías", icon: <CategoryIcon />, path: "/categorias" },
          { title: "Usuarios",   icon: <PersonIcon />,   path: "/team" },
          { title: "Empresa",    icon: <ApartmentIcon />, path: "/settings" },
        ],
      },
    ],
  },
];

/* ─── Flatten all items for auto-expand logic ─── */
const allItems = NAV_SECTIONS.flatMap((s) => s.items);

/* ══════════════════════════════════════════════ */
export default function Sidebar({ mobileOpen, onClose, isCollapsed, setIsCollapsed }) {
  const theme    = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const narrow = useMediaQuery("(max-width: 900px)");
  const isMobile = mdDown || narrow;

  const [openMenus, setOpenMenus]       = useState({});
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverParent, setPopoverParent] = useState(null);

  const isDark = theme.palette.mode === "dark";

  const p = useMemo(() => ({
    bg:         isDark ? "#0F1F2A" : "#fff",
    border:     isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text:       isDark ? "#E6EEF5" : "#1A202C",
    textMuted:  isDark ? "rgba(230,238,245,0.42)" : "rgba(26,32,44,0.45)",
    hover:      isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.045)",
    activeBg:   isDark ? "rgba(57,123,156,0.18)"   : "rgba(57,123,156,0.10)",
    activeText: isDark ? "#ACD6CE" : "#397B9C",
    activeBar:  "#5AAD9C",            // verde marca para el indicador lateral
    subBg:      isDark ? "rgba(255,255,255,0.028)" : "rgba(0,0,0,0.025)",
    sectionLabel: isDark ? "rgba(172,214,206,0.55)" : "rgba(57,123,156,0.65)",
  }), [isDark]);

  const isActive = (path) => !!path && location.pathname === path;

  const toggleMenu  = (key) => setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  const closePopover = () => { setPopoverAnchor(null); setPopoverParent(null); };
  const openPopover  = (e, item) => { e.preventDefault(); e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverParent(item); };

  // Auto-expand & mobile close on route change
  useEffect(() => {
    const path = location.pathname;
    const next = {};
    if (path.startsWith("/facturacion") || path.startsWith("/invoices")   || path.startsWith("/articulos"))  next.ventas         = true;
    if (path.startsWith("/clientes")    || path.startsWith("/ctacte")     || path.startsWith("/pagoscte"))   next.clientes       = true;
    if (path.startsWith("/proveedores"))                                                                       next.proveedores    = true;
    if (path.startsWith("/colaboradores"))                                                                     next.colaboradores  = true;
    if (path.startsWith("/trabajos"))                                                                         next.trabajos       = true;
    if (path.startsWith("/team")        || path.startsWith("/settings")   || path.startsWith("/categorias")) next.administracion = true;
    setOpenMenus((prev) => ({ ...prev, ...next }));
    if (isMobile && onClose) onClose();
    closePopover();
  }, [location.pathname]); // eslint-disable-line

  useEffect(() => { if (isMobile) closePopover(); }, [isMobile]);

  const width = isMobile ? SIDEBAR_WIDTH : (isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH);

  /* ── Single item (leaf) ── */
  const LeafItem = ({ item, level = 0 }) => {
    const active = isActive(item.path);
    return (
      <ListItemButton
        component={Link}
        to={item.path}
        sx={{
          position: "relative",
          mx: 1, my: 0.2,
          borderRadius: "8px",
          pl: level === 0 ? 1.5 : 4,
          pr: 1.5,
          py: level === 0 ? 1.1 : 0.9,
          bgcolor: active ? p.activeBg : "transparent",
          color: active ? p.activeText : p.text,
          "&:hover": { bgcolor: active ? p.activeBg : p.hover },
          // Left accent bar
          "&::before": active ? {
            content: '""',
            position: "absolute",
            left: 0, top: "20%", bottom: "20%",
            width: 3,
            borderRadius: "0 3px 3px 0",
            bgcolor: p.activeBar,
          } : {},
          transition: "background-color .15s, color .15s",
        }}
      >
        {item.icon && (
          <ListItemIcon sx={{ minWidth: 34, color: "inherit", "& svg": { fontSize: 19 } }}>
            {item.icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            fontSize: level === 0 ? 13.5 : 13,
            fontWeight: active ? 700 : 500,
            lineHeight: 1.3,
          }}
        />
      </ListItemButton>
    );
  };

  /* ── Parent item with children (expanded mode) ── */
  const ParentItem = ({ item }) => {
    const open   = !!openMenus[item.key];
    const anyActive = item.children?.some((c) => isActive(c.path));

    return (
      <Box>
        <ListItemButton
          onClick={() => toggleMenu(item.key)}
          sx={{
            mx: 1, my: 0.2,
            borderRadius: "8px",
            pl: 1.5, pr: 1.5, py: 1.1,
            color: anyActive ? p.activeText : p.text,
            bgcolor: anyActive && !open ? p.activeBg : "transparent",
            "&:hover": { bgcolor: p.hover },
            transition: "background-color .15s, color .15s",
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: "inherit", "& svg": { fontSize: 19 } }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{ fontSize: 13.5, fontWeight: anyActive ? 700 : 500 }}
          />
          {open
            ? <ExpandLess sx={{ fontSize: 16, opacity: 0.6 }} />
            : <ExpandMore sx={{ fontSize: 16, opacity: 0.6 }} />
          }
        </ListItemButton>

        <Collapse in={open} timeout={200} unmountOnExit>
          <Box sx={{
            mx: 2.5, mb: 0.5,
            borderLeft: `1.5px solid ${isDark ? "rgba(172,214,206,0.2)" : "rgba(57,123,156,0.2)"}`,
            pl: 0.5,
          }}>
            {item.children.map((child) => (
              <LeafItem key={child.path || child.title} item={child} level={1} />
            ))}
          </Box>
        </Collapse>
      </Box>
    );
  };

  /* ── Collapsed icon button (desktop) ── */
  const CollapsedItem = ({ item }) => {
    const hasChildren = !!item.children?.length;
    const active      = !hasChildren && isActive(item.path);
    const anyActive   = hasChildren && item.children?.some((c) => isActive(c.path));

    return (
      <Tooltip title={item.title} placement="right" arrow>
        <ListItemButton
          component={!hasChildren && item.path ? Link : "button"}
          to={!hasChildren && item.path ? item.path : undefined}
          onClick={(e) => { if (hasChildren) openPopover(e, item); }}
          sx={{
            mx: 1, my: 0.25,
            borderRadius: "8px",
            justifyContent: "center",
            height: 42,
            bgcolor: (active || anyActive) ? p.activeBg : "transparent",
            color: (active || anyActive) ? p.activeText : p.text,
            "&:hover": { bgcolor: (active || anyActive) ? p.activeBg : p.hover },
            "& svg": { fontSize: 20 },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, color: "inherit", justifyContent: "center" }}>
            {item.icon}
          </ListItemIcon>
        </ListItemButton>
      </Tooltip>
    );
  };

  /* ── Main content ── */
  const Content = (
    <Box sx={{
      width,
      height: "100%",
      bgcolor: p.bg,
      borderRight: `1px solid ${p.border}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <Box sx={{
        height: 64,
        px: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed && !isMobile ? "center" : "space-between",
        flexShrink: 0,
      }}>
        {(!isCollapsed || isMobile) ? (
          <>
            <Box sx={{ pl: 0.5, flex: 1, overflow: "hidden" }}>
              <img
                src={isDark ? logoBlanco : logoColor}
                alt="ArtDent"
                style={{
                  height: 38,
                  width: "auto",
                  maxWidth: 160,
                  objectFit: "contain",
                  // Logo blanco tiene fondo transparente pero precisa el invert para oscuro
                  filter: isDark ? "brightness(0) invert(1)" : "none",
                  display: "block",
                }}
              />
            </Box>
            <IconButton
              onClick={() => isMobile ? onClose?.() : setIsCollapsed?.(true)}
              sx={{ color: p.textMuted, "&:hover": { color: p.text }, flexShrink: 0 }}
              size="small"
              aria-label={isMobile ? "Cerrar menú" : "Colapsar sidebar"}
            >
              {isMobile ? <MenuOutlinedIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </>
        ) : (
          /* Colapsado: solo el ícono cuadrado de la marca */
          <Tooltip title="Expandir" placement="right" arrow>
            <IconButton
              onClick={() => setIsCollapsed?.(false)}
              sx={{ p: 0.5, borderRadius: "10px" }}
              aria-label="Expandir sidebar"
            >
              <img src={logoIcon} alt="AD" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ borderColor: p.border, flexShrink: 0 }} />

      {/* ── Navigation ── */}
      <Box sx={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        py: 1,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": {
          background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          borderRadius: 4,
        },
        "&::-webkit-scrollbar-track": { background: "transparent" },
      }}>
        {/* Desktop colapsado */}
        {!isMobile && isCollapsed ? (
          <List disablePadding>
            {allItems.map((item) => (
              <CollapsedItem key={item.key || item.path || item.title} item={item} />
            ))}
          </List>
        ) : (
          /* Expandido y mobile */
          NAV_SECTIONS.map((section, sIdx) => (
            <Box key={sIdx} sx={{ mb: 0.5 }}>
              {section.label && (
                <Typography sx={{
                  px: 2.5,
                  pt: sIdx === 0 ? 0.5 : 1.5,
                  pb: 0.75,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: p.sectionLabel,
                  userSelect: "none",
                }}>
                  {section.label}
                </Typography>
              )}
              <List disablePadding>
                {section.items.map((item) =>
                  item.children
                    ? <ParentItem key={item.key} item={item} />
                    : <LeafItem   key={item.path || item.title} item={item} />
                )}
              </List>
            </Box>
          ))
        )}
      </Box>

      {/* ── Popover (collapsed desktop submenús) ── */}
      <Popover
        open={Boolean(popoverAnchor && popoverParent)}
        anchorEl={popoverAnchor}
        onClose={closePopover}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          elevation: 0,
          sx: {
            ml: 1,
            minWidth: 220,
            bgcolor: p.bg,
            border: `1px solid ${p.border}`,
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: isDark ? "0 16px 40px rgba(0,0,0,.5)" : "0 12px 32px rgba(0,0,0,.15)",
          },
        }}
      >
        <Box sx={{
          px: 2, py: 1.25,
          borderBottom: `1px solid ${p.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
          <Box sx={{ color: p.sectionLabel, "& svg": { fontSize: 16, display: "block" } }}>
            {popoverParent?.icon}
          </Box>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: p.text }}>
            {popoverParent?.title}
          </Typography>
        </Box>
        <Box sx={{ py: 0.5 }}>
          {(popoverParent?.children || []).map((child) => {
            const active = isActive(child.path);
            return (
              <MenuItem
                key={child.path || child.title}
                onClick={() => { closePopover(); if (child.path) navigate(child.path); }}
                sx={{
                  py: 1, px: 1.5, gap: 1.25, borderRadius: 0,
                  color: active ? p.activeText : p.text,
                  bgcolor: active ? p.activeBg : "transparent",
                  "&:hover": { bgcolor: active ? p.activeBg : p.hover },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, color: "inherit", "& svg": { fontSize: 17 } }}>
                  {child.icon}
                </ListItemIcon>
                <Typography sx={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>
                  {child.title}
                </Typography>
              </MenuItem>
            );
          })}
        </Box>
      </Popover>

      <Divider sx={{ borderColor: p.border, flexShrink: 0 }} />

      {/* ── Footer ── */}
      {(!isCollapsed || isMobile) && (
        <Box sx={{ px: 2.5, py: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 11, color: p.textMuted, letterSpacing: "0.04em" }}>
            © {new Date().getFullYear()} ArtDent · Back Office
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: SIDEBAR_WIDTH, bgcolor: p.bg, border: "none" } }}
        sx={{ "& .MuiDrawer-paper": { boxShadow: "4px 0 24px rgba(0,0,0,.3)" } }}
      >
        {Content}
      </Drawer>
    );
  }

  return (
    <Box sx={{
      position: "fixed",
      top: 0, left: 0,
      height: "100vh",
      width,
      zIndex: 1200,
      transition: "width .22s cubic-bezier(.4,0,.2,1)",
    }}>
      {Content}
    </Box>
  );
}