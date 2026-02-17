import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Paper, Card, CardMedia, CardContent, Chip, Typography, TextField,
  InputAdornment, Button, IconButton, Tooltip, Divider, Stack, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery,
  Grid, List, ListItem, ListItemText, ListItemSecondaryAction, Alert, Snackbar,
  Skeleton, ToggleButtonGroup, ToggleButton
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  Print as PrintIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useSidebarContext } from "../../contexts/SidebarContext";
// ✅ Modal de impresión externo
import ModalImprimir from "../../components/modals/ModalImprimir";

// Servicios
import * as Products from "../../services/productService";
import * as Sales from "../../services/salesService";
import * as Warehouse from "../../services/warehouseService";
import { getUserIdFromToken } from "../../auth/auth";

const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

const TIPOS_COMPROBANTE = [
  { id: "X", name: "X - Ticket / Consumidor Final" },
  { id: "A", name: "A - Responsable Inscripto" },
  { id: "B", name: "B - Consumidor Final / IVA Incluido" },
  { id: "C", name: "C - Exento / Monotributo" },
];

// ====== MODAL DE SELECCIÓN DE CLIENTE ======
const ModalCliente = ({ open, onClose, onSelect }) => {
  const [clienteNuevo, setClienteNuevo] = useState({
    nombre: "",
    cuit: "",
    email: "",
  });

  const handleConsumidorFinal = () => {
    onSelect({
      id: null,
      nombre: "Consumidor Final",
      cuit: "",
      email: "",
    });
    onClose();
  };

  const handleNuevoCliente = () => {
    if (!clienteNuevo.nombre) return;
    onSelect({
      id: null,
      ...clienteNuevo,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Seleccionar Cliente</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={handleConsumidorFinal}
            startIcon={<PersonIcon />}
          >
            Consumidor Final
          </Button>

          <Divider>o ingresar datos</Divider>

          <TextField
            label="Nombre / Razón Social"
            value={clienteNuevo.nombre}
            onChange={(e) =>
              setClienteNuevo({ ...clienteNuevo, nombre: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="CUIT (opcional)"
            value={clienteNuevo.cuit}
            onChange={(e) =>
              setClienteNuevo({ ...clienteNuevo, cuit: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Email (opcional)"
            value={clienteNuevo.email}
            onChange={(e) =>
              setClienteNuevo({ ...clienteNuevo, email: e.target.value })
            }
            fullWidth
            type="email"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleNuevoCliente}
          disabled={!clienteNuevo.nombre}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ====== MODAL DE MÉTODO DE PAGO ======
const ModalMetodoPago = ({ open, onClose, total, onConfirm }) => {
  const [metodo, setMetodo] = useState("Efectivo");
  const [recibido, setRecibido] = useState("");
  const [cambio, setCambio] = useState(0);

  useEffect(() => {
    const r = Number(recibido || 0);
    setCambio(r > total ? r - total : 0);
  }, [recibido, total]);

  const handleConfirm = () => {
    if (metodo === "Efectivo" && Number(recibido || 0) < total) return;
    onConfirm?.({
      metodo,
      recibido: Number(recibido || 0),
      cambio,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Método de Pago</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "primary.50", borderColor: "primary.main" }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>Total:</Typography>
              <Typography variant="h6" color="primary" fontWeight={700}>
                $
                {total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </Typography>
            </Stack>
          </Paper>

          <TextField
            select
            label="Método de Pago"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="Efectivo">💵 Efectivo</option>
            <option value="Débito">💳 Tarjeta Débito</option>
            <option value="Crédito">💳 Tarjeta Crédito</option>
            <option value="Transferencia">🏦 Transferencia</option>
            <option value="Mercado Pago">💚 Mercado Pago</option>
          </TextField>

          {metodo === "Efectivo" && (
            <>
              <TextField
                label="Monto Recibido"
                value={recibido}
                onChange={(e) => setRecibido(e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                error={Boolean(recibido && Number(recibido) < total)}
                helperText={
                  recibido && Number(recibido) < total
                    ? "Debe ser mayor o igual al total"
                    : ""
                }
              />
              {recibido && Number(recibido) >= total && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: "success.50",
                    borderColor: "success.main",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={600}>Cambio:</Typography>
                    <Typography variant="h6" color="success.main" fontWeight={700}>
                      $
                      {cambio.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Stack>
                </Paper>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={metodo === "Efectivo" && Number(recibido || 0) < total}
        >
          Confirmar Cobro
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ====== MODAL DE ACCIONES POST-VENTA ======
const ModalAcciones = ({ open, onClose, venta, onImprimir, onWhatsApp, onEmail }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ReceiptIcon color="success" />
          <Typography variant="h6" fontWeight={700}>
            Venta Exitosa
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="success">
            Venta #{venta?.number || venta?.id} registrada correctamente
          </Alert>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Total:</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {(venta?.total || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Comprobante:</Typography>
                <Chip label={venta?.tipo_comprobante || "X"} size="small" />
              </Stack>
            </Stack>
          </Paper>

          <Divider />

          <Stack spacing={1}>
            <Button variant="contained" fullWidth startIcon={<PrintIcon />} onClick={onImprimir}>
              Imprimir Ticket
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<WhatsAppIcon />}
              onClick={onWhatsApp}
              color="success"
            >
              Enviar por WhatsApp
            </Button>
            <Button variant="outlined" fullWidth startIcon={<EmailIcon />} onClick={onEmail}>
              Enviar por Email
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="large" variant="contained">
          Nueva Venta
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ====== TARJETA DE PRODUCTO ======
const ProductCard = ({ product, onAdd, cartCount }) => {
  const imageUrl = product.image_url || product.ImagenUrl || product.primary_image_url;
  const price = Number(product.price || product.PrecioPublico || 0);
  const stock = Number(product.stock || product.Stock || 0);
  const name = product.name || product.Nombre || "";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
      onClick={() => onAdd(product)}
    >
      {cartCount > 0 && (
        <Chip
          label={cartCount}
          color="secondary"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            fontWeight: 700,
          }}
        />
      )}

      <CardMedia
        sx={{
          height: 140,
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImageIcon sx={{ fontSize: 48, color: "grey.400" }} />
        )}
      </CardMedia>

      <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
        <Tooltip title={name}>
          <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ mb: 0.5 }}>
            {name}
          </Typography>
        </Tooltip>

        <Typography variant="h6" color="primary" fontWeight={700}>
          ${price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </Typography>

        <Chip
          label={`Stock: ${stock}`}
          size="small"
          color={stock > 0 ? "success" : "error"}
          variant="outlined"
          sx={{ mt: 0.5 }}
        />
      </CardContent>
    </Card>
  );
};

// ====== ÍTEM DEL CARRITO ======
const CartItem = ({ item, onInc, onDec, onRemove }) => {
  const subtotal = item.qty * item.price;

  return (
    <ListItem
      sx={{
        bgcolor: "background.default",
        borderRadius: 2,
        mb: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <ListItemText
        primary={
          <Typography variant="subtitle2" fontWeight={600}>
            {item.name}
          </Typography>
        }
        secondary={
          <Box component="span" sx={{ display: "block", mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" component="span">
              ${item.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })} × {item.qty}
            </Typography>
            {" = "}
            <Typography variant="body2" color="primary" fontWeight={700} component="span">
              ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton size="small" onClick={() => onDec(item.id)} color="primary">
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Chip label={item.qty} size="small" />
          <IconButton size="small" onClick={() => onInc(item.id)} color="primary">
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onRemove(item.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// ====== SKELETON ======
const ProductCardSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={140} />
    <CardContent>
      <Skeleton variant="text" height={24} />
      <Skeleton variant="text" height={32} width="60%" />
      <Skeleton variant="rectangular" height={24} width="40%" sx={{ mt: 0.5, borderRadius: 1 }} />
    </CardContent>
  </Card>
);

// ====== PRINCIPAL ======
export default function FacturarPOS() {
  const theme = useTheme();
  const appbarH = TOPBAR_HEIGHT(theme);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

const { sidebarWidth } = useSidebarContext();
  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) return;

    const update = () => setSidebarW(sideBox.offsetWidth || 0);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(sideBox);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState("");
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [cajero, setCajero] = useState("Cajero");

  const [cliente, setCliente] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState("X");

  const [openCliente, setOpenCliente] = useState(false);
  const [openPago, setOpenPago] = useState(false);
  const [openAcciones, setOpenAcciones] = useState(false);
  const [openImprimir, setOpenImprimir] = useState(false);
  const [ventaGuardada, setVentaGuardada] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    (async () => {
      try {
        const id = getUserIdFromToken?.();
        if (id) setCajero("Cajero");
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [prods, warehs] = await Promise.all([
          Products.listProducts?.() || Promise.resolve([]),
          Warehouse.listWarehouses?.() || Promise.resolve([]),
        ]);

        setCatalogo(Array.isArray(prods) ? prods : prods?.data || []);

        const wArr = Array.isArray(warehs) ? warehs : warehs?.data || [];
        setWarehouses(wArr);

        if (!warehouseId && wArr.length) setWarehouseId(wArr[0].id);
      } catch (e) {
        console.error(e);
        setSnack({ open: true, message: "Error al cargar datos", severity: "error" });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const catalogoFiltrado = useMemo(() => {
    const q = busca.toLowerCase();
    return catalogo.filter(
      (p) =>
        (p.name || p.Nombre || "").toLowerCase().includes(q) ||
        (p.sku || p.Codigo || "").toLowerCase().includes(q) ||
        (p.barcode || p.CodigoBarra || "").toLowerCase().includes(q)
    );
  }, [catalogo, busca]);

  const cartCounts = useMemo(() => {
    const map = new Map();
    items.forEach((item) => map.set(item.id, item.qty));
    return map;
  }, [items]);

  const totales = useMemo(() => {
    let totalBruto = 0;
    let subtotalNeto = 0;
    const impuestosPorTasa = new Map();

    for (const it of items) {
      const lineTotal = Number(it.subtotal || 0);
      const rate = Number(it.ivaRate || 0);
      totalBruto += lineTotal;

      if (rate > 0 && tipoComprobante !== "C") {
        const lineNeto = lineTotal / (1 + rate);
        const lineImp = lineTotal - lineNeto;
        subtotalNeto += lineNeto;
        impuestosPorTasa.set(rate, (impuestosPorTasa.get(rate) || 0) + lineImp);
      } else {
        subtotalNeto += lineTotal;
      }
    }

    return {
      total: totalBruto,
      subtotal: subtotalNeto,
      iva21: impuestosPorTasa.get(0.21) || 0,
      iva105: impuestosPorTasa.get(0.105) || 0,
    };
  }, [items, tipoComprobante]);

  const addItem = useCallback((prod) => {
    const id = prod.id || prod.idArticulo;
    const name = prod.name || prod.Nombre;
    const price = Number(prod.price || prod.PrecioPublico || 0);
    const ivaPct = Number(prod.tax_rate ?? prod.Iva ?? 0);
    const ivaRate = Number.isFinite(ivaPct) ? Math.max(0, ivaPct) / 100 : 0;

    setItems((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        return prev.map((x) =>
          x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x
        );
      }
      return [...prev, { id, name, price, ivaRate, qty: 1, subtotal: price }];
    });
  }, []);

  const incItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x))
    );
  }, []);

  const decItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id && x.qty > 1 ? { ...x, qty: x.qty - 1, subtotal: (x.qty - 1) * x.price } : x
      )
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCliente(null);
    setTipoComprobante("X");
  }, []);

  const handleVender = () => {
    if (items.length === 0) {
      setSnack({ open: true, message: "El carrito está vacío", severity: "warning" });
      return;
    }
    if (!warehouseId) {
      setSnack({ open: true, message: "Selecciona un almacén", severity: "error" });
      return;
    }
    if (!cliente) {
      setOpenCliente(true);
      return;
    }
    setOpenPago(true);
  };

  const handleClienteSelect = (clienteData) => {
    setCliente(clienteData);
    setOpenPago(true);
  };

  const handlePagoConfirm = async (pagoInfo) => {
    setOpenPago(false);

    try {
      const payload = {
        warehouse_id: warehouseId,
        customer_id: cliente?.id || null,
        items: items.map((it) => ({
          product_id: it.id,
          qty: it.qty,
          unit_price: it.price,
          tax_rate: (it.ivaRate || 0) * 100,
        })),
        observations: `Comprobante ${tipoComprobante} - Cliente: ${cliente?.nombre || "Consumidor Final"}`,
      };

      const venta = await Sales.createSale(payload);

      setVentaGuardada({
        ...venta,
        tipo_comprobante: tipoComprobante,
        cliente,
        items: items.map((it) => ({
          descripcion: it.name,
          name: it.name,
          cantidad: it.qty,
          qty: it.qty,
          precio: it.price,
          price: it.price,
          total: it.subtotal,
          subtotal: it.subtotal,
        })),
        totales,
        pago: { ...pagoInfo, cajero },
      });

      clearCart();
      setOpenAcciones(true);
    } catch (e) {
      console.error(e);
      setSnack({
        open: true,
        message: e.response?.data?.message || "Error al procesar la venta",
        severity: "error",
      });
    }
  };

  const handleImprimir = () => {
    setOpenAcciones(false);
    setOpenImprimir(true);
  };

  const handleWhatsApp = () => {
    const mensaje = `Hola! Tu comprobante ${ventaGuardada?.tipo_comprobante} #${
      ventaGuardada?.number || ventaGuardada?.id
    }\nTotal: $${(ventaGuardada?.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`);
  };

  const handleEmail = () => {
    const asunto = `Comprobante ${ventaGuardada?.tipo_comprobante} #${ventaGuardada?.number || ventaGuardada?.id}`;
    const cuerpo = `Total: $${(ventaGuardada?.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    window.open(`mailto:${cliente?.email || ""}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: mdDown ? 0 : sidebarWidth,  // ← Usar sidebarWidth del contexto
        right: 0,
        bottom: 0,
        p: 2,
        overflow: "hidden",
        transition: "left 0.3s ease",  // ← Sincronizar con transición del sidebar
      }}
    >
      <Grid container spacing={2} sx={{ height: "100%" }}>
        <Grid item xs={12} md={8} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Paper variant="outlined" sx={{ height: "100%", borderRadius: 2, p: 2, display: "flex", flexDirection: "column" }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <TextField
                placeholder="Buscar productos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  ".MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "background.default",
                  },
                }}
              />
              <Chip label={`${catalogoFiltrado.length} productos`} color="primary" variant="outlined" />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 4 },
              }}
            >
              <Grid container spacing={2}>
                {loading
                  ? [1, 2, 3, 4, 5, 6].map((i) => (
                      <Grid item xs={6} sm={4} md={3} key={i}>
                        <ProductCardSkeleton />
                      </Grid>
                    ))
                  : catalogoFiltrado.map((prod) => (
                      <Grid item xs={6} sm={4} md={3} key={prod.id || prod.idArticulo}>
                        <ProductCard
                          product={prod}
                          onAdd={addItem}
                          cartCount={cartCounts.get(prod.id || prod.idArticulo) || 0}
                        />
                      </Grid>
                    ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Paper variant="outlined" sx={{ height: "100%", borderRadius: 2, p: 2, display: "flex", flexDirection: "column" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CartIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Carrito
                </Typography>
                <Badge badgeContent={items.length} color="secondary" />
              </Stack>
              {items.length > 0 && (
                <IconButton size="small" onClick={clearCart} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>

            <Stack spacing={1.5} mb={2}>
              <Button variant="outlined" startIcon={<PersonIcon />} onClick={() => setOpenCliente(true)} fullWidth>
                {cliente ? cliente.nombre : "Seleccionar Cliente"}
              </Button>

              <ToggleButtonGroup
                value={tipoComprobante}
                exclusive
                onChange={(e, val) => val && setTipoComprobante(val)}
                fullWidth
                size="small"
              >
                {TIPOS_COMPROBANTE.map((tipo) => (
                  <ToggleButton key={tipo.id} value={tipo.id}>
                    {tipo.id}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 3 },
              }}
            >
              {items.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <CartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="body2">El carrito está vacío</Typography>
                  <Typography variant="caption">Agrega productos para comenzar</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} onInc={incItem} onDec={decItem} onRemove={removeItem} />
                  ))}
                </List>
              )}
            </Box>

            {items.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${totales.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </Typography>
                  </Stack>

                  {tipoComprobante !== "C" && (
                    <>
                      {totales.iva21 > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            IVA 21%
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            ${totales.iva21.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </Typography>
                        </Stack>
                      )}

                      {totales.iva105 > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            IVA 10.5%
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            ${totales.iva105.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </Typography>
                        </Stack>
                      )}
                    </>
                  )}

                  <Divider />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                      TOTAL
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight={700}>
                      ${totales.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ReceiptIcon />}
                  onClick={handleVender}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  Procesar Venta
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <ModalCliente open={openCliente} onClose={() => setOpenCliente(false)} onSelect={handleClienteSelect} />

      <ModalMetodoPago open={openPago} onClose={() => setOpenPago(false)} total={totales.total} onConfirm={handlePagoConfirm} />

      <ModalAcciones
        open={openAcciones}
        onClose={() => {
          setOpenAcciones(false);
          setVentaGuardada(null);
        }}
        venta={ventaGuardada}
        onImprimir={handleImprimir}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
      />

      {ventaGuardada && (
        <ModalImprimir
          open={openImprimir}
          onClose={() => setOpenImprimir(false)}
          empresa={{
            razonSocial: "ARTDENT",
            condicionIva: "Responsable Inscripto",
            domicilio: "",
            cuit: "",
            iibb: "",
            inicioActividad: "",
          }}
          comprobante={{
            tipo: ventaGuardada.tipo_comprobante || "X",
            numero: ventaGuardada.receipt_number || ventaGuardada.number || `00001-${String(ventaGuardada.id || 1).padStart(8, "0")}`,
            fecha: new Date().toLocaleDateString("es-AR"),
            hora: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          }}
          cliente={{ nombre: ventaGuardada.cliente?.nombre || "Consumidor Final" }}
          items={ventaGuardada.items}
          totales={ventaGuardada.totales}
          pago={ventaGuardada.pago}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
