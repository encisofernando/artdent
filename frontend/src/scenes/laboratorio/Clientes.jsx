// src/scenes/laboratorio/Clientes.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Fab, FormControlLabel, Grid, IconButton,
  InputAdornment, MenuItem, Paper, Select, Skeleton, Snackbar, Stack, Switch,
  TextField, Tooltip, Typography, useMediaQuery,
  BottomNavigation, BottomNavigationAction,
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
import ContentCopyIcon    from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon  from "@mui/icons-material/DeleteOutline";
import EditIcon           from "@mui/icons-material/Edit";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleAltIcon      from "@mui/icons-material/PeopleAlt";
import PersonOffIcon      from "@mui/icons-material/PersonOff";
import SaveIcon           from "@mui/icons-material/Save";
import SearchIcon         from "@mui/icons-material/Search";
import TrendingUpIcon     from "@mui/icons-material/TrendingUp";
import WarningAmberIcon   from "@mui/icons-material/WarningAmber";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "./_shared";
import { getClients, createClient, updateClient, deleteClient } from "../../services/clientService";

// ── Constantes ────────────────────────────────────────────────────────────────
const COMPANY_ID = 2;

const TIPOS = [
  { key: "clinica",     label: "Clínica",    color: BLUE     },
  { key: "odontologo",  label: "Odontólogo", color: TEAL     },
  { key: "otrolab",    label: "Otro Lab",   color: GREEN    },
  { key: "colegio",    label: "Colegio",    color: "#7CA5C3"},
  { key: "particular", label: "Particular", color: "#9B59B6"},
];

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

// ── Formulario vacío — siempre con company_id y strings vacíos (nunca null) ──
const emptyForm = () => ({
  company_id: COMPANY_ID,
  type:   "odontologo",
  name:   "",
  cuit:   "",
  phone:  "",
  email:  "",
  balance: 0,
  active: true,
  notes:  "",
});

// Sanitiza un cliente de la API: convierte null → "" para evitar warning de React
const sanitize = (r) => ({
  ...r,
  name:  r.name  ?? "",
  cuit:  r.cuit  ?? "",
  phone: r.phone ?? "",
  email: r.email ?? "",
  notes: r.notes ?? "",
  balance: r.balance ?? 0,
  active:  r.active  ?? true,
  type:    r.type    ?? "particular",
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

// Diálogo de confirmación de borrado — reemplaza window.confirm
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
        <Typography fontWeight={800} fontFamily="Montserrat, sans-serif">Eliminar cliente</Typography>
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
export default function Clientes() {
  const theme    = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall  = useMediaQuery(theme.breakpoints.down("sm"));

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [tipoFil,    setTipoFil]    = useState("all");
  const [form,       setForm]       = useState(emptyForm());
  const [editing,    setEditing]    = useState(null);   // null | id
  const [modalOpen,  setModalOpen]  = useState(false);
  const [confirm,    setConfirm]    = useState(null);   // null | { id, name }
  const [snack,      setSnack]      = useState({ open: false, msg: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});

  // ── Cargar clientes ─────────────────────────────────────────────────────────
  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClients({ company_id: COMPANY_ID });
      setRows((data ?? []).map(sanitize));
    } catch (err) {
      showSnack("Error al cargar clientes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const showSnack = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const tipoObj = (key) => TIPOS.find(t => t.key === key) ?? TIPOS[0];

  const setField = (key) => (e) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  // ── Filtrado local ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => rows.filter(r => {
    const q   = search.toLowerCase();
    const ms  = !search || r.name.toLowerCase().includes(q) || r.cuit.includes(q) || r.email.toLowerCase().includes(q);
    const mt  = tipoFil === "all" || r.type === tipoFil;
    return ms && mt;
  }), [rows, search, tipoFil]);

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    total:   rows.length,
    activos: rows.filter(r => r.active).length,
    deuda:   rows.filter(r => parseFloat(r.balance) < 0).length,
    favor:   rows.filter(r => parseFloat(r.balance) > 0).length,
  }), [rows]);

  // ── Modal ───────────────────────────────────────────────────────────────────
  const openNew  = ()  => {
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
      type:  row.type  ?? "particular",
      name:  row.name  ?? "",
      cuit:  row.cuit  ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      balance: row.balance ?? 0,
      active:  row.active  ?? true,
      notes:   row.notes   ?? "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "La razón social es obligatoria";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveForm = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        company_id: COMPANY_ID,
        type:    form.type,
        name:    form.name.trim(),
        cuit:    form.cuit.trim()  || null,
        phone:   form.phone.trim() || null,
        email:   form.email.trim() || null,
        balance: Number(form.balance) || 0,
        active:  form.active,
        notes:   form.notes.trim() || null,
      };

      let result;
      if (editing) {
        result = await updateClient(editing, payload);
        setRows(prev => prev.map(r => r.id === result.id ? sanitize(result) : r));
        showSnack("Cliente actualizado correctamente");
      } else {
        result = await createClient(payload);
        setRows(prev => [...prev, sanitize(result)]);
        showSnack("Cliente creado correctamente");
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err?.errors
        ? Object.values(err.errors).flat().join(" · ")
        : (err?.message ?? "Error al guardar el cliente");
      showSnack(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await deleteClient(confirm.id);
      setRows(prev => prev.filter(r => r.id !== confirm.id));
      showSnack("Cliente eliminado");
    } catch {
      showSnack("No se pudo eliminar el cliente", "error");
    } finally {
      setConfirm(null);
    }
  };

  const duplicate = (row) => {
    openNew();
    setForm({
      ...emptyForm(),
      type:  row.type,
      name:  row.name + " (copia)",
      cuit:  "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      notes: row.notes ?? "",
    });
  };

  // ── Columnas ────────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      field: "name", headerName: "Cliente", flex: 1, minWidth: 200,
      renderCell: ({ row }) => {
        const t = tipoObj(row.type);
        return (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: `${t.color}22`, color: t.color, fontSize: "0.78rem", fontWeight: 800 }}>
              {(row.name || "?")[0].toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{row.name}</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.67rem" }} noWrap>
                {row.cuit || "Sin CUIT"}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "type", headerName: "Tipo", width: 115,
      renderCell: ({ value }) => {
        const t = tipoObj(value);
        return (
          <Chip size="small" label={t.label}
            sx={{ bgcolor: `${t.color}18`, color: t.color, fontWeight: 700, fontSize: "0.68rem", border: `1px solid ${t.color}35` }} />
        );
      },
    },
    { field: "phone", headerName: "Teléfono", width: 135,
      renderCell: ({ value }) => <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{value || "—"}</Typography>,
    },
    { field: "email", headerName: "Email", flex: 1, minWidth: 170,
      renderCell: ({ value }) => <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} noWrap>{value || "—"}</Typography>,
    },
    {
      field: "balance", headerName: "Saldo", width: 115,
      renderCell: ({ value }) => {
        const n = parseFloat(value) || 0;
        const color = n < 0 ? theme.palette.error.main : n > 0 ? GREEN : theme.palette.text.disabled;
        return (
          <Typography variant="body2" fontWeight={700} sx={{ color }}>
            {n < 0 ? "−" : n > 0 ? "+" : ""}${Math.abs(n).toLocaleString("es-AR")}
          </Typography>
        );
      },
    },
    {
      field: "active", headerName: "Estado", width: 95,
      renderCell: ({ value }) => (
        <Chip size="small"
          icon={value
            ? <CheckCircleIcon sx={{ fontSize: "0.82rem !important", ml: "4px !important" }} />
            : <PersonOffIcon   sx={{ fontSize: "0.82rem !important", ml: "4px !important" }} />
          }
          label={value ? "Activo" : "Inactivo"}
          sx={{
            bgcolor: value ? `${GREEN}18` : `${theme.palette.error.main}12`,
            color:   value ? GREEN : theme.palette.error.main,
            fontWeight: 700, fontSize: "0.67rem",
            border: `1px solid ${value ? GREEN : theme.palette.error.main}35`,
          }}
        />
      ),
    },
    {
      field: "_actions", headerName: "", width: 110, sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: BLUE, "&:hover": { bgcolor: `${BLUE}12` } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicar">
            <IconButton size="small" onClick={() => duplicate(row)} sx={{ color: TEAL, "&:hover": { bgcolor: `${TEAL}12` } }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={() => setConfirm({ id: row.id, name: row.name })}
              sx={{ color: theme.palette.error.main, "&:hover": { bgcolor: `${theme.palette.error.main}12` } }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [theme, editing]); // eslint-disable-line

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ ...labPageSx, bgcolor: "background.default" }}>

      {/* ── Contenedor con scroll interno ──────────────────────────────────── */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <Box sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* ── Header ─────────────────────────────────────────────────────────── */}
          <Box sx={{
            px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
            background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(57,123,156,0.15)",
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{
                width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 },
                bgcolor: "rgba(255,255,255,0.2)", color: "#fff",
              }}>
                <PeopleAltIcon sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }} />
              </Avatar>
              <Box>
                <Typography variant={isSmall ? "subtitle1" : "h6"} fontWeight={900} color="#fff"
                  fontFamily="Montserrat, sans-serif" sx={{ lineHeight: 1.1 }}>
                  Clientes
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
                  {loading ? "Cargando…" : `${rows.length} cliente${rows.length !== 1 ? 's' : ''} registrado${rows.length !== 1 ? 's' : ''}`}
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
                Nuevo Cliente
              </Button>
            )}
          </Box>

      {/* ── Contenido ──────────────────────────────────────────────────────── */}
      <Box sx={{
        flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
        p: { xs: 1.5, sm: 2 }, gap: 1.5, overflow: "hidden",
      }}>

        {/* KPIs */}
        <Grid container spacing={1.5}>
          {[
            { label: "Total",      value: kpis.total,   icon: <PeopleAltIcon />,   color: BLUE                       },
            { label: "Activos",    value: kpis.activos, icon: <CheckCircleIcon />, color: GREEN                      },
            { label: "Con Deuda",  value: kpis.deuda,   icon: <PersonOffIcon />,   color: theme.palette.error.main   },
            { label: "A Favor",    value: kpis.favor,   icon: <AttachMoneyIcon />, color: TEAL                       },
          ].map(k => (
            <Grid item xs={6} sm={3} key={k.label}>
              <KpiCard {...k} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* Toolbar */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            size="small" fullWidth placeholder="Buscar por nombre, CUIT o email…"
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
            value={tipoFil} 
            onChange={e => setTipoFil(e.target.value)}
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
              if (value === "all") return "Todos los tipos";
              const tipo = TIPOS.find(t => t.key === value);
              return tipo ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tipo.color }} />
                  <span>{tipo.label}</span>
                </Stack>
              ) : "Todos los tipos";
            }}
          >
            <MenuItem value="all">
              <Typography>Todos los tipos</Typography>
            </MenuItem>
            {TIPOS.map(t => (
              <MenuItem key={t.key} value={t.key}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: t.color, flexShrink: 0 }} />
                  <span>{t.label}</span>
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
                  bgcolor: `${BLUE}0A`,
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
      {/* Fin del contenedor con scroll */}
      </Box>

      {/* ── Mobile FAB ─────────────────────────────────────────────────────── */}
      {isMobile && (
        <Fab size="medium" onClick={openNew}
          sx={{
            position: "fixed",
            bottom: 72,
            right: 16,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`,
            color: "#fff", boxShadow: "0 4px 20px rgba(57,123,156,0.45)",
            zIndex: 1000,
          }}>
          <AddIcon />
        </Fab>
      )}
      </Box>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      {isMobile && (
        <BottomNavigation value={1} sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          height: 56,
          zIndex: 1100,
        }}>
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: idx === 1 ? BLUE : theme.palette.text.secondary, minWidth: 0,
                "&.Mui-selected": { color: BLUE },
                "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" },
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
          background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`,
          color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          py: 1.8, px: 2.5,
        }}>
          {editing ? "Editar Cliente" : "Nuevo Cliente"}
          <IconButton onClick={() => setModalOpen(false)} size="small"
            disabled={saving} sx={{ color: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
          <Grid container spacing={2.5}>

            <Grid item xs={12} sm={5}>
              <Select fullWidth size="small" value={form.type} onChange={setField("type")}
                displayEmpty label="Tipo de cliente">
                {TIPOS.map(t => (
                  <MenuItem key={t.key} value={t.key}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: t.color, flexShrink: 0 }} />
                      <span>{t.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={7}>
              <TextField fullWidth size="small" label="Razón Social *"
                value={form.name} onChange={setField("name")}
                error={!!formErrors.name} helperText={formErrors.name}
                autoFocus
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CUIT"
                value={form.cuit} onChange={setField("cuit")}
                placeholder="20-12345678-9"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Teléfono"
                value={form.phone} onChange={setField("phone")}
                placeholder="011-1234-5678"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Email"
                type="email"
                value={form.email} onChange={setField("email")}
                placeholder="contacto@ejemplo.com"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notas" multiline minRows={2}
                value={form.notes} onChange={setField("notes")}
                placeholder="Indicaciones especiales, preferencias…"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{
                px: 2, py: 1.2, borderRadius: 2, display: "flex",
                alignItems: "center", justifyContent: "space-between",
                border: `1px solid ${form.active ? `${GREEN}55` : theme.palette.divider}`,
                bgcolor: form.active ? `${GREEN}08` : "transparent",
                transition: "all .15s",
              }}>
                <Box>
                  <Typography variant="body2" fontWeight={700}>Estado del cliente</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {form.active ? "Visible y disponible para órdenes" : "No aparecerá en nuevas órdenes"}
                  </Typography>
                </Box>
                <Switch checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: GREEN },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: GREEN },
                  }}
                />
              </Paper>
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
            sx={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`, fontWeight: 700, minWidth: 120 }}>
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