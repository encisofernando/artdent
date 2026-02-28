// src/scenes/laboratorio/OrdenTrabajo/consulta.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Chip, Grid, Stack, TextField, Typography, ToggleButtonGroup, ToggleButton,
  Button, InputAdornment, Autocomplete, Select, MenuItem, Paper, useMediaQuery,
  IconButton, Tooltip, Collapse, Avatar, BottomNavigation, BottomNavigationAction,
  Fab,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import SearchIcon             from "@mui/icons-material/Search";
import PrintIcon              from "@mui/icons-material/Print";
import CleaningServicesIcon   from "@mui/icons-material/CleaningServices";
import FileDownloadIcon       from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon       from "@mui/icons-material/PictureAsPdf";
import ContentCopyIcon        from "@mui/icons-material/ContentCopy";
import AccessTimeIcon         from "@mui/icons-material/AccessTime";
import DoneAllIcon            from "@mui/icons-material/DoneAll";
import TaskAltIcon            from "@mui/icons-material/TaskAlt";
import WarningAmberIcon       from "@mui/icons-material/WarningAmber";
import FilterListIcon         from "@mui/icons-material/FilterList";
import ExpandMoreIcon         from "@mui/icons-material/ExpandMore";
import ExpandLessIcon         from "@mui/icons-material/ExpandLess";
import ManageSearchIcon       from "@mui/icons-material/ManageSearch";
import AssignmentIcon         from "@mui/icons-material/Assignment";
import PeopleAltIcon          from "@mui/icons-material/PeopleAlt";
import AccountBalanceIcon     from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon     from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon         from "@mui/icons-material/TrendingUp";
import AddIcon                from "@mui/icons-material/Add";
// Al final de los imports de icons (después de AddIcon)
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";  // ← también lo usas en "Cancelado"
import { labPageSx, BLUE, GREEN, MINT, TEAL } from "../_shared";

import { getJobs } from "../../../services/jobService";
import { getClients } from "../../../services/clientService";

const ESTADOS = {
  "Pendiente":  { icon: <AccessTimeIcon fontSize="small"/>,   color: BLUE,      bg: `${BLUE}20`     },
  "En Proceso": { icon: <TaskAltIcon fontSize="small"/>,      color: TEAL,      bg: `${TEAL}20`     },
  "Terminado":  { icon: <DoneAllIcon fontSize="small"/>,      color: GREEN,     bg: `${GREEN}20`    },
  "Entregado":  { icon: <CheckCircleIcon fontSize="small"/>,  color: "#3498DB", bg: "#3498DB20"     },
  "Cancelado":  { icon: <BlockIcon fontSize="small"/>,        color: "#E74C3C", bg: "#E74C3C20"     },
};

const PRIORIDAD = {
  "Baja":    { color: "#95A5A6", bg: "#95A5A620" },
  "Normal":  { color: "#3498DB", bg: "#3498DB20" },
  "Alta":    { color: "#E67E22", bg: "#E67E2220" },
  "Urgente": { color: "#E74C3C", bg: "#E74C3C20" },
};

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

export default function ConsultaOrdenes() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bottomNavH = isMobile ? 56 : 0;

  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await getClients({ company_id: 1 });
        setClientes(data);
      } catch (err) {
        console.error("Error cargando clientes:", err);
      }
    };
    loadClientes();
  }, []);

  useEffect(() => {
    const loadOrdenes = async () => {
      try {
        const params = {
          company_id: 1,
          status: filtroEstado.join(','),
          priority: filtroPrioridad.join(','),
          client_id: filtroCliente?.id,
          search
        };
        const data = await getJobs(params);
        setRows(data);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
      }
    };
    loadOrdenes();
  }, [filtroEstado, filtroPrioridad, filtroCliente, search]);

  const columns = useMemo(() => [
    { field: "ticket_number", headerName: "Ticket", width: 100 },
    { field: "entry_date", headerName: "Entrada", width: 100 },
    { field: "promised_date", headerName: "Prometida", width: 100 },
    { field: "clinic_name", headerName: "Cliente", flex: 1 },
    { field: "patient_name", headerName: "Paciente", flex: 1 },
    { field: "job_type_name", headerName: "Trabajo", flex: 1 },
    {
      field: "status",
      headerName: "Estado",
      width: 120,
      renderCell: ({ value }) => {
        const est = ESTADOS[value] || {};
        return <Chip icon={est.icon} label={value} size="small" sx={{ bgcolor: est.bg, color: est.color }} />;
      },
    },
    {
      field: "priority",
      headerName: "Prioridad",
      width: 100,
      renderCell: ({ value }) => {
        const pri = PRIORIDAD[value] || {};
        return <Chip label={value} size="small" sx={{ bgcolor: pri.bg, color: pri.color }} />;
      },
    },
    { field: "total", headerName: "Total", width: 100, valueFormatter: ({ value }) => `$${value}` },
  ], []);

  const totalFiltrado = useMemo(() => rows.reduce((sum, r) => sum + (r.total || 0), 0), [rows]);

  return (
    <Box sx={{ ...labPageSx, pt: { xs: 2, sm: 3 }, pb: bottomNavH }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5" fontWeight={800} sx={{ color: BLUE, fontFamily: "Montserrat, sans-serif" }}>
            Consulta Órdenes
          </Typography>
          <Chip label={`${rows.length} ítems`} size="small" sx={{ bgcolor: `${BLUE}15`, color: BLUE, fontWeight: 600 }} />
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 1.5 }}>
        <TextField fullWidth size="small" placeholder="Buscar por ticket, cliente, paciente..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
          }}
        />
      </Box>

      {/* Filtros */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <FilterListIcon sx={{ color: theme.palette.text.secondary }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: theme.palette.text.secondary }}>
            Filtros
          </Typography>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
        <Collapse in={expanded}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <ToggleButtonGroup value={filtroEstado} onChange={(_, v) => setFiltroEstado(v)} fullWidth>
                {Object.keys(ESTADOS).map(e => <ToggleButton key={e} value={e}>{e}</ToggleButton>)}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12}>
              <ToggleButtonGroup value={filtroPrioridad} onChange={(_, v) => setFiltroPrioridad(v)} fullWidth>
                {Object.keys(PRIORIDAD).map(p => <ToggleButton key={p} value={p}>{p}</ToggleButton>)}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete fullWidth size="small"
                options={clientes}
                getOptionLabel={option => option.name}
                value={filtroCliente}
                onChange={(_, v) => setFiltroCliente(v)}
                renderInput={params => <TextField {...params} label="Cliente" />}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Box>

      {/* Grid */}
      <Box sx={{ flex: 1, overflow: "hidden", px: { xs: 0, sm: 3 } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
          hideFooterSelectedRowCount
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: `${BLUE}0A` },
            "& .MuiDataGrid-row:hover": { bgcolor: `${MINT}18` },
          }}
        />
      </Box>

      {/* Footer con export */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 1.5, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
        {[
          { icon: <ContentCopyIcon fontSize="small"/>, label: "Copiar" },
          { icon: <FileDownloadIcon fontSize="small"/>, label: "Excel" },
          { icon: <FileDownloadIcon fontSize="small"/>, label: "CSV" },
          { icon: <PictureAsPdfIcon fontSize="small"/>, label: "PDF" },
        ].map(btn => (
          <Button key={btn.label} size="small" variant="outlined" startIcon={btn.icon}
            sx={{ fontSize: "0.72rem", borderColor: theme.palette.divider, color: theme.palette.text.secondary }}>
            {btn.label}
          </Button>
        ))}
        <Typography variant="caption"
          sx={{ ml: "auto", color: theme.palette.text.secondary }}>
          {rows.length} registros · ${totalFiltrado.toLocaleString("es-AR")}
        </Typography>
      </Box>

      {/* ── Mobile FAB ────────────────────────────────────────────────────── */}
      {isMobile && (
        <Fab size="medium" onClick={() => navigate("/laboratorio/ordenes")}
          sx={{
            position: "absolute", bottom: bottomNavH + 16, right: 16,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`,
            color: "#fff", boxShadow: "0 4px 16px rgba(57,123,156,0.4)",
          }}>
          <AddIcon />
        </Fab>
      )}

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      {isMobile && (
        <BottomNavigation
          value={0}  // Ajusta según LAB_BOTTOM
          sx={{
            flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper, height: 56,
          }}
        >
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: theme.palette.text.secondary,
                "&.Mui-selected": { color: BLUE },
                minWidth: 0,
                "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" },
              }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}