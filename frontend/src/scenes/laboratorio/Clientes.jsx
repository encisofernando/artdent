// src/scenes/laboratorio/Clientes.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControlLabel, Grid, IconButton, InputAdornment, MenuItem, Paper, Select,
  Stack, Switch, TextField, Tooltip, Typography, useMediaQuery, Avatar,
  BottomNavigation, BottomNavigationAction, Fab,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

import AddIcon             from "@mui/icons-material/Add";
import EditIcon            from "@mui/icons-material/Edit";
import DeleteOutlineIcon   from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon     from "@mui/icons-material/ContentCopy";
import SearchIcon          from "@mui/icons-material/Search";
import PeopleAltIcon       from "@mui/icons-material/PeopleAlt";
import PersonOffIcon       from "@mui/icons-material/PersonOff";
import AttachMoneyIcon     from "@mui/icons-material/AttachMoney";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import SaveIcon            from "@mui/icons-material/Save";
import AssignmentIcon      from "@mui/icons-material/Assignment";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon  from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon      from "@mui/icons-material/TrendingUp";
import CloseIcon           from "@mui/icons-material/Close";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "./_shared";

import { getClients, createClient, updateClient, deleteClient } from "../../services/clientService";

const TIPOS = [
  { key: "clinica",    label: "Clínica",     color: BLUE   },
  { key: "odontologo", label: "Odontólogo",  color: TEAL   },
  { key: "otrolab",   label: "Otro Lab",     color: GREEN  },
  { key: "colegio",   label: "Colegio",      color: "#7CA5C3" },
  { key: "particular",label: "Particular",   color: "#9B59B6" },
];

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

export default function Clientes() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bottomNavH = isMobile ? 56 : 0;

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    company_id: 2,
    type: "odontologo",
    name: "",
    cuit: "",
    phone: "",
    email: "",
    balance: 0,
    active: true,
    notes: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients({ company_id: 2, search });  // Asume company_id=1, ajusta según auth
        setRows(data);
      } catch (err) {
        console.error("Error cargando clientes:", err);
        // Opcional: mostrar notificación de error
      }
    };
    loadClients();
  }, [search]);

  const openModal = (row = null) => {
    if (row) {
      setForm({
        id: row.id,
        type: row.type,
        name: row.name,
        cuit: row.cuit,
        phone: row.phone,
        email: row.email,
        balance: row.balance,
        active: row.active,
        notes: row.notes || "",
      });
      setEditing(true);
    } else {
      setForm({
        type: "odontologo",
        name: "",
        cuit: "",
        phone: "",
        email: "",
        balance: 0,
        active: true,
        notes: "",
      });
      setEditing(false);
    }
    setModalOpen(true);
  };

  const saveForm = async () => {
    try {
      let updatedClient;
      if (editing) {
        updatedClient = await updateClient(form.id, form);
      } else {
        updatedClient = await createClient(form);
      }
      setRows(prev => editing
        ? prev.map(r => r.id === updatedClient.id ? updatedClient : r)
        : [...prev, updatedClient]
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Error guardando cliente:", err);
      // Opcional: mostrar error en UI
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este cliente?")) {
      try {
        await deleteClient(id);
        setRows(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error("Error eliminando cliente:", err);
      }
    }
  };

  const columns = useMemo(() => [
    {
      field: "type",
      headerName: "Tipo",
      width: 120,
      renderCell: ({ value }) => {
        const tipo = TIPOS.find(t => t.key === value);
        return tipo ? (
          <Chip label={tipo.label} size="small" sx={{ bgcolor: `${tipo.color}22`, color: tipo.color }} />
        ) : value;
      },
    },
    { field: "name", headerName: "Razón Social", flex: 1 },
    { field: "cuit", headerName: "CUIT", width: 140 },
    { field: "phone", headerName: "Teléfono", width: 140 },
    { field: "email", headerName: "Email", width: 180 },
    {
      field: "balance",
      headerName: "Saldo",
      width: 120,
      renderCell: ({ value }) => {
        const num = parseFloat(value) || 0;
        const color = num < 0 ? "#E74C3C" : num > 0 ? GREEN : theme.palette.text.secondary;
        return <Typography sx={{ color, fontWeight: 600 }}>${num.toLocaleString("es-AR")}</Typography>;
      },
    },
    {
      field: "active",
      headerName: "Activo",
      width: 80,
      renderCell: ({ value }) => value ? <CheckCircleIcon sx={{ color: GREEN }} /> : <PersonOffIcon sx={{ color: "#E74C3C" }} />,
    },
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
    return rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.cuit.includes(search));
  }, [rows, search]);

  return (
    <Box sx={{ ...labPageSx, pt: { xs: 2, sm: 3 }, pb: bottomNavH }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5" fontWeight={800} sx={{ color: BLUE, fontFamily: "Montserrat, sans-serif" }}>
            Clientes
          </Typography>
          <Chip label={`${rows.length} ítems`} size="small" sx={{ bgcolor: `${BLUE}15`, color: BLUE, fontWeight: 600 }} />
          {!isMobile && (
            <Button variant="contained" size="small" startIcon={<AddIcon />}
              onClick={() => openModal()}
              sx={{ ml: "auto", background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`, fontWeight: 700 }}>
              Nuevo
            </Button>
          )}
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar por nombre o CUIT..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
          }}
        />
      </Box>

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
            background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`,
            color: "#fff", boxShadow: "0 4px 16px rgba(57,123,156,0.4)",
          }}>
          <AddIcon />
        </Fab>
      )}

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <BottomNavigation value={1} sx={{ flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, height: 56 }}>
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ color: idx === 1 ? BLUE : theme.palette.text.secondary, minWidth: 0, "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" } }}
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
          {editing ? "Editar Cliente" : "Nuevo Cliente"}
          <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Select fullWidth size="small" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {TIPOS.map(t => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Razón Social *"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CUIT"
                value={form.cuit} onChange={e => setForm(p => ({ ...p, cuit: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Teléfono"
                value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Email"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notas" multiline minRows={2}
                value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={
                <Switch checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: GREEN }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: GREEN } }} />
              } label={form.active ? "Activo" : "Inactivo"} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: theme.palette.text.secondary }}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={saveForm}
            sx={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`, fontWeight: 700 }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}