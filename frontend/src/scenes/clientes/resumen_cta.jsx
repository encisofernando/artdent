import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, CardHeader, Grid, Stack, TextField, Typography,
  Button, Autocomplete, Chip, Paper, InputAdornment
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { tokens } from "../../theme.js";

/** ===== Layout helpers (como FacturarPOS) ===== */
const TOPBAR_HEIGHT = (theme) =>
  (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

/** ===== Componente ===== */
export default function ResumenCta() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);

  // Detectar ancho del sidebar
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

  /** ====== SectionCard con borde/radius de index.jsx ====== */
  function SectionCard({ title, action, children }) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${c.blueAccent[100]}` }}>
        <CardHeader
          sx={{ pb: 0 }}
          title={<Typography variant="h6" sx={{ color: c.brand.primaryBlue, fontWeight: 700 }}>{title}</Typography>}
          action={action}
        />
        <CardContent sx={{ pt: 2 }}>{children}</CardContent>
      </Card>
    );
  }

  /** ====== Mocks ====== */
  const odontologos = ["CARLOS CONSIGLIO", "Dra. López", "Dr. Gómez"].map((x) => ({ label: x }));
  const [odo, setOdo] = useState(odontologos[0]);
  const [desde, setDesde] = useState("2025-10-01");
  const [hasta, setHasta] = useState("2025-10-31");

  const seedRows = [
    {
      id: 1, fecha: "2025-10-01", comp: "Saldo/Ant", odonto: odo.label, tPago: "", dPago: "",
      observ: "al 2025-10-01", debe: 0, haber: 0, saldo: -4021800, opcion: "", destino: ""
    },
    {
      id: 2, fecha: "2025-10-07", comp: "Pago", odonto: "CARLOS CONSIGLIO", tPago: "P", dPago: "Efect",
      observ: "", debe: 0, haber: 1000000, saldo: -5021800, opcion: "•", destino: "—"
    },
    {
      id: 3, fecha: "2025-10-09", comp: "Pago", odonto: "CARLOS CONSIGLIO", tPago: "P", dPago: "Efect",
      observ: "", debe: 0, haber: 400000, saldo: -5421800, opcion: "•", destino: "—"
    },
  ];

  const [rows, setRows] = useState(seedRows);

  /** Totales superiores */
  const saldoAnterior = useMemo(() => (rows[0]?.saldo ?? 0), [rows]);
  const sumaPagos = useMemo(() => rows.slice(1).reduce((a, r) => a + (r.haber || 0), 0), [rows]);
  const otEnCurso = 2376500; // mock
  const facturado = 0;       // mock
  const saldoActual = useMemo(() => (rows.at(-1)?.saldo ?? 0), [rows]);

  const buscar = () => {
    // Lógica de búsqueda (mock por fecha/odo); en prod: fetch API
    let r = seedRows.filter(x => x.fecha >= desde && x.fecha <= hasta);
    setRows(r);
  };

  /** ====== Columnas (sin scroll horizontal) ====== */
  const columns = [
    { field: "fecha", headerName: "Fecha", flex: 0.8, minWidth: 110 },
    { field: "comp", headerName: "Compte", flex: 1, minWidth: 120 },
    { field: "odonto", headerName: "Odontolog@", flex: 1.2, minWidth: 180 },
    { field: "tPago", headerName: "T.Pago", flex: 0.6, minWidth: 90 },
    { field: "dPago", headerName: "D.Pago", flex: 0.8, minWidth: 110 },
    { field: "observ", headerName: "Observación", flex: 1.4, minWidth: 180 },
    { field: "debe", headerName: "Debe", flex: 0.7, minWidth: 100, valueFormatter: ({ value }) => Number(value).toLocaleString() },
    { field: "haber", headerName: "Haber", flex: 0.8, minWidth: 120, valueFormatter: ({ value }) => Number(value).toLocaleString() },
    { field: "saldo", headerName: "Saldo", flex: 0.9, minWidth: 130, valueFormatter: ({ value }) => Number(value).toLocaleString() },
    { field: "opcion", headerName: "Opción", flex: 0.7, minWidth: 90 },
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
        p: 2,
        overflow: "hidden",
      }}
    >
      {/* Tabs de contexto */}
      <Stack direction="row" spacing={1}>
        <Chip label="Clínica" />
        <Chip label="Odontólogo" color="primary" variant="outlined" />
        <Chip label="Otro Lab" />
        <Chip label="Colegio" />
      </Stack>

      {/* Título */}
      <Typography variant="h4" sx={{ fontWeight: 700, color: c.primary[100] }}>Odontólogo</Typography>

      {/* Panel de filtros y acciones principales */}
      <SectionCard title="">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography sx={{ mb: 0.5, opacity: 0.85 }}>Odontólogo:</Typography>
            <Autocomplete
              options={odontologos}
              value={odo}
              onChange={(_, v) => setOdo(v)}
              renderInput={(p) => <TextField {...p} size="small" placeholder="seleccione..." />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ mb: 0.5, opacity: 0.85 }}>Fecha desde:</Typography>
            <TextField
              fullWidth size="small" type="date" value={desde}
              onChange={(e) => setDesde(e.target.value)} InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ mb: 0.5, opacity: 0.85 }}>Fecha hasta:</Typography>
            <TextField
              fullWidth size="small" type="date" value={hasta}
              onChange={(e) => setHasta(e.target.value)} InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, md: 3 } }}>
              <Button startIcon={<SearchIcon />} variant="contained" onClick={buscar}>Buscar</Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button startIcon={<PrintIcon />} variant="contained" color="info">Imprimir</Button>
              <Button startIcon={<EmailIcon />} variant="contained">Enviar por Email</Button>
              <Button startIcon={<WhatsAppIcon />} variant="contained" color="success">Enviar whatsapp</Button>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Totales */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          border: `1px solid ${c.blueAccent[100]}`,
          p: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              label="Saldo anterior"
              size="small"
              fullWidth
              value={saldoAnterior.toLocaleString()}
              InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Suma Pagos"
              size="small"
              fullWidth
              value={sumaPagos.toLocaleString()}
              InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ "& .MuiInputBase-root": { bgcolor: `${theme.palette.success.light}22` } }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Ot/En Curso"
              size="small"
              fullWidth
              value={otEnCurso.toLocaleString()}
              InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Facturado"
              size="small"
              fullWidth
              value={facturado.toLocaleString()}
              InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Saldo actual"
              size="small"
              fullWidth
              value={saldoActual.toLocaleString()}
              InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ "& .MuiInputBase-root": { bgcolor: `${theme.palette.warning.light}22` } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados + export */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, border: `1px solid ${c.blueAccent[100]}`, p: 2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />}>Copy</Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}>Excel</Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}>CSV</Button>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}>PDF</Button>
          </Stack>
          <TextField size="small" placeholder="Search…" sx={{ width: 260 }} />
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            getRowClassName={(params) => {
              // Coloreos similares a la captura
              if (params.row.comp === "Saldo/Ant") return "row-saldo-ant";
              if (params.row.comp === "Pago") return "row-pago";
              return "";
            }}
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 2,
              border: `1px solid ${c.blueAccent[100]}`,
              "& .MuiDataGrid-virtualScroller": { overflowY: "auto", overflowX: "hidden" },
              "& .MuiDataGrid-main": { overflow: "hidden" },
              // Estilos de filas destacadas
              "& .row-saldo-ant": {
                background: theme.palette.mode === "dark" ? "#5a3b7a66" : "#e9d8fd",
              },
              "& .row-pago": {
                background: theme.palette.mode === "dark" ? "#7a6c1f4d" : "#fff8b3",
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
