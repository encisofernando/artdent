import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import TableChartIcon from "@mui/icons-material/TableChart";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import dayjs from "dayjs";
import "dayjs/locale/es";
// si ya existe en tu proyecto, importa desde tu theme real
import { tokens } from "../../theme.js";

const TOPBAR_HEIGHT = (theme) =>
  (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

dayjs.locale("es");

const toCurrency = (n, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(Number(n || 0));
const fmtDate = (iso) => (iso ? dayjs(iso).format("YYYY-MM-DD") : "");

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const COMPANY_ID = 2;

function SectionCard({ title, action, children }) {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${c.blueAccent[100]}` }}>
      <CardHeader sx={{ pb: 0 }} title={<Typography variant="h6" sx={{ color: c.brand.primaryBlue, fontWeight: 700 }}>{title}</Typography>} action={action} />
      <CardContent sx={{ pt: 2 }}>{children}</CardContent>
    </Card>
  );
}

export default function PagosProveedoresListado() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);

  const [sidebarW, setSidebarW] = useState(0);
  const appbarH = TOPBAR_HEIGHT(theme);
  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) { setSidebarW(0); return; }
    const setW = () => setSidebarW(sideBox.offsetWidth || 0);
    setW();
    const ro = new ResizeObserver(setW);
    ro.observe(sideBox);
    window.addEventListener("resize", setW);
    return () => { ro.disconnect(); window.removeEventListener("resize", setW); };
  }, []);

  // Filtros
  const [proveedorId, setProveedorId] = useState("");
  const [desde, setDesde] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [hasta, setHasta] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));
  const [moneda, setMoneda] = useState("ARS");
  const [q, setQ] = useState("");

  // Datos
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => rows.reduce((a, r) => a + (r.total || 0), 0), [rows]);

  const fetchPagos = useCallback(async () => {
    setLoading(true);
    try {
      // endpoint sugerido — ajustá a tu backend real (p.ej. /supplier-payments)
      const url = new URL(`${API_BASE}/supplier-payments`);
      url.searchParams.set("company_id", COMPANY_ID);
      if (proveedorId) url.searchParams.set("supplier_id", proveedorId);
      if (desde) url.searchParams.set("date_from", `${desde} 00:00:00`);
      if (hasta) url.searchParams.set("date_to", `${hasta} 23:59:59`);
      if (q) url.searchParams.set("q", q);
      const res = await fetch(url);
      const json = await res.json();
      const data = (json?.data || []).map((p) => ({
        id: p.id,
        proveedor: p.vendor?.name || p.supplier?.name || p.proveedor || "-",
        tPago: p.payment_type?.name || p.tipo_pago || "-",
        origen: p.origin?.name || p.origen || "-",
        fecha: p.date || p.fecha,
        importe: Number(p.amount || 0),
        nroCheque: p.check_number || p.nro_cheque || "",
        impCheque: Number(p.check_amount || p.imp_cheque || 0),
        total: Number(p.total || p.amount || 0),
        descripcion: p.notes || p.descripcion || "",
        cuenta: p.account?.name || p.cuenta || "-",
        usuario: p.user?.name || p.usuario || "-",
      }));
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [proveedorId, desde, hasta, q]);

  useEffect(() => { fetchPagos(); }, []);

  const columns = [
    { field: "proveedor", headerName: "Proveedor", flex: 1.2, minWidth: 200 },
    { field: "tPago", headerName: "T.Pago", flex: 0.7, minWidth: 100 },
    { field: "origen", headerName: "Origen", flex: 0.8, minWidth: 110 },
    { field: "fecha", headerName: "Fecha", flex: 0.7, minWidth: 110, valueFormatter: ({ value }) => fmtDate(value) },
    { field: "importe", headerName: "Importe", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => toCurrency(value, moneda) },
    { field: "nroCheque", headerName: "Nro.Cheque", flex: 0.8, minWidth: 120 },
    { field: "impCheque", headerName: "Imp.Cheque", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => toCurrency(value, moneda) },
    { field: "total", headerName: "Total", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => toCurrency(value, moneda) },
    { field: "descripcion", headerName: "Descripción", flex: 1.2, minWidth: 180 },
    { field: "opcion", headerName: "Opción", flex: 0.6, minWidth: 100, sortable: false, renderCell: (p) => (
      <Tooltip title="Ver">
        <IconButton size="small" onClick={() => console.log("ver", p.row)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )},
    { field: "cuenta", headerName: "Cuenta", flex: 0.8, minWidth: 120 },
    { field: "usuario", headerName: "Usuario", flex: 0.8, minWidth: 120 },
  ];

  const reset = () => {
    setProveedorId("");
    setDesde(dayjs().startOf("month").format("YYYY-MM-DD"));
    setHasta(dayjs().endOf("month").format("YYYY-MM-DD"));
    setMoneda("ARS");
    setQ("");
    fetchPagos();
  };

  return (
    <Box sx={{ position: "fixed", top: appbarH, left: sidebarW, right: 0, bottom: 0, display: "flex", flexDirection: "column", gap: 2, p: 2, overflow: "hidden" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>Pagos a Proveedores</Typography>
        <Button variant="contained" color="success" startIcon={<AddCircleIcon />}>Nuevo Pago Proveedor</Button>
      </Stack>

      <SectionCard title="Filtros">
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" select label="Proveedor" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
              <MenuItem value="">seleccione…</MenuItem>
              <MenuItem value="1">Proveedor 1</MenuItem>
              <MenuItem value="2">Proveedor 2</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField fullWidth size="small" type="date" label="Fecha desde" value={desde} onChange={(e) => setDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField fullWidth size="small" type="date" label="Fecha hasta" value={hasta} onChange={(e) => setHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" select label="Moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
              <MenuItem value="ARS">$ Local</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="Total" value={toCurrency(total, moneda)} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} md={9}>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<FileCopyIcon />} variant="outlined">Copy</Button>
              <Button startIcon={<TableChartIcon />} variant="outlined">Excel</Button>
              <Button startIcon={<DownloadIcon />} variant="outlined">CSV</Button>
              <Button startIcon={<PictureAsPdfIcon />} variant="outlined">PDF</Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon fontSize="small" /></InputAdornment> }} />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={fetchPagos}>Buscar</Button>
              <Button variant="contained" color="warning" startIcon={<RefreshIcon />} onClick={reset}>Mostrar Todo</Button>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      <Paper variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${c.blueAccent[100]}`, p: 2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Resultados</Typography>
          <TextField size="small" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} sx={{ width: 260 }} />
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            density="compact"
            hideFooterSelectedRowCount
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 2,
              border: `1px solid ${c.blueAccent[100]}`,
              "& .MuiDataGrid-virtualScroller": { overflowY: "auto", overflowX: "hidden" },
              "& .MuiDataGrid-main": { overflow: "hidden" },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" startIcon={<FileCopyIcon />}>Copy</Button>
          <Button size="small" variant="outlined" startIcon={<TableChartIcon />}>Excel</Button>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>CSV</Button>
          <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}>PDF</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
