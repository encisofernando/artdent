// src/scenes/articulos/index.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Box, Stack, Button, IconButton, TextField, InputAdornment,
  Chip, Typography, Dialog, useMediaQuery, useTheme,
  Card, CardContent, Menu, MenuItem, ListItemIcon,
  Skeleton, Grid, Tooltip, Divider, CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon            from "@mui/icons-material/Search";
import AddIcon               from "@mui/icons-material/Add";
import EditIcon              from "@mui/icons-material/Edit";
import MoreVertIcon          from "@mui/icons-material/MoreVert";
import PowerSettingsNewIcon  from "@mui/icons-material/PowerSettingsNew";
import GridViewIcon          from "@mui/icons-material/GridView";
import ViewListIcon          from "@mui/icons-material/ViewList";
import ImageIcon             from "@mui/icons-material/Image";
import InventoryIcon         from "@mui/icons-material/Inventory2Outlined";

import * as Products    from "../../services/productService";
import CrearArticulo    from "./CrearArticulo";
import EditarArticulo   from "./EditarArticulo";

/* ─── Brand ─── */
const B = {
  blue:    "#397B9C",
  green:   "#5AAD9C",
  teal:    "#49949C",
  mint:    "#ACD6CE",
  blueSoft:"#7CA5C3",
};

/* ─── Productos por página ─── */
const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: "all",      label: "Todos"     },
  { value: "active",   label: "Activos"   },
  { value: "inactive", label: "Inactivos" },
];

/* ══════════════════════════════════════════════
   SKELETON CARD
   ══════════════════════════════════════════════ */
function ProductSkeleton({ isList, isDark }) {
  const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  return (
    <Card elevation={0} sx={{
      borderRadius: "12px",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
      bgcolor: isDark ? "#172A36" : "#fff",
      overflow: "hidden",
      display: "flex",
      flexDirection: isList ? { xs: "column", sm: "row" } : "column",
    }}>
      <Skeleton variant="rectangular" sx={{
        height: isList ? { xs: 160, sm: 130 } : { xs: 160, sm: 180 },
        width:  isList ? { xs: "100%", sm: 200 } : "100%",
        flexShrink: 0, bgcolor: bg,
      }} />
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Skeleton variant="text" width="30%" height={16} sx={{ bgcolor: bg, mb: 0.5 }} />
        <Skeleton variant="text" width="85%" height={20} sx={{ bgcolor: bg, mb: 0.5 }} />
        <Skeleton variant="text" width="55%" height={20} sx={{ bgcolor: bg, mb: 1.5 }} />
        <Skeleton variant="text" width="40%" height={28} sx={{ bgcolor: bg }} />
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════════
   PRODUCT CARD
   ══════════════════════════════════════════════ */
function ProductCard({ product, viewMode, onEdit, onToggleActive, isDark }) {
  const theme  = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const isList = viewMode === "list";
  const [anchorEl, setAnchorEl] = useState(null);

  const imageUrl = product.ImagenUrl || product.image_url || null;
  const price    = Number(product.PrecioPublico || product.price || 0);
  const stock    = Number(product.Stock || product.stock || 0);
  const isActive = Boolean(product.Activo ?? product.is_active ?? true);

  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";

  return (
    <Card elevation={0} sx={{
      height: "100%",
      display: "flex",
      flexDirection: isList ? { xs: "column", sm: "row" } : "column",
      position: "relative",
      borderRadius: "12px",
      border: `1px solid ${borderCol}`,
      bgcolor: isDark ? "#172A36" : "#fff",
      overflow: "hidden",
      transition: "box-shadow .18s, transform .18s",
      "&:hover": {
        transform: smDown ? "none" : "translateY(-2px)",
        boxShadow: isDark ? "0 8px 28px rgba(0,0,0,.32)" : "0 8px 24px rgba(0,0,0,.09)",
      },
    }}>
      {/* Inactive overlay */}
      {!isActive && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 3,
          bgcolor: "rgba(0,0,0,0.65)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 1.5, p: 2,
        }}>
          <Chip label="INACTIVO" size="small" sx={{
            bgcolor: alpha("#E63946", 0.2), color: "#E63946",
            border: `1px solid ${alpha("#E63946", 0.4)}`,
            fontWeight: 700, fontSize: 11, letterSpacing: "0.06em",
          }} />
          <Button variant="contained" size="small"
            startIcon={<PowerSettingsNewIcon sx={{ fontSize: "15px !important" }} />}
            onClick={(e) => { e.stopPropagation(); onToggleActive(product); }}
            sx={{
              background: `linear-gradient(90deg, ${B.green}, ${B.teal})`,
              color: "#fff", fontWeight: 700, fontSize: 12,
              textTransform: "none", borderRadius: "8px",
              boxShadow: `0 4px 12px ${alpha(B.green, 0.4)}`,
            }}
          >
            Activar
          </Button>
        </Box>
      )}

      {/* Image */}
      <Box sx={{
        position: "relative",
        bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        height: isList ? { xs: 160, sm: "auto" } : { xs: 160, sm: 180 },
        width:  isList ? { xs: "100%", sm: 200 } : "100%",
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {imageUrl
          ? <img src={imageUrl} alt={product.Nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <ImageIcon sx={{ fontSize: 44, color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }} />
        }
        <IconButton size="small"
          onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
          sx={{
            position: "absolute", top: 8, right: 8, zIndex: 4,
            width: 28, height: 28,
            bgcolor: isDark ? "rgba(15,31,42,0.85)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(4px)",
            "&:hover": { bgcolor: isDark ? "rgba(15,31,42,1)" : "#fff" },
            border: `1px solid ${borderCol}`,
          }}
        >
          <MoreVertIcon sx={{ fontSize: 16, color: textCol }} />
        </IconButton>
        <Box sx={{
          position: "absolute", bottom: 8, left: 8, zIndex: 4,
          px: 1, py: 0.25, borderRadius: "6px",
          bgcolor: stock > 0 ? alpha(B.green, isDark ? 0.2 : 0.12) : alpha("#E63946", isDark ? 0.2 : 0.1),
          border: `1px solid ${stock > 0 ? alpha(B.green, 0.3) : alpha("#E63946", 0.3)}`,
        }}>
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: stock > 0 ? B.green : "#E63946", fontFamily: "Montserrat, sans-serif" }}>
            Stock: {stock}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, minWidth: 0, p: "14px !important" }}>
        <Typography sx={{ fontSize: 10.5, color: mutedCol, fontWeight: 600, letterSpacing: "0.04em", mb: 0.5 }}>
          {product.Codigo || product.sku || "—"}
        </Typography>
        <Typography sx={{
          fontSize: 13.5, fontWeight: 700, color: textCol, mb: 1.25, lineHeight: 1.3,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          minHeight: "2.6em",
        }}>
          {product.Nombre || product.name}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.75} mb={1.25}>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: B.blue, letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif" }}>
            ${price.toLocaleString("es-AR")}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: mutedCol }}>
            + IVA {product.Iva || product.tax_rate || 0}%
          </Typography>
        </Stack>
        {isActive && (
          <Box sx={{
            display: "inline-flex", alignItems: "center",
            px: 0.75, py: 0.2, borderRadius: "5px",
            bgcolor: alpha(B.green, isDark ? 0.15 : 0.08),
            border: `1px solid ${alpha(B.green, 0.25)}`,
          }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: B.green, letterSpacing: "0.05em" }}>
              ACTIVO
            </Typography>
          </Box>
        )}
      </CardContent>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            bgcolor: isDark ? "#172A36" : "#fff",
            border: `1px solid ${borderCol}`,
            borderRadius: "10px", minWidth: 190,
            boxShadow: isDark ? "0 12px 32px rgba(0,0,0,.45)" : "0 12px 28px rgba(0,0,0,.15)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(product); }}
          sx={{ mx: 0.75, borderRadius: "7px", py: 1, fontSize: 13, fontWeight: 600, color: textCol, "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" } }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: B.blue }}><EditIcon sx={{ fontSize: 17 }} /></ListItemIcon>
          Editar producto
        </MenuItem>
        <Divider sx={{ borderColor: borderCol, mx: 1 }} />
        <MenuItem onClick={() => { setAnchorEl(null); onToggleActive(product); }}
          sx={{ mx: 0.75, borderRadius: "7px", py: 1, fontSize: 13, fontWeight: 600, color: isActive ? "#E63946" : B.green, "&:hover": { bgcolor: isActive ? alpha("#E63946", 0.06) : alpha(B.green, 0.06) } }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><PowerSettingsNewIcon sx={{ fontSize: 17 }} /></ListItemIcon>
          {isActive ? "Desactivar" : "Activar"}
        </MenuItem>
      </Menu>
    </Card>
  );
}

/* ══════════════════════════════════════════════
   HOOK — INFINITE SCROLL
   ══════════════════════════════════════════════ */
function useInfiniteProducts({ q, filterStatus }) {
  const [items, setItems]             = useState([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loading, setLoading]         = useState(true);    // primera carga → skeleton completo
  const [loadingMore, setLoadingMore] = useState(false);   // páginas siguientes → spinner
  const [total, setTotal]             = useState(null);    // total real del backend (si lo devuelve)

  // Cuando cambia búsqueda o filtro → reset
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setTotal(null);
  }, [q, filterStatus]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (page === 1) setLoading(true);
      else            setLoadingMore(true);

      try {
        const params = { q, page, per_page: PAGE_SIZE };
        if (filterStatus === "active")   params.is_active = true;
        if (filterStatus === "inactive") params.is_active = false;

        const res = await Products.listProducts(params);
        if (cancelled) return;

        /*
         * Compatibilidad con las tres respuestas más comunes del backend:
         *
         *  A) Array plano        → [{ ... }, ...]
         *  B) Laravel paginator  → { data: [], total, last_page }
         *  C) Meta wrapper       → { data: [], meta: { total, last_page } }
         */
        let newItems  = [];
        let morePages = false;

        if (Array.isArray(res)) {
          newItems  = res;
          morePages = res.length >= PAGE_SIZE;
        } else {
          const data     = res.data            ?? [];
          const lastPage = res.last_page        ?? res.meta?.last_page ?? null;
          const tot      = res.total            ?? res.meta?.total     ?? null;

          newItems  = data;
          morePages = lastPage ? page < lastPage : data.length >= PAGE_SIZE;
          if (tot !== null) setTotal(tot);
        }

        setItems((prev) => page === 1 ? newItems : [...prev, ...newItems]);
        setHasMore(morePages);
      } catch (e) {
        console.error(e);
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [q, filterStatus, page]);

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore) setPage((p) => p + 1);
  }, [loadingMore, loading, hasMore]);

  return { items, loading, loadingMore, hasMore, total, loadMore };
}

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */
export default function ArticulosIndex() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [q, setQ]                       = useState("");
  const [viewMode, setViewMode]         = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openCrear, setOpenCrear]       = useState(false);
  const [openEditar, setOpenEditar]     = useState(false);
  const [editRow, setEditRow]           = useState(null);

  const { items, loading, loadingMore, hasMore, total, loadMore } =
    useInfiniteProducts({ q, filterStatus });

  /* ── Sentinel para IntersectionObserver ── */
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "300px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const surfaceBg = isDark ? "#172A36" : "#fff";

  useEffect(() => { if (smDown) setViewMode("grid"); }, [smDown]);

  // Después de crear/editar/toggle → re-trigger forzando el reset del hook
  const refresh = useCallback(() => setFilterStatus((s) => {
    // Truco: si setFilterStatus recibe el mismo valor, React no re-renderiza,
    // así que usamos un estado separado de "version" para forzar el reset.
    return s;
  }), []);

  // Estado auxiliar para forzar refresh sin cambiar el filtro visible
  const [refreshKey, setRefreshKey] = useState(0);
  const forceRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const { items: allItems, loading: allLoading, loadingMore: allLoadingMore,
          hasMore: allHasMore, total: allTotal, loadMore: allLoadMore } =
    useInfiniteProducts({ q, filterStatus, _key: refreshKey });

  const handleToggleActivo = async (row) => {
    try {
      await Products.toggleProductActive(row.idArticulo || row.id);
      forceRefresh();
    } catch (e) { console.error(e); }
  };

  const gridCols = useMemo(() => ({
    xs: 12, sm: 6,
    md: viewMode === "grid" ? 4 : 12,
    lg: viewMode === "grid" ? 3 : 12,
  }), [viewMode]);

  const countLabel = allTotal !== null
    ? `${allItems.length} de ${allTotal}`
    : `${allItems.length} producto${allItems.length !== 1 ? "s" : ""}`;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>

      {/* ── Header ── */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} spacing={1.5} mb={3}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: textCol, letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif", lineHeight: 1.2 }}>
            Productos
          </Typography>
          <Typography sx={{ fontSize: 13, color: mutedCol, mt: 0.4 }}>
            Gestión del catálogo de artículos
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: "17px !important" }} />}
          onClick={() => setOpenCrear(true)} fullWidth={smDown}
          sx={{
            background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
            color: "#fff", fontFamily: "Montserrat, sans-serif",
            fontWeight: 700, fontSize: 13, textTransform: "none",
            px: 2, py: 1, borderRadius: "10px",
            boxShadow: `0 4px 14px ${alpha(B.blue, 0.35)}`,
            "&:hover": { background: `linear-gradient(90deg, ${B.teal}, ${B.green})`, boxShadow: `0 4px 18px ${alpha(B.green, 0.4)}` },
            whiteSpace: "nowrap",
          }}
        >
          Nuevo Producto
        </Button>
      </Stack>

      {/* ── Controls ── */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} mb={2.5}>
        <TextField
          placeholder="Buscar por nombre, SKU o código de barras..."
          value={q} onChange={(e) => setQ(e.target.value)}
          fullWidth size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: mutedCol }} /></InputAdornment> }}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: surfaceBg, fontSize: 13.5 } }}
        />

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {/* Status filter */}
          <Stack direction="row" sx={{ borderRadius: "10px", border: `1px solid ${borderCol}`, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", p: 0.35, gap: 0.2 }}>
            {STATUS_TABS.map(({ value, label }) => (
              <Box key={value} onClick={() => setFilterStatus(value)} sx={{
                px: 1.25, py: 0.55, borderRadius: "7px",
                fontSize: 12.5, fontWeight: filterStatus === value ? 700 : 500,
                fontFamily: "Montserrat, sans-serif", cursor: "pointer", userSelect: "none",
                background: filterStatus === value ? `linear-gradient(90deg, ${B.blue}, ${B.teal})` : "transparent",
                color: filterStatus === value ? "#fff" : mutedCol,
                transition: "all .15s",
                "&:hover": { color: filterStatus === value ? "#fff" : textCol, bgcolor: filterStatus === value ? undefined : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" },
              }}>
                {label}
              </Box>
            ))}
          </Stack>

          {/* View toggle */}
          {!smDown && (
            <Stack direction="row" sx={{ borderRadius: "10px", border: `1px solid ${borderCol}`, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", p: 0.35, gap: 0.2 }}>
              {[{ value: "grid", Icon: GridViewIcon, label: "Grilla" }, { value: "list", Icon: ViewListIcon, label: "Lista" }].map(({ value, Icon, label }) => (
                <Tooltip key={value} title={label} arrow>
                  <Box onClick={() => setViewMode(value)} sx={{
                    width: 30, height: 30, borderRadius: "7px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    background: viewMode === value ? `linear-gradient(90deg, ${B.blue}, ${B.teal})` : "transparent",
                    color: viewMode === value ? "#fff" : mutedCol, transition: "all .15s",
                    "&:hover": { color: viewMode === value ? "#fff" : textCol, bgcolor: viewMode === value ? undefined : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" },
                  }}>
                    <Icon sx={{ fontSize: 17 }} />
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          )}

          {/* Counter */}
          {!allLoading && allItems.length > 0 && (
            <Box sx={{ px: 1.25, py: 0.5, borderRadius: "8px", bgcolor: alpha(B.blue, isDark ? 0.18 : 0.1), border: `1px solid ${alpha(B.blue, 0.25)}` }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: B.blue }}>
                {countLabel}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>

      {/* ── Grid / Content ── */}
      {allLoading ? (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {Array.from({ length: smDown ? 4 : 8 }).map((_, i) => (
            <Grid item {...gridCols} key={i}>
              <ProductSkeleton isList={viewMode === "list"} isDark={isDark} />
            </Grid>
          ))}
        </Grid>
      ) : allItems.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, px: 2, textAlign: "center" }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "18px", mb: 2.5, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${borderCol}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <InventoryIcon sx={{ fontSize: 32, color: mutedCol }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: textCol, mb: 0.75 }}>
            {q ? "Sin resultados" : "No hay productos"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: mutedCol, mb: 3 }}>
            {q ? "Probá con otros términos de búsqueda" : "Comenzá creando tu primer artículo"}
          </Typography>
          {!q && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCrear(true)}
              sx={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`, color: "#fff", fontWeight: 700, textTransform: "none", borderRadius: "10px", px: 2.5 }}
            >
              Crear Producto
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {allItems.map((product) => (
              <Grid item {...gridCols} key={product.idArticulo || product.id}>
                <ProductCard
                  product={product}
                  viewMode={smDown ? "grid" : viewMode}
                  isDark={isDark}
                  onEdit={(p) => { setEditRow(p); setOpenEditar(true); }}
                  onToggleActive={handleToggleActivo}
                />
              </Grid>
            ))}

            {/* Skeletons inline mientras carga la siguiente página */}
            {allLoadingMore && Array.from({ length: smDown ? 2 : 4 }).map((_, i) => (
              <Grid item {...gridCols} key={`sk-more-${i}`}>
                <ProductSkeleton isList={viewMode === "list"} isDark={isDark} />
              </Grid>
            ))}
          </Grid>

          {/* ─ Sentinel invisible — dispara el observer ─ */}
          <Box ref={sentinelRef} sx={{ height: 1, mt: 1 }} />

          {/* Spinner de carga */}
          {allLoadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5, py: 2.5 }}>
              <CircularProgress size={18} sx={{ color: B.blue }} />
              <Typography sx={{ fontSize: 12.5, color: mutedCol, fontWeight: 600 }}>
                Cargando más productos...
              </Typography>
            </Box>
          )}

          {/* Fin del catálogo */}
          {!allHasMore && allItems.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 2.5, py: 1, borderRadius: "20px",
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${borderCol}`,
              }}>
                <Box sx={{ width: 24, height: 1, bgcolor: borderCol }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: mutedCol }}>
                  {allTotal !== null
                    ? `${allTotal} producto${allTotal !== 1 ? "s" : ""} en total`
                    : "No hay más productos"}
                </Typography>
                <Box sx={{ width: 24, height: 1, bgcolor: borderCol }} />
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ── Dialogs ── */}
      <Dialog open={openCrear} onClose={() => setOpenCrear(false)}
        fullWidth maxWidth="md" fullScreen={mdDown}
        PaperProps={{ elevation: 0, sx: { borderRadius: mdDown ? 0 : "16px", bgcolor: isDark ? "#0F1F2A" : "#F7FAFC", border: mdDown ? "none" : `1px solid ${borderCol}` } }}
      >
        <CrearArticulo
          onClose={() => setOpenCrear(false)}
          onArticuloCreado={() => { setOpenCrear(false); forceRefresh(); }}
        />
      </Dialog>

      <Dialog open={openEditar} onClose={() => setOpenEditar(false)}
        fullWidth maxWidth="md" fullScreen={mdDown}
        PaperProps={{ elevation: 0, sx: { borderRadius: mdDown ? 0 : "16px", bgcolor: isDark ? "#0F1F2A" : "#F7FAFC", border: mdDown ? "none" : `1px solid ${borderCol}` } }}
      >
        <EditarArticulo
          onClose={() => { setOpenEditar(false); setEditRow(null); }}
          articuloEditando={editRow}
          onArticuloEditado={() => { setOpenEditar(false); setEditRow(null); forceRefresh(); }}
        />
      </Dialog>
    </Box>
  );
}