import { useEffect, useState, useMemo } from "react";
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
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";

import EditNoteIcon from "@mui/icons-material/EditNote";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";

import { getUserIdFromToken, getIdEmpleadoFromToken } from "../../auth/auth";
import { getUsuarioById } from "../../config/UsuarioDB";
import { getEmpleadoById } from "../../config/EmpleadoDB";
import { getEmpresaById } from "../../config/EmpresaDB";

const SIDEBAR_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

const Sidebar = ({ mobileOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const [userData, setUserData] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [openMainSubMenu, setOpenMainSubMenu] = useState(null);
  const [openInnerSubMenu, setOpenInnerSubMenu] = useState(null);
  const location = useLocation();

  const ui = useMemo(
    () => ({
      base: colors.azul?.[500] || colors.primary?.[500] || "#397B9C",
      baseDeep: colors.primary?.[700] || "#274F65",
      baseSoft: colors.azul?.[600] || "#2F6782",
      hover: colors.hovermenu?.[500] || colors.blueAccent?.[800] || "#2F6782",
      text: colors.sidebartext?.[500] || colors.grey?.[100] || "#DAE6F0",
      activeBg: colors.primary?.[600] || "#2F6782",
      activeText: "#FFFFFF",
      divider: "rgba(0,0,0,.18)",
      tagBg: colors.greenAccent?.[500] || "#5AAD9C",
      tagBlue: colors.blueAccent?.[400] || "#7CA5C3",
    }),
    [colors]
  );

  const permisosUsuario = JSON.parse(localStorage.getItem("userPermissions") || "[]");
  const esAdmin = userData && userData.idRol === 1;

  const tienePermiso = (nombrePermiso) => {
    if (esAdmin) return true;
    const p = permisosUsuario.find((x) => x?.Nombre === nombrePermiso);
    return !!p && p.PermisoActivo === 1;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserIdFromToken();
        const EmpleadoId = getIdEmpleadoFromToken();
        if (userId) {
          const u = await getUsuarioById(userId);
          setUserData(u);
          if (u?.idEmpresa) setEmpresa(await getEmpresaById(u.idEmpresa));
        } else if (EmpleadoId) {
          const e = await getEmpleadoById(EmpleadoId);
          setUserData(e);
          if (e?.idEmpresa) setEmpresa(await getEmpresaById(e.idEmpresa));
        }
      } catch (err) {
        console.error("Error fetching user/employee data:", err);
      }
    };
    fetchUserData();
  }, []);

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
    )
      setOpenMainSubMenu("Administración");
    else if (location.pathname.startsWith("/trabajos")) setOpenMainSubMenu("Trabajos");

    // En móvil: al navegar, cerrar el drawer
    if (mdDown && onClose) onClose();
  }, [location.pathname, mdDown, onClose]);

  const handleMainSubMenuToggle = (submenu) => {
    setOpenMainSubMenu((prev) => (prev === submenu ? null : submenu));
    setOpenInnerSubMenu(null);
  };
  const handleInnerSubMenuToggle = (submenu) => {
    setOpenInnerSubMenu((prev) => (prev === submenu ? null : submenu));
  };

  const sidebarStyles = {
    "& .pro-sidebar-inner": {
      background: `${ui.base} !important`,
      boxShadow: "0 6px 18px rgba(0,0,0,.35)",
      borderRight: `1px solid ${ui.divider}`,
    },
    "& .pro-sidebar": { color: ui.text },
    "& .pro-menu": { paddingTop: "4px" },
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
    "& .pro-sidebar .pro-menu > ul > .pro-sub-menu > .pro-inner-list-item": {
      backgroundColor: `${ui.baseSoft} !important`,
      borderRadius: "12px",
      margin: "4px 8px 8px",
      padding: "6px 6px 8px !important",
    },
    "& .pro-menu-item.active > .pro-inner-item, & .pro-inner-item.active": {
      backgroundColor: `${ui.activeBg} !important`,
      color: `${ui.activeText} !important`,
      boxShadow: "inset 0 0 0 2px rgba(255,255,255,.10)",
    },
    "& .pro-icon-wrapper": {
      backgroundColor: "transparent !important",
      color: `${ui.text} !important`,
    },
    "& .pro-sidebar.collapsed .pro-menu > ul > .pro-menu-item.pro-sub-menu > .pro-inner-list-item > .popper-inner": {
      backgroundColor: `${ui.baseSoft} !important`,
      borderRadius: "10px",
      border: `1px solid ${ui.divider}`,
    },
  };

const content = (
    <Box sx={sidebarStyles}>
      <ProSidebar
        collapsed={isCollapsed}
        breakPoint="md"
        width={SIDEBAR_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
      >
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{ transition: "all .2s ease-in-out" }}
          >
            {!isCollapsed && (
              <Box display="flex" alignItems="center" ml="10px">
                <Typography variant="h6" sx={{ color: ui.activeText }}>
                  {empresa ? empresa.NomComercial : "Cargando empresa..."}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)} sx={{ ml: "auto", color: ui.activeText }}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box sx={{ p: 2, display: "flex", mb: 1.5, alignItems: "center", background: ui.baseSoft, borderRadius: "12px", mx: 1 }}>
              {userData && (
                <>
                  <img
                    src={userData.Imagen}
                    alt="User"
                    style={{ width: 48, height: 48, borderRadius: "50%", marginRight: 12, objectFit: "cover" }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: ui.activeText, lineHeight: 1.2 }}>
                      {userData.Nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: ui.activeText, opacity: 0.85 }}>
                      {userData.idRol === 1 ? "Administrador" : userData.idRol >= 2 && userData.idRol <= 4 ? userData.Rol : "Usuario"}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}

          <MenuItem className={isActive("/dashboard") ? "active" : ""} icon={<HomeOutlinedIcon />}>
            <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
              Panel General
            </Link>
          </MenuItem>


          {/* === Trabajos (nuevo) === */}
          <SubMenu
            icon={<EditNoteIcon />}
            open={openMainSubMenu === "Trabajos"}
            onClick={() => handleMainSubMenuToggle("Trabajos")}
            title={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "inherit" }}>
                <span>Trabajos</span>
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    px: 1,
                    py: "2px",
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                    borderRadius: "999px",
                    bgcolor: ui.tagBlue,
                    color: "#fff",
                    display: "inline-block",
                  }}
                >
                  Ingreso Trabajo
                </Box>
              </Box>
            }
          >
            <MenuItem icon={<AddCircleOutlineIcon fontSize="small" />} className={isActive("/trabajos/ingresar") ? "active" : ""}>
              <Link to="/trabajos/ingresar" style={{ textDecoration: "none", color: "inherit" }}>
                Ingresar Trabajo
              </Link>
            </MenuItem>
            <MenuItem icon={<SearchIcon fontSize="small" />} className={isActive("/trabajos/consultar") ? "active" : ""}>
              <Link to="/trabajos/consultar" style={{ textDecoration: "none", color: "inherit" }}>
                Consulta y Modificación
              </Link>
            </MenuItem>
          </SubMenu>

          {/* Ventas */}
          <SubMenu
            title="Ventas"
            icon={<ReceiptOutlinedIcon />}
            open={openMainSubMenu === "Ventas"}
            onClick={() => handleMainSubMenuToggle("Ventas")}
          >
            <MenuItem>
              <Link to="/facturacion" style={{ textDecoration: "none", color: "inherit" }}>
                Nueva Venta (F12 o Ctrl+N)
              </Link>
            </MenuItem>
            <MenuItem>
              Buscar Comprobante
              <Box component="span" sx={{ ml: 1, px: 1, py: "2px", fontSize: 10, borderRadius: "999px", bgcolor: ui.tagBg, color: "#fff" }}>
                rápido
              </Box>
            </MenuItem>
            <MenuItem> Anular Comprobante </MenuItem>
            <MenuItem> Comprobante Asociado </MenuItem>
            <MenuItem> Reimprimir Comprobante </MenuItem>
          </SubMenu>

          {/* Caja */}
          <SubMenu title="Caja" icon={<LocalAtmIcon />} open={openMainSubMenu === "Caja"} onClick={() => handleMainSubMenuToggle("Caja")}>
            <SubMenu
              title="Extracciones e Ingresos"
              open={openInnerSubMenu === "Extracciones e Ingresos"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Extracciones e Ingresos");
              }}
            >
              <MenuItem> Extracción de Caja </MenuItem>
              <MenuItem> Ingreso de Caja </MenuItem>
              <MenuItem> Ver Extracciones e Ingresos </MenuItem>
            </SubMenu>
            <MenuItem> Apertura de Caja </MenuItem>
            <MenuItem> Cierre de Caja </MenuItem>
            <MenuItem> Ver Cajas Cerradas </MenuItem>
          </SubMenu>

          {/* Clientes */}
          <SubMenu title="Clientes" icon={<PeopleOutlinedIcon />} open={openMainSubMenu === "Clientes"} onClick={() => handleMainSubMenuToggle("Clientes")}>
            <MenuItem icon={<AccessibilityIcon fontSize="small" />} className={isActive("/clientes") ? "active" : ""}>
              <Link to="/clientes" style={{ textDecoration: "none", color: "inherit" }}>
                Lista de Clientes
              </Link>
            </MenuItem>
            <MenuItem> Clientes de Cuentas Corrientes (Ctrl+K) </MenuItem>
            <MenuItem> Alta de Cliente (Ctrl+E) </MenuItem>
          </SubMenu>

          {/* Proveedores */}
          <SubMenu icon={<AddBusinessIcon />} title="Proveedores" open={openMainSubMenu === "Proveedores"} onClick={() => handleMainSubMenuToggle("Proveedores")}>
            <MenuItem> Alta de Entrada de Mercadería </MenuItem>
            <MenuItem> Buscar Entrada de Mercadería </MenuItem>
          </SubMenu>

          {/* Estadísticas */}
          <SubMenu icon={<SignalCellularAltIcon />} title="Estadísticas" open={openMainSubMenu === "Estadísticas"} onClick={() => handleMainSubMenuToggle("Estadísticas")}>
            <MenuItem> Ventas por Usuarios </MenuItem>
            <MenuItem> Artículos Vendidos </MenuItem>
          </SubMenu>

          {/* Reportes/Listados */}
          <SubMenu icon={<AnalyticsIcon />} title="Reportes/Listados" open={openMainSubMenu === "Reportes/Listados"} onClick={() => handleMainSubMenuToggle("Reportes/Listados")}>
            <SubMenu
              title="Precio"
              open={openInnerSubMenu === "Precio"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Precio");
              }}
            >
              <MenuItem> Precio General </MenuItem>
              <MenuItem> Precio por Categoría </MenuItem>
            </SubMenu>

            <SubMenu
              title="Ventas"
              open={openInnerSubMenu === "Ventas"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Ventas");
              }}
            >
              <MenuItem> Venta Detallada </MenuItem>
              <MenuItem> Ventas por Categoría </MenuItem>
              <MenuItem> Ventas Diarias </MenuItem>
              <MenuItem> Ventas Mensuales </MenuItem>
              <MenuItem> Ventas por Vendedor </MenuItem>
              <MenuItem> Costos/Ganancias </MenuItem>
            </SubMenu>

            <SubMenu
              title="Compras"
              open={openInnerSubMenu === "Compras"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Compras");
              }}
            >
              <MenuItem> Compras por Proveedor </MenuItem>
            </SubMenu>

            <SubMenu
              title="Fiscales"
              open={openInnerSubMenu === "Fiscales"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Fiscales");
              }}
            >
              <MenuItem> Libro de IVA Ventas </MenuItem>
              <MenuItem> Libro de IVA Compras </MenuItem>
              <MenuItem> Ventas por Jurisdicción </MenuItem>
            </SubMenu>

            <MenuItem> Artículos a Reponer Stock </MenuItem>

            <SubMenu
              title="Artículos"
              open={openInnerSubMenu === "Artículos"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Artículos");
              }}
            >
              <MenuItem> Por Categoría </MenuItem>
              <MenuItem> Por Proveedor </MenuItem>
              <MenuItem> A Vencer </MenuItem>
              <MenuItem> Inventario General </MenuItem>
              <MenuItem> Inventario por Costo </MenuItem>
            </SubMenu>

            <SubMenu
              title="Clientes"
              open={openInnerSubMenu === "Clientes"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Clientes");
              }}
            >
              <MenuItem> Clientes </MenuItem>
              <MenuItem> Cuentas Corrientes </MenuItem>
              <MenuItem> Cuentas Corrientes por Vencer </MenuItem>
            </SubMenu>
          </SubMenu>

          {/* Artículos */}
          <SubMenu icon={<InventoryIcon />} title="Artículos" open={openMainSubMenu === "Artículos"} onClick={() => handleMainSubMenuToggle("Artículos")}>
            <MenuItem> Consulta de Precios (F9) </MenuItem>
            <MenuItem icon={<ArticleIcon />} className={isActive("/articulos") ? "active" : ""}>
              <Link to="/articulos" style={{ textDecoration: "none", color: "inherit" }}>
                Buscar Artículos (Ctrl + S)
              </Link>
            </MenuItem>
            {tienePermiso("Articulos: Permite dar de alta artículos") && <MenuItem> Alta de Artículos (Ctrl + A) </MenuItem>}
            <MenuItem> Promociones </MenuItem>
            <MenuItem> Actualización Masiva de Precios </MenuItem>
            <MenuItem> Impresión de Código de Barras </MenuItem>
          </SubMenu>

          {/* Operaciones */}
          <SubMenu icon={<ManageSearchIcon />} title="Operaciones" open={openMainSubMenu === "Operaciones"} onClick={() => handleMainSubMenuToggle("Operaciones")}>
            <SubMenu
              title="Factura Electrónica"
              open={openInnerSubMenu === "Factura Electrónica"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Factura Electrónica");
              }}
            >
              <MenuItem> Reproceso de Factura Electrónica </MenuItem>
            </SubMenu>
            <MenuItem> Régimen de Información de Ventas RG3685 </MenuItem>
            <MenuItem> Actualizar Cotización Dólar </MenuItem>
          </SubMenu>

          {/* Administración */}
          <SubMenu icon={<TuneIcon />} title="Administración" open={openMainSubMenu === "Administración"} onClick={() => handleMainSubMenuToggle("Administración")}>
            <MenuItem icon={<CategoryIcon fontSize="small" />} className={isActive("/categorias") ? "active" : ""}>
              <Link to="/categorias" style={{ textDecoration: "none", color: "inherit" }}>
                Categorías
              </Link>
            </MenuItem>

            <MenuItem icon={<GroupsIcon fontSize="small" />} className={isActive("/proveedores") ? "active" : ""}>
              <Link to="/proveedores" style={{ textDecoration: "none", color: "inherit" }}>
                Proveedores
              </Link>
            </MenuItem>

            {tienePermiso("Admin: Administración de Usuarios") && (
              <MenuItem icon={<PersonIcon fontSize="small" />} className={isActive("/team") ? "active" : ""}>
                <Link to="/team" style={{ textDecoration: "none", color: "inherit" }}>
                  Usuarios
                </Link>
              </MenuItem>
            )}

            <MenuItem> Tarjetas </MenuItem>
            <MenuItem> Descuentos </MenuItem>
            <MenuItem> Tipos de Mov. de Caja </MenuItem>

            <SubMenu
              title="Importación de Datos (Excel)"
              open={openInnerSubMenu === "Importación de Datos (Excel)"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Importación de Datos (Excel)");
              }}
            >
              <MenuItem> Artículos CSV </MenuItem>
              <MenuItem> Clientes CSV </MenuItem>
              <MenuItem> Categorías CSV </MenuItem>
            </SubMenu>

            <SubMenu
              title="Exportación de Datos (Excel)"
              open={openInnerSubMenu === "Exportación de Datos (Excel)"}
              onClick={(e) => {
                e.stopPropagation();
                handleInnerSubMenuToggle("Exportación de Datos (Excel)");
              }}
            >
              <MenuItem> Artículos CSV </MenuItem>
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
              <MenuItem> Comprobantes </MenuItem>
              <MenuItem> Impresoras </MenuItem>
              <MenuItem> Cuenta de Correo </MenuItem>
              <MenuItem> Cajas </MenuItem>
              <MenuItem> Canales de Venta </MenuItem>
              <MenuItem> Código de Barras de Balanza </MenuItem>
              <MenuItem> Configuración General </MenuItem>
              <MenuItem> AFIP Factura Electrónica </MenuItem>
              <MenuItem> Generar CSR </MenuItem>
              <MenuItem> Integración con Mercado Libre </MenuItem>
            </SubMenu>
          </SubMenu>
        </Menu>
      </ProSidebar>
    </Box>
  );
 // Drawer en móvil, fijo en desktop
  if (mdDown) {
    return (
      <Drawer
        variant="temporary"
        open={!!mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: SIDEBAR_WIDTH, bgcolor: "transparent", boxShadow: "none" } }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        zIndex: 1200,
      }}
    >
      {content}
    </Box>
  );
};

export default Sidebar;
