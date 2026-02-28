// src/scenes/laboratorio/CuentasCorrientes.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, InputAdornment, MenuItem, Paper, Select, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, Avatar,
  BottomNavigation, BottomNavigationAction, Divider, Autocomplete, FormControl, InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import AssignmentIcon      from "@mui/icons-material/Assignment";
import PeopleAltIcon       from "@mui/icons-material/PeopleAlt";
import MonetizationOnIcon  from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon      from "@mui/icons-material/TrendingUp";
import AddIcon             from "@mui/icons-material/Add";
import SaveIcon            from "@mui/icons-material/Save";
import CloseIcon           from "@mui/icons-material/Close";
import TrendingDownIcon    from "@mui/icons-material/TrendingDown";
import PaymentsIcon        from "@mui/icons-material/Payments";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "./_shared";

import { getClients } from "../../services/clientService";  // Para selector de clientes
import { getMovements, createMovement } from "../../services/movementService";  // Nuevo service para movimientos

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

function KpiCard({ label, value, color, icon }) {
  return (
    <Paper sx={{
      p: 1.5, borderRadius: 2, bgcolor: `${color}10`, border: `1px solid ${color}44`,
      textAlign: "center",
    }}>
      <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: "0.65rem" }}>{label}</Typography>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 0.3 }}>
        {icon}
        <Typography variant="h6" fontWeight={900} sx={{ color, fontSize: "1.1rem" }}>
          ${Math.abs(value).toLocaleString("es-AR")}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function CuentasCorrientes() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bottomNavH = isMobile ? 56 : 0;

  const [clientes, setClientes] = useState([]);  // Clientes reales
  const [clienteSel, setClienteSel] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState({
    client_id: null,
    date: new Date().toISOString().slice(0,10),
    type: "Pago",
    amount: "",
    description: "",
    method: "efectivo",
    reference: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

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
    if (clienteSel) {
      const loadMovimientos = async () => {
        try {
          const data = await getMovements({ company_id: 1, client_id: clienteSel.id });
          setMovimientos(data);
        } catch (err) {
          console.error("Error cargando movimientos:", err);
        }
      };
      loadMovimientos();
    } else {
      setMovimientos([]);
    }
  }, [clienteSel]);

  const guardar = async () => {
    try {
      const newMovement = await createMovement({ ...form, client_id: clienteSel.id });
      setMovimientos(prev => [...prev, newMovement]);
      setModalOpen(false);
    } catch (err) {
      console.error("Error guardando movimiento:", err);
    }
  };

  const openModal = () => {
    if (!clienteSel) {
      // Opcional: mostrar alerta "Seleccione un cliente primero"
      return;
    }
    setForm({
      client_id: clienteSel.id,
      date: new Date().toISOString().slice(0,10),
      type: "Pago",
      amount: "",
      description: "",
      method: "efectivo",
      reference: "",
    });
    setModalOpen(true);
  };

  const columns = useMemo(() => [
    { field: "date", headerName: "Fecha", width: 100 },
    {
      field: "type",
      headerName: "Tipo",
      width: 80,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" sx={{ bgcolor: value === "Pago" ? `${GREEN}20` : `${BLUE}20`, color: value === "Pago" ? GREEN : BLUE }} />
      ),
    },
    { field: "description", headerName: "Descripción", flex: 1 },
    { field: "reference", headerName: "Referencia", width: 120 },
    { field: "debit", headerName: "Debe", width: 100, valueFormatter: ({ value }) => value > 0 ? `$${value}` : "" },
    { field: "credit", headerName: "Haber", width: 100, valueFormatter: ({ value }) => value > 0 ? `$${value}` : "" },
    { field: "balance", headerName: "Saldo", width: 120, valueFormatter: ({ value }) => `$${value}` },
  ], []);

  const kpis = useMemo(() => {
    // Calcula KPIs reales de movimientos
    const totalDebe = movimientos.reduce((sum, m) => sum + (m.debit || 0), 0);
    const totalHaber = movimientos.reduce((sum, m) => sum + (m.credit || 0), 0);
    const saldo = totalHaber - totalDebe;  // Ajusta lógica según tu backend
    return [
      { label: "Debe", value: totalDebe, color: "#E74C3C", icon: <TrendingDownIcon fontSize="small" /> },
      { label: "Haber", value: totalHaber, color: GREEN, icon: <TrendingUpIcon fontSize="small" /> },
      { label: "Saldo", value: saldo, color: saldo >= 0 ? GREEN : "#E74C3C", icon: <PaymentsIcon fontSize="small" /> },
    ];
  }, [movimientos]);

  return (
    <Box sx={{ ...labPageSx, pt: { xs: 2, sm: 3 }, pb: bottomNavH }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: BLUE, fontFamily: "Montserrat, sans-serif" }}>
          Cuentas Corrientes
        </Typography>
      </Box>

      {/* Selector Cliente */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Autocomplete fullWidth size="small"
          options={clientes}
          getOptionLabel={option => option.name}
          value={clienteSel}
          onChange={(_, v) => setClienteSel(v)}
          renderInput={params => <TextField {...params} label="Seleccionar cliente" />}
        />
      </Box>

      {/* KPIs */}
      {clienteSel && (
        <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
          <Grid container spacing={1.5}>
            {kpis.map(kpi => (
              <Grid item xs={4} key={kpi.label}>
                <KpiCard {...kpi} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Grid Movimientos */}
      <Box sx={{ flex: 1, overflow: "hidden", px: { xs: 0, sm: 3 } }}>
        <DataGrid
          rows={movimientos}
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
        <Fab size="medium" onClick={openModal}
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
        <BottomNavigation value={2} sx={{ flexShrink: 0, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, height: 56 }}>
          {LAB_BOTTOM.map((item, idx) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ color: idx === 2 ? BLUE : theme.palette.text.secondary, minWidth: 0, "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" } }}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`,
          color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          Nuevo Movimiento
          <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Fecha" type="date"
                value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <ToggleButtonGroup exclusive fullWidth value={form.type} onChange={(_, v) => v && setForm(p => ({ ...p, type: v }))}
                sx={{ "& .Mui-selected": { fontWeight: 800 } }}>
                <ToggleButton value="Pago" sx={{ "&.Mui-selected": { bgcolor: `${GREEN}20`, color: GREEN } }}>💰 Pago</ToggleButton>
                <ToggleButton value="Cargo" sx={{ "&.Mui-selected": { bgcolor: `${BLUE}20`, color: BLUE } }}>📋 Cargo</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Monto *"
                value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value.replace(/[^0-9.]/g, "") }))}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: form.type === "Pago" ? GREEN : BLUE, fontWeight: 800 }}>$</InputAdornment> }}
                sx={{ "& .MuiInputBase-input": { fontSize: "1.1rem", fontWeight: 800, color: form.type === "Pago" ? GREEN : BLUE } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Descripción"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </Grid>
            {form.type === "Pago" && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Método de Pago</InputLabel>
                  <Select value={form.method} label="Método de Pago" onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                    {["efectivo", "transferencia", "cheque", "debito", "credito", "mercadopago"].map(m => (
                      <MenuItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Referencia"
                value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: theme.palette.text.secondary }}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={guardar}
            sx={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`, fontWeight: 700 }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}