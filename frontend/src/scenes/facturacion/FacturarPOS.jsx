import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Paper, Card, CardHeader, CardActionArea, CardContent, Chip,
  Typography, TextField, InputAdornment, Button, IconButton, Tooltip,
  Divider, Stack, Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery, Grid
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// Servicios
import { Products, Users, Sales, Receipts, PaymentMethods, Warehouse } from "../../services";
import { getUserIdFromToken } from "../../auth/auth";

// Modales
import ModalWhatsApp from "../../components/modals/ModalWhatsApp";
import ModalEmail from "../../components/modals/ModalEmail";
import ModalImprimir from "../../components/modals/ModalImprimir";
import ModalMetodoPago from "../../components/modals/ModalMetodoPago";

// Altura del Topbar
const TOPBAR_HEIGHT = (theme) =>
  (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

// ====== Tarjeta de producto
const ProductTile = ({ prod, onAdd, count, isFav, onToggleFav }) => {
  const theme = useTheme();
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, position: "relative" }}>
      {!!count && (
        <Chip
          size="small"
          color="secondary"
          label={count}
          sx={{ position: "absolute", top: -10, right: -10, zIndex: 2 }}
        />
      )}
      <CardHeader
        sx={{ pb: 0.5 }}
        action={
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleFav(prod); }}>
            {isFav ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
        }
        title={
          <Chip
            size="small"
            label={prod?.stock != null ? `Inv ${prod.stock}` : "Inv"}
            sx={{ borderRadius: 1.5 }}
          />
        }
      />
      <CardActionArea onClick={() => onAdd(prod)}>
        <CardContent sx={{ pt: 1 }}>
          <Box
            sx={{
              width: "100%", height: 82, borderRadius: 2, mb: 1.2,
              bgcolor: theme.palette.background.default,
              border: `1px dashed ${theme.palette.divider}`,
              display: "grid", placeItems: "center", fontSize: 24, opacity: .7,
            }}
          >
            🏷️
          </Box>
          <Typography variant="subtitle2" noWrap title={prod.Nombre || prod.name}>
            {prod.Nombre || prod.name}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            ${(prod.PrecioPublico || prod.price || 0).toFixed(2)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const FacturarPOSCompact = () => {
  const theme = useTheme();
  const appbarH = TOPBAR_HEIGHT(theme);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  // === Detectar ancho del sidebar ===
  const [sidebarW, setSidebarW] = useState(0);
  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) { setSidebarW(0); return; }
    setSidebarW(sideBox.offsetWidth || 0);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarW(entry.target.offsetWidth || entry.contentRect?.width || 0);
      }
    });
    ro.observe(sideBox);
    const onResize = () => setSidebarW(sideBox.offsetWidth || 0);
    window.addEventListener("resize", onResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);

  // Catálogo
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState("");
  const [favIds, setFavIds] = useState([]);

  // Venta
  const [cliente, setCliente] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState("C");
  const [listaPrecio, setListaPrecio] = useState("General");
  const [items, setItems] = useState([]); // {id, name, price, qty, subtotal}

  // Usuario / Cajero
  const [cajero, setCajero] = useState("Usuario");
  useEffect(() => {
    (async () => {
      try {
        const id = getUserIdFromToken?.();
        if (id && Users?.getUser) {
          const u = await Users.getUser(id);
          const nombre = u?.Nombre || u?.name || u?.username || "Usuario";
          setCajero(nombre);
        } else {
          const local = JSON.parse(localStorage.getItem("user") || "{}");
          setCajero(local?.Nombre || local?.name || "Usuario");
        }
      } catch { /* noop */ }
    })();
  }, []);

  // Modales y pago
  const [openPago, setOpenPago] = useState(false);
  const [openAcciones, setOpenAcciones] = useState(false);
  const [openWA, setOpenWA] = useState(false);
  const [openEmail, setOpenEmail] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [ticketSize, setTicketSize] = useState(localStorage.getItem("ticketSize") || "80"); // "57" o "80"
  const [pago, setPago] = useState({ metodo: "-", nota: "", recibido: 0, cambio: 0 });

  // Instantánea de venta para enviar/imprimir luego de limpiar carrito
  const [venta, setVenta] = useState(null);

  // Configuración / datos auxiliares
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Cargar catálogo
  useEffect(() => {
    (async () => {
      try {
        const prods = await Products.listProducts?.();
        setCatalogo(prods || []);
      } catch { /* noop */ }
    })();
  }, []);

  // Cargar depósitos y métodos de pago (para persistir la venta)
  useEffect(() => {
    (async () => {
      try {
        const ws = await Warehouse.listWarehouses?.();
        const wArr = Array.isArray(ws) ? ws : (ws?.data && Array.isArray(ws.data) ? ws.data : []);
        setWarehouses(wArr);

        // Si no hay depósito seleccionado, intentamos setear el primero.
        if (!warehouseId && wArr.length) setWarehouseId(wArr[0].id);

        // Si la API devuelve vacío pero el sistema igual necesita un depósito para registrar stock,
        // dejamos un fallback común (id=1) para entornos de desarrollo.
        if ((!wArr || !wArr.length) && !warehouseId) {
          setWarehouses([{ id: 1, name: "Depósito", code: "DEFAULT" }]);
          setWarehouseId(1);
        }
      } catch {
        // Fallback si el endpoint /warehouses no está disponible
        if (!warehouseId) {
          setWarehouses([{ id: 1, name: "Depósito", code: "DEFAULT" }]);
          setWarehouseId(1);
        }
      }

      try {
        const pms = await PaymentMethods.list?.();
        setPaymentMethods(Array.isArray(pms) ? pms : []);
      } catch { /* noop */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrar = useMemo(() => {
    const q = (busca || "").toLowerCase();
    return (catalogo || []).filter((p) =>
      String(p.name || p.Nombre || "").toLowerCase().includes(q) ||
      String(p.code || p.CodigoBarra || "").toLowerCase().includes(q)
    );
  }, [catalogo, busca]);

  const addItem = useCallback((prod) => {
    const id = prod.idArticulo || prod.id;
    const name = prod.Nombre || prod.name;
    const price = Number(prod.PrecioPublico || prod.price || 0);
    const ivaPct = Number(prod.Iva ?? prod.iva ?? 0); // ej: 21
    const ivaRate = isFinite(ivaPct) ? Math.max(0, ivaPct) / 100 : 0;
    setItems((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f)
        return prev.map((x) =>
          x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x
        );
      return [...prev, { id, name, price, ivaRate, qty: 1, subtotal: price }];
    });
  }, []);
  const decItem = (id) =>
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, qty: Math.max(1, x.qty - 1), subtotal: Math.max(1, x.qty - 1) * x.price }
          : x
      )
    );
  const incItem = (id) =>
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x
      )
    );
  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clearAll = () => setItems([]);

  const toggleFav = (p) => {
    const id = p.idArticulo || p.id;
    setFavIds((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };
  const contador = useMemo(() => {
    const map = new Map();
    items.forEach((x) => map.set(x.id, x.qty));
    return map;
  }, [items]);

  // TOTALES (IVA discriminado por ítem; el total ya incluye IVA porque el precio de catálogo es PrecioPublico)
  const totales = useMemo(() => {
    let totalBruto = 0;
    let subtotalNeto = 0;
    const impuestosPorTasa = new Map(); // key: tasa (ej 0.21), value: impuesto

    for (const it of items) {
      const lineTotal = Number(it.subtotal || 0);
      const rate = Number(it.ivaRate || 0);
      totalBruto += lineTotal;

      if (rate > 0) {
        const lineNeto = lineTotal / (1 + rate);
        const lineImp = lineTotal - lineNeto;
        subtotalNeto += lineNeto;
        impuestosPorTasa.set(rate, (impuestosPorTasa.get(rate) || 0) + lineImp);
      } else {
        subtotalNeto += lineTotal;
      }
    }

    const impuestosTotal = totalBruto - subtotalNeto;
    const iva21 = impuestosPorTasa.get(0.21) || 0;
    const iva105 = impuestosPorTasa.get(0.105) || 0;

    return {
      total: totalBruto,
      subtotal: subtotalNeto,
      impuestosTotal,
      iva21,
      iva105,
      impuestosPorTasa,
    };
  }, [items]);

  const total = totales.total;
  const neto = totales.subtotal;
  const iva21 = totales.iva21;
  const iva105 = totales.iva105;

  // Persistir preferencia de tamaño de ticket
  useEffect(() => {
    localStorage.setItem("ticketSize", ticketSize);
  }, [ticketSize]);

  // Vender: abre método de pago
  const handleVender = () => {
    if (items.length === 0) return;
    setOpenPago(true);
  };

  const handlePagoConfirm = async (info) => {
    setPago(info);

    // Validaciones mínimas
    // Si no hay depósito seleccionado, intentamos elegir uno automáticamente.
    // (En algunos entornos el endpoint /warehouses puede no estar configurado.)
    let effectiveWarehouseId = warehouseId;
    if (!effectiveWarehouseId) {
      effectiveWarehouseId = warehouses?.[0]?.id || 1;
      setWarehouseId(effectiveWarehouseId);
    }
    if (!items.length) return;

    setOpenPago(false);
    setOpenAcciones(false);

    try {
      // 1) Crear venta (esto descuenta stock en el backend)
      const payloadSale = {
        warehouse_id: effectiveWarehouseId,
        customer_id: cliente?.id || null,
        invoice_type_id: null,
        items: items.map((i) => ({
          product_id: i.id,
          qty: Number(i.qty || 0),
          // En el backend se calculan/registran impuestos (IVA). Para evitar duplicar IVA,
          // guardamos precio neto (sin IVA) cuando el producto tenga tax_rate.
          unit_price: (() => {
            const gross = Number(i.price || 0);
            const rate = Number(i.tax_rate || 0);
            if (!rate) return gross;
            const net = gross / (1 + rate);
            return Math.round(net * 100) / 100;
          })(),
        })),
      };

      const sale = await Sales.createSale(payloadSale);

      // 2) Asociar comprobante de pago (Receipt)
      const code = info?.metodo_code || null;
      const pm = (paymentMethods || []).find((x) => x.code === code) || null;
      if (!pm?.id) {
        // Si no hay match por código, intentamos por nombre (fallback)
        const byName = (paymentMethods || []).find(
          (x) => String(x.name || "").toLowerCase() === String(info?.metodo || "").toLowerCase()
        );
        if (byName?.id) {
          await Receipts.createReceipt({
            sale_id: sale.id,
            payment_method_id: byName.id,
            amount: Number(sale.total ?? total ?? 0),
            notes: info?.nota || null,
          });
        }
      } else {
        await Receipts.createReceipt({
          sale_id: sale.id,
          payment_method_id: pm.id,
          amount: Number(sale.total ?? total ?? 0),
          notes: info?.nota || null,
        });
      }

      // 3) Snapshot para imprimir/enviar y limpiar carrito
      const snap = snapshotVenta();
      setVenta({ ...snap, sale_id: sale.id });
      clearAll();
      setPago({ metodo: "-", nota: "", recibido: 0, cambio: 0 });
      setOpenAcciones(true);
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Error guardando la venta.";
      alert(msg);
    }
  };

  // Instantánea + limpiar carrito antes de abrir cada modal de envío/impresión
  const snapshotVenta = () => ({
    cliente: cliente || { name: "Consumidor final" },
    items: items.map((i) => ({
      name: i.name, qty: i.qty, subtotal: i.subtotal, descripcion: i.name, total: i.subtotal,
    })),
    total,
    totales: { subtotal: neto, iva21, iva105, impuestos: totales.impuestosTotal },
    pago,
    cajero,
  });

  const prepararY = (openFn) => {
    const snap = snapshotVenta();
    setVenta(snap);
    setOpenAcciones(false);
    clearAll();             // 👉 nuevo carrito vacío
    setPago({ metodo: "-", nota: "", recibido: 0, cambio: 0 });
    openFn(true);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: mdDown ? 0 : sidebarW,
        right: 0,
        bottom: 0,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 420px", lg: "1fr 460px" },
        gap: 2,
        p: 2,
        overflow: "hidden",
        transition: "left .18s ease",
      }}
    >
      {/* IZQUIERDA - Catálogo */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, p: 1.5, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <Stack direction="row" spacing={1} mb={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar productos"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ ".MuiOutlinedInput-root": { height: 44, borderRadius: 2 } }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => (window.location.href = "/articulos")}
            sx={{ height: 44, borderRadius: 2, px: 2, whiteSpace: "nowrap" }}
          >
            Nuevo producto
          </Button>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
          <Grid container spacing={2}>
            {filtrar.map((p) => {
              const id = p.idArticulo || p.id;
              return (
                <Grid key={id} item xs={12} sm={6} md={4} lg={3}>
                  <ProductTile
                    prod={p}
                    onAdd={addItem}
                    count={contador.get(id) || 0}
                    isFav={favIds.includes(id)}
                    onToggleFav={toggleFav}
                  />
                </Grid>
              );
            })}
            {filtrar.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                  <Typography>No se encontraron productos.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* DERECHA - Carrito */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, p: 2, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1.25}>
          <Typography variant="h6">Punto de Venta</Typography>
          <Tooltip title="Numeración / listas">
            <IconButton size="small"><ReceiptLongIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>

        <Grid container spacing={1.25}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Lista de precio</InputLabel>
              <Select value={listaPrecio} label="Lista de precio" onChange={(e) => setListaPrecio(e.target.value)}>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Mayorista">Mayorista</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Comprobante</InputLabel>
              <Select value={tipoComprobante} label="Tipo de Comprobante" onChange={(e) => setTipoComprobante(e.target.value)}>
                <MenuItem value="X">Factura X</MenuItem>
                <MenuItem value="C">Factura Electrónica C</MenuItem>
                <MenuItem value="B">Factura Electrónica B</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Preferencia de tamaño */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Tamaño de ticket</InputLabel>
              <Select value={ticketSize} label="Tamaño de ticket" onChange={(e) => setTicketSize(e.target.value)}>
                <MenuItem value="80">80 mm</MenuItem>
                <MenuItem value="57">57 mm</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                label="Cliente"
                value={cliente?.name || cliente?.Nombre || "Consumidor final"}
                InputProps={{ readOnly: true }}
              />
              <Tooltip title="Buscar cliente">
                <IconButton color="primary"><PersonAddAltIcon /></IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {items.length === 0 ? (
            <Box py={6} textAlign="center" sx={{ opacity: 0.7 }}>
              <Typography variant="body2">
                Acá verás los productos que elijas para tu primera venta
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {items.map((it) => (
                <Paper key={it.id} variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap title={it.name}>{it.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${it.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton size="small" onClick={() => decItem(it.id)}><RemoveIcon fontSize="small" /></IconButton>
                      <Typography width={24} textAlign="center">{it.qty}</Typography>
                      <IconButton size="small" onClick={() => incItem(it.id)}><AddIcon fontSize="small" /></IconButton>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} width={82} textAlign="right">
                      ${it.subtotal.toFixed(2)}
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => removeItem(it.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        {/* FOOTER */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            pt: 1.5,
            mt: 2,
            background: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Total (incluye IVA) */}
          <Paper
            variant="outlined"
            sx={{ p: 1.25, borderRadius: 2, mb: 1.25, background: theme.palette.background.default }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={800} variant="h6">
                ${total.toFixed(2)}
              </Typography>
            </Stack>
          </Paper>

          {/* Transparencia Fiscal (IVA discriminado del total) */}
          {(totales.impuestosTotal > 0 || neto > 0) && (
            <Stack spacing={0.5} mb={1}>
              <Typography color="text.secondary" fontWeight={700}>
                Transparencia Fiscal
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>${neto.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Impuestos</Typography>
                <Typography>${totales.impuestosTotal.toFixed(2)}</Typography>
              </Stack>
              {iva21 > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">IVA 21%</Typography>
                  <Typography>${iva21.toFixed(2)}</Typography>
                </Stack>
              )}
              {iva105 > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">IVA 10.5%</Typography>
                  <Typography>${iva105.toFixed(2)}</Typography>
                </Stack>
              )}
            </Stack>
          )}

          {/* Info breve del pago si ya fue elegido */}
          {pago?.metodo && pago.metodo !== "-" && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Pago: {pago.metodo}{pago.nota ? ` · ${pago.nota}` : ""}{pago.cambio ? ` · Cambio $${pago.cambio.toFixed(2)}` : ""}
            </Typography>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              disabled={items.length === 0}
              onClick={handleVender}
            >
              Vender
            </Button>
            <Button variant="text" color="inherit" onClick={clearAll}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* 1) Modal método de pago */}
      <ModalMetodoPago
        open={openPago}
        onClose={() => setOpenPago(false)}
        total={total}
        onConfirm={handlePagoConfirm}
      />

      {/* 2) Diálogo de acciones posventa */}
      <Dialog open={openAcciones} onClose={() => setOpenAcciones(false)} fullWidth maxWidth="xs">
        <DialogTitle>¿Qué querés hacer con la venta?</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Button variant="outlined" onClick={() => prepararY(setOpenWA)}>
              Enviar por WhatsApp
            </Button>
            <Button variant="outlined" onClick={() => prepararY(setOpenEmail)}>
              Enviar por Email
            </Button>
            <Button variant="outlined" onClick={() => prepararY(setOpenPrint)}>
              Imprimir
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAcciones(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* 3) Modales específicos (usan la instantánea `venta`) */}
      <ModalWhatsApp
        open={openWA}
        onClose={() => setOpenWA(false)}
        cliente={venta?.cliente || cliente}
        items={venta?.items || items}
        total={venta?.total ?? total}
        pago={venta?.pago || pago}
        totales={venta?.totales || { iva21, iva105: 0, subtotal: neto }}
        cajero={venta?.cajero || cajero}
      />

      <ModalEmail
        open={openEmail}
        onClose={() => setOpenEmail(false)}
        cliente={venta?.cliente || cliente}
        items={venta?.items || items}
        total={venta?.total ?? total}
        pago={venta?.pago || pago}
        totales={venta?.totales || { iva21, iva105: 0, subtotal: neto }}
        cajero={venta?.cajero || cajero}
      />

      <ModalImprimir
        open={openPrint}
        onClose={() => setOpenPrint(false)}
        size={ticketSize}
        logoUrl="https://artdent.com.ar/logo-negro.png"
        company={{ nombre: "ARTDENT", condicion: "Responsable Monotributo" }}
        comprobante={{
          tipoLetra: tipoComprobante || "C",
          codigo: "",
          numero:
            venta?.receipt_number ||
            (venta?.receipt_id ? `R-${String(venta.receipt_id).padStart(8, "0")}` : null) ||
            (venta?.sale_id ? `V-${String(venta.sale_id).padStart(8, "0")}` : "0001-00000000"),
          fecha: venta?.created_at ? new Date(venta.created_at).toLocaleString() : new Date().toLocaleString(),
          cliente: (venta?.cliente || cliente)?.name || "Consumidor final",
        }}
        items={(venta?.items || items).map((i) => ({
          descripcion: i.name || i.descripcion,
          // Soportar distintos nombres según origen (carrito vs backend)
          precio: i.price ?? i.precio ?? i.unit_price ?? 0,
          cantidad: i.qty ?? i.cantidad ?? 0,
          total: i.subtotal ?? i.total ?? 0,
        }))}
        totales={venta?.totales || { subtotal: neto, iva21, iva105: 0, total }}
        pago={{
          medio: (venta?.pago?.metodo
            ? `${venta.pago.metodo}${venta.pago.nota ? ` (${venta.pago.nota})` : ""}`
            : "-"),
          cajero: venta?.cajero || cajero,
        }}
        cae={{ numero: "", vencimiento: "" }}
        qrImage={undefined}
        footer="Gracias por su compra."
      />
    </Box>
  );
};

export default FacturarPOSCompact;
