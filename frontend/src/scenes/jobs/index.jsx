import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, IconButton, Stack, TextField, Typography,
  ToggleButtonGroup, ToggleButton, FormControlLabel, Radio, RadioGroup, FormControl, FormLabel,
  Checkbox, Button, InputAdornment, Paper, Tooltip, Autocomplete,
  useMediaQuery
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PostAddIcon from "@mui/icons-material/PostAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme.js";
import SelectorDientes from "./SelectorDientes";

// ====== Layout helpers (fijo bajo topbar + compensación sidebar) ======
const TOPBAR_HEIGHT = (theme) => (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

// mocks
const odontologosMock = [{ id: 1, label: "Dr. Juan Pérez" }, { id: 2, label: "Dra. Ana López" }, { id: 3, label: "Dr. Ricardo Gómez" }];
const pacientesMock   = [{ id: 1, label: "Sosa, Marta" }, { id: 2, label: "Ruiz, Emanuel" }, { id: 3, label: "Fernández, Laura" }];
const trabajosMock    = [{ id: "impresion3d", label: "Impresión 3D" }, { id: "corona-zirconio", label: "Corona de Zirconio" }, { id: "protesis-removible", label: "Prótesis Removible" }];
const opcionesAdicionales = [
  { key: "cubeta", label: "Cubeta" }, { key: "mordida", label: "Mordida" }, { key: "analogos", label: "Análogo" },
  { key: "impresion", label: "Impresión" }, { key: "transfer", label: "Transfer" }, { key: "uclaabut", label: "Ucla/Abut" },
  { key: "antagonista", label: "Antagonista" }, { key: "torntrans", label: "Torn/Trans" }, { key: "pernopref", label: "Perno/Pref" },
];

function SectionCard({ title, children, action }) {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
return (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>}
        action={action}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 2 }}>{children}</CardContent>
    </Card>
  );
}

export default function TrabajoARTDENT() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);

  
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
// ====== Fixed layout state ======
  const appbarH = TOPBAR_HEIGHT(theme);
  const [sidebarW, setSidebarW] = useState(0);
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

  const [sector, setSector] = useState("clinica");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [odontologo, setOdontologo] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState("ticket");

  const [tipoLista, setTipoLista] = useState("odontologo");
  const [trabajo, setTrabajo] = useState(null);
  const [especificaciones, setEspecificaciones] = useState("");

  // Selección de piezas (array de strings "n - Tono")
  const [piezaColorList, setPiezaColorList] = useState([]);
  const [openDientes, setOpenDientes] = useState(false);

  const [importe, setImporte] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const totalItem = useMemo(() => Number(cantidad || 0) * Number(importe || 0), [cantidad, importe]);

  const [extras, setExtras] = useState(Object.fromEntries(opcionesAdicionales.map((o) => [o.key, { checked: false, qty: 0 }])));

  const sumaTotal = useMemo(() => totalItem /* + extras valorizados si corresponde */, [totalItem]);

  const handleExtraToggle = (key) => (evt) => setExtras((prev) => ({ ...prev, [key]: { ...prev[key], checked: evt.target.checked } }));
  const handleExtraQty = (key) => (evt) => {
    const value = evt.target.value.replace(/[^0-9]/g, "");
    setExtras((prev) => ({ ...prev, [key]: { ...prev[key], qty: value } }));
  };

  const limpiar = () => {
    setTrabajo(null);
    setEspecificaciones("");
    setImporte(0);
    setCantidad(1);
    setPiezaColorList([]);
    setExtras(Object.fromEntries(opcionesAdicionales.map((o) => [o.key, { checked: false, qty: 0 }])));
  };

  const guardarContinuar = () => {
    console.log({
      sector, fechaDesde, fechaHasta, odontologo, paciente, tipoComprobante, tipoLista, trabajo,
      piezaColor: piezaColorList, // array de "n - Tono"
      especificaciones,
      importe: Number(importe || 0),
      cantidad: Number(cantidad || 0),
      totalItem,
      extras,
      sumaTotal,
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: mdDown ? 0 : sidebarW,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        overflow: "hidden",
        transition: "left .18s ease",
      }}
    >
      {/* Scroll interno para el contenido */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
        {/* Filtros superiores */}
        <SectionCard
          title="Nueva Orden / Trabajo"
          action={
            <Stack direction="row" spacing={1}>
              {[
                { key: "clinica", label: "Clínica" },
                { key: "odontologo", label: "Odontólogo" },
                { key: "otrolab", label: "Otro Lab" },
                { key: "colegio", label: "Colegio" },
              ].map((t) => (
                <Chip
                  key={t.key}
                  label={t.label}
                  color={sector === t.key ? "primary" : "default"}
                  onClick={() => setSector(t.key)}
                  sx={{ fontWeight: 600, background: sector === t.key ? c.brand.primaryBlue : c.tertiaryIce, color: sector === t.key ? "#fff" : c.primary[800] }}
                />
              ))}
            </Stack>
          }
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.5}>
              <TextField fullWidth size="small" label="Fecha desde" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField fullWidth size="small" label="Fecha hasta" type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete options={odontologosMock} value={odontologo} onChange={(_, v) => setOdontologo(v)} renderInput={(params) => <TextField {...params} size="small" label="Odontólogo" />} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete options={pacientesMock} value={paciente} onChange={(_, v) => setPaciente(v)} renderInput={(params) => <TextField {...params} size="small" label="Paciente" />} />
            </Grid>
            <Grid item xs={12} md={1}>
              <ToggleButtonGroup exclusive value={tipoComprobante} onChange={(_, v) => v && setTipoComprobante(v)} size="small" fullWidth>
                <ToggleButton value="ticket">Ticket</ToggleButton>
                <ToggleButton value="presupuesto">Presup.</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </SectionCard>

        <Box mt={3} />

        {/* Detalle del trabajo */}
        <SectionCard title="Detalle del trabajo">
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <FormLabel>Tipo de Lista</FormLabel>
                <RadioGroup row value={tipoLista} onChange={(e) => setTipoLista(e.target.value)}>
                  <FormControlLabel value="odontologo" control={<Radio />} label="Lista de odontólogo" />
                  <FormControlLabel value="libre" control={<Radio />} label="Lista libre" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={9}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={trabajosMock}
                  value={trabajo}
                  onChange={(_, v) => setTrabajo(v)}
                  renderInput={(params) => (
                    <TextField {...params} size="small" label="Trabajo" placeholder="Seleccione…" />
                  )}
                />
                <Tooltip title="Nuevo Trabajo">
                  <IconButton color="primary">
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>


            <Grid item xs={12}>
              <TextField
                fullWidth multiline minRows={2} size="small" label="Especificaciones"
                placeholder="Detalles adicionales para la orden de trabajo"
                value={especificaciones} onChange={(e) => setEspecificaciones(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Pieza – Color" placeholder='Ej: "11 - A2, 21 - B1"'
                value={piezaColorList.join(", ")}
                onClick={() => setOpenDientes(true)}
                InputProps={{ readOnly: true }}
              />
              <SelectorDientes
                open={openDientes}
                onClose={() => setOpenDientes(false)}
                initialValue={piezaColorList}
                multiple
                onSelect={(arr) => setPiezaColorList(arr)} // arr: ["11 - A2", "21 - B1"]
              />
            </Grid>

            {/* Opciones adicionales */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Opciones Adicionales</Typography>
                <Grid container spacing={1}>
                  {opcionesAdicionales.map((opt) => (
                    <Grid item xs={12} sm={6} key={opt.key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FormControlLabel control={<Checkbox checked={extras[opt.key].checked} onChange={handleExtraToggle(opt.key)} />} label={opt.label} />
                        <TextField size="small" sx={{ width: 68 }} value={extras[opt.key].qty} onChange={handleExtraQty(opt.key)} inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} />
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Importes */}
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="Importe" value={importe} onChange={(e) => setImporte(e.target.value.replace(/[^0-9.]/g, ""))} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="Cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value.replace(/[^0-9]/g, ""))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="Total Item" value={totalItem.toFixed(2)} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="Suma Total" value={sumaTotal.toFixed(2)} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, readOnly: true }} />
            </Grid>

            {/* Acciones */}
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="contained" color="secondary" startIcon={<SaveIcon />} onClick={guardarContinuar}>Guardar y Continuar</Button>
                <Button variant="contained" color="primary" startIcon={<PostAddIcon />} onClick={limpiar}>Nuevo Trabajo</Button>
                <Button variant="outlined" color="error" startIcon={<CheckCircleIcon />}>Terminar</Button>
                <Button variant="contained" startIcon={<ReceiptLongIcon />}>Ticket</Button>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Exportaciones / utilitarios */}
        <Box mt={2}>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />}>Copy</Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}>Excel</Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}>CSV</Button>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}>PDF</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
