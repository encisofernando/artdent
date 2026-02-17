import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Divider,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  useMediaQuery,
  useTheme,
  MenuItem,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Avatar,
  Alert,
  Collapse,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { useSidebarContext } from "../../contexts/SidebarContext";
import { listSalesHub } from "../../services/salesHubService";
import ModalVentaDetalle from "../../components/modals/ModalVentaDetalle";

const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

const money = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const normalizeListResponse = (r) => {
  if (Array.isArray(r)) return { rows: r, meta: null };
  if (Array.isArray(r?.data)) return { rows: r.data, meta: r.meta || null };
  if (Array.isArray(r?.data?.data)) return { rows: r.data.data, meta: r.data.meta || null };
  return { rows: [], meta: null };
};

// ====== TARJETA DE ESTADÍSTICA ======
const StatCard = ({ title, value, icon: Icon, color = "primary", trend, subtitle }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}.50 0%, ${color}.100 100%)`,
      borderLeft: 4,
      borderColor: `${color}.main`,
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      },
    }}
  >
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={`${color}.main`} gutterBottom>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 56,
            height: 56,
          }}
        >
          <Icon sx={{ fontSize: 32 }} />
        </Avatar>
      </Stack>
      {trend && (
        <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
          {trend > 0 ? (
            <TrendingUpIcon fontSize="small" color="success" />
          ) : (
            <TrendingDownIcon fontSize="small" color="error" />
          )}
          <Typography
            variant="caption"
            color={trend > 0 ? 'success.main' : 'error.main'}
            fontWeight={600}
          >
            {trend > 0 ? '+' : ''}{trend}% vs mes anterior
          </Typography>
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default function VentasControlIndex() {
  const theme = useTheme();
  const appbarH = TOPBAR_HEIGHT(theme);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  // Sidebar width
// Obtener ancho del sidebar desde el contexto
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

  // Estados
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      try {
        const rawParams = {
          source: overrides.source ?? source,
          status: overrides.status ?? status,
          search: overrides.search ?? search,
          from: overrides.from ?? from,
          to: overrides.to ?? to,
          per_page: 50,
        };

        const params = Object.fromEntries(
          Object.entries(rawParams).filter(([_, v]) => v !== undefined && v !== null && v !== "")
        );

        const r = await listSalesHub(params);
        const n = normalizeListResponse(r);

        setRows(n.rows);
        setMeta(n.meta);
      } catch (e) {
        console.error(e);
        setRows([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    [source, status, search, from, to]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = rows.reduce((sum, r) => sum + Number(r?.totals?.total || r?.total || 0), 0);
    const paid = rows.reduce((sum, r) => sum + Number(r?.totals?.paid || r?.paid_total || 0), 0);
    const due = rows.reduce((sum, r) => sum + Number(r?.totals?.due || r?.due_total || 0), 0);
    const count = rows.length;
    const avgTicket = count > 0 ? total / count : 0;

    return { total, paid, due, count, avgTicket };
  }, [rows]);

  const columns = useMemo(() => {
    const statusChip = (value) => {
      const v = String(value || "").toLowerCase();

      const map = {
        cancelled: { label: "Anulada", color: "error" },
        invoiced: { label: "Facturada", color: "success" },
        confirmed: { label: "Confirmada", color: "info" },
        draft: { label: "Borrador", color: "warning" },
        paid: { label: "Pagada", color: "success" },
        partial: { label: "Parcial", color: "warning" },
        shipped: { label: "Enviada", color: "info" },
        delivered: { label: "Entregada", color: "success" },
      };

      const cfg = map[v] || { label: value || "—", color: "default" };
      return <Chip size="small" label={cfg.label} color={cfg.color} variant="outlined" />;
    };

    return [
      {
        field: "actions",
        headerName: "",
        width: 80,
        sortable: false,
        renderCell: ({ row }) => (
          <Tooltip title="Ver detalle">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelected({ source: row.source, id: row.rawId });
                setOpenDetail(true);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        field: "source",
        headerName: "Origen",
        width: 100,
        sortable: false,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={String(value).toLowerCase() === "ecom" ? "Online" : "POS"}
            color={String(value).toLowerCase() === "ecom" ? "secondary" : "primary"}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        field: "number",
        headerName: "Comprobante",
        width: 180,
        valueGetter: (p) => p.row?.number ?? p.row?.code ?? "",
        renderCell: ({ value }) => (
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {value}
          </Typography>
        ),
      },
      {
        field: "date",
        headerName: "Fecha",
        width: 180,
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString("es-AR") : ""),
      },
      {
        field: "customer",
        headerName: "Cliente",
        flex: 1,
        minWidth: 200,
        valueGetter: (p) => p.row?.customer?.name ?? "Consumidor Final",
        renderCell: ({ value }) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {value?.charAt(0)?.toUpperCase() || 'C'}
            </Avatar>
            <Typography variant="body2" color="text.primary">{value}</Typography>
          </Stack>
        ),
      },
      {
        field: "total",
        headerName: "Total",
        width: 140,
        valueGetter: (p) => p.row?.totals?.total ?? p.row?.total ?? 0,
        renderCell: (p) => (
          <Typography color="primary" fontWeight={700}>
            {money(p.value)}
          </Typography>
        ),
      },
      {
        field: "paid_total",
        headerName: "Pagado",
        width: 140,
        valueGetter: (p) => p.row?.totals?.paid ?? p.row?.paid_total ?? 0,
        renderCell: (p) => (
          <Typography color="success.main" fontWeight={600}>
            {money(p.value)}
          </Typography>
        ),
      },
      {
        field: "due_total",
        headerName: "Saldo",
        width: 140,
        valueGetter: (p) => p.row?.totals?.due ?? p.row?.due_total ?? 0,
        renderCell: (p) => (
          <Typography
            color={Number(p.value || 0) > 0 ? "error.main" : "text.secondary"}
            fontWeight={Number(p.value || 0) > 0 ? 700 : 400}
          >
            {money(p.value)}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Estado",
        width: 130,
        renderCell: (p) => statusChip(p.value),
      },
      {
        field: "items_count",
        headerName: "Items",
        width: 80,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (p) => p.row?.items_count ?? p.row?.items?.length ?? 0,
        renderCell: ({ value }) => (
          <Chip
            label={value}
            size="small"
            variant="outlined"
            color="default"
          />
        ),
      },
    ];
  }, []);

  const hasActiveFilters = useMemo(
    () => source || status || search || from || to,
    [source, status, search, from, to]
  );

  const clearFilters = () => {
    setSource("");
    setStatus("");
    setSearch("");
    setFrom("");
    setTo("");
    fetchData({ source: "", status: "", search: "", from: "", to: "" });
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
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 2,
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          gap={2}
          mb={3}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ReceiptIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Control de Ventas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestión centralizada POS y E-commerce
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" gap={1} alignItems="center">
            <Tooltip title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}>
              <IconButton
                color={showFilters ? "primary" : "default"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchData()}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              disabled={rows.length === 0}
            >
              Exportar
            </Button>
          </Stack>
        </Stack>

        {/* Estadísticas */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Ventas"
              value={stats.count}
              icon={CartIcon}
              color="primary"
              subtitle={`${stats.count} operaciones`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Facturado"
              value={money(stats.total)}
              icon={MoneyIcon}
              color="success"
              subtitle="Total del período"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cobrado"
              value={money(stats.paid)}
              icon={TrendingUpIcon}
              color="info"
              subtitle={`${((stats.paid / stats.total) * 100 || 0).toFixed(1)}% del total`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Ticket Promedio"
              value={money(stats.avgTicket)}
              icon={ReceiptIcon}
              color="warning"
              subtitle="Por operación"
            />
          </Grid>
        </Grid>

        {/* Filtros Colapsables */}
        <Collapse in={showFilters}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: 'background.default',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>
                  Filtros de Búsqueda
                </Typography>
                {hasActiveFilters && (
                  <Button size="small" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="center">
                <TextField
                  select
                  size="small"
                  label="Origen"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="pos">POS</MenuItem>
                  <MenuItem value="ecom">Online</MenuItem>
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Estado"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="draft">Borrador</MenuItem>
                  <MenuItem value="confirmed">Confirmada</MenuItem>
                  <MenuItem value="invoiced">Facturada</MenuItem>
                  <MenuItem value="paid">Pagada</MenuItem>
                  <MenuItem value="cancelled">Anulada</MenuItem>
                </TextField>

                <TextField
                  placeholder="Buscar por comprobante, cliente, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: { sm: 360 },
                    ".MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />

                <TextField
                  size="small"
                  type="date"
                  label="Desde"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />

                <TextField
                  size="small"
                  type="date"
                  label="Hasta"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />

                <Button
                  variant="contained"
                  onClick={() => fetchData()}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Aplicar
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Collapse>

        {/* Alerta de filtros activos */}
        {hasActiveFilters && !showFilters && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={clearFilters}>
                Limpiar
              </Button>
            }
          >
            Hay filtros activos aplicados
          </Alert>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Tabla */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            "&::-webkit-scrollbar": { width: 8, height: 8 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.300",
              borderRadius: 4,
              "&:hover": { bgcolor: "grey.400" },
            },
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              height: "100%",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
            }}
          >
            <DataGrid
              rows={rows.map((r) => ({
                ...r,
                gridId: `${r.source}-${r.id}`,
                rawId: r.id,
              }))}
              columns={columns}
              getRowId={(r) => r.gridId}
              loading={loading}
              disableRowSelectionOnClick
              onRowDoubleClick={(p) => {
                setSelected({ source: p.row.source, id: p.row.rawId });
                setOpenDetail(true);
              }}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 50, page: 0 } },
              }}
              sx={{
                border: "none",

                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                  borderBottom: 2,
                  borderColor: "divider",
                  minHeight: 56,
                  maxHeight: 56,
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 700,
                  fontSize: 14,
                  color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
                },

                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  py: 1.5,
                  color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
                },
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
                  "&:hover": {
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'action.hover',
                  },
                  "&:nth-of-type(even)": {
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                    "&:hover": {
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'action.hover',
                    },
                  },
                },

                "& .MuiDataGrid-footerContainer": {
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                  borderTop: 2,
                  borderColor: "divider",
                  minHeight: 56,
                  color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
                },

                "& .MuiDataGrid-iconSeparator": {
                  display: "none",
                },

                "& .MuiDataGrid-virtualScroller": {
                  minHeight: 200,
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
                },

                "& .MuiTablePagination-root": {
                  color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
                },

                "& .MuiDataGrid-overlay": {
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
                },
              }}
            />
          </Paper>
        </Box>

        <ModalVentaDetalle
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          source={selected?.source}
          id={selected?.id}
          onChanged={() => fetchData()}
        />
      </Paper>
    </Box>
  );
}
