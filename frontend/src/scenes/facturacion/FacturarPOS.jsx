// src/scenes/facturacion/FacturarPOSCompact.jsx
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

// Ajustá a tus paths reales
import { Products } from "../../services";

// Modales post-venta
import ModalWhatsApp from "../../components/modals/ModalWhatsApp";
import ModalEmail from "../../components/modals/ModalEmail";
import ModalImprimir from "../../components/modals/ModalImprimir";

// Altura del Topbar (toma la de MUI si está seteada)
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

  // === Detectar dinámicamente el ancho del sidebar (expandido/colapsado) ===
  const [sidebarW, setSidebarW] = useState(0);
  useEffect(() => {
    // Busca el contenedor del ProSidebar en desktop
    const el = document.querySelector(".pro-sidebar"); // elemento interno
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement; // wrapper fijo
    if (!sideBox) {
      setSidebarW(0);
      return;
    }
    // Set inicial
    setSidebarW(sideBox.offsetWidth || 0);

    // Observa cambios de tamaño (colapsado/expansión, responsive)
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarW(entry.target.offsetWidth || entry.contentRect?.width || 0);
      }
    });
    ro.observe(sideBox);

    // También por seguridad al redimensionar ventana
    const onResize = () => setSidebarW(sideBox.offsetWidth || 0);
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Catálogo
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState("");
  const [favIds, setFavIds] = useState([]);

  // Venta compacta
  const [cliente, setCliente] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState("C");
  const [listaPrecio, setListaPrecio] = useState("General");
  const [items, setItems] = useState([]); // {id, name, price, qty, subtotal}

  // Acciones post-venta
  const [openAcciones, setOpenAcciones] = useState(false);
  const [openWA, setOpenWA] = useState(false);
  const [openEmail, setOpenEmail] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const prods = await Products.listProducts?.();
        setCatalogo(prods || []);
      } catch { /* noop */ }
    })();
  }, []);

  const filtrar = useMemo(() => {
    const q = (busca || "").toLowerCase();
    return (catalogo || []).filter(p =>
      String(p.name || p.Nombre || "").toLowerCase().includes(q) ||
      String(p.code || p.CodigoBarra || "").toLowerCase().includes(q)
    );
  }, [catalogo, busca]);

  const addItem = useCallback((prod) => {
    const id = prod.idArticulo || prod.id;
    const name = prod.Nombre || prod.name;
    const price = Number(prod.PrecioPublico || prod.price || 0);
    setItems(prev => {
      const f = prev.find(x => x.id === id);
      if (f) return prev.map(x => x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x);
      return [...prev, { id, name, price, qty: 1, subtotal: price }];
    });
  }, []);
  const decItem = (id) => setItems(prev =>
    prev.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty - 1), subtotal: Math.max(1, x.qty - 1) * x.price } : x)
  );
  const incItem = (id) => setItems(prev =>
    prev.map(x => x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x)
  );
  const removeItem = (id) => setItems(prev => prev.filter(x => x.id !== id));
  const clearAll = () => setItems([]);

  const toggleFav = (p) => {
    const id = p.idArticulo || p.id;
    setFavIds(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };
  const contador = useMemo(() => {
    const map = new Map();
    items.forEach(x => map.set(x.id, x.qty));
    return map;
  }, [items]);

  const subtotal = useMemo(() => items.reduce((a, x) => a + x.subtotal, 0), [items]);
  const iva = useMemo(() => subtotal * 0.21, [subtotal]); // placeholder 21%
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: mdDown ? 0 : sidebarW, // 👉 se adapta al ancho del sidebar en desktop
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
      {/* IZQUIERDA - Catálogo (alto completo + scroll interno) */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Stack direction="row" spacing={1} mb={1.5}>
          <TextField
            fullWidth size="small"
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

      {/* DERECHA - Carrito (alto completo + scroll + footer sticky) */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1.25}>
          <Typography variant="h6">Factura electrónica</Typography>
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
              <InputLabel>Numeración</InputLabel>
              <Select value={tipoComprobante} label="Numeración" onChange={(e) => setTipoComprobante(e.target.value)}>
                <MenuItem value="C">Factura Electrónica C</MenuItem>
                <MenuItem value="B">Factura Electrónica B</MenuItem>
                <MenuItem value="A">Factura Electrónica A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small" fullWidth
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
            <Box py={6} textAlign="center" sx={{ opacity: .7 }}>
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
                      <IconButton size="small" onClick={() => decItem(it.id)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography width={24} textAlign="center">{it.qty}</Typography>
                      <IconButton size="small" onClick={() => incItem(it.id)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
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

        {/* FOOTER STICKY */}
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
          <Stack spacing={0.5} mb={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">IVA (21.00%)</Typography>
              <Typography>${iva.toFixed(2)}</Typography>
            </Stack>
          </Stack>

          <Paper
            variant="outlined"
            sx={{ p: 1.25, borderRadius: 2, mb: 1.25, background: theme.palette.background.default }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={800} variant="h6">${total.toFixed(2)}</Typography>
            </Stack>
          </Paper>

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth variant="contained" color="secondary"
              disabled={items.length === 0}
              onClick={() => setOpenAcciones(true)}
            >
              Vender
            </Button>
            <Button variant="text" color="inherit" onClick={clearAll}>Cancelar</Button>
          </Stack>
        </Box>
      </Paper>

      {/* Diálogo de acciones posventa */}
      <Dialog open={openAcciones} onClose={() => setOpenAcciones(false)} fullWidth maxWidth="xs">
        <DialogTitle>¿Qué querés hacer con la venta?</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Button variant="outlined" onClick={() => { setOpenAcciones(false); setOpenWA(true); }}>
              Enviar por WhatsApp
            </Button>
            <Button variant="outlined" onClick={() => { setOpenAcciones(false); setOpenEmail(true); }}>
              Enviar por Email
            </Button>
            <Button variant="outlined" onClick={() => { setOpenAcciones(false); setOpenPrint(true); }}>
              Imprimir
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAcciones(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modales específicos */}
      <ModalWhatsApp open={openWA} onClose={() => setOpenWA(false)} cliente={cliente} total={total} items={items} />
      <ModalEmail   open={openEmail} onClose={() => setOpenEmail(false)} cliente={cliente} total={total} items={items} />
      <ModalImprimir open={openPrint} onClose={() => setOpenPrint(false)} cliente={cliente} total={total} items={items} />
    </Box>
  );
};

export default FacturarPOSCompact;
