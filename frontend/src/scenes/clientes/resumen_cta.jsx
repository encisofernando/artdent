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
  Chip,
  Paper,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { tokens } from "../../theme.js";
import api from "../../services/api";

const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

export default function ResumenCta() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

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
        {title ? (
          <CardHeader
            sx={{ pb: 0 }}
            title={<Typography variant="h6" sx={{ color: c.brand.primaryBlue, fontWeight: 900 }}>{title}</Typography>}
            action={action}
          />
        ) : null}
        <CardContent sx={{ pt: title ? 2 : 1.25 }}>{children}</CardContent>
      </Card>
    );
  }

  const [customers, setCustomers] = useState([]);
  const [odo, setOdo] = useState(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async (q = "") => {
    try {
      const res = await api.get("/customers", { params: { search: q } });
      const data = res?.data?.data ?? res?.data ?? [];
      const list = (Array.isArray(data) ? data : []).map((x) => ({
        id: x.id,
        label: x.name ?? x.razon_social ?? "—",
      }));
      setCustomers(list);
    } catch (e) {
      console.error("[ResumenCta] fetchCustomers:", e);
      setCustomers([]);
    }
  }, []);

  const fetchStatement = useCallback(async () => {
    if (!odo?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Endpoint sugerido. Ajustalo a tu backend real.
      const res = await api.get(`/customers/${odo.id}/statement`, {
        params: { from: desde || undefined, to: hasta || undefined },
      });

      const data = res?.data?.data ?? res?.data ?? [];
      const list = (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        fecha: (r.date ?? r.fecha ?? "").slice(0, 10),
        comp: r.type ?? r.comp ?? "—",
        odonto: r.customer_name ?? odo.label,
        tPago: r.payment_type ?? r.tPago ?? "",
        dPago: r.payment_detail ?? r.dPago ?? "",
        observ: r.note ?? r.observ ?? "",
        debe: Number(r.debit ?? r.debe ?? 0),
        haber: Number(r.credit ?? r.haber ?? 0),
        saldo: Number(r.balance ?? r.saldo ?? 0),
        opcion: r.option ?? "",
        destino: r.destination ?? r.destino ?? "",
      }));

      setRows(list);
    } catch (e) {
      console.error("[ResumenCta] fetchStatement:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [odo, desde, hasta]);

  useEffect(() => {
    fetchCustomers("");
  }, [fetchCustomers]);

  const saldoAnterior = useMemo(() => rows[0]?.saldo ?? 0, [rows]);
  const sumaPagos = useMemo(() => rows.reduce((a, r) => a + (r.haber || 0), 0), [rows]);
  const saldoActual = useMemo(() => rows.at(-1)?.saldo ?? 0, [rows]);

  const columns = [
    { field: "fecha", headerName: "Fecha", flex: 0.8, minWidth: 110 },
    { field: "comp", headerName: "Compte", flex: 1, minWidth: 120 },
    { field: "odonto", headerName: "Odontolog@", flex: 1.2, minWidth: 180 },
    { field: "tPago", headerName: "T.Pago", flex: 0.6, minWidth: 90 },
    { field: "dPago", headerName: "D.Pago", flex: 0.8, minWidth: 110 },
    { field: "observ", headerName: "Observación", flex: 1.4, minWidth: 180 },
    { field: "debe", headerName: "Debe", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => money(value) },
    { field: "haber", headerName: "Haber", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => money(value) },
    { field: "saldo", headerName: "Saldo", flex: 0.9, minWidth: 130, valueFormatter: ({ value }) => money(value) },
    { field: "destino", headerName: "Destino", flex: 0.9, minWidth: 120 },
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
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Chip label="Clínica" />
        <Chip label="Odontólogo" color="primary" variant="outlined" />
        <Chip label="Otro Lab" />
        <Chip label="Colegio" />
      </Stack>

      <Typography variant="h4" sx={{ fontWeight: 900, color: text, lineHeight: 1.1 }}>
        Resumen de Cuenta
      </Typography>

      <SectionCard title="">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography sx={{ mb: 0.5, color: muted }}>Odontólogo / Cliente:</Typography>
            <Autocomplete
              options={customers}
              value={odo}
              onChange={(_, v) => setOdo(v)}
              onInputChange={(_, v) => fetchCustomers(v)}
              renderInput={(p) => <TextField {...p} size="small" placeholder="seleccione..." />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
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

          <Grid item xs={12} md={3}>
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

          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 0, md: 3 } }}>
              <Button
                startIcon={<SearchIcon />}
                variant="contained"
                onClick={fetchStatement}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: c.brand.primaryBlue,
                  "&:hover": { bgcolor: c.brand.primaryGreen },
                  width: { xs: "100%", md: "auto" },
                }}
              >
                Buscar
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button startIcon={<PrintIcon />} variant="contained" color="info" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900 }}>
                Imprimir
              </Button>
              <Button startIcon={<EmailIcon />} variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900 }}>
                Enviar por Email
              </Button>
              <Button startIcon={<WhatsAppIcon />} variant="contained" color="success" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900 }}>
                Enviar WhatsApp
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Totales */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          border: `1px solid ${border}`,
          bgcolor: panel,
          p: { xs: 1.25, md: 2 },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Saldo anterior"
              size="small"
              fullWidth
              value={money(saldoAnterior)}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Suma pagos"
              size="small"
              fullWidth
              value={money(sumaPagos)}
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiInputBase-root": { bgcolor: alpha(c.brand.primaryGreen, isDark ? 0.16 : 0.10) } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Saldo actual"
              size="small"
              fullWidth
              value={money(saldoActual)}
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiInputBase-root": { bgcolor: alpha(theme.palette.warning.main, isDark ? 0.14 : 0.08) } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          border: `1px solid ${border}`,
          bgcolor: panel,
          p: { xs: 1.25, md: 2 },
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} sx={{ borderRadius: 2 }}>Copy</Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} sx={{ borderRadius: 2 }}>Excel</Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} sx={{ borderRadius: 2 }}>CSV</Button>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} sx={{ borderRadius: 2 }}>PDF</Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1.25, borderColor: border }} />

        {loading ? (
          <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : isXs ? (
          // Mobile: cards
          <Box sx={{ flex: 1, overflow: "auto" }}>
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
                      <Typography sx={{ color: text, fontWeight: 900, fontSize: 14 }}>
                        {r.comp} · {r.fecha}
                      </Typography>
                      <Typography sx={{ color: muted, fontSize: 12, mt: 0.25 }}>
                        {r.observ || "—"}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: c.brand.primaryGreen, fontWeight: 900 }}>
                      {money(r.saldo)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" gap={1} mt={1} sx={{ flexWrap: "wrap" }}>
                    <Chip size="small" label={`Debe: ${money(r.debe)}`} variant="outlined" />
                    <Chip size="small" label={`Haber: ${money(r.haber)}`} variant="outlined" />
                    {r.destino ? <Chip size="small" label={r.destino} /> : null}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              density="compact"
              disableRowSelectionOnClick
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
                "& .MuiDataGrid-virtualScroller": { overflowY: "auto", overflowX: "hidden" },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}