// src/scenes/global/Sidebar.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";

// ICONOS
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import InventoryIcon from "@mui/icons-material/Inventory";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import TuneIcon from "@mui/icons-material/Tune";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeIcon from "@mui/icons-material/Badge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';

// Servicios / auth
import { getUserIdFromToken, getIdEmpleadoFromToken } from "../../auth/auth";
import { Users, Employees, Companies } from "../../services";

export const SIDEBAR_WIDTH = 260;
export const COLLAPSED_WIDTH = 80;

const Sidebar = ({ mobileOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const [userData, setUserData] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [openMainSubMenu, setOpenMainSubMenu] = useState(null);
  const [openInnerSubMenu, setOpenInnerSubMenu] = useState(null);
  const didFetch = useRef(false); // evita doble carga en StrictMode

  // Paleta de la UI del sidebar (mode-aware)
  const ui = useMemo(
    () => ({
      base: colors.azul?.[500] || (isDark ? "#1D3B4C" : "#F4F8FB"),
      baseDeep: isDark ? (colors.primary?.[700] || "#274F65") : "#FFFFFF",
      baseSoft: isDark
        ? (colors.azul?.[600] || "#2F6782")
        : (colors.hovermenu?.[500] || "#E9F2F7"),
      hover: colors.hovermenu?.[500] || (isDark ? "#2F6782" : "#E9F2F7"),
      text: isDark
        ? (colors.sidebartext?.[500] || "#DAE6F0")
        : (colors.sidebartext?.[500] || "#274F65"),
      activeBg: isDark ? (colors.primary?.[600] || "#2F6782") : "#E6EEF5",
      activeText: isDark ? "#FFFFFF" : (colors.sidebartext?.[500] || "#274F65"),
      divider: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)",
      tagBg: colors.blueAccent?.[400] || "#7CA5C3",
    }),
    [colors, isDark]
  );

  // Permisos
  const permisosUsuario = JSON.parse(localStorage.getItem("userPermissions") || "[]");
  const esAdmin = userData && (userData.idRol === 1 || userData.role_id === 1);
  const tienePermiso = (nombrePermiso) => {
    if (esAdmin) return true;
    const p = permisosUsuario.find((x) => x?.Nombre === nombrePermiso);
    return !!p && ((p.PermisoActivo === 1) || (p.active === 1));
  };

  // Cargar usuario/empleado y empresa (best-effort)
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    (async () => {
      try {
        const userId = getUserIdFromToken();
        const empId = getIdEmpleadoFromToken();

        let principal = null;
        if (userId) principal = await Users.getUser(userId).catch(() => null);
        if (!principal && empId)
          principal = await Employees.getEmployee(empId).catch(() => null);

        if (principal) setUserData(principal);

        if (principal?.idEmpresa || principal?.company_id) {
          const comp = await Companies.getCompanyById(
            principal.idEmpresa || principal.company_id
          );
          setEmpresa(comp);
        } else {
          const comp = await Companies.getMyCompany().catch(() => null);
          setEmpresa(comp);
        }
      } catch {
        /* silencioso */
      }
    })();
  }, []);

  // Helpers
  const isActive = (to) => location.pathname === to;

  useEffect(() => {
    if (location.pathname.startsWith("/clientes")) setOpenMainSubMenu("Clientes");
    else if (location.pathname.startsWith("/proveedores")) setOpenMainSubMenu("Proveedores");
    else if (location.pathname.startsWith("/facturacion")) setOpenMainSubMenu("Ventas");
    else if (location.pathname.startsWith("/articulos")) setOpenMainSubMenu("Artículos");
    else if (
      location.pathname.startsWith("/categorias") ||
      location.pathname.startsWith("/team") ||
      location.pathname.startsWith("/proveedores")
    ) setOpenMainSubMenu("Administración");
    else if (location.pathname.startsWith("/trabajos")) setOpenMainSubMenu("Trabajos");
    else setOpenMainSubMenu(null);

    if (mdDown && onClose) onClose(); // cerrar en móvil al navegar
  }, [location.pathname, mdDown, onClose]);

  const handleMainSubMenuToggle = (submenu) => {
    setOpenMainSubMenu((prev) => (prev === submenu ? null : submenu));
    setOpenInnerSubMenu(null);
  };
  const handleInnerSubMenuToggle = (submenu) => {
    setOpenInnerSubMenu((prev) => (prev === submenu ? null : submenu));
  };

  // === Estilos del pro-sidebar (altura + scroll + colores por tema) ===
  const sidebarStyles = {
    "& .pro-sidebar-inner": {
      background: `${ui.base} !important`,
      boxShadow: "0 6px 18px rgba(0,0,0,.20)",
      borderRight: `1px solid ${ui.divider}`,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
    },

    // Menú scrollable
    "& .pro-menu": {
      paddingTop: "4px",
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      paddingBottom: "16px",
      color: `${ui.text} !important`,
    },

    "& .pro-sidebar": { color: ui.text },

    // Ítems
    "& .pro-inner-item": {
      color: `${ui.text} !important`,
      padding: "10px 14px !important",
      margin: "6px 8px",
      borderRadius: "12px",
      transition: "background-color .18s ease, color .18s ease, transform .1s ease",
    },
    "& .pro-inner-item:hover": {
      backgroundColor: `${ui.hover} !important`,
      color: `${ui.text} !important`,
    },

    // Contenedor interno de SubMenu (lista expandida)
    "& .pro-sidebar .pro-menu > ul > .pro-sub-menu > .pro-inner-list-item": {
      backgroundColor: `${ui.baseSoft} !important`,
      borderRadius: "12px",
      margin: "4px 8px 8px",
      padding: "6px 6px 8px !important",
      border: `1px solid ${ui.divider}`,
      color: `${ui.text} !important`,
    },

    // Estado activo
    "& .pro-menu-item.active > .pro-inner-item, & .pro-inner-item.active": {
      backgroundColor: `${ui.activeBg} !important`,
      color: `${ui.activeText} !important`,
      boxShadow: isDark ? "inset 0 0 0 2px rgba(255,255,255,.08)" : "inset 0 0 0 1px rgba(0,0,0,.06)",
    },

    "& .pro-icon-wrapper": {
      backgroundColor: "transparent !important",
      color: `${ui.text} !important`,
    },

    // Popper cuando está colapsado
    "& .pro-sidebar.collapsed .pro-menu > ul > .pro-menu-item.pro-sub-menu > .pro-inner-list-item > .popper-inner": {
      backgroundColor: `${ui.baseSoft} !important`,
      borderRadius: "10px",
      border: `1px solid ${ui.divider}`,
      color: `${ui.text} !important`,
    },
  };

  // Contenido del sidebar
  const content = (
    <Box sx={sidebarStyles}>
      <ProSidebar
        collapsed={isCollapsed}
        breakPoint="md"
        width={SIDEBAR_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
      >
        <Menu iconShape="square">
          {/* CABECERA */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
          >
            {!isCollapsed && (
              <Box display="flex" alignItems="center" ml="10px">
                <Typography variant="h6" sx={{ color: ui.text }}>
                  {empresa
                    ? (empresa.NomComercial ||
                        empresa.name ||
                        empresa.trade_name ||
                        "Mi Empresa")
                    : "Cargando empresa..."}
                </Typography>
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{ ml: "auto", color: ui.text }}
                  size="small"
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* TARJETA USUARIO */}
          {!isCollapsed && (
            <Box
              sx={{
                p: 2,
                display: "flex",
                mb: 1.5,
                alignItems: "center",
                background: ui.baseSoft,
                borderRadius: "12px",
                mx: 1,
                border: `1px solid ${ui.divider}`,
                color: ui.text,
              }}
            >
              {userData && (
                <>
                  <img
                    src={userData.Imagen || userData.image_url}
                    alt="User"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      marginRight: 12,
                      objectFit: "cover",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: ui.text, lineHeight: 1.2 }}
                    >
                      {userData.Nombre || userData.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: ui.text, opacity: 0.85 }}
                    >
                      {esAdmin
                        ? "Administrador"
                        : userData.Rol || userData.role_name || "Usuario"}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}

          {/* Inicio */}
          <MenuItem
            className={isActive("/dashboard") ? "active" : ""}
            icon={<HomeOutlinedIcon />}
          >
            <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
              Panel General
            </Link>
          </MenuItem>

          {/* === Trabajos === */}
          <SubMenu
            icon={<EditNoteIcon />}
            open={openMainSubMenu === "Trabajos"}
            onClick={() => handleMainSubMenuToggle("Trabajos")}
            title={
              <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: ui.text }}>Trabajos</span>
                <span
                  style={{
                    marginLeft: 6,
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 999,
                    background: ui.tagBg,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  Ingreso Trabajo
                </span>
              </Box>
            }
          >
            <MenuItem
              icon={<AddCircleOutlineIcon fontSize="small" />}
              className={isActive("/trabajos/ingresar") ? "active" : ""}
            >
              <Link to="/trabajos/ingresar" style={{ textDecoration: "none", color: "inherit" }}>
                Ingresar Trabajo
              </Link>
            </MenuItem>
            <MenuItem
              icon={<SearchIcon fontSize="small" />}
              className={isActive("/trabajos/consultar") ? "active" : ""}
            >
              <Link to="/trabajos/consultar" style={{ textDecoration: "none", color: "inherit" }}>
                Consulta y Modificación
              </Link>
            </MenuItem>
          </SubMenu>

          {/* === Colaboradores === */}
          <SubMenu
            icon={<GroupsIcon />}
            open={openMainSubMenu === "Colaboradores"}
            onClick={() => handleMainSubMenuToggle("Colaboradores")}
            title={<span style={{ color: ui.text }}>Colaboradores</span>}
          >
            <MenuItem
              icon={<BadgeIcon fontSize="small" />}
              className={isActive("/colaboradores") ? "active" : ""}
            >
              <Link to="/colaboradores" style={{ textDecoration: "none", color: "inherit" }}>
                ABM y $/Hora
              </Link>
            </MenuItem>
            <MenuItem
              icon={<AccessTimeIcon fontSize="small" />}
              className={isActive("/colaboradores/asistencias") ? "active" : ""}
            >
              <Link to="/colaboradores/asistencias" style={{ textDecoration: "none", color: "inherit" }}>
                Asistencias
              </Link>
            </MenuItem>
            <MenuItem
              icon={<ReceiptLongIcon fontSize="small" />}
              className={isActive("/colaboradores/recibos") ? "active" : ""}
            >
              <Link to="/colaboradores/recibos" style={{ textDecoration: "none", color: "inherit" }}>
                Recibos
              </Link>
            </MenuItem>
          </SubMenu>

          {/* Ventas */}
          <SubMenu
            title={<span style={{ color: ui.text }}>Insumos</span>}
            icon={<ReceiptOutlinedIcon />}
            open={openMainSubMenu === "Ventas"}
            onClick={() => handleMainSubMenuToggle("Ventas")}
          >
            <MenuItem
              icon={<AddShoppingCartIcon />}
              className={isActive("/facturacion") ? "active" : ""}
            >
              <Link to="/facturacion" style={{ textDecoration: "none", color: "inherit" }}>
                Nueva Venta
              </Link>
            </MenuItem>
            <MenuItem
              icon={<ListAltIcon />}
              className={isActive("/invoices") ? "active" : ""}
            >
              <Link to="/invoices" style={{ textDecoration: "none", color: "inherit" }}>
                Lista de Ventas
              </Link>
            </MenuItem>
            <MenuItem
              icon={<ArticleIcon />}
              className={isActive("/articulos") ? "active" : ""}
            >
              <Link to="/articulos" style={{ textDecoration: "none", color: "inherit" }}>
                Articulos
              </Link>
            </MenuItem>
          </SubMenu>

          {/* Caja 
          <SubMenu
            title={<span style={{ color: ui.text }}>Caja</span>}
            icon={<LocalAtmIcon />}
            open={openMainSubMenu === "Caja"}
            onClick={() => handleMainSubMenuToggle("Caja")}
          >
            <SubMenu
              title="Extracciones e Ingresos"
              open={openInnerSubMenu === "Extracciones e Ingresos"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Extracciones e Ingresos");
              }}
            >
              <MenuItem>Extracción de Caja</MenuItem>
              <MenuItem>Ingreso de Caja</MenuItem>
              <MenuItem>Ver Extracciones e Ingresos</MenuItem>
            </SubMenu>
            <MenuItem>Apertura de Caja</MenuItem>
            <MenuItem>Cierre de Caja</MenuItem>
            <MenuItem>Ver Cajas Cerradas</MenuItem>
          </SubMenu> */}

          {/* Clientes */}
          <SubMenu
            title={<span style={{ color: ui.text }}>Clientes</span>}
            icon={<PeopleOutlinedIcon />}
            open={openMainSubMenu === "Clientes"}
            onClick={() => handleMainSubMenuToggle("Clientes")}
          >
            <MenuItem
              icon={<AccessibilityIcon fontSize="small" />}
              className={isActive("/clientes") ? "active" : ""}
            >
              <Link to="/clientes" style={{ textDecoration: "none", color: "inherit" }}>
                Lista de Clientes
              </Link>
            </MenuItem>
            <MenuItem
              icon={<AccountBalanceWalletIcon fontSize="small" />}
              className={isActive("/ctacte") ? "active" : ""}
            >
              <Link to="/ctacte" style={{ textDecoration: "none", color: "inherit" }}>
                Cta Cte
              </Link>
            </MenuItem>
            <MenuItem
              icon={<PersonAddAlt1Icon fontSize="small" />}
              className={isActive("/altacte") ? "active" : ""}
            >
              <Link to="/pagoscte" style={{ textDecoration: "none", color: "inherit" }}>
                Pagos
              </Link>
            </MenuItem>
          </SubMenu>

          {/* Proveedores */}
          <SubMenu
            icon={<AddBusinessIcon />}
            title={<span style={{ color: ui.text }}>Proveedores</span>}
            open={openMainSubMenu === "Proveedores"}
            onClick={() => handleMainSubMenuToggle("Proveedores")}
          >
            <MenuItem
              icon={<AccountBalanceWalletIcon fontSize="small" />}
              className={isActive("/proveedores/comprobantes") ? "active" : ""}
            >
              <Link to="/proveedores/comprobantes" style={{ textDecoration: "none", color: "inherit" }}>
                Comprobantes
              </Link>
            </MenuItem>
            <MenuItem
              icon={<AccountBalanceWalletIcon fontSize="small" />}
              className={isActive("/proveedores/pagos") ? "active" : ""}
            >
              <Link to="/proveedores/pagos" style={{ textDecoration: "none", color: "inherit" }}>
                Pago/Proveedores
              </Link>
            </MenuItem>
                        <MenuItem
              icon={<AccountBalanceWalletIcon fontSize="small" />}
              className={isActive("/proveedores/ctacte") ? "active" : ""}
            >
              <Link to="/proveedores/ctacte" style={{ textDecoration: "none", color: "inherit" }}>
                CtaCte por Proveedor
              </Link>
            </MenuItem>
          </SubMenu>

          {/* Estadísticas */}
          <SubMenu
            icon={<SignalCellularAltIcon />}
            title={<span style={{ color: ui.text }}>Estadísticas</span>}
            open={openMainSubMenu === "Estadísticas"}
            onClick={() => handleMainSubMenuToggle("Estadísticas")}
          >
            <MenuItem>Ventas por Usuarios</MenuItem>
            <MenuItem>Artículos Vendidos</MenuItem>
          </SubMenu>

          {/* Reportes/Listados */}
          <SubMenu
            icon={<AnalyticsIcon />}
            title={<span style={{ color: ui.text }}>Reportes/Listados</span>}
            open={openMainSubMenu === "Reportes/Listados"}
            onClick={() => handleMainSubMenuToggle("Reportes/Listados")}
          >
            <SubMenu
              title="Precio"
              open={openInnerSubMenu === "Precio"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Precio");
              }}
            >
              <MenuItem>Precio General</MenuItem>
              <MenuItem>Precio por Categoría</MenuItem>
            </SubMenu>

            <SubMenu
              title="Ventas"
              open={openInnerSubMenu === "Ventas"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Ventas");
              }}
            >
              <MenuItem>Venta Detallada</MenuItem>
              <MenuItem>Ventas por Categoría</MenuItem>
              <MenuItem>Ventas Diarias</MenuItem>
              <MenuItem>Ventas Mensuales</MenuItem>
              <MenuItem>Ventas por Vendedor</MenuItem>
              <MenuItem>Costos/Ganancias</MenuItem>
            </SubMenu>

            <SubMenu
              title="Compras"
              open={openInnerSubMenu === "Compras"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Compras");
              }}
            >
              <MenuItem>Compras por Proveedor</MenuItem>
            </SubMenu>

            <SubMenu
              title="Fiscales"
              open={openInnerSubMenu === "Fiscales"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Fiscales");
              }}
            >
              <MenuItem>Libro de IVA Ventas</MenuItem>
              <MenuItem>Libro de IVA Compras</MenuItem>
              <MenuItem>Ventas por Jurisdicción</MenuItem>
            </SubMenu>

            <MenuItem>Artículos a Reponer Stock</MenuItem>

            <SubMenu
              title="Artículos"
              open={openInnerSubMenu === "Artículos"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Artículos");
              }}
            >
              <MenuItem>Por Categoría</MenuItem>
              <MenuItem>Por Proveedor</MenuItem>
              <MenuItem>A Vencer</MenuItem>
              <MenuItem>Inventario General</MenuItem>
              <MenuItem>Inventario por Costo</MenuItem>
            </SubMenu>

            <SubMenu
              title="Clientes"
              open={openInnerSubMenu === "Clientes"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Clientes");
              }}
            >
              <MenuItem>Clientes</MenuItem>
              <MenuItem>Cuentas Corrientes</MenuItem>
              <MenuItem>Cuentas Corrientes por Vencer</MenuItem>
            </SubMenu>
          </SubMenu>

          {/* Artículos 
          <SubMenu
            icon={<InventoryIcon />}
            title={<span style={{ color: ui.text }}>Artículos</span>}
            open={openMainSubMenu === "Artículos"}
            onClick={() => handleMainSubMenuToggle("Artículos")}
          >
            <MenuItem>Consulta de Precios (F9)</MenuItem>
            <MenuItem
              icon={<ArticleIcon />}
              className={isActive("/articulos") ? "active" : ""}
            >
              <Link to="/articulos" style={{ textDecoration: "none", color: "inherit" }}>
                Buscar Artículos (Ctrl + S)
              </Link>
            </MenuItem>
            {tienePermiso("Articulos: Permite dar de alta artículos") && (
              <MenuItem>Alta de Artículos (Ctrl + A)</MenuItem>
            )}
            <MenuItem>Promociones</MenuItem>
            <MenuItem>Actualización Masiva de Precios</MenuItem>
            <MenuItem>Impresión de Código de Barras</MenuItem>
          </SubMenu> */}

          {/* Operaciones */}
          <SubMenu
            icon={<ManageSearchIcon />}
            title={<span style={{ color: ui.text }}>Operaciones</span>}
            open={openMainSubMenu === "Operaciones"}
            onClick={() => handleMainSubMenuToggle("Operaciones")}
          >
            <SubMenu
              title="Factura Electrónica"
              open={openInnerSubMenu === "Factura Electrónica"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Factura Electrónica");
              }}
            >
              <MenuItem>Reproceso de Factura Electrónica</MenuItem>
            </SubMenu>
            <MenuItem>Régimen de Información de Ventas RG3685</MenuItem>
          </SubMenu>

          {/* Administración */}
          <SubMenu
            icon={<TuneIcon />}
            title={<span style={{ color: ui.text }}>Administración</span>}
            open={openMainSubMenu === "Administración"}
            onClick={() => handleMainSubMenuToggle("Administración")}
          >
            <MenuItem
              icon={<CategoryIcon fontSize="small" />}
              className={isActive("/categorias") ? "active" : ""}
            >
              <Link to="/categorias" style={{ textDecoration: "none", color: "inherit" }}>
                Categorías
              </Link>
            </MenuItem>

            <MenuItem
              icon={<GroupsIcon fontSize="small" />}
              className={isActive("/proveedores") ? "active" : ""}
            >
              <Link to="/proveedores" style={{ textDecoration: "none", color: "inherit" }}>
                Proveedores
              </Link>
            </MenuItem>

            {esAdmin && (
              <MenuItem
                icon={<PersonIcon fontSize="small" />}
                className={isActive("/team") ? "active" : ""}
              >
                <Link to="/team" style={{ textDecoration: "none", color: "inherit" }}>
                  Usuarios
                </Link>
              </MenuItem>
            )}

            <MenuItem>Tarjetas</MenuItem>
            <MenuItem>Descuentos</MenuItem>
            <MenuItem>Tipos de Mov. de Caja</MenuItem>

            <SubMenu
              title="Importación de Datos (Excel)"
              open={openInnerSubMenu === "Importación de Datos (Excel)"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Importación de Datos (Excel)");
              }}
            >
              <MenuItem>Artículos CSV</MenuItem>
              <MenuItem>Clientes CSV</MenuItem>
              <MenuItem>Categorías CSV</MenuItem>
            </SubMenu>

            <SubMenu
              title="Exportación de Datos (Excel)"
              open={openInnerSubMenu === "Exportación de Datos (Excel)"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Exportación de Datos (Excel)");
              }}
            >
              <MenuItem>Artículos CSV</MenuItem>
            </SubMenu>

            <SubMenu
              title="Configuración del Sistema"
              open={openInnerSubMenu === "Configuración del Sistema"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Configuración del Sistema");
              }}
            >
              <MenuItem icon={<ApartmentIcon fontSize="small" />}>
                <Link to="/settings" style={{ textDecoration: "none", color: "inherit" }}>
                  Empresa
                </Link>
              </MenuItem>
              <MenuItem>Comprobantes</MenuItem>
              <MenuItem>Impresoras</MenuItem>
              <MenuItem>Cuenta de Correo</MenuItem>
              <MenuItem>Cajas</MenuItem>
              <MenuItem>Canales de Venta</MenuItem>
              <MenuItem>Código de Barras de Balanza</MenuItem>
              <MenuItem>Configuración General</MenuItem>
              <MenuItem>AFIP Factura Electrónica</MenuItem>
              <MenuItem>Generar CSR</MenuItem>
              <MenuItem>Integración con Mercado Libre</MenuItem>
            </SubMenu>
          </SubMenu>
        </Menu>
      </ProSidebar>
    </Box>
  );

  // Drawer en móvil
  if (mdDown) {
    return (
      <Drawer
        variant="temporary"
        open={!!mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            bgcolor: "transparent",
            boxShadow: "none",
            height: "100vh",
          },
        }}
      >
        <Box sx={{ height: "100%" }}>{content}</Box>
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {content}
    </Box>
  );
};

export default Sidebar;
