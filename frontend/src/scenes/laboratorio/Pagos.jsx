// src/scenes/laboratorio/Pagos.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery,
  BottomNavigation, BottomNavigationAction, Fab, Autocomplete, Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import AddIcon             from "@mui/icons-material/Add";
import CloseIcon           from "@mui/icons-material/Close";
import SaveIcon            from "@mui/icons-material/Save";
import PaymentsIcon        from "@mui/icons-material/Payments";
import SearchIcon          from "@mui/icons-material/Search";
import AssignmentIcon      from "@mui/icons-material/Assignment";
import PeopleAltIcon       from "@mui/icons-material/PeopleAlt";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon  from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon      from "@mui/icons-material/TrendingUp";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import TodayIcon           from "@mui/icons-material/Today";
import BlockIcon           from "@mui/icons-material/Block";
import ReceiptLongIcon     from "@mui/icons-material/ReceiptLong";
import AttachMoneyIcon     from "@mui/icons-material/AttachMoney";
import CreditCardIcon      from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "./_shared";

import { getPayments, createPayment } from "../../services/paymentService";
import { getClients } from "../../services/clientService";  // Para selector de clientes

// Keys = valores del enum en job_payments.payment_method (cash|card|transfer|check|other)
const METODOS = [
  { key: "cash",      label: "Efectivo",      icon: <AttachMoneyIcon />,         color: GREEN    },
  { key: "transfer",  label: "Transferencia", icon: <AccountBalanceIcon />,       color: BLUE     },
  { key: "card",      label: "Débito/Cred.",  icon: <CreditCardIcon />,           color: TEAL     },
  { key: "other",     label: "MercadoPago",   icon: <AccountBalanceWalletIcon />, color: "#00B1EA"},
  { key: "check",     label: "Cheque",        icon: <ReceiptLongIcon />,          color: "#E67E22"},
];

const LAB_BOTTOM = [
  { label: "Órdenes",   icon: <AssignmentIcon />,    path: "/laboratorio/ordenes"   },
  { label: "Clientes",  icon: <PeopleAltIcon />,      path: "/laboratorio/clientes"  },
  { label: "Ctas.",     icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte"    },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos",    icon: <TrendingUpIcon />,     path: "/laboratorio/costos"    },
];

export default function Pagos() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const bottomNavH = isMobile ? 56 : 0;

  const [clientes, setClientes] = useState([]);  // Clientes reales para selector
  const [clienteSel, setClienteSel] = useState(null);
  const [rows, setRows] = useState([]);  // Pagos reales
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    company_id: 2,
    job_id: null,
    payment_date: new Date().toISOString().slice(0,10),
    payment_method: "cash",
    amount: "",
    reference: "",
    notes: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [metodoSel, setMetodoSel] = useState("cash");

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await getClients({ company_id: 2 });
        setClientes(data);
      } catch (err) {
        console.error("Error cargando clientes:", err);
      }
    };
    loadClientes();
  }, []);

  useEffect(() => {
    const loadPagos = async () => {
      try {
        const data = await getPayments({ company_id: 2, client_id: clienteSel?.id, search });
        setRows(data);
      } catch (err) {
        console.error("Error cargando pagos:", err);
      }
    };
    loadPagos();
  }, [clienteSel, search]);

  const guardar = async () => {
    try {
      const payload = {
        ...form,
        company_id: 2,
        payment_method: metodoSel,
        clinic_id: clienteSel?.id,  // Pasa clinic_id para filtrado en backend
      };
      const newPayment = await createPayment(payload);
      setRows(prev => [...prev, newPayment]);
      setModalOpen(false);
    } catch (err) {
      console.error("Error guardando pago:", err);
    }
  };

  const openModal = () => {
    setForm({
      company_id: 2,
      job_id: null,
      payment_date: new Date().toISOString().slice(0,10),
      payment_method: "cash",
      amount: "",
      reference: "",
      notes: "",
    });
    setMetodoSel("cash");
    setModalOpen(true);
  };

  const columns = useMemo(() => [
    { field: "payment_date", headerName: "Fecha", width: 110,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString("es-AR") : "" },
    { field: "job", headerName: "Orden", width: 130,
      valueGetter: ({ row }) => row.job?.ticket_number ?? "-" },
    { field: "job_clinic", headerName: "Cliente", flex: 1,
      valueGetter: ({ row }) => row.job?.clinic?.name ?? "-" },
    {
      field: "payment_method",
      headerName: "Método",
      width: 130,
      renderCell: ({ value }) => {
        const metodo = METODOS.find(m => m.key === value);
        return metodo ? (
          <Chip icon={metodo.icon} label={metodo.label} size="small"
            sx={{ bgcolor: `${metodo.color}22`, color: metodo.color }} />
        ) : value;
      },
    },
    { field: "amount", headerName: "Monto", width: 110,
      valueFormatter: ({ value }) => `$${Number(value).toLocaleString("es-AR")}` },
    { field: "reference", headerName: "Referencia", width: 140 },
  ], []);

  return (
    <Box sx={{ ...labPageSx, pt: { xs: 2, sm: 3 }, pb: bottomNavH }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5" fontWeight={800} sx={{ color: GREEN, fontFamily: "Montserrat, sans-serif" }}>
            Pagos
          </Typography>
          <Chip label={`${rows.length} ítems`} size="small" sx={{ bgcolor: `${GREEN}15`, color: GREEN, fontWeight: 600 }} />
          {!isMobile && (
            <Button variant="contained" size="small" startIcon={<AddIcon />}
              onClick={openModal}
              sx={{ ml: "auto", background: `linear-gradient(135deg, ${GREEN} 0%, ${TEAL} 100%)`, fontWeight: 700 }}>
              Nuevo
            </Button>
          )}
        </Stack>
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

      {/* Search */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar por recibo o referencia..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
          }}
        />
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
            "& .MuiDataGrid-columnHeaders": { bgcolor: `${GREEN}0A` },
            "& .MuiDataGrid-row:hover": { bgcolor: `${MINT}18` },
          }}
        />
      </Box>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab size="medium" onClick={openModal}
          sx={{
            position: "absolute", bottom: bottomNavH + 16, right: 16,
            background: `linear-gradient(135deg, ${GREEN} 0%, ${TEAL} 100%)`,
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
              sx={{ color: idx === 2 ? GREEN : theme.palette.text.secondary, minWidth: 0, "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem" } }}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${GREEN} 0%, ${TEAL} 100%)`,
          color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          Nuevo Pago
          <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Fecha" type="date"
                value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Monto *"
                value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value.replace(/[^0-9.]/g, "") }))}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: GREEN, fontWeight: 800 }}>$</InputAdornment> }}
                sx={{ "& .MuiInputBase-input": { fontSize: "1.1rem", fontWeight: 800, color: GREEN } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.65rem" }}>Método de Pago</Typography>
              <Grid container spacing={1}>
                {METODOS.map(m => (
                  <Grid item xs={4} sm={4} key={m.key}>
                    <Paper onClick={() => setMetodoSel(m.key)}
                      sx={{
                        p: 1.2, textAlign: "center", cursor: "pointer", borderRadius: 2,
                        border: `2px solid ${metodoSel === m.key ? m.color : theme.palette.divider}`,
                        bgcolor: metodoSel === m.key ? `${m.color}18` : theme.palette.background.paper,
                        transition: "all .15s",
                        "&:hover": { borderColor: m.color, bgcolor: `${m.color}10` },
                      }}>
                      <Box sx={{ color: metodoSel === m.key ? m.color : theme.palette.text.secondary, mb: 0.3 }}>
                        {React.cloneElement(m.icon, { fontSize: "small" })}
                      </Box>
                      <Typography variant="caption" fontWeight={metodoSel === m.key ? 800 : 500}
                        sx={{ fontSize: "0.63rem", color: metodoSel === m.key ? m.color : theme.palette.text.secondary, lineHeight: 1.2, display: "block" }}>
                        {m.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Referencia / Comprobante"
                value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notas" multiline minRows={2}
                value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: theme.palette.text.secondary }}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={guardar}
            sx={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${TEAL} 100%)`, fontWeight: 700 }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}