import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  Autocomplete,
  InputAdornment,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";

import { tokens } from "../../theme.js";
import api from "../../services/api"; // <-- tu api.js
import ClienteForm from "./ClienteForm.jsx";

// === Altura Topbar (como FacturarPOS)
const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

export default function Clientes() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // === Detectar ancho sidebar (como FacturarPOS)
  const [sidebarW, setSidebarW] = useState(0);
  const appbarH = TOPBAR_HEIGHT(theme);

  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) {
      setSidebarW(0);
      return;
    }
    const setW = () => setSidebarW(sideBox.offsetWidth || 0);
    setW();
    const ro = new ResizeObserver(setW);
    ro.observe(sideBox);
    window.addEventListener("resize", setW);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setW);
    };
  }, []);

  // ====== Estilos base (consistentes) ======
  const bg = isDark ? "#0B1E2A" : "#F7FAFC";
  const panel = isDark ? "#0F2733" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "#E6EEF5" : "#111827";
  const muted = isDark ? "rgba(230,238,245,0.55)" : "rgba(17,24,39,0.55)";

  const money = (n = 0) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  function SectionCard({ title, action, children }) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${border}`,
          bgcolor: panel,
          boxShadow: isDark ? "0 10px 30px rgba(0,0,0,.30)" : "0 10px 24px rgba(0,0,0,.07)",
        }}
      >
        <CardHeader
          sx={{ pb: 0 }}
          title={
            <Typography variant="h6" sx={{ color: c.brand.primaryBlue, fontWeight: 900 }}>
              {title}
            </Typography>
          }
          action={action}
        />
        <CardContent sx={{ pt: 2 }}>{children}</CardContent>
      </Card>
    );
  }

  // ====== Estado real ======
  const [openNuevoCliente, setOpenNuevoCliente] = useState(false);

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]); // para Autocomplete
  const [rows, setRows] = useState([]); // grilla
  const [search, setSearch] = useState("");
  const [cliente, setCliente] = useState(null);
  const [formaPago, setFormaPago] = useState(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Si tu backend tiene formas de pago: traerlo. Si no, dejalo fijo.
  const formasPago = ["Efectivo", "Transferencia", "Cheque", "Mixto"].map((x) => ({ label: x }));

  const totalFiltrado = useMemo(
    () => rows.reduce((a, b) => a + (Number(b.total) || 0), 0),
    [rows]
  );

  // ====== Fetch customers (para selector) ======
  const fetchCustomers = useCallback(async (q = "") => {
    try {
      // Ajustá param si tu backend usa ?q= en vez de ?search=
      const res = await api.get("/customers", { params: { search: q } });
      const data = res?.data?.data ?? res?.data ?? [];
      const list = (Array.isArray(data) ? data : []).map((x) => ({
        id: x.id,
        label: x.name ?? x.razon_social ?? "—",
        tax_id: x.tax_id ?? x.cuit ?? "",
        raw: x,
      }));
      setCustomers(list);
    } catch (e) {
      console.error("[Clientes] fetchCustomers:", e);
      setCustomers([]);
    }
  }, []);

  // ====== Fetch movimientos/pagos (reemplaza mocks) ======
  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint sugerido: /api/payments o /api/customer-movements
      // Si tu backend todavía no lo tiene, decime cómo se llama y lo ajusto.
      const params = {
        search,
        customer_id: cliente?.id || undefined,
        payment_method: formaPago?.label || undefined,
        from: desde || undefined,
        to: hasta || undefined,
      };

      const res = await api.get("/payments", { params });
      const data = res?.data?.data ?? res?.data ?? [];

      const list = (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        tipo: r.type ?? r.tipo ?? "—",
        clinica: r.customer_name ?? r.clinica ?? "—",
        tPago: r.payment_method ?? r.tPago ?? "—",
        comp: r.reference ?? r.comp ?? "—",
        observacion: r.note ?? r.observacion ?? "",
        cheque: r.cheque_number ?? r.cheque ?? "",
        fecha: (r.date ?? r.fecha ?? "").slice(0, 10),
        efectivo: Number(r.cash_amount ?? r.efectivo ?? 0),
        impCheque: Number(r.cheque_amount ?? r.impCheque ?? 0),
        total: Number(r.total ?? 0),
        opcion: r.option ?? "—",
        usuario: r.user_name ?? r.usuario ?? "—",
        cuenta: r.account_name ?? r.cuenta ?? "—",
      }));

      setRows(list);
    } catch (e) {
      console.error("[Clientes] fetchRows:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, cliente, formaPago, desde, hasta]);

  useEffect(() => {
    // carga inicial
    fetchCustomers("");
    fetchRows();
  }, [fetchCustomers, fetchRows]);

  const limpiarFiltros = () => {
    setCliente(null);
    setFormaPago(null);
    setDesde("");
    setHasta("");
    setSearch("");
  };

  // ====== Columnas (sin scroll horizontal) ======
  const columns = [
    { field: "tipo", headerName: "Tipo", flex: 0.6, minWidth: 90 },
    { field: "clinica", headerName: "Cliente", flex: 1.4, minWidth: 220 },
    { field: "tPago", headerName: "T.Pago", flex: 0.8, minWidth: 110 },
    { field: "comp", headerName: "Comp", flex: 0.8, minWidth: 110 },
    { field: "observacion", headerName: "Observación", flex: 1.2, minWidth: 160 },
    { field: "cheque", headerName: "Cheque", flex: 0.9, minWidth: 120 },
    { field: "fecha", headerName: "Fecha", flex: 0.8, minWidth: 110 },
    {
      field: "efectivo",
      headerName: "Efectivo",
      flex: 0.9,
      minWidth: 110,
      valueFormatter: ({ value }) => money(value),
    },
    {
      field: "impCheque",
      headerName: "Imp.Cheque",
      flex: 0.9,
      minWidth: 120,
      valueFormatter: ({ value }) => money(value),
    },
    {
      field: "total",
      headerName: "Total",
      flex: 0.9,
      minWidth: 120,
      valueFormatter: ({ value }) => money(value),
    },
    { field: "usuario", headerName: "Usuario", flex: 0.9, minWidth: 120 },
    { field: "cuenta", headerName: "Cuenta", flex: 1, minWidth: 140 },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: sidebarW,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: { xs: 1.25, md: 2 },
        overflow: "hidden",
        bgcolor: bg,
      }}
    >
      {/* Context tabs */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Chip label="Clínica" />
        <Chip label="Odontólogo" color="primary" variant="outlined" />
        <Chip label="Otro Lab" />
        <Chip label="Colegio" />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} gap={1}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: text, lineHeight: 1.1 }}>
          Clientes
        </Typography>

        <Box flex={1} />

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => setOpenNuevoCliente(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              bgcolor: c.brand.primaryBlue,
              "&:hover": { bgcolor: c.brand.primaryGreen },
            }}
          >
            Nuevo Cliente
          </Button>

          <Tooltip title="Actualizar">
            <IconButton
              onClick={fetchRows}
              sx={{
                borderRadius: 2,
                border: `1px solid ${border}`,
                bgcolor: alpha("#FFFFFF", isDark ? 0.04 : 0.7),
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            color="success"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
          >
            Volver
          </Button>
        </Stack>
      </Stack>

      {/* Filtros */}
      <SectionCard title="Filtros">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography sx={{ mb: 0.5, color: muted }}>Odontólogo/Cliente:</Typography>
            <Autocomplete
              options={customers}
              value={cliente}
              onChange={(_, v) => setCliente(v)}
              onInputChange={(_, v) => {
                // búsqueda en backend para grandes padrones
                fetchCustomers(v);
              }}
              renderInput={(p) => <TextField {...p} size="small" placeholder="seleccione..." />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ mb: 0.5, color: muted }}>Forma de Pago:</Typography>
            <Autocomplete
              options={formasPago}
              value={formaPago}
              onChange={(_, v) => setFormaPago(v)}
              renderInput={(p) => <TextField {...p} size="small" placeholder="seleccione..." />}
            />
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Typography sx={{ mb: 0.5, color: muted }}>Fecha desde:</Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Typography sx={{ mb: 0.5, color: muted }}>Fecha hasta:</Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Typography sx={{ mb: 0.5, color: muted }}>Total:</Typography>
            <TextField
              fullWidth
              size="small"
              value={totalFiltrado}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                readOnly: true,
              }}
              sx={{
                "& .MuiInputBase-root": { bgcolor: alpha(c.brand.primaryGreen, isDark ? 0.16 : 0.10) },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={fetchRows}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: c.brand.primaryBlue,
                  "&:hover": { bgcolor: c.brand.primaryGreen },
                }}
              >
                Buscar
              </Button>

              <Button
                variant="outlined"
                startIcon={<CleaningServicesIcon />}
                onClick={() => {
                  limpiarFiltros();
                  // después de limpiar, recargamos
                  setTimeout(fetchRows, 0);
                }}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              >
                Mostrar Todo
              </Button>

              <Box flex={1} />

              <TextField
                size="small"
                placeholder="Buscar en resultados…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRows()}
                sx={{ width: { xs: "100%", sm: 320 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Resultados */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          border: `1px solid ${border}`,
          p: { xs: 1.25, md: 2 },
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: panel,
          boxShadow: isDark ? "0 10px 30px rgba(0,0,0,.25)" : "0 10px 24px rgba(0,0,0,.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          gap={1}
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" sx={{ color: c.brand.primaryBlue, fontWeight: 900 }}>
            Resultados
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} sx={{ borderRadius: 2 }}>
              Copy
            </Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} sx={{ borderRadius: 2 }}>
              Excel
            </Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} sx={{ borderRadius: 2 }}>
              CSV
            </Button>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} sx={{ borderRadius: 2 }}>
              PDF
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1.25, borderColor: border }} />

        {loading ? (
          <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : isXs ? (
          // ✅ Mobile: cards
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Stack gap={1}>
              {rows.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 2.5,
                    border: `1px solid ${border}`,
                    bgcolor: alpha("#FFFFFF", isDark ? 0.03 : 0.75),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: text, fontWeight: 900, fontSize: 14, lineHeight: 1.2 }}>
                        {r.clinica}
                      </Typography>
                      <Typography sx={{ color: muted, fontSize: 12, mt: 0.25 }}>
                        {r.fecha} · {r.tPago} · {r.comp}
                      </Typography>
                      {r.observacion ? (
                        <Typography sx={{ color: muted, fontSize: 12, mt: 0.25 }}>
                          {r.observacion}
                        </Typography>
                      ) : null}
                    </Box>

                    <Typography sx={{ color: c.brand.primaryGreen, fontWeight: 900 }}>
                      {money(r.total)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" gap={1} mt={1} sx={{ flexWrap: "wrap" }}>
                    <Chip size="small" label={r.tipo} />
                    <Chip size="small" label={r.usuario} variant="outlined" />
                    <Chip size="small" label={r.cuenta} variant="outlined" />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          // ✅ Desktop: DataGrid
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              density="compact"
              hideFooterSelectedRowCount
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              sx={{
                height: "100%",
                width: "100%",
                borderRadius: 2,
                border: `1px solid ${border}`,
                color: text,
                "& .MuiDataGrid-columnHeaders": {
                  borderBottom: `1px solid ${border}`,
                  backgroundColor: alpha("#FFFFFF", isDark ? 0.03 : 0.7),
                },
                "& .MuiDataGrid-cell": { borderBottom: `1px solid ${border}` },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: alpha(c.brand.primaryBlue, isDark ? 0.08 : 0.05),
                },
                "& .MuiDataGrid-virtualScroller": {
                  overflowY: "auto",
                  overflowX: "hidden",
                },
                "& .MuiDataGrid-main": { overflow: "hidden" },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Modal Nuevo Cliente */}
      <ClienteForm
        open={openNuevoCliente}
        onClose={() => setOpenNuevoCliente(false)}
        onCreate={() => {
          setOpenNuevoCliente(false);
          // refrescar selector y tabla
          fetchCustomers("");
          fetchRows();
        }}
      />
    </Box>
  );
}