// src/scenes/laboratorio/Aranceles.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, InputAdornment, MenuItem, Paper, Select, Stack, Tab, Tabs,
  TextField, Tooltip, Typography, useMediaQuery, BottomNavigation, BottomNavigationAction,
  Fab, InputLabel, FormControl,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import AddIcon             from "@mui/icons-material/Add";
import EditIcon            from "@mui/icons-material/Edit";
import DeleteOutlineIcon   from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon     from "@mui/icons-material/ContentCopy";
import SearchIcon          from "@mui/icons-material/Search";
import MonetizationOnIcon  from "@mui/icons-material/MonetizationOn";
import SaveIcon            from "@mui/icons-material/Save";
import AssignmentIcon      from "@mui/icons-material/Assignment";
import PeopleAltIcon       from "@mui/icons-material/PeopleAlt";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import TrendingUpIcon      from "@mui/icons-material/TrendingUp";
import CloseIcon           from "@mui/icons-material/Close";
import LightbulbIcon       from "@mui/icons-material/Lightbulb";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "./_shared";

import { getTariffs, createTariff, updateTariff, deleteTariff } from "../../services/tariffService";

const CATEGORIAS = ["Coronas y Puentes", "Prótesis Removible", "Implantología", "Ortodoncia", "Impresión 3D", "Carillas", "Endodoncia", "Otros"];
const UNIDADES   = ["pieza", "juego", "kit", "par", "unidad"];
const LISTAS = [
  { key: "base",        label: "Lista Base",     pct: 100 },
  { key: "odontologoA", label: "Odontólogo A",   pct: 90  },
  { key: "odontologoB", label: "Odontólogo B",   pct: 85  },
  { key: "clinica",     label: "Clínica",         pct: 80  },
  { key: "otrolab",     label: "Otro Lab",        pct: 75  },
];
const CAT_COLORS = {
  "Coronas y Puentes":  BLUE,
  "Prótesis Removible": TEAL,
  "Implantología":      GREEN,
  "Ortodoncia":         "#7CA5C3",
  "Impresión 3D":       "#9B59B6",
  "Carillas":           "#E67E22",
  "Endodoncia":         "#E74C3C",
  "Otros":              "#95A5A6",
};

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

export default function Aranceles() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bottomNavH = isMobile ? 56 : 0;

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    active: true,
    base_price: "",
    price_a: "",
    price_b: "",
    price_cli: "",
    price_lab: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadTariffs = async () => {
      try {
        const data = await getTariffs({ company_id: 1, search });  // Asume company_id=1, ajusta según auth
        setRows(data);
      } catch (err) {
        console.error("Error cargando aranceles:", err);
        // Opcional: mostrar notificación de error
      }
    };
    loadTariffs();
  }, [search]);

  const handleBaseChange = (value) => {
    const base = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    setForm(p => ({
      ...p,
      base_price: base,
      price_a:    Math.round(base * 0.90),
      price_b:    Math.round(base * 0.85),
      price_cli:  Math.round(base * 0.80),
      price_lab:  Math.round(base * 0.75),
    }));
  };

  const openModal = (row = null) => {
    if (row) {
      setForm({
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category,
        unit: row.unit,
        active: row.active,
        base_price: row.base_price,
        price_a: row.price_a,
        price_b: row.price_b,
        price_cli: row.price_cli,
        price_lab: row.price_lab,
      });
      setEditing(true);
    } else {
      setForm({
        code: "",
        name: "",
        category: "",
        unit: "",
        active: true,
        base_price: "",
        price_a: "",
        price_b: "",
        price_cli: "",
        price_lab: "",
      });
      setEditing(false);
    }
    setModalOpen(true);
  };

  const saveForm = async () => {
    try {
      let updatedTariff;
      if (editing) {
        updatedTariff = await updateTariff(form.id, form);
      } else {
        updatedTariff = await createTariff(form);
      }
      setRows(prev => editing
        ? prev.map(r => r.id === updatedTariff.id ? updatedTariff : r)
        : [...prev, updatedTariff]
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Error guardando arancel:", err);
      // Opcional: mostrar error en UI
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este arancel?")) {
      try {
        await deleteTariff(id);
        setRows(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error("Error eliminando arancel:", err);
      }
    }
  };

  const columns = useMemo(() => [
    { field: "code", headerName: "Código", width: 100 },
    { field: "name", headerName: "Nombre", flex: 1 },
    {
      field: "category",
      headerName: "Categoría",
      width: 150,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" sx={{ bgcolor: `${CAT_COLORS[value]}22`, color: CAT_COLORS[value] }} />
      ),
    },
    { field: "unit", headerName: "Unidad", width: 100 },
    {
      field: "active",
      headerName: "Activo",
      width: 80,
      renderCell: ({ value }) => value ? <CheckCircleIcon sx={{ color: GREEN }} /> : <CloseIcon sx={{ color: "#E74C3C" }} />,
    },
    { field: "base_price", headerName: "Base", width: 100, valueFormatter: ({ value }) => `$${value}` },
    { field: "price_a", headerName: "Odont. A", width: 100, valueFormatter: ({ value }) => `$${value}` },
    { field: "price_b", headerName: "Odont. B", width: 100, valueFormatter: ({ value }) => `$${value}` },
    { field: "price_cli", headerName: "Clínica", width: 100, valueFormatter: ({ value }) => `$${value}` },
    { field: "price_lab", headerName: "Otro Lab", width: 100, valueFormatter: ({ value }) => `$${value}` },
    {
      field: "actions",
      headerName: "",
      width: 120,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => openModal(row)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(row.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
          <IconButton size="small"><ContentCopyIcon fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ], []);

  const filteredRows = useMemo(() => {
    return rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.includes(search));
  }, [rows, search]);

  return (
    <Box sx={{ ...labPageSx, pt: { xs: 2, sm: 3 }, pb: bottomNavH }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5" fontWeight={800} sx={{ color: TEAL, fontFamily: "Montserrat, sans-serif" }}>
            Aranceles
          </Typography>
          <Chip label={`${rows.length} ítems`} size="small" sx={{ bgcolor: `${TEAL}15`, color: TEAL, fontWeight: 600 }} />
          {!isMobile && (
            <Button variant="contained" size="small" startIcon={<AddIcon />}
              onClick={() => openModal()}
              sx={{ ml: "auto", background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`, fontWeight: 700 }}>
              Nuevo
            </Button>
          )}
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar por código o nombre..."
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
          "& .Mui-selected": { color: TEAL },
        }}>
        {LISTAS.map((l, i) => <Tab key={l.key} label={l.label} />)}
      </Tabs>

      {/* Grid */}
      <Box sx={{ flex: 1, overflow: "hidden", px: { xs: 0, sm: 3 } }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          density="compact"
          hideFooterSelectedRowCount
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: `${TEAL}0A` },
            "& .MuiDataGrid-row:hover": { bgcolor: `${MINT}18` },
          }}
        />
      </Box>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab size="medium" onClick={() => openModal()}
          sx={{
            position: "absolute", bottom: bottomNavH + 16, right: 16,
            background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`,
            color: "#fff", boxShadow: "0 4px 16px rgba(57,123,156,0.4)",
          }}>
          <AddIcon />
        </Fab>
      )}

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <BottomNavigation value={3} sx={{ flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, height: 56 }}>
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ color: idx === 3 ? TEAL : theme.palette.text.secondary, minWidth: 0, "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" } }}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`,
          color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {editing ? "Editar Arancel" : "Nuevo Arancel"}
          <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Código *"
                value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth size="small" label="Nombre del trabajo *"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select value={form.category} label="Categoría" onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIAS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Unidad</InputLabel>
                <Select value={form.unit} label="Unidad" onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                  {UNIDADES.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Precios */}
          <Box sx={{ mt: 2.5, mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: TEAL, fontFamily: "Montserrat, sans-serif" }}>
                Precios escalonados
              </Typography>
              <Chip size="small" icon={<LightbulbIcon sx={{ fontSize: "0.75rem !important" }} />}
                label="Al ingresar Base se calculan los demás"
                sx={{ bgcolor: `${TEAL}15`, color: TEAL, fontSize: "0.65rem", fontWeight: 600 }} />
            </Stack>
            <Grid container spacing={1.5}>
              {[
                { key: "base_price", label: "Lista Base (100%)", onChange: handleBaseChange },
                { key: "price_a",    label: "Odontólogo A (90%)" },
                { key: "price_b",    label: "Odontólogo B (85%)" },
                { key: "price_cli",  label: "Clínica (80%)" },
                { key: "price_lab",  label: "Otro Lab (75%)" },
              ].map(({ key, label, onChange }) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    size="small"
                    label={label}
                    value={form[key]}
                    onChange={e =>
                      onChange
                        ? onChange(e.target.value)
                        : setForm(p => ({
                            ...p,
                            [key]: e.target.value.replace(/[^0-9.]/g, "")
                          }))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ color: TEAL }}>
                          $
                        </InputAdornment>
                      )
                    }}
                    sx={
                      key === "base_price"
                        ? {
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: TEAL,
                                borderWidth: 1.5
                              }
                            }
                          }
                        : {}
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: theme.palette.text.secondary }}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={saveForm}
            sx={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`, fontWeight: 700 }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}