import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import "dayjs/locale/es";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCardIcon from "@mui/icons-material/AddCard";
import CloseIcon from "@mui/icons-material/Close";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import TableChartIcon from "@mui/icons-material/TableChart";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LaunchIcon from "@mui/icons-material/Launch";
import { tokens } from "../../theme.js";

dayjs.locale("es");

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const COMPANY_ID = 2;
const TOPBAR_HEIGHT = (theme) => (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

const toCurrency = (n, currency = "ARS") => new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(Number(n || 0));
const fmtDate = (iso) => (iso ? dayjs(iso).format("YYYY-MM-DD") : "");

function SectionCard({ title, children, action }) {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${c.blueAccent[100]}` }}>
      <CardHeader sx={{ pb: 0 }} title={<Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>} action={action} />
      <CardContent sx={{ pt: 2 }}>{children}</CardContent>
    </Card>
  );
}

export default function ResumenCtaProveedor() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);

  // Ajuste de layout (topbar + sidebar)
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

  // ====== Filtros ======
  const [proveedorId, setProveedorId] = useState("");
  const [desde, setDesde] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [hasta, setHasta] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));
  const [moneda, setMoneda] = useState("ARS");
  const [q, setQ] = useState("");

  // ====== Datos ======
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Totales resumen
  const sumaComprobantes = useMemo(() => rows.reduce((a, r) => a + (r.haber || 0), 0), [rows]);
  const sumaPagos = useMemo(() => rows.reduce((a, r) => a + (r.debe || 0), 0), [rows]);
  const saldoAnterior = 0; // calcular desde API si aplica
  const saldoActual = saldoAnterior + sumaComprobantes - sumaPagos;

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      // endpoint sugerido — ajustá a tu backend real (p.ej. /supplier-account/summary)
      const url = new URL(`${API_BASE}/supplier-account/summary`);
      url.searchParams.set("company_id", COMPANY_ID);
      if (proveedorId) url.searchParams.set("supplier_id", proveedorId);
      if (desde) url.searchParams.set("date_from", `${desde} 00:00:00`);
      if (hasta) url.searchParams.set("date_to", `${hasta} 23:59:59`);
      if (q) url.searchParams.set("q", q);
      const res = await fetch(url);
      const json = await res.json();
      const data = (json?.data || []).map((it, idx) => ({
        id: it.id || idx + 1,
        fecha: it.date || it.fecha,
        tipo: it.type || it.tipo || "-",
        fPago: it.payment_type?.name || it.f_pago || "-",
        comprobante: it.voucher || it.comprobante || "-",
        entrada: Number(it.entrada || 0),
        haber: Number(it.haber || 0),
        debe: Number(it.debe || 0),
        saldo: Number(it.saldo || 0),
      }));
      setRows(data);
      // si tu API devuelve los saldos, tomalos aquí
      // setSaldoAnterior(json.meta?.saldo_anterior ?? 0)
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [proveedorId, desde, hasta, q]);

  useEffect(() => { fetchResumen(); }, []);

  const columns = [
    { field: "fecha", headerName: "Fecha", flex: 0.7, minWidth: 110, valueFormatter: ({ value }) => fmtDate(value) },
    { field: "tipo", headerName: "Tipo", flex: 0.7, minWidth: 110 },
    { field: "fPago", headerName: "F.Pago", flex: 0.7, minWidth: 110 },
    { field: "comprobante", headerName: "Comprobante", flex: 1.2, minWidth: 160 },
    { field: "entrada", headerName: "Entrada", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => toCurrency(value, moneda) },
    { field: "haber", headerName: "Haber", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => toCurrency(value, moneda) },
    { field: "debe", headerName: "Debe", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => toCurrency(value, moneda) },
    { field: "saldo", headerName: "Saldo", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => toCurrency(value, moneda) },
    { field: "opcion", headerName: "Opción", flex: 0.7, minWidth: 110, sortable: false, renderCell: () => (<Button size="small" variant="outlined">Comprobante</Button>) },
    { field: "seleccion", headerName: "Selección", flex: 0.8, minWidth: 120, sortable: false, renderCell: () => (<Button size="small" variant="contained" color="secondary">Seleccionar</Button>) },
  ];

  // ====== Modal Pagos ======
  const [openPago, setOpenPago] = useState(false);
  const [form, setForm] = useState({
    // Cuenta Origen
    cuentaId: "",
    nroCuenta: "",
    alias: "",
    descOrigen: "",
    // Destino
    proveedorId: "",
    fecha: dayjs().format("YYYY-MM-DD"),
    formaPago: "",
    recibo: "",
    moneda: "ARS",
    importe: "",
    descDestino: "",
  });
  const setF = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const guardarPago = async () => {
    // Validación mínima
    if (!form.cuentaId || !form.proveedorId || !form.importe) {
      alert("Cuenta, Proveedor e Importe son obligatorios");
      return;
    }
    try {
      // POST a tu endpoint real p.ej. /supplier-payments
      // await fetch(`${API_BASE}/supplier-payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, company_id: COMPANY_ID }) })
      setOpenPago(false);
      fetchResumen();
    } catch (e) {
      console.error(e);
    }
  };

  const resetFiltros = () => {
    setProveedorId("");
    setDesde(dayjs().startOf("month").format("YYYY-MM-DD"));
    setHasta(dayjs().endOf("month").format("YYYY-MM-DD"));
    setMoneda("ARS");
    setQ("");
    fetchResumen();
  };

  return (
    <Box sx={{ position: "fixed", top: appbarH, left: sidebarW, right: 0, bottom: 0, display: "flex", flexDirection: "column", gap: 2, p: 2, overflow: "hidden" }}>
      {/* Encabezado + acciones */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>Resumen cuenta proveedor</Typography>
        <Button variant="outlined" onClick={() => window.history.back()}>Volver</Button>
      </Stack>

      {/* Filtros */}
      <SectionCard title="Filtros">
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" select label="Proveedor" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
              <MenuItem value="">Seleccionar…</MenuItem>
              <MenuItem value="1">Proveedor 1</MenuItem>
              <MenuItem value="2">Proveedor 2</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" type="date" label="Fecha desde" value={desde} onChange={(e) => setDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" type="date" label="Fecha hasta" value={hasta} onChange={(e) => setHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField fullWidth size="small" select label="Moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
              <MenuItem value="ARS">$ Local</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={fetchResumen}>Buscar</Button>
          </Grid>

          {/* Botón Pagos + Imprimir */}
          <Grid item xs={12} md={9}>
            <Button variant="contained" color="success" startIcon={<AddCardIcon />} onClick={() => setOpenPago(true)}>Pagos</Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined">Imprimir</Button>
          </Grid>

          {/* Cintas de totales */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Saldo anterior" value={toCurrency(saldoAnterior, moneda)} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Suma comprobantes" value={toCurrency(sumaComprobantes, moneda)} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Suma pagos" value={toCurrency(sumaPagos, moneda)} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Saldo actual" value={toCurrency(saldoActual, moneda)} InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
          </Grid>

          {/* Export + search */}
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
        </Grid>
      </SectionCard>

      {/* Tabla */}
      <Paper variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${c.blueAccent[100]}`, p: 2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Movimientos</Typography>
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
      </Paper>

      {/* MODAL: Pagos */}
      <Dialog open={openPago} onClose={() => setOpenPago(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Pagos</Typography>
          </Stack>
          <IconButton onClick={() => setOpenPago(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {/* Cuenta Origen */}
            <Grid item xs={12} md={6}>
              <SectionCard title="Cuenta Origen">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField select fullWidth size="small" label="Cuenta (*)" value={form.cuentaId} onChange={setF("cuentaId")}>
                      <MenuItem value="">seleccione…</MenuItem>
                      <MenuItem value="1">Caja</MenuItem>
                      <MenuItem value="2">Banco Nación</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Nro de Cuenta" value={form.nroCuenta} onChange={setF("nroCuenta")} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Alias" value={form.alias} onChange={setF("alias")} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Descripción" value={form.descOrigen} onChange={setF("descOrigen")} />
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Destino */}
            <Grid item xs={12} md={6}>
              <SectionCard title="Destino" action={<Button size="small" variant="text" endIcon={<LaunchIcon />} onClick={() => console.log("Ir a Proveedores")}>Ir a Proveedores</Button>}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={7}>
                    <TextField select fullWidth size="small" label="Proveedor" value={form.proveedorId} onChange={setF("proveedorId")}>
                      <MenuItem value="">seleccione…</MenuItem>
                      <MenuItem value="1">Proveedor 1</MenuItem>
                      <MenuItem value="2">Proveedor 2</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField fullWidth size="small" type="date" label="Fecha" value={form.fecha} onChange={setF("fecha")} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <TextField select fullWidth size="small" label="Forma de Pago" value={form.formaPago} onChange={setF("formaPago")}>
                      <MenuItem value="">seleccione…</MenuItem>
                      <MenuItem value="efectivo">Efectivo</MenuItem>
                      <MenuItem value="transferencia">Transferencia</MenuItem>
                      <MenuItem value="cheque">Cheque</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField fullWidth size="small" label="Recibo/Comprobante" value={form.recibo} onChange={setF("recibo")} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField select fullWidth size="small" label="Moneda" value={form.moneda} onChange={setF("moneda")}>
                      <MenuItem value="ARS">$ Local</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth size="small" label="Importe" value={form.importe} onChange={setF("importe")} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Descripción" value={form.descDestino} onChange={setF("descDestino")} />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="success" onClick={guardarPago}>Guardar</Button>
                      <Button variant="contained" color="warning" onClick={() => setOpenPago(false)}>Cancelar</Button>
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
