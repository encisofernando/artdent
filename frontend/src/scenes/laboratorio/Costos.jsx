// src/scenes/laboratorio/Costos.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, InputAdornment, LinearProgress, MenuItem, Paper, Select,
  Stack, Tab, Tabs, TextField, Tooltip, Typography, useMediaQuery, Autocomplete,
  BottomNavigation, BottomNavigationAction, Fab, FormControl, InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import AddIcon            from "@mui/icons-material/Add";
import EditIcon           from "@mui/icons-material/Edit";
import DeleteOutlineIcon  from "@mui/icons-material/DeleteOutline";
import SearchIcon         from "@mui/icons-material/Search";
import TrendingUpIcon     from "@mui/icons-material/TrendingUp";
import SaveIcon           from "@mui/icons-material/Save";
import AssignmentIcon     from "@mui/icons-material/Assignment";
import PeopleAltIcon      from "@mui/icons-material/PeopleAlt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CloseIcon          from "@mui/icons-material/Close";
import InventoryIcon      from "@mui/icons-material/Inventory";
import BuildIcon          from "@mui/icons-material/Build";
import LocalShippingIcon  from "@mui/icons-material/LocalShipping";
import HandymanIcon       from "@mui/icons-material/Handyman";
import CategoryIcon       from "@mui/icons-material/Category";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "./_shared";

import { getCosts, createCost, updateCost, deleteCost } from "../../services/costService";

const TIPOS_COSTO = [
  { key: "material",    label: "Material",       icon: <InventoryIcon />,     color: BLUE     },
  { key: "mano_obra",  label: "Mano de Obra",    icon: <HandymanIcon />,      color: TEAL     },
  { key: "herramienta",label: "Herramienta",     icon: <BuildIcon />,         color: GREEN    },
  { key: "logistica",  label: "Logística",       icon: <LocalShippingIcon />, color: "#7CA5C3"},
  { key: "otros",      label: "Otros",           icon: <CategoryIcon />,      color: "#9B59B6"},
];

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

const calcTotal = (unitario, cantidad) => (parseFloat(unitario) || 0) * (parseInt(cantidad) || 0);
const calcSugerido = (total, margen) => {
  const pct = (parseFloat(margen) || 0) / 100;
  return Math.round(total * (1 + pct));
};

export default function Costos() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bottomNavH = isMobile ? 56 : 0;

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    job_id: null,
    type: "material",
    description: "",
    supplier: "",
    unit: "",
    unit_cost: "",
    quantity: "1",
    margin: "30",
    total: "0",
    suggested: "0",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadCosts = async () => {
      try {
        const data = await getCosts({ company_id: 2, search });  // Asume company_id=2, ajusta según auth
        setRows(data);
      } catch (err) {
        console.error("Error cargando costos:", err);
        // Opcional: mostrar notificación de error
      }
    };
    loadCosts();
  }, [search]);

  const openModal = (row = null) => {
    if (row) {
      setForm({
        id: row.id,
        job_id: row.job_id,
        type: row.type,
        description: row.description,
        supplier: row.supplier,
        unit: row.unit,
        unit_cost: row.unit_cost,
        quantity: row.quantity,
        margin: row.margin,
        total: row.total,
        suggested: row.suggested,
      });
      setEditing(true);
    } else {
      setForm({
        job_id: null,
        type: "material",
        description: "",
        supplier: "",
        unit: "",
        unit_cost: "",
        quantity: "1",
        margin: "30",
        total: "0",
        suggested: "0",
      });
      setEditing(false);
    }
    setModalOpen(true);
  };

  const saveForm = async () => {
    const total = calcTotal(form.unit_cost, form.quantity);
    const suggested = calcSugerido(total, form.margin);
    const dataToSave = { ...form, total, suggested };

    try {
      let updatedCost;
      if (editing) {
        updatedCost = await updateCost(form.id, dataToSave);
      } else {
        updatedCost = await createCost(dataToSave);
      }
      setRows(prev => editing
        ? prev.map(r => r.id === updatedCost.id ? updatedCost : r)
        : [...prev, updatedCost]
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Error guardando costo:", err);
      // Opcional: mostrar error en UI
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este costo?")) {
      try {
        await deleteCost(id);
        setRows(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error("Error eliminando costo:", err);
      }
    }
  };

  const columns = useMemo(() => [
    { field: "job", headerName: "Trabajo", flex: 1, valueGetter: ({ row }) => row.job?.ticket_number || row.job || "" },
    {
      field: "type",
      headerName: "Tipo",
      width: 120,
      renderCell: ({ value }) => {
        const tipo = TIPOS_COSTO.find(t => t.key === value);
        return tipo ? (
          <Chip icon={tipo.icon} label={tipo.label} size="small" sx={{ bgcolor: `${tipo.color}22`, color: tipo.color }} />
        ) : value;
      },
    },
    { field: "description", headerName: "Descripción", flex: 1 },
    { field: "supplier", headerName: "Proveedor", width: 120 },
    { field: "unit", headerName: "Unidad", width: 80 },
    { field: "unit_cost", headerName: "Unitario", width: 100, valueFormatter: ({ value }) => `$${value}` },
    { field: "quantity", headerName: "Cant.", width: 80 },
    { field: "margin", headerName: "Margen", width: 80, valueFormatter: ({ value }) => `${value}%` },
    { field: "total", headerName: "Total", width: 100, valueFormatter: ({ value }) => `$${value}` },
    { field: "suggested", headerName: "Sugerido", width: 120, valueFormatter: ({ value }) => `$${value}` },
    {
      field: "actions",
      headerName: "",
      width: 100,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => openModal(row)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(row.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ], []);

  const filteredRows = useMemo(() => {
    return rows.filter(r => r.description.toLowerCase().includes(search.toLowerCase()));
  }, [rows, search]);

  return (
    <Box sx={{ ...labPageSx, pt: { xs: 2, sm: 3 }, pb: bottomNavH }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5" fontWeight={800} sx={{ color: BLUE, fontFamily: "Montserrat, sans-serif" }}>
            Costos
          </Typography>
          <Chip label={`${rows.length} ítems`} size="small" sx={{ bgcolor: `${BLUE}15`, color: BLUE, fontWeight: 600 }} />
          {!isMobile && (
            <Button variant="contained" size="small" startIcon={<AddIcon />}
              onClick={() => openModal()}
              sx={{ ml: "auto", background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`, fontWeight: 700 }}>
              Nuevo
            </Button>
          )}
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar por descripción..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          "& .MuiTab-root": { fontWeight: 600, color: theme.palette.text.secondary },
          "& .Mui-selected": { color: BLUE },
        }}>
        {TIPOS_COSTO.map((t, i) => <Tab key={t.key} label={t.label} />)}
      </Tabs>

      {/* Grid */}
      <Box sx={{ flex: 1, overflow: "hidden", px: { xs: 0, sm: 3 } }}>
        <DataGrid
          rows={filteredRows.filter(r => r.type === TIPOS_COSTO[tab].key)}
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

      {/* Mobile FAB */}
      {isMobile && (
        <Fab size="medium" onClick={() => openModal()}
          sx={{
            position: "absolute", bottom: bottomNavH + 16, right: 16,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`,
            color: "#fff", boxShadow: "0 4px 16px rgba(57,123,156,0.4)",
          }}>
          <AddIcon />
        </Fab>
      )}

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <BottomNavigation value={4} sx={{ flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, height: 56 }}>
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ color: idx === 4 ? BLUE : theme.palette.text.secondary, minWidth: 0, "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" } }}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`,
          color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {editing ? "Editar Costo" : "Nuevo Costo"}
          <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete fullWidth size="small" freeSolo
                options={[]}  // Puedes cargar trabajos reales aquí con getJobs si quieres
                value={form.job_id || ""}
                onChange={(_, v) => setForm(p => ({ ...p, job_id: v }))}
                renderInput={params => <TextField {...params} label="Trabajo asociado (opcional)" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select value={form.type} label="Tipo" onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {TIPOS_COSTO.map(t => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Descripción *"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Proveedor"
                value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="C. Unitario"
                value={form.unit_cost} onChange={e => setForm(p => ({ ...p, unit_cost: e.target.value.replace(/[^0-9.]/g,"") }))}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: BLUE }}>$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Cantidad" type="number"
                value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value.replace(/\D/,"") }))} inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField fullWidth size="small" label="Margen %"
                value={form.margin} onChange={e => setForm(p => ({ ...p, margin: e.target.value.replace(/[^0-9.]/g,"") }))}
                InputProps={{ endAdornment: <InputAdornment position="end" sx={{ color: TEAL }}>%</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <Paper sx={{ p: 1.5, borderRadius: 2, background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`, border: "none" }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.62rem" }}>P. Sugerido</Typography>
                <Typography variant="h6" fontWeight={900} sx={{ color: "#fff" }}>
                  ${calcSugerido(calcTotal(form.unit_cost, form.quantity), form.margin).toLocaleString("es-AR")}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: theme.palette.text.secondary }}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={saveForm}
            sx={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${BLUE} 100%)`, fontWeight: 700 }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}