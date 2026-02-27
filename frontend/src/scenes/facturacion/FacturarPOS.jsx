// src/scenes/ventas/FacturarPOS.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Box, Stack, Button, IconButton, TextField, InputAdornment,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, useTheme, Grid, Divider, Alert, Snackbar,
  Skeleton, CircularProgress, MenuItem, Chip, Tooltip,
  Drawer, Fab, Badge,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon          from "@mui/icons-material/Search";
import AddIcon             from "@mui/icons-material/Add";
import RemoveIcon          from "@mui/icons-material/Remove";
import DeleteOutlineIcon   from "@mui/icons-material/DeleteOutline";
import PersonAddIcon       from "@mui/icons-material/PersonAdd";
import PersonIcon          from "@mui/icons-material/Person";
import CloseIcon           from "@mui/icons-material/Close";
import ImageIcon           from "@mui/icons-material/Image";
import ReceiptLongIcon     from "@mui/icons-material/ReceiptLong";
import PaymentIcon         from "@mui/icons-material/Payment";
import PrintIcon           from "@mui/icons-material/Print";
import WhatsAppIcon        from "@mui/icons-material/WhatsApp";
import EmailIcon           from "@mui/icons-material/Email";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import InventoryIcon       from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartIcon    from "@mui/icons-material/ShoppingCart";
import StoreIcon           from "@mui/icons-material/Store";
import ReceiptIcon         from "@mui/icons-material/Receipt";

import { useSidebarContext } from "../../contexts/SidebarContext";
import ModalImprimir        from "../../components/modals/ModalImprimir";

import * as Products    from "../../services/productService";
import * as Sales       from "../../services/salesService";
import * as Warehouse   from "../../services/warehouseService";
import * as CustomerSvc from "../../services/customerService";

// ─── Brand ──────────────────────────────────────────────────────────────────
const B = {
  blue:    "#397B9C",
  green:   "#5AAD9C",
  teal:    "#49949C",
  mint:    "#ACD6CE",
  soft:    "#7CA5C3",
};

const PAGE_SIZE = 24;

const fmt = (n = 0) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const TIPOS = [
  { id: "X", label: "Ticket X",  desc: "Sin factura",     accentColor: "#64748b" },
  { id: "A", label: "Factura A", desc: "Resp. Inscripto",  accentColor: B.blue   },
  { id: "B", label: "Factura B", desc: "Cons. Final",      accentColor: B.green  },
  { id: "C", label: "Factura C", desc: "Monotributista",   accentColor: B.teal   },
];

const IVA_OPTS = [
  { value: 0,    label: "0% — Exento"  },
  { value: 10.5, label: "10.5%"        },
  { value: 21,   label: "21%"          },
  { value: 27,   label: "27%"          },
];

const TAX_CONDITIONS = [
  { value: "consumidor_final",      label: "Consumidor Final"   },
  { value: "responsable_inscripto", label: "Resp. Inscripto"    },
  { value: "monotributista",        label: "Monotributista"     },
  { value: "exento",                label: "Exento"             },
];

// ─── Infinite scroll hook ────────────────────────────────────────────────────
function useInfiniteProducts({ q, refreshKey }) {
  const [items, setItems]             = useState([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setItems([]); setPage(1); setHasMore(true);
  }, [q, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (page === 1) setLoading(true);
      else            setLoadingMore(true);
      try {
        const { items: batch, lastPage } = await Products.listProductsPaginated({
          q, page, per_page: PAGE_SIZE, is_active: true,
        });
        if (cancelled) return;
        setItems((prev) => page === 1 ? batch : [...prev, ...batch]);
        if (lastPage !== null) setHasMore(page < lastPage);
        else setHasMore(batch.length >= PAGE_SIZE);
      } catch (e) {
        console.error("[POS products]", e);
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) { setLoading(false); setLoadingMore(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [q, refreshKey, page]);

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore) setPage((p) => p + 1);
  }, [loadingMore, loading, hasMore]);

  return { items, loading, loadingMore, hasMore, loadMore };
}

// ─── Product Card ────────────────────────────────────────────────────────────
function ProdCard({ product, cartQty, onAdd, isDark }) {
  const imageUrl = product.ImagenUrl || product.image_url || null;
  const price    = Number(product.PrecioPublico || product.price || 0);
  const stock    = Number(product.Stock || product.stock || 0);
  const name     = product.Nombre || product.name || "";
  const sku      = product.Codigo || product.sku || "";

  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.4)" : "rgba(26,32,44,0.4)";
  const inCart    = cartQty > 0;

  return (
    <Box
      onClick={() => onAdd(product)}
      sx={{
        position: "relative", borderRadius: "11px", overflow: "hidden",
        border: `1.5px solid ${inCart ? B.green : borderCol}`,
        bgcolor: isDark ? "#172A36" : "#fff",
        cursor: "pointer", userSelect: "none",
        transition: "all .14s",
        "&:hover": {
          border: `1.5px solid ${B.blue}`,
          transform: "translateY(-2px)",
          boxShadow: isDark ? "0 6px 18px rgba(0,0,0,.32)" : "0 5px 14px rgba(0,0,0,.1)",
        },
        "&:active": { transform: "translateY(0)", opacity: 0.9 },
      }}
    >
      {/* Cart badge */}
      {inCart && (
        <Box sx={{
          position: "absolute", top: 7, right: 7, zIndex: 3,
          width: 19, height: 19, borderRadius: "50%",
          bgcolor: B.green, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 2px 6px ${alpha(B.green, 0.5)}`,
        }}>
          <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
            {cartQty}
          </Typography>
        </Box>
      )}

      {/* Image */}
      <Box sx={{
        height: 88, overflow: "hidden",
        bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {imageUrl
          ? <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <ImageIcon sx={{ fontSize: 26, color: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)" }} />
        }
      </Box>

      {/* Info */}
      <Box sx={{ p: "8px 9px 9px" }}>
        {sku && (
          <Typography sx={{ fontSize: 9, color: mutedCol, fontWeight: 600, letterSpacing: "0.04em", mb: 0.25 }}>
            {sku}
          </Typography>
        )}
        <Typography sx={{
          fontSize: 11.5, fontWeight: 700, color: textCol, lineHeight: 1.25, mb: 0.5,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          minHeight: "2.4em",
        }}>
          {name}
        </Typography>
        <Typography sx={{
          fontSize: 13, fontWeight: 800, color: B.blue,
          fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.01em",
        }}>
          ${fmt(price)}
        </Typography>
        <Box sx={{
          mt: 0.5, display: "inline-flex", alignItems: "center",
          px: 0.6, py: 0.1, borderRadius: "4px",
          bgcolor: stock > 0 ? alpha(B.green, isDark ? 0.18 : 0.09) : alpha("#E63946", 0.1),
          border: `1px solid ${stock > 0 ? alpha(B.green, 0.28) : alpha("#E63946", 0.28)}`,
        }}>
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: stock > 0 ? B.green : "#E63946" }}>
            {stock > 0 ? `Stock: ${stock}` : "Sin stock"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Product Skeleton ────────────────────────────────────────────────────────
function ProdSkeleton({ isDark }) {
  const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  return (
    <Box sx={{
      borderRadius: "11px", overflow: "hidden",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
      bgcolor: isDark ? "#172A36" : "#fff",
    }}>
      <Skeleton variant="rectangular" height={88} sx={{ bgcolor: bg }} />
      <Box sx={{ p: "8px 9px 9px" }}>
        <Skeleton variant="text" width="35%" height={11} sx={{ bgcolor: bg, mb: 0.5 }} />
        <Skeleton variant="text" width="90%" height={13} sx={{ bgcolor: bg }} />
        <Skeleton variant="text" width="65%" height={13} sx={{ bgcolor: bg, mb: 0.5 }} />
        <Skeleton variant="text" width="50%" height={16} sx={{ bgcolor: bg }} />
      </Box>
    </Box>
  );
}

// ─── Cart Row ────────────────────────────────────────────────────────────────
function CartRow({ item, onInc, onDec, onRemove, isDark }) {
  const textCol  = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol = isDark ? "rgba(230,238,245,0.4)" : "rgba(26,32,44,0.4)";
  const rowBg    = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const rowBdr   = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.25,
      p: "8px 10px", borderRadius: "10px",
      bgcolor: rowBg, border: `1px solid ${rowBdr}`,
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 12.5, fontWeight: 700, color: textCol, lineHeight: 1.2, mb: 0.15,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: mutedCol }}>
          ${fmt(item.price)} × {item.qty}{" "}
          <span style={{ color: B.blue, fontWeight: 700 }}>= ${fmt(item.subtotal)}</span>
        </Typography>
      </Box>
      <Stack direction="row" alignItems="center" spacing={0.4} flexShrink={0}>
        <IconButton size="small" onClick={() => onDec(item.id)}
          sx={{
            width: 23, height: 23,
            bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
            "&:hover": { bgcolor: alpha("#E63946", 0.15) },
          }}>
          <RemoveIcon sx={{ fontSize: 12, color: textCol }} />
        </IconButton>
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: textCol, minWidth: 20, textAlign: "center" }}>
          {item.qty}
        </Typography>
        <IconButton size="small" onClick={() => onInc(item.id)}
          sx={{
            width: 23, height: 23,
            bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
            "&:hover": { bgcolor: alpha(B.green, 0.2) },
          }}>
          <AddIcon sx={{ fontSize: 12, color: textCol }} />
        </IconButton>
        <IconButton size="small" onClick={() => onRemove(item.id)}
          sx={{ width: 23, height: 23, ml: 0.25, "&:hover": { bgcolor: alpha("#E63946", 0.12) } }}>
          <DeleteOutlineIcon sx={{ fontSize: 12, color: "#E63946" }} />
        </IconButton>
      </Stack>
    </Box>
  );
}

// ─── Modal: Alta rápida de artículo ─────────────────────────────────────────
function ModalAltaProducto({ open, onClose, onCreated, isDark }) {
  const [form, setForm]     = useState({ name: "", sku: "", price: "", tax_rate: 21, initial_stock: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name.trim() || !form.price) { setErr("Nombre y precio son obligatorios."); return; }
    setSaving(true); setErr("");
    try {
      const created = await Products.createProduct({
        name:          form.name.trim(),
        sku:           form.sku.trim() || undefined,
        price:         Number(form.price),
        tax_rate:      Number(form.tax_rate),
        initial_stock: form.initial_stock ? Number(form.initial_stock) : 0,
        is_active:     true,
        track_stock:   true,
      });
      setForm({ name: "", sku: "", price: "", tax_rate: 21, initial_stock: "" });
      onCreated(created);
    } catch (e) {
      setErr(e?.response?.data?.message || "Error al crear el artículo.");
    } finally { setSaving(false); }
  };

  const borderCol = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const inputSx   = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontSize: 13.5,
      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    },
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
      PaperProps={{ elevation: 0, sx: {
        borderRadius: "16px", bgcolor: isDark ? "#0F1F2A" : "#F7FAFC",
        border: `1px solid ${borderCol}`,
      }}}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <InventoryIcon sx={{ color: B.blue, fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 15, fontFamily: "Montserrat, sans-serif", color: textCol }}>
              Alta rápida de artículo
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 17 }} /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} pt={1}>
          {err && <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 12.5, py: 0.5 }}>{err}</Alert>}
          <TextField label="Nombre *" value={form.name} onChange={set("name")} fullWidth size="small" sx={inputSx} autoFocus />
          <TextField label="SKU / Código (opcional)" value={form.sku} onChange={set("sku")} fullWidth size="small" sx={inputSx} />
          <Stack direction="row" spacing={1.5}>
            <TextField label="Precio de venta *" value={form.price} onChange={set("price")}
              fullWidth size="small" type="number" inputProps={{ min: 0 }}
              InputProps={{ startAdornment: <InputAdornment position="start" sx={{ fontSize: 13 }}>$</InputAdornment> }}
              sx={inputSx}
            />
            <TextField select label="IVA" value={form.tax_rate} onChange={set("tax_rate")}
              size="small" sx={{ ...inputSx, minWidth: 115 }}>
              {IVA_OPTS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField label="Stock inicial" value={form.initial_stock} onChange={set("initial_stock")}
            fullWidth size="small" type="number" inputProps={{ min: 0 }} sx={inputSx} />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: "10px 20px 16px" }}>
        <Button onClick={onClose} sx={{ fontSize: 13, textTransform: "none", color: isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)" }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={saving}
          sx={{
            background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
            color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "none",
            borderRadius: "10px", px: 2.5, boxShadow: `0 4px 12px ${alpha(B.blue, 0.35)}`,
          }}
        >
          {saving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "Crear y agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Modal: Buscar / Alta rápida de cliente ──────────────────────────────────
function ModalCliente({ open, onClose, onSelect, isDark }) {
  const [tab, setTab]         = useState("buscar");
  const [q, setQ]             = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [form, setForm]       = useState({ name: "", tax_id: "", tax_condition: "consumidor_final", phone: "", email: "" });
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");

  // Reset on open
  useEffect(() => {
    if (open) { setTab("buscar"); setQ(""); setResults([]); setErr(""); }
  }, [open]);

  // Debounced customer search
  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await CustomerSvc.listCustomers({ q: q.trim(), per_page: 10 });
        const arr = Array.isArray(res) ? res : (res?.data || []);
        setResults(arr);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const pickCustomer = (c) => {
    onSelect({ id: c.id, nombre: c.name, cuit: c.tax_id || "", email: c.email || "", phone: c.phone || "", tax_condition: c.tax_condition || "" });
    onClose();
  };

  const handleConsumidorFinal = () => {
    onSelect({ id: null, nombre: "Consumidor Final", cuit: "", email: "", phone: "", tax_condition: "consumidor_final" });
    onClose();
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name.trim()) { setErr("El nombre es obligatorio."); return; }
    setSaving(true); setErr("");
    try {
      const raw = await CustomerSvc.createCustomer({
        name:          form.name.trim(),
        tax_id:        form.tax_id.trim() || undefined,
        tax_condition: form.tax_condition,
        phone:         form.phone.trim() || undefined,
        email:         form.email.trim() || undefined,
        is_active:     1,
      });
      const c = raw?.data || raw;
      pickCustomer(c);
    } catch (e) {
      setErr(e?.response?.data?.message || "Error al crear el cliente.");
    } finally { setSaving(false); }
  };

  const borderCol = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const inputSx   = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontSize: 13.5,
      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    },
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ elevation: 0, sx: {
        borderRadius: "16px", bgcolor: isDark ? "#0F1F2A" : "#F7FAFC",
        border: `1px solid ${borderCol}`,
      }}}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon sx={{ color: B.blue, fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 15, fontFamily: "Montserrat, sans-serif", color: textCol }}>
              Cliente
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 17 }} /></IconButton>
        </Stack>
        {/* Tabs */}
        <Stack direction="row" sx={{
          borderRadius: "10px", border: `1px solid ${borderCol}`,
          bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          p: 0.4, gap: 0.25,
        }}>
          {[{ v: "buscar", label: "Buscar cliente" }, { v: "nuevo", label: "Nuevo cliente" }].map(({ v, label }) => (
            <Box key={v} onClick={() => setTab(v)} sx={{
              flex: 1, textAlign: "center", py: 0.65, borderRadius: "7px", cursor: "pointer",
              background: tab === v ? `linear-gradient(90deg, ${B.blue}, ${B.teal})` : "transparent",
              color: tab === v ? "#fff" : mutedCol,
              fontSize: 12.5, fontWeight: tab === v ? 700 : 500,
              fontFamily: "Montserrat, sans-serif", transition: "all .14s",
            }}>{label}</Box>
          ))}
        </Stack>
      </DialogTitle>

      <DialogContent>
        {tab === "buscar" ? (
          <Stack spacing={1.5}>
            <Button variant="outlined" onClick={handleConsumidorFinal}
              startIcon={<PersonIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: 12.5,
                py: 1.1, borderColor: borderCol, color: textCol, justifyContent: "flex-start",
                "&:hover": { borderColor: B.blue, bgcolor: alpha(B.blue, 0.06) },
              }}>
              Consumidor Final (sin datos fiscales)
            </Button>
            <TextField
              placeholder="Buscar por nombre, CUIT o email..."
              value={q} onChange={(e) => setQ(e.target.value)}
              fullWidth size="small" autoFocus
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: mutedCol }} /></InputAdornment> }}
              sx={inputSx}
            />
            {searching && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <CircularProgress size={18} sx={{ color: B.blue }} />
              </Box>
            )}
            {results.length > 0 && (
              <Box sx={{ borderRadius: "10px", border: `1px solid ${borderCol}`, overflow: "hidden", maxHeight: 220, overflowY: "auto" }}>
                {results.map((c, i) => (
                  <Box key={c.id} onClick={() => pickCustomer(c)} sx={{
                    px: 2, py: 1.25, cursor: "pointer",
                    borderBottom: i < results.length - 1 ? `1px solid ${borderCol}` : "none",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                  }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: textCol }}>{c.name}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: mutedCol }}>
                      {[c.tax_id && `CUIT: ${c.tax_id}`, c.email].filter(Boolean).join(" · ")}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {q && !searching && results.length === 0 && (
              <Typography sx={{ fontSize: 12.5, color: mutedCol, textAlign: "center", py: 0.5 }}>
                Sin resultados — podés crear un cliente nuevo en la otra pestaña.
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {err && <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 12.5, py: 0.5 }}>{err}</Alert>}
            <TextField label="Nombre / Razón Social *" value={form.name} onChange={set("name")} fullWidth size="small" sx={inputSx} autoFocus />
            <Stack direction="row" spacing={1.5}>
              <TextField label="CUIT / Tax ID" value={form.tax_id} onChange={set("tax_id")} fullWidth size="small" sx={inputSx} />
              <TextField select label="Condición IVA" value={form.tax_condition} onChange={set("tax_condition")} size="small" sx={{ ...inputSx, minWidth: 165 }}>
                {TAX_CONDITIONS.map((tc) => (
                  <MenuItem key={tc.value} value={tc.value} sx={{ fontSize: 13 }}>{tc.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <TextField label="Teléfono" value={form.phone} onChange={set("phone")} fullWidth size="small" sx={inputSx} />
              <TextField label="Email" value={form.email} onChange={set("email")} fullWidth size="small" sx={inputSx} type="email" />
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: "10px 20px 16px" }}>
        <Button onClick={onClose} sx={{ fontSize: 13, textTransform: "none", color: mutedCol }}>Cancelar</Button>
        {tab === "nuevo" && (
          <Button variant="contained" onClick={handleCreate} disabled={saving}
            sx={{
              background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
              color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "none",
              borderRadius: "10px", px: 2.5, boxShadow: `0 4px 12px ${alpha(B.blue, 0.35)}`,
            }}
          >
            {saving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : "Crear y seleccionar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Modal: Método de pago ───────────────────────────────────────────────────
function ModalPago({ open, onClose, total, paymentMethods, onConfirm, isDark }) {
  const [method, setMethod]       = useState(null);
  const [received, setReceived]   = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open && paymentMethods.length > 0) {
      setMethod(paymentMethods[0]);
      setReceived(""); setReference("");
    }
  }, [open, paymentMethods]);

  const isCash      = method?.code === "cash" || (method?.name || "").toLowerCase().includes("efectivo");
  const receivedNum = Number(received || 0);
  const change      = isCash && receivedNum > total ? receivedNum - total : 0;
  const canConfirm  = !!method && (!isCash || receivedNum >= total);

  const borderCol = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const inputSx   = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontSize: 13.5,
      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    },
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
      PaperProps={{ elevation: 0, sx: {
        borderRadius: "16px", bgcolor: isDark ? "#0F1F2A" : "#F7FAFC",
        border: `1px solid ${borderCol}`,
      }}}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <PaymentIcon sx={{ color: B.blue, fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 15, fontFamily: "Montserrat, sans-serif", color: textCol }}>
              Cobrar
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 17 }} /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5}>
          {/* Total */}
          <Box sx={{
            p: "14px 16px", borderRadius: "12px",
            background: `linear-gradient(135deg, ${alpha(B.blue, isDark ? 0.22 : 0.09)}, ${alpha(B.teal, isDark ? 0.15 : 0.06)})`,
            border: `1px solid ${alpha(B.blue, 0.22)}`,
          }}>
            <Typography sx={{ fontSize: 11.5, color: mutedCol, fontWeight: 600, mb: 0.4, letterSpacing: "0.04em" }}>
              TOTAL A COBRAR
            </Typography>
            <Typography sx={{ fontSize: 30, fontWeight: 800, color: B.blue, fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.02em" }}>
              ${fmt(total)}
            </Typography>
          </Box>

          {/* Payment method grid */}
          <Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: mutedCol, letterSpacing: "0.06em", mb: 1 }}>
              MÉTODO DE PAGO
            </Typography>
            <Grid container spacing={0.75}>
              {paymentMethods.map((pm) => {
                const sel = method?.id === pm.id || method?.name === pm.name;
                return (
                  <Grid item xs={6} key={pm.id ?? pm.name}>
                    <Box onClick={() => setMethod(pm)} sx={{
                      p: "10px 12px", borderRadius: "10px", cursor: "pointer", textAlign: "center",
                      border: `1.5px solid ${sel ? B.blue : borderCol}`,
                      background: sel ? `linear-gradient(135deg, ${alpha(B.blue, isDark ? 0.22 : 0.1)}, ${alpha(B.teal, isDark ? 0.15 : 0.07)})` : "transparent",
                      transition: "all .13s",
                      "&:hover": { border: `1.5px solid ${B.blue}` },
                    }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: sel ? 700 : 500, color: sel ? B.blue : textCol }}>
                        {pm.name}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Cash: received + change */}
          {isCash && (
            <Stack spacing={1.25}>
              <TextField
                label="Monto recibido" value={received}
                onChange={(e) => setReceived(e.target.value)}
                type="number" fullWidth size="small" autoFocus
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ fontSize: 14 }}>$</InputAdornment> }}
                error={Boolean(received && receivedNum < total)}
                helperText={received && receivedNum < total ? "Debe ser mayor o igual al total" : ""}
                sx={inputSx}
              />
              {change > 0 && (
                <Box sx={{
                  p: "10px 14px", borderRadius: "10px",
                  bgcolor: alpha(B.green, isDark ? 0.18 : 0.08),
                  border: `1px solid ${alpha(B.green, 0.3)}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: B.green }}>Vuelto</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: B.green, fontFamily: "Montserrat, sans-serif" }}>
                    ${fmt(change)}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}

          {/* Other: reference */}
          {!isCash && (
            <TextField
              label="Referencia / Nro. operación (opcional)"
              value={reference} onChange={(e) => setReference(e.target.value)}
              fullWidth size="small" sx={inputSx}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: "10px 20px 16px" }}>
        <Button onClick={onClose} sx={{ fontSize: 13, textTransform: "none", color: mutedCol }}>Cancelar</Button>
        <Button variant="contained" onClick={() => onConfirm({ method, received: receivedNum, change, reference })}
          disabled={!canConfirm}
          sx={{
            background: `linear-gradient(90deg, ${B.green}, ${B.teal})`,
            color: "#fff", fontWeight: 700, fontSize: 13.5, textTransform: "none",
            borderRadius: "10px", px: 3, py: 1,
            boxShadow: `0 4px 14px ${alpha(B.green, 0.4)}`,
            "&:disabled": { background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", color: mutedCol, boxShadow: "none" },
          }}
        >
          Confirmar cobro
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Modal: Venta exitosa ────────────────────────────────────────────────────
function ModalExito({ open, onClose, venta, onImprimir, onWhatsApp, onEmail, isDark }) {
  const borderCol = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const isFiscal  = ["A","B","C"].includes(venta?.tipo_comprobante);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
      PaperProps={{ elevation: 0, sx: {
        borderRadius: "16px", bgcolor: isDark ? "#0F1F2A" : "#F7FAFC",
        border: `1px solid ${borderCol}`,
      }}}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Stack alignItems="center" spacing={1.25} pt={1.5}>
          <Box sx={{
            width: 54, height: 54, borderRadius: "50%",
            background: `linear-gradient(135deg, ${B.green}, ${B.teal})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 20px ${alpha(B.green, 0.42)}`,
          }}>
            <CheckCircleIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 17, fontFamily: "Montserrat, sans-serif", color: textCol }}>
            Venta registrada
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: mutedCol }}>
            Comprobante {venta?.tipo_comprobante || "X"} · {venta?.number || `#${venta?.id}`}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.5} pt={1.5}>
          {/* Summary */}
          <Box sx={{ p: "12px 14px", borderRadius: "12px", border: `1px solid ${borderCol}`, bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography sx={{ fontSize: 12, color: mutedCol }}>Cliente</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: textCol }}>{venta?.cliente?.nombre || "Consumidor Final"}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography sx={{ fontSize: 12, color: mutedCol }}>Pago</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: textCol }}>{venta?.pago?.method?.name || "—"}</Typography>
            </Stack>
            {venta?.pago?.change > 0 && (
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ fontSize: 12, color: B.green }}>Vuelto</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: B.green }}>${fmt(venta.pago.change)}</Typography>
              </Stack>
            )}
            <Divider sx={{ my: 0.75, borderColor: borderCol }} />
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: textCol }}>Total</Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: B.blue, fontFamily: "Montserrat, sans-serif" }}>
                ${fmt(venta?.totales?.total)}
              </Typography>
            </Stack>
          </Box>

          {/* ARCA notice */}
          {isFiscal && (
            <Alert severity="info" icon={<ReceiptIcon sx={{ fontSize: 18 }} />}
              sx={{ borderRadius: "10px", fontSize: 12, py: 0.5 }}>
              Factura electrónica pendiente de autorización ARCA/AFIP. El CAE se asignará en el próximo ciclo de facturación.
            </Alert>
          )}

          {/* Actions */}
          <Button variant="contained" fullWidth startIcon={<PrintIcon sx={{ fontSize: 17 }} />} onClick={onImprimir}
            sx={{
              background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
              color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "none",
              borderRadius: "10px", py: 1.1, boxShadow: `0 4px 14px ${alpha(B.blue, 0.35)}`,
            }}>
            Imprimir ticket
          </Button>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" fullWidth startIcon={<WhatsAppIcon sx={{ fontSize: 15 }} />} onClick={onWhatsApp}
              sx={{
                borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: 12,
                borderColor: borderCol, color: B.green,
                "&:hover": { borderColor: B.green, bgcolor: alpha(B.green, 0.07) },
              }}>
              WhatsApp
            </Button>
            <Button variant="outlined" fullWidth startIcon={<EmailIcon sx={{ fontSize: 15 }} />} onClick={onEmail}
              sx={{
                borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: 12,
                borderColor: borderCol, color: textCol,
                "&:hover": { borderColor: B.blue, bgcolor: alpha(B.blue, 0.07) },
              }}>
              Email
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: "10px 20px 16px" }}>
        <Button fullWidth variant="outlined" onClick={onClose}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: 13.5, borderColor: borderCol, color: textCol, py: 1 }}>
          Nueva venta
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
// ─── CartPanel ─ compartido entre sidebar desktop y mobile Drawer ────────────
function CartPanel({
  items, itemCount, cliente, tipoComp, setTipoComp, tipoSelected,
  totales, procesando, incItem, decItem, removeItem, clearCart,
  setOpenCliente, handleCobrar,
  isDark, borderCol, textCol, mutedCol, sidebarBg, hideHeader = false,
}) {
  return (
    <>
{!hideHeader && (
<Box sx={{ px: 2, pt: 2, pb: 1.5, borderBottom: `1px solid ${borderCol}` }}>
  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
    <Stack direction="row" spacing={1} alignItems="center">
      <ShoppingCartIcon sx={{ color: B.blue, fontSize: 18 }} />
      <Typography sx={{ fontWeight: 800, fontSize: 14.5, fontFamily: "Montserrat, sans-serif", color: textCol }}>
        Orden
      </Typography>
      {itemCount > 0 && (
        <Box sx={{
          px: 0.75, py: 0.1, borderRadius: "5px",
          bgcolor: alpha(B.blue, isDark ? 0.2 : 0.1),
          border: `1px solid ${alpha(B.blue, 0.25)}`,
        }}>
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: B.blue }}>
            {itemCount}
          </Typography>
        </Box>
      )}
    </Stack>
    {items.length > 0 && (
      <Button size="small" onClick={clearCart} sx={{
        color: "#E63946", fontSize: 11.5, fontWeight: 600, textTransform: "none",
        py: 0.25, px: 1, borderRadius: "7px",
        "&:hover": { bgcolor: alpha("#E63946", 0.08) },
      }}>
        Limpiar
      </Button>
    )}
  </Stack>

  {/* Cliente */}
  <Button
    onClick={() => setOpenCliente(true)}
    startIcon={<PersonIcon sx={{ fontSize: 15 }} />}
    endIcon={!cliente ? <PersonAddIcon sx={{ fontSize: 14, opacity: 0.5 }} /> : undefined}
    variant="outlined"
    fullWidth size="small"
    sx={{
      mb: 1, borderRadius: "10px", textTransform: "none",
      fontWeight: 600, fontSize: 12.5, py: 0.85,
      justifyContent: "flex-start",
      borderColor: cliente ? alpha(B.blue, 0.45) : borderCol,
      color: cliente ? B.blue : mutedCol,
      bgcolor: cliente ? alpha(B.blue, isDark ? 0.12 : 0.05) : "transparent",
      "&:hover": { borderColor: B.blue, bgcolor: alpha(B.blue, isDark ? 0.15 : 0.06) },
    }}
  >
    {cliente ? cliente.nombre : "Seleccionar cliente"}
  </Button>

  {/* Tipo comprobante */}
  <Stack direction="row" spacing={0.5} mb={0.75}>
    {TIPOS.map((t) => {
      const sel = tipoComp === t.id;
      return (
        <Box key={t.id} onClick={() => setTipoComp(t.id)} sx={{
          flex: 1, textAlign: "center", py: 0.6, borderRadius: "8px", cursor: "pointer",
          border: `1.5px solid ${sel ? t.accentColor : borderCol}`,
          background: sel ? alpha(t.accentColor, isDark ? 0.22 : 0.1) : "transparent",
          transition: "all .13s",
          "&:hover": { border: `1.5px solid ${t.accentColor}` },
        }}>
          <Typography sx={{
            fontSize: 11, fontWeight: sel ? 800 : 500,
            color: sel ? t.accentColor : mutedCol,
            fontFamily: "Montserrat, sans-serif",
          }}>
            {t.id}
          </Typography>
        </Box>
      );
    })}
  </Stack>
  {tipoSelected && (
    <Typography sx={{ fontSize: 10.5, color: mutedCol, textAlign: "center" }}>
      {tipoSelected.label} — {tipoSelected.desc}
      {["A","B","C"].includes(tipoComp) ? " · ARCA/AFIP" : ""}
    </Typography>
  )}
</Box>

)}
{/* Cart items */}
<Box sx={{
  flex: 1, overflowY: "auto", px: 2, py: 1.5,
  "&::-webkit-scrollbar": { width: 4 },
  "&::-webkit-scrollbar-thumb": {
    bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", borderRadius: 2,
  },
}}>
  {items.length === 0 ? (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", textAlign: "center",
    }}>
      <ShoppingCartIcon sx={{ fontSize: 38, color: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", mb: 1.5 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: mutedCol }}>Carrito vacío</Typography>
      <Typography sx={{ fontSize: 11.5, color: isDark ? "rgba(230,238,245,0.22)" : "rgba(26,32,44,0.22)", mt: 0.4 }}>
        Hacé clic en un artículo para agregarlo
      </Typography>
    </Box>
  ) : (
    <Stack spacing={0.75}>
      {items.map((item) => (
        <CartRow
          key={item.id} item={item}
          onInc={incItem} onDec={decItem} onRemove={removeItem}
          isDark={isDark}
        />
      ))}
    </Stack>
  )}
</Box>

{/* Totals + pay button */}
{items.length > 0 && (
  <Box sx={{ borderTop: `1px solid ${borderCol}`, px: 2, pt: 1.5, pb: 2 }}>
    <Stack spacing={0.5} mb={1.5}>
      {/* Neto — only for A/B */}
      {["A","B"].includes(tipoComp) && (
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 11.5, color: mutedCol }}>Subtotal neto</Typography>
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: textCol }}>${fmt(totales.subtotal)}</Typography>
        </Stack>
      )}
      {tipoComp !== "C" && totales.iva21 > 0 && (
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 11.5, color: mutedCol }}>IVA 21%</Typography>
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: textCol }}>${fmt(totales.iva21)}</Typography>
        </Stack>
      )}
      {tipoComp !== "C" && totales.iva105 > 0 && (
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 11.5, color: mutedCol }}>IVA 10.5%</Typography>
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: textCol }}>${fmt(totales.iva105)}</Typography>
        </Stack>
      )}

      <Divider sx={{ borderColor: borderCol, my: 0.5 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: textCol, fontFamily: "Montserrat, sans-serif", letterSpacing: "0.01em" }}>
          TOTAL
        </Typography>
        <Typography sx={{
          fontSize: 26, fontWeight: 800, color: B.blue,
          fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.02em",
        }}>
          ${fmt(totales.total)}
        </Typography>
      </Stack>
    </Stack>

    <Button
      variant="contained"
      fullWidth
      onClick={handleCobrar}
      disabled={procesando}
      startIcon={
        procesando
          ? <CircularProgress size={17} sx={{ color: "#fff" }} />
          : <ReceiptLongIcon sx={{ fontSize: "19px !important" }} />
      }
      sx={{
        background: `linear-gradient(90deg, ${B.green}, ${B.teal})`,
        color: "#fff", fontFamily: "Montserrat, sans-serif",
        fontWeight: 800, fontSize: 15, textTransform: "none",
        py: 1.4, borderRadius: "12px",
        boxShadow: `0 6px 20px ${alpha(B.green, 0.42)}`,
        "&:hover": {
          background: `linear-gradient(90deg, ${B.teal}, ${B.blue})`,
          boxShadow: `0 6px 24px ${alpha(B.teal, 0.48)}`,
        },
        "&:disabled": {
          background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          color: mutedCol, boxShadow: "none",
        },
      }}
    >
      {procesando ? "Procesando..." : `Cobrar $${fmt(totales.total)}`}
    </Button>
  </Box>
)}
    </>
  );
}

export default function FacturarPOS() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { sidebarWidth } = useSidebarContext();
  const topbarH = theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

  // Palette shortcuts
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const surfaceBg = isDark ? "#0F1F2A" : "#F4F7FA";
  const cardBg    = isDark ? "#172A36" : "#fff";
  const sidebarBg = isDark ? "#0D1B24" : "#EEF3F8";

  // ── Mobile cart drawer ──
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // ── Data state ──
  const [busca, setBusca]                   = useState("");
  const [prodKey, setProdKey]               = useState(0);
  const [warehouses, setWarehouses]         = useState([]);
  const [warehouseId, setWarehouseId]       = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // ── Cart state ──
  const [items, setItems]     = useState([]);
  const [cliente, setCliente] = useState(null);
  const [tipoComp, setTipoComp] = useState("X");

  // ── Modal state ──
  const [openCliente, setOpenCliente]   = useState(false);
  const [openAltaProd, setOpenAltaProd] = useState(false);
  const [openPago, setOpenPago]         = useState(false);
  const [openExito, setOpenExito]       = useState(false);
  const [openImprimir, setOpenImprimir] = useState(false);
  const [ventaGuardada, setVentaGuardada] = useState(null);
  const [procesando, setProcesando]       = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const notify = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  // ── Infinite scroll (single hook) ──
  const { items: catalog, loading: catalogLoading, loadingMore, hasMore, loadMore } =
    useInfiniteProducts({ q: busca, refreshKey: prodKey });

  // Scroll container + sentinel — root-scoped observer
  const containerRef = useRef(null);
  const sentinelRef  = useRef(null);

  useEffect(() => {
    const sentinel  = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { root: container, rootMargin: "200px", threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loadMore]);

  // ── Load warehouses + payment methods ──
  useEffect(() => {
    (async () => {
      const DEFAULT_PM = [
        { id: "cash",     name: "Efectivo",     code: "cash"     },
        { id: "debit",    name: "Débito",        code: "debit"    },
        { id: "credit",   name: "Crédito",       code: "credit"   },
        { id: "transfer", name: "Transferencia", code: "transfer" },
        { id: "mp",       name: "Mercado Pago",  code: "mp"       },
      ];
      const [wRes, pmRes] = await Promise.allSettled([
        Warehouse.listWarehouses(),
        Warehouse.listPaymentMethods(),
      ]);
      if (wRes.status === "fulfilled") {
        const arr = Array.isArray(wRes.value) ? wRes.value : (wRes.value?.data || []);
        setWarehouses(arr);
        if (arr.length > 0) setWarehouseId(arr[0].id);
      }
      if (pmRes.status === "fulfilled") {
        const arr = Array.isArray(pmRes.value) ? pmRes.value : (pmRes.value?.data || []);
        setPaymentMethods(arr.length > 0 ? arr : DEFAULT_PM);
      } else {
        setPaymentMethods(DEFAULT_PM);
      }
    })();
  }, []);

  // ── Cart helpers ──
  const cartMap = useMemo(() => {
    const m = new Map();
    items.forEach((it) => m.set(it.id, it.qty));
    return m;
  }, [items]);

  const addItem = useCallback((prod) => {
    const id      = prod.id || prod.idArticulo;
    const name    = prod.Nombre || prod.name || "";
    const price   = Number(prod.PrecioPublico || prod.price || 0);
    const ivaPct  = Number(prod.Iva ?? prod.tax_rate ?? 0);
    const ivaRate = Math.max(0, ivaPct) / 100;
    setItems((prev) => {
      const ex = prev.find((x) => x.id === id);
      if (ex) return prev.map((x) => x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x);
      return [...prev, { id, name, price, ivaRate, qty: 1, subtotal: price }];
    });
  }, []);

  const incItem = useCallback((id) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x));
  }, []);

  const decItem = useCallback((id) => {
    setItems((p) => p
      .map((x) => x.id === id ? { ...x, qty: x.qty - 1, subtotal: (x.qty - 1) * x.price } : x)
      .filter((x) => x.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id) => setItems((p) => p.filter((x) => x.id !== id)), []);
  const clearCart  = useCallback(() => { setItems([]); setCliente(null); setTipoComp("X"); }, []);

  // ── Totals ──
  const totales = useMemo(() => {
    let total = 0, neto = 0;
    const ivaMap = new Map();
    for (const it of items) {
      const line = Number(it.subtotal || 0);
      const rate = Number(it.ivaRate  || 0);
      total += line;
      if (rate > 0 && tipoComp !== "C") {
        const lineNeto = line / (1 + rate);
        neto += lineNeto;
        ivaMap.set(rate, (ivaMap.get(rate) || 0) + (line - lineNeto));
      } else {
        neto += line;
      }
    }
    return {
      total,
      subtotal: neto,
      iva21:  ivaMap.get(0.21)  || 0,
      iva105: ivaMap.get(0.105) || 0,
    };
  }, [items, tipoComp]);

  // ── Handle cobrar ──
  const handleCobrar = () => {
    if (items.length === 0)  { notify("El carrito está vacío", "warning"); return; }
    if (!warehouseId)        { notify("No hay depósito configurado", "error"); return; }
    if (!cliente)            { setOpenCliente(true); return; }
    setOpenPago(true);
  };

  const handleClienteSelect = (c) => {
    setCliente(c);
    setOpenPago(true);
  };

  const handlePagoConfirm = async (pagoInfo) => {
    setOpenPago(false);
    setProcesando(true);
    try {
      const payload = {
        warehouse_id:      warehouseId,
        customer_id:       cliente?.id || null,
        sale_date:         new Date().toISOString(),
        observations:      `Comp. ${tipoComp} — ${cliente?.nombre || "Consumidor Final"}`,
        payment_method:    pagoInfo.method?.name || "—",
        payment_reference: pagoInfo.reference || null,
        items: items.map((it) => ({
          product_id: it.id,
          qty:        it.qty,
          unit_price: it.price,
          tax_rate:   (it.ivaRate || 0) * 100,
          discount:   0,
        })),
      };

      const raw   = await Sales.createSale(payload);
      const venta = raw?.data || raw;

      // Non-blocking: register receipt
      try {
        if (typeof Sales.registerReceipts === "function") {
          await Sales.registerReceipts(venta.id, [{
            payment_method_id: typeof pagoInfo.method?.id === "number" ? pagoInfo.method.id : null,
            amount:            totales.total,
            receipt_date:      new Date().toISOString().split("T")[0],
            reference:         pagoInfo.reference || null,
          }]);
        }
      } catch { /* payment receipt is secondary; don't block */ }

      setVentaGuardada({
        ...venta,
        tipo_comprobante: tipoComp,
        cliente,
        items: items.map((it) => ({
          descripcion: it.name, name: it.name,
          cantidad: it.qty,     qty:  it.qty,
          precio: it.price,     price: it.price,
          total: it.subtotal,   subtotal: it.subtotal,
        })),
        totales,
        pago: { ...pagoInfo, cajero: "Cajero" },
      });

      clearCart();
      setOpenExito(true);
    } catch (e) {
      console.error(e);
      notify(e?.response?.data?.message || "Error al procesar la venta", "error");
    } finally { setProcesando(false); }
  };

  const handleWhatsApp = () => {
    const t = ventaGuardada?.tipo_comprobante;
    const n = ventaGuardada?.number || ventaGuardada?.id;
    const msg = `Hola! Tu comprobante ${t} N° ${n}%0ATotal: $${fmt(ventaGuardada?.totales?.total)}`;
    const phone = cliente?.phone ? encodeURIComponent(cliente.phone.replace(/\D/g, "")) : "";
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const handleEmail = () => {
    const subj = `Comprobante ${ventaGuardada?.tipo_comprobante} N° ${ventaGuardada?.number || ventaGuardada?.id}`;
    const body = `Total: $${fmt(ventaGuardada?.totales?.total)}`;
    window.open(`mailto:${cliente?.email || ""}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`);
  };

  const tipoSelected = TIPOS.find((t) => t.id === tipoComp);
  const itemCount    = items.reduce((s, it) => s + it.qty, 0);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      position: "fixed",
      top: topbarH,
      left: mdDown ? 0 : sidebarWidth,
      right: 0, bottom: 0,
      bgcolor: surfaceBg,
      overflow: "hidden",
      transition: "left .3s ease",
    }}>
      <Grid container sx={{ height: "100%" }}>

        {/* ═══ LEFT — Catálogo ══════════════════════════════════════════════ */}
        <Grid item xs={12} md={7} lg={7.5} sx={{
          height: "100%", display: "flex", flexDirection: "column",
          borderRight: `1px solid ${borderCol}`,
        }}>
          {/* Search bar */}
          <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <TextField
                placeholder="Buscar artículo por nombre, SKU o código..."
                value={busca} onChange={(e) => setBusca(e.target.value)}
                fullWidth size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 17, color: mutedCol }} />
                    </InputAdornment>
                  ),
                  endAdornment: busca ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setBusca("")} sx={{ p: 0.25 }}>
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: cardBg, fontSize: 13.5 } }}
              />

              {/* Quick add product */}
              <Tooltip title="Alta rápida de artículo" arrow>
                <IconButton onClick={() => setOpenAltaProd(true)} sx={{
                  width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
                  border: `1.5px dashed ${alpha(B.blue, 0.4)}`, color: B.blue,
                  "&:hover": { bgcolor: alpha(B.blue, 0.08), border: `1.5px solid ${B.blue}` },
                }}>
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              {/* Warehouse selector */}
              {warehouses.length > 1 && (
                <TextField select value={warehouseId || ""} onChange={(e) => setWarehouseId(e.target.value)}
                  size="small" sx={{ minWidth: 140, flexShrink: 0, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: cardBg, fontSize: 13 } }}
                >
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id} sx={{ fontSize: 13 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <StoreIcon sx={{ fontSize: 14, color: mutedCol }} />
                        <span>{w.name}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          </Box>

          {/* Grid with infinite scroll inside the container */}
          <Box
            ref={containerRef}
            sx={{
              flex: 1, overflowY: "auto", px: 2, pb: 2,
              "&::-webkit-scrollbar": { width: 5 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                borderRadius: 3,
              },
            }}
          >
            {catalogLoading ? (
              <Grid container spacing={1.25}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Grid item xs={6} sm={4} lg={3} key={i}>
                    <ProdSkeleton isDark={isDark} />
                  </Grid>
                ))}
              </Grid>
            ) : catalog.length === 0 ? (
              <Box sx={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "60%", textAlign: "center",
              }}>
                <InventoryIcon sx={{ fontSize: 38, color: mutedCol, mb: 1.5 }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: textCol, mb: 0.5 }}>
                  {busca ? "Sin resultados" : "Sin artículos activos"}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: mutedCol }}>
                  {busca ? "Probá con otro término de búsqueda" : "Creá tu primer artículo con el botón +"}
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={1.25}>
                  {catalog.map((prod) => (
                    <Grid item xs={6} sm={4} lg={3} key={prod.id}>
                      <ProdCard
                        product={prod}
                        cartQty={cartMap.get(prod.id) || 0}
                        onAdd={addItem}
                        isDark={isDark}
                      />
                    </Grid>
                  ))}
                  {loadingMore && Array.from({ length: 4 }).map((_, i) => (
                    <Grid item xs={6} sm={4} lg={3} key={`sk-more-${i}`}>
                      <ProdSkeleton isDark={isDark} />
                    </Grid>
                  ))}
                </Grid>

                {/* Sentinel — IntersectionObserver target */}
                <Box ref={sentinelRef} sx={{ height: 1, mt: 1 }} />

                {loadingMore && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={16} sx={{ color: B.blue }} />
                  </Box>
                )}

                {!hasMore && !loadingMore && catalog.length > PAGE_SIZE && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Typography sx={{ fontSize: 11.5, color: mutedCol, fontWeight: 600 }}>
                      — {catalog.length} artículos cargados —
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Grid>

        {/* ═══ RIGHT ─ Cart panel (desktop only) ══════════════════════════ */}
        {!mdDown && (
          <Grid item md={5} lg={4.5} sx={{
            height: "100%", display: "flex", flexDirection: "column",
            bgcolor: sidebarBg,
          }}>
            <CartPanel
              items={items} itemCount={itemCount} cliente={cliente}
              tipoComp={tipoComp} setTipoComp={setTipoComp} tipoSelected={tipoSelected}
              totales={totales} procesando={procesando}
              incItem={incItem} decItem={decItem} removeItem={removeItem} clearCart={clearCart}
              setOpenCliente={setOpenCliente} handleCobrar={handleCobrar}
              isDark={isDark} borderCol={borderCol} textCol={textCol}
              mutedCol={mutedCol} sidebarBg={sidebarBg}
            />
          </Grid>
        )}
      </Grid>

      {/* ═══ MOBILE ─ FAB + Bottom Sheet ══════════════════════════════════ */}
      {mdDown && (
        <>
          {/* FAB flotante con badge de cantidad */}
          <Fab
            onClick={() => setCartDrawerOpen(true)}
            sx={{
              position: "fixed",
              bottom: 20, right: 16,
              zIndex: 1200,
              background: items.length > 0
                ? `linear-gradient(135deg, ${B.green}, ${B.teal})`
                : isDark ? "#1E3545" : "#DDE5ED",
              color: items.length > 0 ? "#fff" : mutedCol,
              boxShadow: items.length > 0
                ? `0 6px 24px ${alpha(B.green, 0.5)}`
                : "0 2px 8px rgba(0,0,0,0.2)",
              width: 60, height: 60,
              transition: "all .25s",
            }}
          >
            <Badge
              badgeContent={itemCount}
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: items.length > 0 ? "#fff" : B.blue,
                  color:   items.length > 0 ? B.green : "#fff",
                  fontWeight: 800, fontSize: 10,
                  minWidth: 18, height: 18, borderRadius: "9px",
                  top: -2, right: -2,
                },
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 24 }} />
            </Badge>
          </Fab>

          {/* Bottom Sheet ─ 92vh máx para dejar un respiro visual */}
          <Drawer
            anchor="bottom"
            open={cartDrawerOpen}
            onClose={() => setCartDrawerOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: "20px 20px 0 0",
                bgcolor: isDark ? "#0D1B24" : "#EEF3F8",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            }}
          >
            {/* Handle pill */}
            <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5, flexShrink: 0 }}>
              <Box sx={{
                width: 40, height: 4, borderRadius: 2,
                bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
              }} />
            </Box>

            {/* Header del drawer (propio, sin duplicar el de CartPanel) */}
            <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ShoppingCartIcon sx={{ color: B.blue, fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: 15, fontFamily: "Montserrat, sans-serif", color: textCol }}>
                    Orden
                  </Typography>
                  {itemCount > 0 && (
                    <Box sx={{
                      px: 0.75, py: 0.1, borderRadius: "5px",
                      bgcolor: alpha(B.blue, isDark ? 0.2 : 0.1),
                      border: `1px solid ${alpha(B.blue, 0.25)}`,
                    }}>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: B.blue }}>
                        {itemCount}
                      </Typography>
                    </Box>
                  )}
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {items.length > 0 && (
                    <Button size="small" onClick={clearCart} sx={{
                      color: "#E63946", fontSize: 11.5, fontWeight: 600, textTransform: "none",
                      py: 0.25, px: 1, borderRadius: "7px",
                      "&:hover": { bgcolor: alpha("#E63946", 0.08) },
                    }}>
                      Limpiar
                    </Button>
                  )}
                  <IconButton size="small" onClick={() => setCartDrawerOpen(false)}
                    sx={{ color: mutedCol, "&:hover": { color: textCol } }}>
                    <CloseIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* CartPanel ─ hideHeader para no duplicar el header ya definido arriba */}
            <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <CartPanel
                items={items} itemCount={itemCount} cliente={cliente}
                tipoComp={tipoComp} setTipoComp={setTipoComp} tipoSelected={tipoSelected}
                totales={totales} procesando={procesando}
                incItem={incItem} decItem={decItem} removeItem={removeItem} clearCart={clearCart}
                setOpenCliente={setOpenCliente}
                handleCobrar={() => { setCartDrawerOpen(false); handleCobrar(); }}
                isDark={isDark} borderCol={borderCol} textCol={textCol}
                mutedCol={mutedCol} sidebarBg={sidebarBg}
                hideHeader
              />
            </Box>
          </Drawer>
        </>
      )}


      {/* ─── Modales ─────────────────────────────────────────────────────── */}
      <ModalCliente
        open={openCliente}
        onClose={() => setOpenCliente(false)}
        onSelect={handleClienteSelect}
        isDark={isDark}
      />

      <ModalAltaProducto
        open={openAltaProd}
        onClose={() => setOpenAltaProd(false)}
        isDark={isDark}
        onCreated={(prod) => {
          setProdKey((k) => k + 1); // refresh catalog
          addItem(prod);            // add directly to cart
          setOpenAltaProd(false);
        }}
      />

      <ModalPago
        open={openPago}
        onClose={() => setOpenPago(false)}
        total={totales.total}
        paymentMethods={paymentMethods}
        onConfirm={handlePagoConfirm}
        isDark={isDark}
      />

      <ModalExito
        open={openExito}
        onClose={() => { setOpenExito(false); setVentaGuardada(null); }}
        venta={ventaGuardada}
        onImprimir={() => { setOpenExito(false); setOpenImprimir(true); }}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        isDark={isDark}
      />

      {ventaGuardada && (
        <ModalImprimir
          open={openImprimir}
          onClose={() => setOpenImprimir(false)}
          empresa={{ razonSocial: "ARTDENT", condicionIva: "Responsable Inscripto", domicilio: "", cuit: "", iibb: "", inicioActividad: "" }}
          comprobante={{
            tipo: ventaGuardada.tipo_comprobante || "X",
            numero: ventaGuardada.receipt_number
              || ventaGuardada.number
              || `00001-${String(ventaGuardada.id || 1).padStart(8, "0")}`,
            fecha: new Date().toLocaleDateString("es-AR"),
            hora:  new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          }}
          cliente={{ nombre: ventaGuardada.cliente?.nombre || "Consumidor Final" }}
          items={ventaGuardada.items || []}
          totales={ventaGuardada.totales || {}}
          pago={{ medio: ventaGuardada.pago?.method?.name || "—", cajero: ventaGuardada.pago?.cajero || "Cajero" }}
          cae={{}}
          qrImage={null}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: "10px", fontSize: 13, fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}