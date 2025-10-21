import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, CardHeader, Grid, Stack, TextField, Typography,
  Button, Autocomplete, Select, MenuItem, InputAdornment, Chip, Paper
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { tokens } from "../../theme.js";
import ClienteForm from "./ClienteForm.jsx"; // ruta relativa a tu carpeta clientes


// === Altura del Topbar (mismo approach que FacturarPOS)
const TOPBAR_HEIGHT = (theme) =>
  (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

export default function Clientes() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);

  // === Detectar ancho del sidebar (igual a FacturarPOS)
  const [sidebarW, setSidebarW] = useState(0);
  const appbarH = TOPBAR_HEIGHT(theme);
  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) { setSidebarW(0); return; }
    setSidebarW(sideBox.offsetWidth || 0);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarW(entry.target.offsetWidth || entry.contentRect?.width || 0);
      }
    });
    ro.observe(sideBox);
    const onResize = () => setSidebarW(sideBox.offsetWidth || 0);
    window.addEventListener("resize", onResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);

  // ====== Card con estilo de index.jsx (radius 3 + borde blueAccent[100])
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

  // ====== Mock data (reemplazar por API) ======
  const clientes = ["Cristina", "Saturnino", "Dorardo Teresa", "No Detalla", "Miranda Veronica"];
  const formasPago = ["Efectivo", "Transferencia", "Cheque", "Mixto"];
  const usuarios = ["Diego", "Laura", "Jorge", "Paula"];
  const cuentas = ["Caja", "Banco Nación", "Banco Provincia"];
  const [openNuevoCliente, setOpenNuevoCliente] = useState(false);

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const seedRows = Array.from({ length: 18 }).map((_, i) => {
    const fp = rand(formasPago);
    const impCheque = fp === "Cheque" || fp === "Mixto" ? Math.floor(2000 + Math.random() * 18000) : 0;
    const efectivo = fp === "Efectivo" || fp === "Mixto" ? Math.floor(2000 + Math.random() * 18000) : 0;
    return {
      id: i + 1,
      tipo: i % 3 === 0 ? "Pago" : "Cobro",
      clinica: ["Clínica Norte", "Odonto Smile", "Lab Procer", "Colegio Odont."][i % 4],
      tPago: fp,
      comp: `RC-${1000 + i}`,
      observacion: i % 4 === 0 ? "Adelanto" : "",
      cheque: impCheque ? `CH-${7000 + i}` : "",
      fecha: `2025-10-${String(1 + i).padStart(2, "0")}`,
      efectivo,
      impCheque,
      total: efectivo + impCheque,
      opcion: "—",
      usuario: rand(usuarios),
      cuenta: rand(cuentas),
    };
  });

  // ====== Filtros ======
  const [cliente, setCliente] = useState(null);
  const [formaPago, setFormaPago] = useState(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [rows, setRows] = useState(seedRows);

  const totalFiltrado = useMemo(
    () => rows.reduce((a, b) => a + (Number(b.total) || 0), 0),
    [rows]
  );

  const buscar = () => {
    let r = [...seedRows];
    if (cliente) r = r.filter((x) => x.cliente === cliente?.label || true); // placeholder si no hay campo cliente en mock
    if (formaPago) r = r.filter((x) => x.tPago === formaPago?.label);
    if (desde) r = r.filter((x) => x.fecha >= desde);
    if (hasta) r = r.filter((x) => x.fecha <= hasta);
    setRows(r);
  };

  const mostrarTodo = () => setRows(seedRows);

  // ====== Columnas (sin scroll horizontal: flex + minWidth) ======
  const columns = [
    { field: "tipo", headerName: "Tipo", flex: 0.6, minWidth: 90 },
    { field: "clinica", headerName: "Clinica/Odonto/Lab/Col", flex: 1.5, minWidth: 220 },
    { field: "tPago", headerName: "T.Pago", flex: 0.8, minWidth: 110 },
    { field: "comp", headerName: "Comp", flex: 0.8, minWidth: 110 },
    { field: "observacion", headerName: "Observación", flex: 1.2, minWidth: 160 },
    { field: "cheque", headerName: "Cheque", flex: 0.9, minWidth: 120 },
    { field: "fecha", headerName: "Fecha", flex: 0.8, minWidth: 110 },
    { field: "efectivo", headerName: "Efectivo", flex: 0.9, minWidth: 110, valueFormatter: ({ value }) => `$${Number(value).toLocaleString()}` },
    { field: "impCheque", headerName: "Imp.Cheque", flex: 0.9, minWidth: 120, valueFormatter: ({ value }) => `$${Number(value).toLocaleString()}` },
    { field: "total", headerName: "Total", flex: 0.9, minWidth: 120, valueFormatter: ({ value }) => `$${Number(value).toLocaleString()}` },
    { field: "opcion", headerName: "Opción", flex: 0.8, minWidth: 100 },
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
        p: 2,              // padding adaptable como FacturarPOS
        overflow: "hidden" // sin scroll del navegador
      }}
    >
      {/* Tabs superiores de contexto (opcionales) */}
      <Stack direction="row" spacing={1}>
        <Chip label="Clínica" />
        <Chip label="Odontólogo" color="primary" variant="outlined" />
        <Chip label="Otro Lab" />
        <Chip label="Colegio" />
      </Stack>

      <Typography variant="h4" sx={{ fontWeight: 700, color: c.primary[100] }}>Clientes</Typography>

      {/* Botonera superior */}
      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="success" startIcon={<AddCircleIcon />}>Nuevo Pago</Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddCircleIcon />}
          onClick={() => setOpenNuevoCliente(true)}
        >
          Nuevo Cliente
        </Button>
        <Box flex={1} />
        <Button variant="outlined" color="success" startIcon={<ArrowBackIcon />}>Volver</Button>
      </Stack>

      {/* Filtros */}
      <SectionCard title="Filtros">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography sx={{ mb: 0.5, opacity: 0.8 }}>Odontólogo/Cliente:</Typography>
            <Autocomplete
              options={clientes.map((x) => ({ label: x }))}
              value={cliente}
              onChange={(_, v) => setCliente(v)}
              renderInput={(p) => <TextField {...p} size="small" placeholder="seleccione..." />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ mb: 0.5, opacity: 0.8 }}>Forma de Pago:</Typography>
            <Autocomplete
              options={formasPago.map((x) => ({ label: x }))}
              value={formaPago}
              onChange={(_, v) => setFormaPago(v)}
              renderInput={(p) => <TextField {...p} size="small" placeholder="seleccione..." />}
            />
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Typography sx={{ mb: 0.5, opacity: 0.8 }}>Fecha desde:</Typography>
            <TextField
              fullWidth size="small" type="date" value={desde}
              onChange={(e) => setDesde(e.target.value)} InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Typography sx={{ mb: 0.5, opacity: 0.8 }}>Fecha hasta:</Typography>
            <TextField
              fullWidth size="small" type="date" value={hasta}
              onChange={(e) => setHasta(e.target.value)} InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Typography sx={{ mb: 0.5, opacity: 0.8 }}>Total:</Typography>
            <TextField
              fullWidth size="small" value={totalFiltrado.toLocaleString()} InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                readOnly: true,
              }}
              sx={{
                "& .MuiInputBase-root": { bgcolor: `${theme.palette.success.light}22` }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={buscar}>Buscar</Button>
              <Button variant="contained" color="warning" startIcon={<CleaningServicesIcon />} onClick={mostrarTodo}>Mostrar Todo</Button>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Resultados */}
      <Paper variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${c.blueAccent[100]}`, p: 2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ color: c.brand.primaryBlue, fontWeight: 700 }}>
            Resultados
          </Typography>
          <TextField size="small" placeholder="Search…" sx={{ width: 260 }} />
        </Stack>

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
              border: `1px solid ${c.blueAccent[100]}`,
              "& .MuiDataGrid-virtualScroller": { overflowY: "auto", overflowX: "hidden" }, // solo vertical
              "& .MuiDataGrid-main": { overflow: "hidden" },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />}>Copy</Button>
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}>Excel</Button>
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}>CSV</Button>
          <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}>PDF</Button>
        </Stack>
      </Paper>
      
      <ClienteForm
          open={openNuevoCliente}
          onClose={() => setOpenNuevoCliente(false)}
          onCreate={(created) => {
            // refrescá tu grilla si corresponde
            // ej: setRows(prev => [{ id: Date.now(), ...mapFrom(created) }, ...prev]);
            setOpenNuevoCliente(false);
          }}
      />

    </Box>
  );

}
