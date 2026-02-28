// src/scenes/laboratorio/Pacientes.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Fab, FormControlLabel, Grid, IconButton,
  InputAdornment, MenuItem, Paper, Select, Skeleton, Snackbar, Stack, Switch,
  TextField, Typography, useMediaQuery, BottomNavigation, BottomNavigationAction,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Icons
import AddIcon            from "@mui/icons-material/Add";
import AssignmentIcon     from "@mui/icons-material/Assignment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AttachMoneyIcon    from "@mui/icons-material/AttachMoney";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import CloseIcon          from "@mui/icons-material/Close";
import DeleteOutlineIcon  from "@mui/icons-material/DeleteOutline";
import EditIcon           from "@mui/icons-material/Edit";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleAltIcon      from "@mui/icons-material/PeopleAlt";
import PersonIcon         from "@mui/icons-material/Person";
import SaveIcon           from "@mui/icons-material/Save";
import SearchIcon         from "@mui/icons-material/Search";
import TrendingUpIcon     from "@mui/icons-material/TrendingUp";
import WarningAmberIcon   from "@mui/icons-material/WarningAmber";
import WcIcon             from "@mui/icons-material/Wc";
import CakeIcon           from "@mui/icons-material/Cake";
import PhoneIcon          from "@mui/icons-material/Phone";
import EmailIcon          from "@mui/icons-material/Email";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "./_shared";
import { getPatients, createPatient, updatePatient, deletePatient } from "../../services/patientService";

// ── Constantes ────────────────────────────────────────────────────────────────
const COMPANY_ID = 2;

const GENERO = [
  { key: "male",   label: "Masculino", icon: "♂", color: BLUE },
  { key: "female", label: "Femenino",  icon: "♀", color: "#E91E63" },
  { key: "other",  label: "Otro",      icon: "⚥", color: TEAL },
];

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

// ── Formulario vacío ──────────────────────────────────────────────────────────
const emptyForm = () => ({
  company_id: COMPANY_ID,
  first_name: "",
  last_name:  "",
  date_of_birth: "",
  gender: "male",
  phone:  "",
  email:  "",
  address: "",
  notes:  "",
});

// Sanitiza un paciente de la API
const sanitize = (r) => ({
  ...r,
  first_name: r.first_name ?? "",
  last_name:  r.last_name  ?? "",
  date_of_birth: r.date_of_birth ?? "",
  gender: r.gender ?? "male",
  phone:  r.phone  ?? "",
  email:  r.email  ?? "",
  address: r.address ?? "",
  notes:  r.notes  ?? "",
});

// ── Subcomponentes ────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, loading }) {
  const theme = useTheme();
  return (
    <Paper sx={{
      p: { xs: 1.5, sm: 2 }, borderRadius: 2,
      border: `1px solid ${color}30`,
      bgcolor: `${color}08`,
      transition: "all 0.2s",
      "&:hover": { 
        transform: "translateY(-2px)", 
        boxShadow: `0 4px 12px ${color}30`,
        border: `1px solid ${color}50`,
      },
    }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="caption" sx={{
            color: theme.palette.text.secondary, fontWeight: 600,
            textTransform: "uppercase", fontSize: "0.63rem", letterSpacing: "0.06em",
          }}>
            {label}
          </Typography>
          {loading
            ? <Skeleton width={48} height={32} sx={{ mt: 0.3 }} />
            : <Typography variant="h5" fontWeight={900}
                sx={{ color, fontFamily: "Montserrat, sans-serif", mt: 0.3, lineHeight: 1.15 }}>
                {value}
              </Typography>
          }
        </Box>
        <Box sx={{
          width: 36, height: 36, borderRadius: 1.5,
          bgcolor: `${color}20`, display: "flex",
          alignItems: "center", justifyContent: "center", color,
          transition: "all 0.2s",
        }}>
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// Diálogo de confirmación de borrado
function ConfirmDialog({ open, onClose, onConfirm, name }) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: `${theme.palette.error.main}15`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WarningAmberIcon sx={{ color: theme.palette.error.main, fontSize: "1.2rem" }} />
        </Box>
        <Typography fontWeight={800} fontFamily="Montserrat, sans-serif">Eliminar paciente</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          ¿Estás seguro que querés eliminar a <strong style={{ color: theme.palette.text.primary }}>{name}</strong>?
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: theme.palette.divider, color: theme.palette.text.secondary }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained"
          sx={{ bgcolor: theme.palette.error.main, "&:hover": { bgcolor: theme.palette.error.dark }, fontWeight: 700 }}>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Pacientes() {
  const theme    = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall  = useMediaQuery(theme.breakpoints.down("sm"));

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [generoFil,  setGeneroFil]  = useState("all");
  const [form,       setForm]       = useState(emptyForm());
  const [editing,    setEditing]    = useState(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [confirm,    setConfirm]    = useState(null);
  const [snack,      setSnack]      = useState({ open: false, msg: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});

  // ── Cargar pacientes ────────────────────────────────────────────────────────
  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatients({ company_id: COMPANY_ID });
      setRows((data ?? []).map(sanitize));
    } catch (err) {
      showSnack("Error al cargar pacientes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const showSnack = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const setField = (field) => (e) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const generoObj = (key) => GENERO.find(g => g.key === key) || GENERO[0];

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = rows.length;
    const hombres = rows.filter(r => r.gender === "male").length;
    const mujeres = rows.filter(r => r.gender === "female").length;
    const hoy = new Date();
    const cumpleañeros = rows.filter(r => {
      if (!r.date_of_birth) return false;
      const fecha = new Date(r.date_of_birth);
      return fecha.getMonth() === hoy.getMonth();
    }).length;
    return { total, hombres, mujeres, cumpleañeros };
  }, [rows]);

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let temp = rows;
    if (generoFil !== "all") temp = temp.filter(r => r.gender === generoFil);
    if (search) {
      const s = search.toLowerCase();
      temp = temp.filter(r => 
        (r.first_name ?? "").toLowerCase().includes(s) ||
        (r.last_name  ?? "").toLowerCase().includes(s) ||
        (r.phone      ?? "").toLowerCase().includes(s) ||
        (r.email      ?? "").toLowerCase().includes(s)
      );
    }
    return temp;
  }, [rows, generoFil, search]);

  // ── Acciones ────────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row.id);
    setForm({
      company_id: COMPANY_ID,
      id:    row.id,
      first_name: row.first_name ?? "",
      last_name:  row.last_name  ?? "",
      date_of_birth: row.date_of_birth ?? "",
      gender: row.gender ?? "male",
      phone:  row.phone  ?? "",
      email:  row.email  ?? "",
      address: row.address ?? "",
      notes:  row.notes  ?? "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "El nombre es obligatorio";
    if (!form.last_name.trim())  errs.last_name  = "El apellido es obligatorio";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveForm = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        company_id: COMPANY_ID,
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        phone:  form.phone.trim() || null,
        email:  form.email.trim() || null,
        address: form.address.trim() || null,
        notes:  form.notes.trim() || null,
      };
      if (editing) {
        await updatePatient(editing, payload);
        showSnack("Paciente actualizado");
      } else {
        await createPatient(payload);
        showSnack("Paciente creado");
      }
      setModalOpen(false);
      loadPatients();
    } catch (err) {
      console.error("Error guardando paciente:", err);
      showSnack("Error al guardar paciente", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePatient(confirm.id);
      loadPatients();
      showSnack("Paciente eliminado");
    } catch {
      showSnack("No se pudo eliminar el paciente", "error");
    } finally {
      setConfirm(null);
    }
  };

  // ── Columnas ────────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      field: "name",
      headerName: "Paciente",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => {
        const g = generoObj(row.gender);
        const fullName = `${row.first_name} ${row.last_name}`;
        return (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ 
              width: 36, height: 36, 
              bgcolor: `${g.color}22`, 
              color: g.color, 
              fontSize: "0.9rem", 
              fontWeight: 800 
            }}>
              {g.icon}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{fullName}</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.67rem" }} noWrap>
                {row.phone || "Sin teléfono"}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "gender",
      headerName: "Género",
      width: 120,
      renderCell: ({ value }) => {
        const g = generoObj(value);
        return (
          <Chip
            label={g.label}
            size="small"
            icon={<WcIcon />}
            sx={{ bgcolor: `${g.color}18`, color: g.color, fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: "date_of_birth",
      headerName: "Fecha Nac.",
      width: 130,
      valueFormatter: ({ value }) => {
        if (!value) return "-";
        const fecha = new Date(value);
        return fecha.toLocaleDateString("es-AR");
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: ({ value }) => (
        <Typography variant="body2" noWrap>
          {value || "-"}
        </Typography>
      ),
    },
    {
      field: "phone",
      headerName: "Teléfono",
      width: 140,
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => openEdit(row)}
            sx={{ color: BLUE, "&:hover": { bgcolor: `${BLUE}18` } }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setConfirm({ id: row.id, name: `${row.first_name} ${row.last_name}` })}
            sx={{ color: theme.palette.error.main, "&:hover": { bgcolor: `${theme.palette.error.main}18` } }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [theme]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ ...labPageSx, bgcolor: theme.palette.mode === "dark" ? "#0A1929" : "#f5f7fa" }}>
      {/* ── Contenedor con scroll interno ──────────────────────────────── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <Box sx={{
            px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
            background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(73,148,156,0.15)",
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{
                width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 },
                bgcolor: "rgba(255,255,255,0.2)", color: "#fff",
              }}>
                <PersonIcon sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }} />
              </Avatar>
              <Box>
                <Typography variant={isSmall ? "subtitle1" : "h6"} fontWeight={900} color="#fff"
                  fontFamily="Montserrat, sans-serif" sx={{ lineHeight: 1.1 }}>
                  Pacientes
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
                  {loading ? "Cargando…" : `${rows.length} paciente${rows.length !== 1 ? 's' : ''} registrado${rows.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            </Stack>

            {!isMobile && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.2)", 
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }, 
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                Nuevo Paciente
              </Button>
            )}
          </Box>

          {/* ── Contenido ──────────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: { xs: 1.5, sm: 2 }, gap: 1.5, overflow: "hidden" }}>

            {/* KPIs */}
            <Grid container spacing={1.5}>
              {[
                { label: "Total",        value: kpis.total,        icon: <PersonIcon />,     color: TEAL                     },
                { label: "Hombres",      value: kpis.hombres,      icon: <WcIcon />,         color: BLUE                     },
                { label: "Mujeres",      value: kpis.mujeres,      icon: <WcIcon />,         color: "#E91E63"                },
                { label: "Cumpleaños",   value: kpis.cumpleañeros, icon: <CakeIcon />,       color: GREEN                    },
              ].map(k => (
                <Grid item xs={6} sm={3} key={k.label}>
                  <KpiCard {...k} loading={loading} />
                </Grid>
              ))}
            </Grid>

            {/* Toolbar */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
              <TextField
                size="small" fullWidth placeholder="Buscar por nombre, teléfono o email…"
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: "1.1rem" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Select 
                size="small" 
                value={generoFil} 
                onChange={e => setGeneroFil(e.target.value)}
                sx={{ 
                  minWidth: 180, 
                  flexShrink: 0,
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  },
                }}
                renderValue={(value) => {
                  if (value === "all") return "Todos los géneros";
                  const genero = GENERO.find(g => g.key === value);
                  return genero ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{genero.icon}</span>
                      <span>{genero.label}</span>
                    </Stack>
                  ) : "Todos los géneros";
                }}
              >
                <MenuItem value="all">
                  <Typography>Todos los géneros</Typography>
                </MenuItem>
                {GENERO.map(g => (
                  <MenuItem key={g.key} value={g.key}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            {/* DataGrid */}
            <Paper sx={{
              flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              bgcolor: theme.palette.background.paper,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              {loading ? (
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={36} />
                  ))}
                </Box>
              ) : (
                <DataGrid
                  rows={filtered} columns={columns}
                  density="compact"
                  disableRowSelectionOnClick hideFooterSelectedRowCount
                  pageSizeOptions={[25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                  localeText={{
                    noRowsLabel: "Sin resultados",
                    footerRowSelected: (count) => `${count} seleccionado${count !== 1 ? "s" : ""}`,
                  }}
                  sx={{
                    height: "100%", border: "none",
                    "& .MuiDataGrid-columnHeaders": {
                      bgcolor: `${TEAL}0A`,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      fontWeight: 700,
                    },
                    "& .MuiDataGrid-columnHeaderTitle": { 
                      fontWeight: 700, 
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    },
                    "& .MuiDataGrid-row": {
                      cursor: "pointer",
                      transition: "all 0.15s",
                    },
                    "& .MuiDataGrid-row:hover": { 
                      bgcolor: `${MINT}18`,
                      transform: "scale(1.005)",
                    },
                    "& .MuiDataGrid-cell": { 
                      alignItems: "center",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                />
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* ── Mobile FAB ─────────────────────────────────────────────────────── */}
      {isMobile && (
        <Fab size="medium" onClick={openNew}
          sx={{
            position: "fixed",
            bottom: 72,
            right: 16,
            background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`,
            color: "#fff", boxShadow: "0 4px 20px rgba(73,148,156,0.45)",
            zIndex: 1000,
          }}>
          <AddIcon />
        </Fab>
      )}

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      {isMobile && (
        <BottomNavigation
          value={1}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            height: 56,
            zIndex: 1100,
          }}
        >
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction 
              key={item.label} 
              label={item.label} 
              icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ 
                color: idx === 1 ? TEAL : theme.palette.text.secondary,
                "&.Mui-selected": { color: TEAL },
                minWidth: 0,
                "& .MuiBottomNavigationAction-label": { 
                  fontSize: "0.62rem",
                  fontWeight: idx === 1 ? 700 : 400,
                },
              }}
            />
          ))}
        </BottomNavigation>
      )}

      {/* ── Diálogo Nuevo / Editar ────────────────────────────────────────── */}
      <Dialog
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        maxWidth="sm" fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`,
          color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          py: 1.8, px: 2.5,
        }}>
          {editing ? "Editar Paciente" : "Nuevo Paciente"}
          <IconButton onClick={() => setModalOpen(false)} size="small"
            disabled={saving} sx={{ color: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
          <Grid container spacing={2.5}>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Nombre *"
                value={form.first_name} onChange={setField("first_name")}
                error={!!formErrors.first_name} helperText={formErrors.first_name}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ fontSize: "1.1rem", color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Apellido *"
                value={form.last_name} onChange={setField("last_name")}
                error={!!formErrors.last_name} helperText={formErrors.last_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Select fullWidth size="small" value={form.gender} onChange={setField("gender")}
                displayEmpty>
                {GENERO.map(g => (
                  <MenuItem key={g.key} value={g.key}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Fecha de Nacimiento" type="date"
                value={form.date_of_birth} onChange={setField("date_of_birth")}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CakeIcon sx={{ fontSize: "1.1rem", color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Teléfono"
                value={form.phone} onChange={setField("phone")}
                placeholder="011-1234-5678"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ fontSize: "1.1rem", color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Email"
                type="email"
                value={form.email} onChange={setField("email")}
                placeholder="paciente@ejemplo.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: "1.1rem", color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Dirección"
                value={form.address} onChange={setField("address")}
                placeholder="Calle, número, ciudad..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notas" multiline minRows={2}
                value={form.notes} onChange={setField("notes")}
                placeholder="Alergias, condiciones especiales, preferencias..."
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} disabled={saving}
            sx={{ color: theme.palette.text.secondary }}>
            Cancelar
          </Button>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={saveForm} disabled={saving}
            sx={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${GREEN} 100%)`, fontWeight: 700, minWidth: 120 }}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Diálogo de confirmación borrado ──────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        name={confirm?.name ?? ""}
      />

      {/* ── Snackbar ──────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}
          onClose={() => setSnack(p => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}