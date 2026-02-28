// src/scenes/laboratorio/OrdenTrabajo/index.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, IconButton, Stack, TextField,
  Typography, ToggleButtonGroup, ToggleButton, Checkbox, Button, InputAdornment,
  Paper, Tooltip, Autocomplete, Divider, Badge, useMediaQuery, Select, MenuItem,
  Collapse, Alert, BottomNavigation, BottomNavigationAction, Fab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

import SaveIcon            from "@mui/icons-material/Save";
import PostAddIcon         from "@mui/icons-material/PostAdd";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon     from "@mui/icons-material/ReceiptLong";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ToothIcon           from "@mui/icons-material/MedicalServices";
import CalendarMonthIcon   from "@mui/icons-material/CalendarMonth";
import AssignmentIcon      from "@mui/icons-material/Assignment";
import ClearIcon           from "@mui/icons-material/Clear";
import PrintIcon           from "@mui/icons-material/Print";
import PeopleAltIcon       from "@mui/icons-material/PeopleAlt";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon  from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon      from "@mui/icons-material/TrendingUp";
import ExpandMoreIcon      from "@mui/icons-material/ExpandMore";
import ExpandLessIcon      from "@mui/icons-material/ExpandLess";
import ManageSearchIcon    from "@mui/icons-material/ManageSearch";
import PersonIcon          from "@mui/icons-material/Person";

import SelectorDientesSVG from "../SelectorDientesSVG";
import { labPageSx, BLUE, GREEN, MINT, TEAL } from "../_shared";

import { getClients } from "../../../services/clientService";
import { getPatients } from "../../../services/patientService";
import { getJobTypes } from "../../../services/jobTypeService";
import { createJob } from "../../../services/jobService";

// Agrega esta constante aquí (copiada de consulta.jsx)
const PRIORIDAD = {
  "Baja":    { color: "#95A5A6", bg: "#95A5A620" },
  "Normal":  { color: "#3498DB", bg: "#3498DB20" },
  "Alta":    { color: "#E67E22", bg: "#E67E2220" },
  "Urgente": { color: "#E74C3C", bg: "#E74C3C20" },
};

// ── Componentes auxiliares ────────────────────────────────────────────────────
function SectionCard({ title, children, color = TEAL }) {
  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <CardHeader title={title} titleTypographyProps={{ variant: "subtitle1", fontWeight: 800, color }}
        sx={{ bgcolor: `${color}18`, py: 1.2, px: 2 }} />
      <CardContent sx={{ px: 2, py: 1.5 }}>{children}</CardContent>
    </Card>
  );
}

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

export default function NuevaOrden() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bottomNavH = isMobile ? 56 : 0;

  const [clientes, setClientes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [trabajos, setTrabajos] = useState([]);  // Tipos de trabajo
  const [clienteSel, setClienteSel] = useState(null);
  const [pacienteSel, setPacienteSel] = useState(null);
  const [trabajosAgregados, setTrabajosAgregados] = useState([]);
  const [trabajoTemp, setTrabajoTemp] = useState({ id: null, precio: 0 });
  const [openDientes, setOpenDientes] = useState(false);
  const [piezas, setPiezas] = useState([]);
  const [notas, setNotas] = useState("");
  const [fechaPrometida, setFechaPrometida] = useState(new Date().toISOString().slice(0,10));
  const [prioridad, setPrioridad] = useState("Normal");

  useEffect(() => {
    const loadData = async () => {
      try {
        const cliData = await getClients({ company_id: 1 });
        setClientes(cliData);
        const pacData = await getPatients({ company_id: 1 });
        setPacientes(pacData);
        const jobTypeData = await getJobTypes({ company_id: 1 });
        setTrabajos(jobTypeData);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    loadData();
  }, []);

  const agregarTrabajo = () => {
    if (trabajoTemp.id) {
      setTrabajosAgregados(prev => [...prev, { ...trabajoTemp, piezas: piezas.join(", ") }]);
      setTrabajoTemp({ id: null, precio: 0 });
      setPiezas([]);
    }
  };

  const guardar = async () => {
    const data = {
      clinic_id: clienteSel?.id,
      patient_id: pacienteSel?.id,
      job_type_id: trabajosAgregados.map(t => t.id),  // Asume array de IDs
      promised_date: fechaPrometida,
      priority: prioridad,
      notes: notas,
      total: trabajosAgregados.reduce((sum, t) => sum + t.precio, 0),
      // Agrega más campos según modelo
    };
    try {
      await createJob(data);
      // Opcional: limpiar form o navegar
    } catch (err) {
      console.error("Error guardando orden:", err);
    }
  };

  const limpiar = () => {
    setTrabajosAgregados([]);
    setTrabajoTemp({ id: null, precio: 0 });
    setPiezas([]);
    setNotas("");
  };

  return (
    <Box sx={{ ...labPageSx, pt: { xs: 2, sm: 3 }, pb: bottomNavH }}>
      {/* Cliente */}
      <SectionCard title="Cliente" color={BLUE}>
        <Autocomplete fullWidth size="small"
          options={clientes}
          getOptionLabel={option => option.name}
          value={clienteSel}
          onChange={(_, v) => setClienteSel(v)}
          renderInput={params => <TextField {...params} label="Seleccionar cliente *" />}
        />
      </SectionCard>

      {/* Paciente */}
      <SectionCard title="Paciente" color={TEAL}>
        <Autocomplete fullWidth size="small"
          options={pacientes}
          getOptionLabel={option => option.name}
          value={pacienteSel}
          onChange={(_, v) => setPacienteSel(v)}
          renderInput={params => <TextField {...params} label="Seleccionar paciente *" />}
        />
      </SectionCard>

      {/* Trabajos */}
      <SectionCard title="Trabajos" color={GREEN}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={8}>
            <Autocomplete fullWidth size="small"
              options={trabajos}
              getOptionLabel={option => option.name}
              value={trabajos.find(t => t.id === trabajoTemp.id) || null}
              onChange={(_, v) => setTrabajoTemp({ id: v?.id, precio: v?.precio || 0 })}
              renderInput={params => <TextField {...params} label="Seleccionar trabajo *" />}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField fullWidth size="small" label="Precio"
              value={trabajoTemp.precio} onChange={e => setTrabajoTemp(p => ({ ...p, precio: e.target.value.replace(/[^0-9.]/g, "") }))}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <Button fullWidth variant="outlined" startIcon={<ToothIcon />} onClick={() => setOpenDientes(true)}
              sx={{ height: "100%", textTransform: "none", fontSize: "0.75rem" }}>
              Piezas {piezas.length > 0 && `(${piezas.length})`}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={agregarTrabajo}
              sx={{ background: GREEN, fontWeight: 700 }}>
              Agregar
            </Button>
          </Grid>
        </Grid>
        {trabajosAgregados.map((t, i) => (
          <Paper key={i} sx={{ p: 1.5, mt: 1.5, borderRadius: 2, bgcolor: `${GREEN}10` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" fontWeight={600}>{t.name}</Typography>
              <Chip label={`$${t.precio}`} size="small" sx={{ bgcolor: `${GREEN}20`, color: GREEN }} />
              <Typography variant="caption" sx={{ ml: "auto" }}>{t.piezas}</Typography>
              <IconButton size="small" onClick={() => setTrabajosAgregados(prev => prev.filter((_, idx) => idx !== i))}><ClearIcon fontSize="small" /></IconButton>
            </Stack>
          </Paper>
        ))}
      </SectionCard>

      {/* Detalles */}
      <SectionCard title="Detalles" color={TEAL}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Fecha Prometida" type="date"
              value={fechaPrometida} onChange={e => setFechaPrometida(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Select fullWidth size="small" value={prioridad} onChange={e => setPrioridad(e.target.value)}>
              {Object.keys(PRIORIDAD).map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Notas" multiline minRows={2}
              value={notas} onChange={e => setNotas(e.target.value)} />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Acciones */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
          <Button variant="contained" startIcon={<SaveIcon />} onClick={guardar}
            sx={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`, fontWeight: 700, flex: { xs: 1, sm: "unset" } }}>
            Guardar y Continuar
          </Button>
          <Button variant="outlined" startIcon={<PostAddIcon />} onClick={limpiar}
            sx={{ borderColor: GREEN, color: GREEN, fontWeight: 700, flex: { xs: 1, sm: "unset" } }}>
            Nuevo Trabajo
          </Button>
          <Button variant="contained" startIcon={<CheckCircleIcon />}
            sx={{ bgcolor: GREEN, "&:hover": { bgcolor: "#4a9d8c" }, fontWeight: 700, flex: { xs: 1, sm: "unset" } }}>
            Terminar Orden
          </Button>
          <Button variant="contained" startIcon={<ReceiptLongIcon />}
            sx={{ bgcolor: TEAL, "&:hover": { bgcolor: "#3e8490" }, fontWeight: 700, flex: { xs: 1, sm: "unset" } }}>
            Emitir Ticket
          </Button>
          {!isMobile && (
            <Button variant="outlined" startIcon={<PrintIcon />}
              sx={{ borderColor: theme.palette.divider, color: theme.palette.text.secondary, ml: { sm: "auto" } }}>
              Imprimir
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── Selector de dientes ────────────────────────────────────────────── */}
      <SelectorDientesSVG
        open={openDientes}
        onClose={() => setOpenDientes(false)}
        initialValue={piezas}
        multiple
        onSelect={arr => setPiezas(arr)}
      />

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      {isMobile && (
        <BottomNavigation
          value={0}
          sx={{ flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, height: 56 }}
        >
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ color: idx === 0 ? BLUE : theme.palette.text.secondary, minWidth: 0, "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" } }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}