// src/scenes/facturacion/index.jsx  ─── Control de Ventas
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Stack, Button, IconButton, TextField, InputAdornment,
  Chip, Typography, useMediaQuery, useTheme, MenuItem,
  Drawer, Divider, CircularProgress, Tooltip, Avatar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

import SearchIcon          from "@mui/icons-material/Search";
import RefreshIcon         from "@mui/icons-material/Refresh";
import ReceiptLongIcon     from "@mui/icons-material/ReceiptLong";
import FilterListIcon      from "@mui/icons-material/FilterList";
import DownloadIcon        from "@mui/icons-material/Download";
import VisibilityIcon      from "@mui/icons-material/Visibility";
import CloseIcon           from "@mui/icons-material/Close";
import TrendingUpIcon      from "@mui/icons-material/TrendingUp";
import TrendingDownIcon    from "@mui/icons-material/TrendingDown";
import StorefrontIcon      from "@mui/icons-material/Storefront";
import ShoppingBagIcon     from "@mui/icons-material/ShoppingBag";

import { useSidebarContext }  from "../../contexts/SidebarContext";
import { listSalesHub }       from "../../services/salesHubService";
import ModalVentaDetalle      from "../../components/modals/ModalVentaDetalle";

// ─── Brand ───────────────────────────────────────────────────────────────────
const B = {
  blue:  "#397B9C",
  green: "#5AAD9C",
  teal:  "#49949C",
  mint:  "#ACD6CE",
  soft:  "#7CA5C3",
};

const TOPBAR_H = (theme) =>
  theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const normalizeList = (r) => {
  if (Array.isArray(r))             return { rows: r,           meta: null };
  if (Array.isArray(r?.data))       return { rows: r.data,       meta: r.meta  || null };
  if (Array.isArray(r?.data?.data)) return { rows: r.data.data,  meta: r.data.meta || null };
  return { rows: [], meta: null };
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  cancelled: { label: "Anulada",    color: "#E63946" },
  invoiced:  { label: "Facturada",  color: B.green   },
  confirmed: { label: "Confirmada", color: B.blue    },
  draft:     { label: "Borrador",   color: "#64748b" },
  paid:      { label: "Pagada",     color: B.teal    },
  partial:   { label: "Parcial",    color: "#F4A261" },
  shipped:   { label: "Enviada",    color: B.soft    },
  delivered: { label: "Entregada",  color: B.green   },
};

function StatusBadge({ value }) {
  const v   = String(value || "").toLowerCase();
  const cfg = STATUS[v] || { label: value || "—", color: "#64748b" };
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      px: 1.1, py: 0.3, borderRadius: "6px",
      bgcolor: alpha(cfg.color, 0.12),
      border: `1px solid ${alpha(cfg.color, 0.3)}`,
    }}>
      <Typography sx={{
        fontSize: 11.5, fontWeight: 700, color: cfg.color,
        fontFamily: "Montserrat, sans-serif",
      }}>
        {cfg.label}
      </Typography>
    </Box>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, icon: Icon }) {
  const isDark = useTheme().palette.mode === "dark";
  return (
    <Box sx={{
      flex: "1 1 0", minWidth: 0,
      px: 2, py: 1.75,
      borderRadius: "14px",
      bgcolor: alpha(accent, isDark ? 0.08 : 0.06),
      border: `1px solid ${alpha(accent, isDark ? 0.2 : 0.16)}`,
      position: "relative", overflow: "hidden",
      transition: "transform .15s, box-shadow .15s",
      "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 24px ${alpha(accent, 0.18)}` },
    }}>
      <Box sx={{
        position: "absolute", top: -16, right: -16,
        width: 64, height: 64, borderRadius: "50%",
        bgcolor: alpha(accent, isDark ? 0.14 : 0.1),
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon sx={{ fontSize: 20, color: alpha(accent, 0.7) }} />
      </Box>
      <Typography sx={{
        fontSize: 10.5, fontWeight: 700, color: alpha(accent, 0.75),
        letterSpacing: "0.05em", textTransform: "uppercase",
        fontFamily: "Montserrat, sans-serif", mb: 0.4,
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: { xs: 16, md: 19 }, fontWeight: 800, color: accent,
        fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.02em", lineHeight: 1.2,
      }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: 10.5, color: isDark ? "rgba(230,238,245,0.38)" : "rgba(26,32,44,0.42)", mt: 0.4 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

// ─── Mobile Sale Card ─────────────────────────────────────────────────────────
function SaleCard({ row, onView, isDark }) {
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const cardBg    = isDark ? "#172A36" : "#fff";

  const total    = Number(row?.totals?.total   ?? row?.total        ?? 0);
  const paid     = Number(row?.totals?.paid    ?? row?.paid_total   ?? 0);
  const due      = Number(row?.totals?.due     ?? row?.due_total    ?? 0);
  const customer = row?.customer?.name ?? "Consumidor Final";
  const isOnline = String(row?.source || "").toLowerCase() === "ecom";

  return (
    <Box
      onClick={() => onView(row)}
      sx={{
        bgcolor: cardBg, borderRadius: "14px",
        border: `1px solid ${borderCol}`,
        p: 2, cursor: "pointer",
        transition: "box-shadow .15s, transform .1s",
        "&:active": { transform: "scale(0.992)", boxShadow: `0 4px 16px ${alpha(B.blue, 0.12)}` },
      }}
    >
      {/* Row 1 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{
            px: 0.9, py: 0.2, borderRadius: "6px",
            bgcolor: alpha(isOnline ? B.teal : B.blue, 0.1),
            border: `1px solid ${alpha(isOnline ? B.teal : B.blue, 0.22)}`,
            display: "flex", alignItems: "center", gap: 0.5,
          }}>
            {isOnline
              ? <ShoppingBagIcon sx={{ fontSize: 11, color: B.teal }} />
              : <StorefrontIcon  sx={{ fontSize: 11, color: B.blue }} />
            }
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: isOnline ? B.teal : B.blue, fontFamily: "Montserrat, sans-serif" }}>
              {isOnline ? "Online" : "POS"}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: textCol, fontFamily: "Montserrat, sans-serif" }}>
            {row?.number ?? row?.code ?? "—"}
          </Typography>
        </Stack>
        <StatusBadge value={row?.status} />
      </Stack>

      {/* Row 2 */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
        <Avatar sx={{
          width: 28, height: 28,
          bgcolor: alpha(B.blue, 0.12), color: B.blue,
          fontSize: 11, fontWeight: 800,
        }}>
          {customer.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: textCol, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {customer}
          </Typography>
          <Typography sx={{ fontSize: 11, color: mutedCol }}>
            {row?.date ? new Date(row.date).toLocaleDateString("es-AR") : "—"}
          </Typography>
        </Box>
      </Stack>

      {/* Row 3 — financials */}
      <Box sx={{ pt: 1.25, borderTop: `1px solid ${borderCol}` }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: 9.5, color: mutedCol, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.25 }}>Total</Typography>
            <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: B.blue, fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.01em" }}>{money(total)}</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 9.5, color: mutedCol, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.25 }}>Cobrado</Typography>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: B.green, letterSpacing: "-0.01em" }}>{money(paid)}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 9.5, color: mutedCol, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.25 }}>Saldo</Typography>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: due > 0 ? "#E63946" : mutedCol, letterSpacing: "-0.01em" }}>{money(due)}</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

// ─── Filter Drawer (mobile) ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, values, onChange, onApply, onClear, isDark }) {
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const cardBg    = isDark ? "#0D1B24" : "#EEF3F8";
  const sx = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: isDark ? "#172A36" : "#fff", fontSize: 13, color: textCol },
    "& .MuiInputLabel-root": { fontSize: 13, color: mutedCol },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: borderCol },
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}
      PaperProps={{ sx: { borderRadius: "20px 20px 0 0", bgcolor: cardBg, pb: 3 } }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, mb: 1.5 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.14)" }} />
      </Box>
      <Box sx={{ px: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: textCol, fontFamily: "Montserrat, sans-serif" }}>
            Filtros
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: mutedCol }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        <Stack spacing={1.5}>
          <TextField select size="small" label="Origen" value={values.source}
            onChange={(e) => onChange("source", e.target.value)} sx={sx} fullWidth>
            <MenuItem value="">Todas las fuentes</MenuItem>
            <MenuItem value="pos">POS — Local</MenuItem>
            <MenuItem value="ecom">Online — E-commerce</MenuItem>
          </TextField>

          <TextField select size="small" label="Estado" value={values.status}
            onChange={(e) => onChange("status", e.target.value)} sx={sx} fullWidth>
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="draft">Borrador</MenuItem>
            <MenuItem value="confirmed">Confirmada</MenuItem>
            <MenuItem value="invoiced">Facturada</MenuItem>
            <MenuItem value="paid">Pagada</MenuItem>
            <MenuItem value="cancelled">Anulada</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1.5}>
            <TextField size="small" type="date" label="Desde" value={values.from}
              onChange={(e) => onChange("from", e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ ...sx, flex: 1 }} />
            <TextField size="small" type="date" label="Hasta" value={values.to}
              onChange={(e) => onChange("to", e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ ...sx, flex: 1 }} />
          </Stack>

          <Stack direction="row" spacing={1.5} pt={0.5}>
            <Button fullWidth variant="outlined" onClick={onClear}
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: borderCol, color: mutedCol, py: 1.2 }}>
              Limpiar
            </Button>
            <Button fullWidth variant="contained" onClick={() => { onApply(); onClose(); }}
              sx={{
                borderRadius: "10px", textTransform: "none",
                fontWeight: 800, fontFamily: "Montserrat, sans-serif",
                background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
                boxShadow: `0 4px 14px ${alpha(B.blue, 0.35)}`, py: 1.2,
              }}>
              Aplicar filtros
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VentasControlIndex() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const appbarH = TOPBAR_H(theme);
  const { sidebarWidth } = useSidebarContext();

  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const surfaceBg = isDark ? "#0F1F2A" : "#F4F7FA";
  const cardBg    = isDark ? "#172A36" : "#fff";
  const inputSx   = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: cardBg, fontSize: 13, color: textCol },
    "& .MuiInputLabel-root": { fontSize: 13, color: mutedCol },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: borderCol },
    "& .MuiSelect-icon": { color: mutedCol },
  };

  // Filter state
  const [source, setSource]             = useState("");
  const [status, setStatus]             = useState("");
  const [search, setSearch]             = useState("");
  const [from,   setFrom]               = useState("");
  const [to,     setTo]                 = useState("");
  const [filterDrawer,  setFilterDrawer]  = useState(false);
  const [showFilters,   setShowFilters]   = useState(false);

  // Data
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [openDetail, setOpenDetail] = useState(false);
  const [selected,   setSelected]   = useState(null);

  const handleView = useCallback((row) => {
    setSelected({ source: row.source, id: row.rawId ?? row.id });
    setOpenDetail(true);
  }, []);

  const fetchData = useCallback(async (ov = {}) => {
    setLoading(true);
    try {
      const raw = {
        source: ov.source ?? source,
        status: ov.status ?? status,
        search: ov.search ?? search,
        from:   ov.from   ?? from,
        to:     ov.to     ?? to,
        per_page: 50,
      };
      const params = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== "" && v != null));
      const r = await listSalesHub(params);
      const n = normalizeList(r);
      setRows(n.rows);
    } catch (e) {
      console.error("[VentasControl]", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [source, status, search, from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total    = rows.reduce((s, r) => s + Number(r?.totals?.total  ?? r?.total       ?? 0), 0);
    const paid     = rows.reduce((s, r) => s + Number(r?.totals?.paid   ?? r?.paid_total  ?? 0), 0);
    const due      = rows.reduce((s, r) => s + Number(r?.totals?.due    ?? r?.due_total   ?? 0), 0);
    const count    = rows.length;
    const avgTicket = count > 0 ? total / count : 0;
    return { total, paid, due, count, avgTicket };
  }, [rows]);

  const hasFilters = source || status || search || from || to;

  const clearFilters = () => {
    setSource(""); setStatus(""); setSearch(""); setFrom(""); setTo("");
    fetchData({ source: "", status: "", search: "", from: "", to: "" });
  };

  // DataGrid columns
  const columns = useMemo(() => [
    {
      field: "actions", headerName: "", width: 56, sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title="Ver detalle" arrow>
          <IconButton size="small" onClick={() => handleView(row)}
            sx={{ width: 30, height: 30, borderRadius: "8px", color: B.blue,
              "&:hover": { bgcolor: alpha(B.blue, 0.1) } }}>
            <VisibilityIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: "source", headerName: "Origen", width: 90, sortable: false,
      renderCell: ({ value }) => {
        const isOnline = String(value || "").toLowerCase() === "ecom";
        return (
          <Stack direction="row" spacing={0.6} alignItems="center">
            {isOnline
              ? <ShoppingBagIcon sx={{ fontSize: 13, color: B.teal }} />
              : <StorefrontIcon  sx={{ fontSize: 13, color: B.blue }} />
            }
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: isOnline ? B.teal : B.blue, fontFamily: "Montserrat, sans-serif" }}>
              {isOnline ? "Online" : "POS"}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: "number", headerName: "Comprobante", width: 170,
      valueGetter: (p) => p.row?.number ?? p.row?.code ?? "",
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: textCol, fontFamily: "Montserrat, sans-serif" }}>{value}</Typography>
      ),
    },
    {
      field: "date", headerName: "Fecha", width: 120,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, color: mutedCol }}>
          {value ? new Date(value).toLocaleDateString("es-AR") : "—"}
        </Typography>
      ),
    },
    {
      field: "customer", headerName: "Cliente", flex: 1, minWidth: 180,
      valueGetter: (p) => p.row?.customer?.name ?? "Consumidor Final",
      renderCell: ({ value }) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 26, height: 26, bgcolor: alpha(B.blue, 0.12), color: B.blue, fontSize: 11, fontWeight: 800 }}>
            {value?.charAt(0)?.toUpperCase() || "C"}
          </Avatar>
          <Typography sx={{ fontSize: 12.5, color: textCol, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "total", headerName: "Total", width: 130,
      valueGetter: (p) => p.row?.totals?.total ?? p.row?.total ?? 0,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: B.blue, fontFamily: "Montserrat, sans-serif" }}>{money(value)}</Typography>
      ),
    },
    {
      field: "paid_total", headerName: "Cobrado", width: 130,
      valueGetter: (p) => p.row?.totals?.paid ?? p.row?.paid_total ?? 0,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: B.green }}>{money(value)}</Typography>
      ),
    },
    {
      field: "due_total", headerName: "Saldo", width: 120,
      valueGetter: (p) => p.row?.totals?.due ?? p.row?.due_total ?? 0,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: Number(value || 0) > 0 ? "#E63946" : mutedCol }}>{money(value)}</Typography>
      ),
    },
    {
      field: "status", headerName: "Estado", width: 120,
      renderCell: (p) => <StatusBadge value={p.value} />,
    },
    {
      field: "items_count", headerName: "Ítems", width: 70, align: "center", headerAlign: "center",
      valueGetter: (p) => p.row?.items_count ?? p.row?.items?.length ?? 0,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: mutedCol }}>{value}</Typography>
      ),
    },
  ], [textCol, mutedCol]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      position: "fixed",
      top: appbarH,
      left: mdDown ? 0 : sidebarWidth,
      right: 0, bottom: 0,
      bgcolor: surfaceBg,
      overflow: "hidden",
      transition: "left .3s ease",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <Box sx={{
        px: { xs: 2, md: 3 }, pt: { xs: 1.5, md: 2 }, pb: { xs: 1.25, md: 1.75 },
        borderBottom: `1px solid ${borderCol}`,
        bgcolor: cardBg, flexShrink: 0,
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5}>
          {/* Title */}
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
              background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 12px ${alpha(B.blue, 0.35)}`,
            }}>
              <ReceiptLongIcon sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: textCol, fontFamily: "Montserrat, sans-serif", lineHeight: 1.15 }}>
                Control de Ventas
              </Typography>
              <Typography sx={{ fontSize: 11, color: mutedCol, lineHeight: 1.2 }}>
                POS + E-commerce
              </Typography>
            </Box>
          </Stack>

          {/* Desktop search */}
          {!mdDown && (
            <TextField
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ ...inputSx, width: 220 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: mutedCol }} /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")} sx={{ p: 0.25 }}>
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          )}

          {/* Actions */}
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Tooltip title={mdDown ? "Filtros" : (showFilters ? "Ocultar" : "Filtros")} arrow>
              <IconButton
                onClick={() => mdDown ? setFilterDrawer(true) : setShowFilters(!showFilters)}
                sx={{
                  width: 36, height: 36, borderRadius: "9px",
                  border: `1px solid ${hasFilters ? alpha(B.blue, 0.5) : borderCol}`,
                  color: hasFilters ? B.blue : mutedCol,
                  bgcolor: hasFilters ? alpha(B.blue, 0.08) : "transparent",
                  "&:hover": { color: textCol, bgcolor: alpha(B.blue, isDark ? 0.08 : 0.05) },
                }}>
                <FilterListIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Actualizar" arrow>
              <span>
                <IconButton onClick={() => fetchData()} disabled={loading}
                  sx={{
                    width: 36, height: 36, borderRadius: "9px",
                    border: `1px solid ${borderCol}`, color: mutedCol,
                    "&:hover": { color: textCol },
                    "&.Mui-disabled": { opacity: 0.4 },
                  }}>
                  {loading
                    ? <CircularProgress size={15} sx={{ color: "inherit" }} />
                    : <RefreshIcon sx={{ fontSize: 17 }} />
                  }
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Exportar" arrow>
              <span>
                <IconButton disabled={rows.length === 0}
                  sx={{
                    width: 36, height: 36, borderRadius: "9px",
                    border: `1px solid ${borderCol}`, color: mutedCol,
                    "&:hover": { color: textCol },
                    "&.Mui-disabled": { opacity: 0.4 },
                  }}>
                  <DownloadIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Mobile search */}
        {mdDown && (
          <Box sx={{ mt: 1.25 }}>
            <TextField
              placeholder="Buscar por comprobante, cliente…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              size="small" fullWidth sx={inputSx}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: mutedCol }} /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")} sx={{ p: 0.25 }}>
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>
        )}
      </Box>

      {/* ── Desktop filter row ──────────────────────────────────────────── */}
      {!mdDown && showFilters && (
        <Box sx={{
          px: 3, py: 1.5,
          borderBottom: `1px solid ${borderCol}`,
          bgcolor: isDark ? "#0D1B24" : "#EEF3F8",
          flexShrink: 0,
        }}>
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
            <TextField select size="small" label="Origen" value={source}
              onChange={(e) => setSource(e.target.value)} sx={{ ...inputSx, minWidth: 140 }}>
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="pos">POS</MenuItem>
              <MenuItem value="ecom">Online</MenuItem>
            </TextField>
            <TextField select size="small" label="Estado" value={status}
              onChange={(e) => setStatus(e.target.value)} sx={{ ...inputSx, minWidth: 150 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="draft">Borrador</MenuItem>
              <MenuItem value="confirmed">Confirmada</MenuItem>
              <MenuItem value="invoiced">Facturada</MenuItem>
              <MenuItem value="paid">Pagada</MenuItem>
              <MenuItem value="cancelled">Anulada</MenuItem>
            </TextField>
            <TextField size="small" type="date" label="Desde" value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ ...inputSx, minWidth: 140 }} />
            <TextField size="small" type="date" label="Hasta" value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ ...inputSx, minWidth: 140 }} />
            <Button variant="contained" onClick={() => fetchData()} disabled={loading}
              sx={{
                borderRadius: "9px", textTransform: "none", fontWeight: 800,
                fontFamily: "Montserrat, sans-serif", px: 2.5,
                background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
                boxShadow: `0 4px 12px ${alpha(B.blue, 0.3)}`,
              }}>
              Aplicar
            </Button>
            {hasFilters && (
              <Button onClick={clearFilters} size="small"
                sx={{ textTransform: "none", color: "#E63946", fontWeight: 600,
                  "&:hover": { bgcolor: alpha("#E63946", 0.07) } }}>
                Limpiar
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* ── Active filter chips ─────────────────────────────────────────── */}
      {hasFilters && (
        <Box sx={{
          px: { xs: 2, md: 3 }, py: 0.75,
          borderBottom: `1px solid ${borderCol}`,
          bgcolor: isDark ? alpha(B.blue, 0.04) : alpha(B.blue, 0.025),
          flexShrink: 0,
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
            <Typography sx={{ fontSize: 10.5, color: mutedCol, fontWeight: 700, flexShrink: 0 }}>
              Filtros activos:
            </Typography>
            {source && <Chip size="small" label={source === "pos" ? "POS" : "Online"} onDelete={() => setSource("")}
              sx={{ height: 22, fontSize: 11, bgcolor: alpha(B.blue, 0.1), color: B.blue, border: `1px solid ${alpha(B.blue, 0.25)}`, "& .MuiChip-deleteIcon": { fontSize: 13, color: alpha(B.blue, 0.55) } }} />}
            {status && <Chip size="small" label={STATUS[status]?.label ?? status} onDelete={() => setStatus("")}
              sx={{ height: 22, fontSize: 11, bgcolor: alpha(B.teal, 0.1), color: B.teal, border: `1px solid ${alpha(B.teal, 0.25)}`, "& .MuiChip-deleteIcon": { fontSize: 13, color: alpha(B.teal, 0.55) } }} />}
            {from   && <Chip size="small" label={`Desde ${from}`} onDelete={() => setFrom("")}  sx={{ height: 22, fontSize: 11 }} />}
            {to     && <Chip size="small" label={`Hasta ${to}`}   onDelete={() => setTo("")}    sx={{ height: 22, fontSize: 11 }} />}
            {search && <Chip size="small" label={`"${search}"`}   onDelete={() => setSearch("")} sx={{ height: 22, fontSize: 11 }} />}
          </Stack>
        </Box>
      )}

      {/* ── KPI strip ───────────────────────────────────────────────────── */}
      <Box sx={{
        px: { xs: 1.5, md: 3 }, py: { xs: 1.25, md: 1.5 },
        borderBottom: `1px solid ${borderCol}`,
        flexShrink: 0,
        overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" },
      }}>
        <Stack direction="row" spacing={1.25} sx={{ minWidth: { xs: 520, md: "unset" } }}>
          <KpiCard
            label="Operaciones"
            value={loading ? "…" : stats.count}
            sub="en este período"
            accent={B.blue}
            icon={StorefrontIcon}
          />
          <KpiCard
            label="Facturado"
            value={loading ? "…" : money(stats.total)}
            sub="total del período"
            accent={B.green}
            icon={ReceiptLongIcon}
          />
          <KpiCard
            label="Cobrado"
            value={loading ? "…" : money(stats.paid)}
            sub={`${((stats.paid / (stats.total || 1)) * 100).toFixed(0)}% del total`}
            accent={B.teal}
            icon={TrendingUpIcon}
          />
          <KpiCard
            label="Saldo Pendiente"
            value={loading ? "…" : money(stats.due)}
            sub={stats.due > 0 ? "por cobrar" : "todo cobrado"}
            accent={stats.due > 0 ? "#E63946" : B.mint}
            icon={stats.due > 0 ? TrendingDownIcon : TrendingUpIcon}
          />
        </Stack>
      </Box>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>

        {/* Desktop — DataGrid */}
        {!mdDown && (
          <DataGrid
            rows={rows.map((r) => ({ ...r, gridId: `${r.source}-${r.id}`, rawId: r.id }))}
            columns={columns}
            getRowId={(r) => r.gridId}
            loading={loading}
            disableRowSelectionOnClick
            onRowDoubleClick={(p) => handleView(p.row)}
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 50, page: 0 } } }}
            sx={{
              border: "none", height: "100%", bgcolor: cardBg,
              fontFamily: "Montserrat, sans-serif",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: isDark ? "#0D1B24" : "#EEF3F8",
                borderBottom: `1px solid ${borderCol}`,
                minHeight: "46px !important", maxHeight: "46px !important",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontSize: 10.5, fontWeight: 700, color: mutedCol,
                textTransform: "uppercase", letterSpacing: "0.05em",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${borderCol}`, py: 1, fontSize: 13, color: textCol,
              },
              "& .MuiDataGrid-row": {
                cursor: "pointer",
                "&:hover": { bgcolor: isDark ? alpha(B.blue, 0.06) : alpha(B.blue, 0.025) },
                "&:nth-of-type(even)": { bgcolor: isDark ? alpha("#fff", 0.015) : alpha("#000", 0.01) },
              },
              "& .MuiDataGrid-footerContainer": {
                bgcolor: isDark ? "#0D1B24" : "#EEF3F8",
                borderTop: `1px solid ${borderCol}`, minHeight: 46, color: mutedCol, fontSize: 12,
              },
              "& .MuiDataGrid-iconSeparator": { display: "none" },
              "& .MuiDataGrid-virtualScroller": { bgcolor: cardBg },
              "& .MuiTablePagination-root": { color: mutedCol, fontSize: 12 },
              "& .MuiDataGrid-overlay": { bgcolor: cardBg },
            }}
          />
        )}

        {/* Mobile — Card list */}
        {mdDown && (
          <Box sx={{
            height: "100%", overflowY: "auto",
            px: 1.5, py: 1.5,
            "&::-webkit-scrollbar": { display: "none" },
          }}>
            {loading ? (
              <Stack spacing={1}>
                {[...Array(5)].map((_, i) => (
                  <Box key={i} sx={{
                    borderRadius: "14px", height: 124, bgcolor: cardBg,
                    border: `1px solid ${borderCol}`,
                    opacity: 0.65 - i * 0.1,
                    animation: "pulse 1.4s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 0.65 - i * 0.1 },
                      "50%": { opacity: (0.65 - i * 0.1) * 0.5 },
                    },
                  }} />
                ))}
              </Stack>
            ) : rows.length === 0 ? (
              <Stack alignItems="center" justifyContent="center" height="65%" spacing={1.5} textAlign="center">
                <Box sx={{
                  width: 64, height: 64, borderRadius: "18px",
                  bgcolor: alpha(B.blue, isDark ? 0.1 : 0.07),
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ReceiptLongIcon sx={{ fontSize: 28, color: alpha(B.blue, 0.5) }} />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: textCol, fontFamily: "Montserrat, sans-serif" }}>
                  {hasFilters ? "Sin resultados" : "Sin ventas"}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: mutedCol, maxWidth: 240 }}>
                  {hasFilters ? "Probá con otros filtros" : "Las ventas aparecerán acá"}
                </Typography>
                {hasFilters && (
                  <Button size="small" onClick={clearFilters}
                    sx={{ textTransform: "none", fontWeight: 700, color: B.blue, mt: 0.5 }}>
                    Limpiar filtros
                  </Button>
                )}
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Typography sx={{ fontSize: 11, color: mutedCol, fontWeight: 600, px: 0.25, pb: 0.25 }}>
                  {rows.length} {rows.length === 1 ? "resultado" : "resultados"}
                </Typography>
                {rows.map((row) => (
                  <SaleCard
                    key={`${row.source}-${row.id}`}
                    row={row}
                    onView={handleView}
                    isDark={isDark}
                  />
                ))}
                <Box sx={{ height: 80 }} /> {/* space for FAB-safe area */}
              </Stack>
            )}
          </Box>
        )}
      </Box>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      <FilterDrawer
        open={filterDrawer}
        onClose={() => setFilterDrawer(false)}
        values={{ source, status, from, to }}
        onChange={(key, val) => {
          if (key === "source") setSource(val);
          if (key === "status") setStatus(val);
          if (key === "from")   setFrom(val);
          if (key === "to")     setTo(val);
        }}
        onApply={() => fetchData()}
        onClear={clearFilters}
        isDark={isDark}
      />

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      <ModalVentaDetalle
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        source={selected?.source}
        id={selected?.id}
        onChanged={() => fetchData()}
      />
    </Box>
  );
}