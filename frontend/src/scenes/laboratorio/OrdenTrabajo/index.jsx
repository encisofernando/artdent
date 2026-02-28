// src/scenes/laboratorio/OrdenTrabajo/index.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Chip,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Paper,
  Autocomplete,
  Divider,
  useMediaQuery,
  Select,
  MenuItem,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  BottomNavigation,
  BottomNavigationAction,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ToothIcon from "@mui/icons-material/MedicalServices";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import NotesIcon from "@mui/icons-material/Notes";

import SelectorDientesSVG from "../SelectorDientesSVG";
import { labPageSx, BLUE, GREEN, TEAL } from "../_shared";

import { getClients } from "../../../services/clientService";
import { getPatients, createPatient } from "../../../services/patientService";
import { getTariffs } from "../../../services/tariffService";
import { createJob } from "../../../services/jobService";

// ── Constantes ────────────────────────────────────────────────────────────────
const COMPANY_ID = 2;

const PRIORIDAD_UI = {
  Baja: { color: "#95A5A6", bg: "#95A5A620", icon: "◦", api: "low" },
  Normal: { color: "#3498DB", bg: "#3498DB20", icon: "●", api: "normal" },
  Alta: { color: "#E67E22", bg: "#E67E2220", icon: "▲", api: "high" },
  Urgente: { color: "#E74C3C", bg: "#E74C3C20", icon: "⬆", api: "urgent" },
};

const LAB_BOTTOM = [
  { label: "Órdenes", icon: <AssignmentIcon />, path: "/laboratorio/ordenes" },
  { label: "Clientes", icon: <PeopleAltIcon />, path: "/laboratorio/clientes" },
  { label: "Ctas.", icon: <AccountBalanceIcon />, path: "/laboratorio/ctacte" },
  { label: "Aranceles", icon: <MonetizationOnIcon />, path: "/laboratorio/aranceles" },
  { label: "Costos", icon: <TrendingUpIcon />, path: "/laboratorio/costos" },
];

export default function NuevaOrden() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [clientes, setClientes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [tariffs, setTariffs] = useState([]);

  const [clienteSel, setClienteSel] = useState(null);
  const [pacienteSel, setPacienteSel] = useState(null);

  const [items, setItems] = useState([]);
  const [itemTemp, setItemTemp] = useState({ tariff_id: null, name: "", price: 0, qty: 1 });

  const [openDientes, setOpenDientes] = useState(false);
  const [piezas, setPiezas] = useState([]);

  const [notas, setNotas] = useState("");
  const [fechaPrometida, setFechaPrometida] = useState(new Date().toISOString().slice(0, 10));
  const [prioridad, setPrioridad] = useState("Normal");

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cliData = await getClients({ company_id: COMPANY_ID });
        setClientes(cliData || []);

        const pacData = await getPatients({ company_id: COMPANY_ID });
        setPacientes(pacData || []);

        const tariffData = await getTariffs({ company_id: COMPANY_ID, search: "" });
        const list = Array.isArray(tariffData) ? tariffData : (tariffData?.data ?? []);
        setTariffs(list);
      } catch (err) {
        console.error("[NuevaOrden] Error cargando datos:", err);
        console.error("[NuevaOrden] Detalles:", err?.response?.data || err?.message);
        showSnack("Error cargando datos iniciales", "error");
      }
    };

    loadData();
  }, []);

  const addItem = () => {
    const qty = Math.max(1, parseInt(itemTemp.qty || 1, 10));
    const price = Number(itemTemp.price || 0);

    if (!itemTemp.tariff_id || price < 0 || qty < 1) return;

    setItems((prev) => [
      ...prev,
      {
        tempId: Date.now(),
        tariff_id: itemTemp.tariff_id,
        name: itemTemp.name || "",
        price,
        qty,
        pieces: piezas.join(", "),
      },
    ]);

    setItemTemp({ tariff_id: null, name: "", price: 0, qty: 1 });
    setPiezas([]);
  };

  const removeItem = (tempId) => setItems((prev) => prev.filter((x) => x.tempId !== tempId));

  const totalOrden = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 1), 0),
    [items]
  );

  const guardar = async () => {
    if (!clienteSel?.id) return showSnack("Debes seleccionar un cliente", "error");
    if (!pacienteSel) return showSnack("Debes seleccionar o escribir el nombre del paciente", "error");
    if (items.length === 0) return showSnack("Debes agregar al menos un trabajo", "error");

    setSaving(true);

    try {
      let patientId = null;

      // crear paciente si es string
      if (typeof pacienteSel === "string") {
        const raw = pacienteSel.trim();
        if (!raw) {
          setSaving(false);
          return showSnack("Paciente inválido", "error");
        }

        const parts = raw.split(/\s+/);
        const first_name = parts[0] || "";
        const last_name = parts.slice(1).join(" ") || "";

        const newPatient = await createPatient({ company_id: COMPANY_ID, first_name, last_name });
        patientId = newPatient.id;
        setPacientes((prev) => [...prev, newPatient]);
      } else if (pacienteSel?.id) {
        patientId = pacienteSel.id;
      } else {
        setSaving(false);
        return showSnack("Paciente inválido", "error");
      }

      // ✅ Payload EXACTO (opción B)
      const data = {
        company_id: COMPANY_ID,
        clinic_id: clienteSel.id,
        patient_id: patientId,

        entry_date: new Date().toISOString().slice(0, 10),
        promised_date: fechaPrometida,
        priority: PRIORIDAD_UI[prioridad]?.api || "normal",
        work_type: "ticket",
        notes: notas,

        items: items.map((t) => ({
          tariff_id: t.tariff_id,
          name: t.name || "",
          qty: Number(t.qty || 1),
          price: Number(t.price || 0),
          pieces: t.pieces || "",
        })),
      };

      await createJob(data);

      showSnack("Orden creada correctamente", "success");

      // reset
      setClienteSel(null);
      setPacienteSel(null);
      setItems([]);
      setItemTemp({ tariff_id: null, name: "", price: 0, qty: 1 });
      setPiezas([]);
      setNotas("");
      setFechaPrometida(new Date().toISOString().slice(0, 10));
      setPrioridad("Normal");
    } catch (err) {
      console.error("[NuevaOrden] Error guardando:", err);
      console.error("[NuevaOrden] Detalles:", err?.response?.data || err?.message);

      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors ? "Error de validación" : null) ||
        "Error al guardar la orden";

      showSnack(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ ...labPageSx, bgcolor: theme.palette.mode === "dark" ? "#0A1929" : "#f5f7fa" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`,
              px: { xs: 2, sm: 3 },
              py: { xs: 2.5, sm: 3 },
              display: "flex",
              alignItems: "center",
              gap: 2,
              boxShadow: "0 4px 12px rgba(57,123,156,0.15)",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#fff",
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
              }}
            >
              <AssignmentIcon sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem" } }} />
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                fontWeight={900}
                color="#fff"
                fontFamily="Montserrat, sans-serif"
                sx={{ lineHeight: 1.1 }}
              >
                Nueva Orden de Trabajo
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
                Complete los datos para generar una nueva orden
              </Typography>
            </Box>
          </Box>

          {/* Contenido */}
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            {/* Cliente y Paciente */}
            <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: `${BLUE}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BusinessIcon sx={{ color: BLUE, fontSize: "1.2rem" }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: BLUE }}>
                      Cliente
                    </Typography>
                  </Stack>

                  <Autocomplete
                    fullWidth
                    size="small"
                    options={clientes}
                    getOptionLabel={(option) => option?.name || ""}
                    value={clienteSel}
                    onChange={(_, v) => setClienteSel(v)}
                    renderInput={(params) => <TextField {...params} placeholder="Seleccionar cliente *" />}
                  />

                  <Box sx={{ mt: 0.75, minHeight: 20 }} />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: `${TEAL}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PersonIcon sx={{ color: TEAL, fontSize: "1.2rem" }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: TEAL }}>
                      Paciente
                    </Typography>
                  </Stack>

                  <Autocomplete
                    fullWidth
                    size="small"
                    freeSolo
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    options={pacientes}
                    getOptionLabel={(option) => {
                      if (typeof option === "object" && option !== null) {
                        return `${option.first_name || ""} ${option.last_name || ""}`.trim() || option.name || "";
                      }
                      return option || "";
                    }}
                    value={pacienteSel}
                    onChange={(_, v) => setPacienteSel(v)}
                    onInputChange={(_, value, reason) => {
                      if (reason === "input") setPacienteSel(value);
                    }}
                    renderInput={(params) => {
                      const isNew = typeof pacienteSel === "string" && pacienteSel.trim().length > 0;

                      return (
                        <TextField
                          {...params}
                          placeholder="Seleccionar o escribir paciente *"
                          helperText={
                            isNew
                              ? `✨ Se creará el paciente "${pacienteSel}" automáticamente`
                              : "Podés escribir el nombre si no está en la lista"
                          }
                          sx={{ "& .MuiFormHelperText-root": { minHeight: 20 } }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isNew && (
                                  <Chip
                                    label="Nuevo"
                                    size="small"
                                    sx={{
                                      bgcolor: `${GREEN}20`,
                                      color: GREEN,
                                      fontWeight: 700,
                                      fontSize: "0.7rem",
                                      height: 22,
                                      mr: 1,
                                    }}
                                  />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      );
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Trabajos */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 2,
                mb: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: `${GREEN}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ToothIcon sx={{ color: GREEN, fontSize: "1.2rem" }} />
                </Box>

                <Typography variant="subtitle2" fontWeight={700} sx={{ color: GREEN }}>
                  Trabajos
                </Typography>

                {items.length > 0 && (
                  <Chip
                    label={`${items.length} trabajo${items.length !== 1 ? "s" : ""}`}
                    size="small"
                    sx={{ bgcolor: `${GREEN}20`, color: GREEN, fontWeight: 600 }}
                  />
                )}
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={tariffs}
                    getOptionLabel={(option) =>
                      option?.name ? `${option.code ? option.code + " - " : ""}${option.name}` : ""
                    }
                    value={tariffs.find((t) => t.id === itemTemp.tariff_id) || null}
                    onChange={(_, v) => {
                      if (!v) {
                        setItemTemp({ tariff_id: null, name: "", price: 0, qty: 1 });
                        return;
                      }
                      const price = Number(v.base_price ?? 0);
                      setItemTemp({ tariff_id: v.id, name: v.name, price, qty: 1 });
                    }}
                    renderInput={(params) => <TextField {...params} label="Tipo de trabajo" />}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Precio"
                    type="number"
                    value={itemTemp.price}
                    onChange={(e) => setItemTemp((p) => ({ ...p, price: Number(e.target.value || 0) }))}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>

                <Grid item xs={6} sm={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cant."
                    type="number"
                    inputProps={{ min: 1, step: 1 }}
                    value={itemTemp.qty}
                    onChange={(e) =>
                      setItemTemp((p) => ({ ...p, qty: Math.max(1, parseInt(e.target.value || "1", 10)) }))
                    }
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ToothIcon />}
                    onClick={() => setOpenDientes(true)}
                    sx={{
                      height: "100%",
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.secondary,
                      fontSize: "0.8rem",
                    }}
                  >
                    {piezas.length > 0 ? `${piezas.length} pzs` : "Piezas"}
                  </Button>
                </Grid>

                <Grid item xs={6} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addItem}
                    disabled={!itemTemp.tariff_id || itemTemp.price < 0 || itemTemp.qty < 1}
                    sx={{
                      height: "100%",
                      background: `linear-gradient(135deg, ${GREEN} 0%, ${TEAL} 100%)`,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    Agregar
                  </Button>
                </Grid>
              </Grid>

              {items.length > 0 && (
                <Box sx={{ mt: 2.5 }}>
                  <Divider sx={{ mb: 2 }} />

                  <List dense disablePadding>
                    {items.map((it, idx) => (
                      <ListItem
                        key={it.tempId}
                        sx={{
                          bgcolor: idx % 2 === 0 ? "transparent" : `${GREEN}05`,
                          borderRadius: 1,
                          mb: 0.5,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${GREEN}20`,
                            color: GREEN,
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {idx + 1}
                        </Avatar>

                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{it.name}</Typography>}
                          secondary={
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {it.pieces || "Sin piezas especificadas"}
                            </Typography>
                          }
                        />

                        <Chip
                          label={`${it.qty} x $${Number(it.price).toLocaleString("es-AR")} = $${(it.qty * it.price).toLocaleString("es-AR")}`}
                          size="small"
                          sx={{ bgcolor: `${GREEN}15`, color: GREEN, fontWeight: 700, mr: 1 }}
                        />

                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => removeItem(it.tempId)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  <Paper sx={{ mt: 2, p: 1.5, bgcolor: `${GREEN}10`, border: `1px solid ${GREEN}30` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700}>Total de la orden</Typography>
                      <Typography variant="h6" fontWeight={900} color={GREEN} fontFamily="Montserrat, sans-serif">
                        ${totalOrden.toLocaleString("es-AR")}
                      </Typography>
                    </Stack>
                  </Paper>
                </Box>
              )}
            </Paper>

            {/* Detalles */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 2,
                mb: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: `${BLUE}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NotesIcon sx={{ color: BLUE, fontSize: "1.2rem" }} />
                </Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: BLUE }}>
                  Detalles de la Orden
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Fecha Prometida"
                    type="date"
                    value={fechaPrometida}
                    onChange={(e) => setFechaPrometida(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon sx={{ fontSize: "1.1rem", color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      value={prioridad}
                      onChange={(e) => setPrioridad(e.target.value)}
                      label="Prioridad"
                      startAdornment={
                        <InputAdornment position="start">
                          <PriorityHighIcon sx={{ fontSize: "1.1rem", color: PRIORIDAD_UI[prioridad]?.color }} />
                        </InputAdornment>
                      }
                    >
                      {Object.keys(PRIORIDAD_UI).map((p) => (
                        <MenuItem key={p} value={p}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ color: PRIORIDAD_UI[p].color, fontWeight: 700 }}>
                              {PRIORIDAD_UI[p].icon}
                            </Typography>
                            <span>{p}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Notas adicionales"
                    multiline
                    rows={3}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Indicaciones especiales, colores, materiales..."
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Acciones */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={guardar}
                    disabled={saving || !clienteSel || !pacienteSel || items.length === 0}
                    sx={{
                      background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`,
                      fontWeight: 700,
                      py: 1.2,
                    }}
                  >
                    Guardar Orden
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    disabled
                    sx={{ bgcolor: GREEN, "&:hover": { bgcolor: "#4a9d8c" }, fontWeight: 700, py: 1.2 }}
                  >
                    Finalizar
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ReceiptLongIcon />}
                    disabled
                    sx={{ bgcolor: TEAL, "&:hover": { bgcolor: "#3e8490" }, fontWeight: 700, py: 1.2 }}
                  >
                    Emitir Ticket
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/laboratorio/ordenes/consulta")}
                    sx={{ borderColor: theme.palette.divider, color: theme.palette.text.secondary, fontWeight: 600, py: 1.2 }}
                  >
                    Cancelar
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Selector de dientes */}
      <SelectorDientesSVG
        open={openDientes}
        onClose={() => setOpenDientes(false)}
        initialValue={piezas}
        multiple
        onSelect={(arr) => setPiezas(arr)}
      />

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <BottomNavigation
          value={0}
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
                color: idx === 0 ? BLUE : theme.palette.text.secondary,
                "&.Mui-selected": { color: BLUE },
                minWidth: 0,
                "& .MuiBottomNavigationAction-label": { fontSize: "0.62rem", fontWeight: idx === 0 ? 700 : 400 },
              }}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}