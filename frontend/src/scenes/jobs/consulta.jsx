import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, Stack, TextField, Typography,
  ToggleButtonGroup, ToggleButton, Button, InputAdornment,
  Autocomplete, Select, MenuItem, Paper,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningIcon from "@mui/icons-material/Warning";
import { tokens } from "../../theme.js";

// === Altura del Topbar (igual patrón que FacturarPOS)
const TOPBAR_HEIGHT = (theme) =>
  (theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64);

export default function ConsultasYModificaciones() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);

  
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
// === Detectar ancho de sidebar (igual a FacturarPOS)
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

  // ====== Helpers UI (estilo de index.jsx: radius 3 y borde blueAccent[100]) ======
  function SectionCard({ title, action, children }) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </Paper>
    );
  }

  // ====== Mocks (reemplazar por datos reales) ======
  const clinicas = ["Camila Paterno", "Jacobo", "Mariana Salomon", "Juan Zambon", "Avila Agostina"];
  const odontologos = ["Dr. Pérez", "Dra. López", "Dr. Gómez", "Dra. Romero"];
  const otrosLabs = ["Lab Norte", "Procer 3D", "DentalMax"];
  const colegios = ["Colegio 1", "Colegio 2", "Colegio 3"];
  const pacientes = ["Cristina", "Saturnino", "Dorardo Teresa", "No Detalla", "Miranda Veronica"];
  const trabajos = ["Impresión 3D", "Corona de Zirconio", "Prótesis Removible"];
  const asignados = ["Sin asignar", "Laura", "Jorge", "Paula", "Diego"];
  const rand = (arr)=>arr[Math.floor(Math.random()*arr.length)];
  const seedRows = Array.from({length: 45}).map((_,i)=>({
    id: 650 + i,
    ticket: 710 - i,
    clinica: rand(clinicas),
    odolab: rand(odontologos),
    paciente: rand(pacientes),
    fecDesde: "2025-10-17",
    fecHasta: "2025-10-17",
    total: [15000, 35000, 40000, 65000, 79000, 88000][i%6],
    estado: ["Terminado","Pendiente","En Proceso"][i%3],
    asignado: rand(asignados),
    fechaAlta: `2025-10-17 13:${String(10 + (i%50)).padStart(2,"0")}:4${i%10}`,
  }));

  // ====== Estado filtros ======
  const [nro, setNro] = useState("");
  const [clinica, setClinica] = useState(null);
  const [odontologo, setOdontologo] = useState(null);
  const [otroLab, setOtroLab] = useState(null);
  const [colegio, setColegio] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [trabajo, setTrabajo] = useState(null);
  const [ticketOPresupuesto, setTicketOPresupuesto] = useState("ticket");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(null);

  const [rows, setRows] = useState(seedRows);
  const totalFiltrado = useMemo(()=> rows.reduce((a,b)=>a + (Number(b.total)||0),0),[rows]);

  const limpiar = ()=>{
    setNro(""); setClinica(null); setOdontologo(null); setOtroLab(null); setColegio(null); setPaciente(null);
    setTrabajo(null); setTicketOPresupuesto("ticket"); setDesde(""); setHasta(""); setEstadoFiltro(null);
    setRows(seedRows);
  };

  const buscar = ()=>{
    let rs = [...seedRows];
    if(nro) rs = rs.filter(r => String(r.ticket).includes(nro));
    if(clinica) rs = rs.filter(r => r.clinica === clinica?.label);
    if(odontologo) rs = rs.filter(r => r.odolab === odontologo?.label);
    if(paciente) rs = rs.filter(r => r.paciente === paciente?.label);
    if(desde) rs = rs.filter(r => r.fecDesde >= desde);
    if(hasta) rs = rs.filter(r => r.fecHasta <= hasta);
    if(estadoFiltro) rs = rs.filter(r => r.estado === estadoFiltro);
    setRows(rs);
  };

  // ====== Columnas (sin scroll horizontal: flex + minWidth) ======
  const columns = [
    { field: "ticket", headerName: "Ticket", flex: 0.6, minWidth: 90, sortable: true },
    { field: "clinica", headerName: "Clínica", flex: 1, minWidth: 140 },
    { field: "odolab", headerName: "Odo/Lab", flex: 1, minWidth: 140 },
    { field: "paciente", headerName: "Paciente", flex: 1, minWidth: 150 },
    { field: "fecDesde", headerName: "Fec. desde", flex: 0.9, minWidth: 120 },
    { field: "fecHasta", headerName: "Fec. hasta", flex: 0.9, minWidth: 120 },
    { field: "total", headerName: "Total", flex: 0.8, minWidth: 110, valueFormatter: ({value})=>`$${Number(value).toLocaleString()}` },
    { field: "estado", headerName: "Estado", flex: 1, minWidth: 130, renderCell: (p)=>{
        const map = {
          "Pendiente": { icon: <AccessTimeIcon fontSize="small"/>, color: c.blueAccent[400] },
          "En Proceso": { icon: <TaskAltIcon fontSize="small"/>, color: c.greenAccent[500] },
          "Terminado": { icon: <DoneAllIcon fontSize="small"/>, color: theme.palette.success.main },
        };
        const m = map[p.value] || {icon:null,color:c.primary[500]};
        return <Chip size="small" icon={m.icon} label={p.value} sx={{ bgcolor: `${m.color}22`, color: m.color, border: `1px solid ${m.color}55` }} />;
      }
    },
    { field: "accion", headerName: "Opción", flex: 1, minWidth: 170, sortable: false, renderCell: (p)=>(
        <Select size="small" fullWidth defaultValue="" onChange={(e)=>console.log("accion", e.target.value, p.row)} displayEmpty>
          <MenuItem value="">Seleccionar</MenuItem>
          <MenuItem value="imprimir-etiqueta">Imprimir Etiqueta</MenuItem>
          <MenuItem value="imprimir-ticket">Imprimir Ticket</MenuItem>
          <MenuItem value="marcar-terminado">Marcar Terminado</MenuItem>
          <MenuItem value="editar-cabecera">Editar Cabecera</MenuItem>
          <MenuItem value="ver-items">Ver Items</MenuItem>
          <MenuItem value="anular">Anular Ticket</MenuItem>
          <MenuItem value="espera">En espera</MenuItem>
        </Select>
      )
    },
    { field: "asignado", headerName: "Asignado a:", flex: 1.1, minWidth: 160, renderCell:(p)=>(
        <Select size="small" fullWidth value={p.row.asignado} onChange={(e)=>{p.row.asignado=e.target.value; setRows(r=>[...r]);}}>
          {asignados.map(a=> <MenuItem key={a} value={a}>{a}</MenuItem>)}
        </Select>
      )
    },
    { field: "fechaAlta", headerName: "Fecha alta:", flex: 1.1, minWidth: 160 },
  ];

  const headerAction = (
    <Stack direction="row" spacing={1}>
      <Chip icon={<AccessTimeIcon/>} label="Pendientes" onClick={()=> setEstadoFiltro("Pendiente")} sx={{ bgcolor: `${c.blueAccent[100]}`, color: c.primary[700] }} />
      <Chip icon={<TaskAltIcon/>} label="En Proceso" onClick={()=> setEstadoFiltro("En Proceso")} sx={{ bgcolor: `${c.greenAccent[100]}`, color: c.greenAccent[700] }} />
      <Chip icon={<DoneAllIcon/>} label="Terminado" onClick={()=> setEstadoFiltro("Terminado")} sx={{ bgcolor: `${c.blueAccent[100]}`, color: theme.palette.success.main }} />
      <Chip icon={<WarningIcon/>} label="Sale hoy" onClick={()=> setEstadoFiltro(null)} sx={{ bgcolor: `#FFE7E7`, color: theme.palette.error.main }} />
    </Stack>
  );

  // ====== CONTENEDOR PRINCIPAL ======
  // Igual approach que FacturarPOS: fija el viewport debajo del topbar y al lado del sidebar.
  // Con esto NO hay scroll del navegador; solo scrollean los paneles internos.
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
        p: 2,              // padding adaptable como FacturarPOS
        overflow: "hidden", // bloquea scroll del body
        transition: "left .18s ease"
      }}
    >
      {/* FILTROS */}
      <SectionCard title="Filtros de Búsqueda" action={headerAction}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Nro:" value={nro} onChange={(e)=>setNro(e.target.value.replace(/[^0-9]/g,''))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete options={clinicas.map(x=>({label:x}))} value={clinica} onChange={(_,v)=>setClinica(v)} renderInput={(p)=><TextField {...p} size="small" label="Clínica:"/>} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete options={odontologos.map(x=>({label:x}))} value={odontologo} onChange={(_,v)=>setOdontologo(v)} renderInput={(p)=><TextField {...p} size="small" label="Odontólogo:"/>} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete options={otrosLabs.map(x=>({label:x}))} value={otroLab} onChange={(_,v)=>setOtroLab(v)} renderInput={(p)=><TextField {...p} size="small" label="Otro Lab:"/>} />
          </Grid>

          <Grid item xs={12} md={3}>
            <Autocomplete options={colegios.map(x=>({label:x}))} value={colegio} onChange={(_,v)=>setColegio(v)} renderInput={(p)=><TextField {...p} size="small" label="Colegio:"/>} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Autocomplete options={pacientes.map(x=>({label:x}))} value={paciente} onChange={(_,v)=>setPaciente(v)} renderInput={(p)=><TextField {...p} size="small" label="Paciente:" placeholder="Buscar paciente…"/>} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete options={trabajos.map(x=>({label:x}))} value={trabajo} onChange={(_,v)=>setTrabajo(v)} renderInput={(p)=><TextField {...p} size="small" label="Trabajo:"/>} />
          </Grid>

          <Grid item xs={12} md={3}>
            <ToggleButtonGroup exclusive fullWidth size="small" value={ticketOPresupuesto} onChange={(_,v)=>v && setTicketOPresupuesto(v)}>
              <ToggleButton value="ticket">TICKET</ToggleButton>
              <ToggleButton value="presupuesto">PRESUP.</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Fecha desde:" placeholder="dd/mm/aaaa" type="date" value={desde} onChange={(e)=>setDesde(e.target.value)} InputLabelProps={{shrink:true}} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Fecha hasta:" placeholder="dd/mm/aaaa" type="date" value={hasta} onChange={(e)=>setHasta(e.target.value)} InputLabelProps={{shrink:true}} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Total:" value={totalFiltrado.toLocaleString()} InputProps={{startAdornment:<InputAdornment position="start">$</InputAdornment>, readOnly:true}} />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" startIcon={<SearchIcon/>} onClick={buscar}>Buscar</Button>
              <Button variant="contained" color="info" startIcon={<PrintIcon/>}>Imprimir</Button>
              <Button variant="contained" color="warning" startIcon={<CleaningServicesIcon/>} onClick={limpiar}>Limpiar</Button>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      {/* RESULTADOS — ocupa todo el resto; SOLO acá hay scroll */}
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ color: c.brand.primaryBlue, fontWeight: 700, mb: 1 }}>
          Resultados de Búsqueda
        </Typography>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            density="compact"
            hideFooterSelectedRowCount
            pageSizeOptions={[10,25,50,100]}
            initialState={{ pagination:{ paginationModel:{ pageSize: 25 } } }}
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              "& .MuiDataGrid-columnHeaders": { background: theme.palette.background.paper },
              "& .MuiDataGrid-virtualScroller": { overflowY: "auto", overflowX: "hidden" }, // solo vertical
              "& .MuiDataGrid-main": { overflow: "hidden" },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: theme.palette.mode==='dark' ? '#173042' : '#FFF8EE00'
              },
            }}
          />
        </Box>

        {/* Acciones de exportación */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" startIcon={<ContentCopyIcon/>}>Copy</Button>
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon/>}>Excel</Button>
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon/>}>CSV</Button>
          <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon/>}>PDF</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
