// src/scenes/laboratorio/OrdenTrabajo/consulta.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Chip, Grid, Stack, TextField, Typography, ToggleButtonGroup, ToggleButton,
  Button, InputAdornment, Autocomplete, Paper, useMediaQuery, IconButton,
  Collapse, Avatar, BottomNavigation, BottomNavigationAction, Fab, Badge, Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Icons
import SearchIcon             from "@mui/icons-material/Search";
import FileDownloadIcon       from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon       from "@mui/icons-material/PictureAsPdf";
import ContentCopyIcon        from "@mui/icons-material/ContentCopy";
import AccessTimeIcon         from "@mui/icons-material/AccessTime";
import DoneAllIcon            from "@mui/icons-material/DoneAll";
import TaskAltIcon            from "@mui/icons-material/TaskAlt";
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
import CheckCircleIcon        from "@mui/icons-material/CheckCircle";
import BlockIcon              from "@mui/icons-material/Block";
import ClearIcon              from "@mui/icons-material/Clear";

import { labPageSx, BLUE, GREEN, MINT, TEAL } from "../_shared";
import { getJobs } from "../../../services/jobService";
import { getClients } from "../../../services/clientService";

// ── Constantes ────────────────────────────────────────────────────────────────
const COMPANY_ID = 2;

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

// Mini cards para estadísticas
function StatCard({ label, value, color }) {
  return (
    <Paper sx={{
      p: 1.5,
      borderRadius: 2,
      border: `1px solid ${color}30`,
      bgcolor: `${color}08`,
      transition: "all 0.2s",
      "&:hover": { transform: "translateY(-2px)", boxShadow: `0 4px 12px ${color}20` },
    }}>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.65rem" }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={900} sx={{ color, fontFamily: "Montserrat, sans-serif", mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function ConsultaOrdenes() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        const data = await getClients({ company_id: COMPANY_ID });
        setClientes(data || []);
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
          company_id: COMPANY_ID,
          status: filtroEstado.join(','),
          priority: filtroPrioridad.join(','),
          client_id: filtroCliente?.id,
          search
        };
        const data = await getJobs(params);
        setRows(data || []);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
      }
    };
    loadOrdenes();
  }, [filtroEstado, filtroPrioridad, filtroCliente, search]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = rows.length;
    const pendientes = rows.filter(r => r.status === "Pendiente").length;
    const proceso = rows.filter(r => r.status === "En Proceso").length;
    const terminados = rows.filter(r => r.status === "Terminado").length;
    return { total, pendientes, proceso, terminados };
  }, [rows]);

  const columns = useMemo(() => [
    { 
      field: "ticket_number", 
      headerName: "Ticket", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip 
          label={`#${value}`} 
          size="small"
          sx={{ 
            bgcolor: `${BLUE}15`, 
            color: BLUE, 
            fontWeight: 700,
            fontFamily: "monospace",
          }} 
        />
      ),
    },
    { 
      field: "entry_date", 
      headerName: "Entrada", 
      width: 110,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString("es-AR") : "-",
    },
    { 
      field: "promised_date", 
      headerName: "Prometida", 
      width: 110,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString("es-AR") : "-",
    },
    { 
      field: "clinic_name", 
      headerName: "Cliente", 
      flex: 1,
      minWidth: 150,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {value || "-"}
        </Typography>
      ),
    },
    { 
      field: "patient_name", 
      headerName: "Paciente", 
      flex: 1,
      minWidth: 150,
    },
    { 
      field: "job_type_name", 
      headerName: "Trabajo", 
      flex: 1,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Estado",
      width: 130,
      renderCell: ({ value }) => {
        const est = ESTADOS[value] || {};
        return (
          <Chip 
            icon={est.icon} 
            label={value} 
            size="small" 
            sx={{ 
              bgcolor: est.bg, 
              color: est.color,
              fontWeight: 600,
              border: `1px solid ${est.color}40`,
            }} 
          />
        );
      },
    },
    {
      field: "priority",
      headerName: "Prioridad",
      width: 110,
      renderCell: ({ value }) => {
        const pri = PRIORIDAD[value] || {};
        return (
          <Chip 
            label={value} 
            size="small" 
            sx={{ 
              bgcolor: pri.bg, 
              color: pri.color,
              fontWeight: 600,
            }} 
          />
        );
      },
    },
    { 
      field: "total", 
      headerName: "Total", 
      width: 100,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontWeight={700} color={GREEN}>
          ${parseFloat(value || 0).toLocaleString("es-AR")}
        </Typography>
      ),
    },
  ], []);

  const totalFiltrado = useMemo(() => 
    rows.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0),
    [rows]
  );

  const hasActiveFilters = filtroEstado.length > 0 || filtroPrioridad.length > 0 || filtroCliente !== null;

  const clearFilters = () => {
    setFiltroEstado([]);
    setFiltroPrioridad([]);
    setFiltroCliente(null);
    setSearch("");
  };

  return (
    <Box sx={{ ...labPageSx, bgcolor: theme.palette.mode === "dark" ? "#0A1929" : "#f5f7fa" }}>
      {/* ── Contenedor con scroll interno ──────────────────────────────────── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <Box sx={{
            background: `linear-gradient(135deg, ${BLUE} 0%, ${TEAL} 100%)`,
            px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
            boxShadow: "0 4px 12px rgba(57,123,156,0.15)",
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ 
                bgcolor: "rgba(255,255,255,0.2)", 
                color: "#fff",
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
              }}>
                <ManageSearchIcon sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={900} color="#fff"
                  fontFamily="Montserrat, sans-serif" sx={{ lineHeight: 1.1 }}>
                  Consulta de Órdenes
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
                  {rows.length} orden{rows.length !== 1 ? "es" : ""} encontrada{rows.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
              {!isMobile && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/laboratorio/ordenes")}
                  sx={{ 
                    bgcolor: "rgba(255,255,255,0.2)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    fontWeight: 700,
                  }}>
                  Nueva Orden
                </Button>
              )}
            </Stack>
          </Box>

          {/* ── Contenido ──────────────────────────────────────────────────── */}
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
            
            {/* Stats mini */}
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={3}>
                <StatCard label="Total" value={stats.total} color={BLUE} />
              </Grid>
              <Grid item xs={3}>
                <StatCard label="Pendientes" value={stats.pendientes} color={BLUE} />
              </Grid>
              <Grid item xs={3}>
                <StatCard label="En Proceso" value={stats.proceso} color={TEAL} />
              </Grid>
              <Grid item xs={3}>
                <StatCard label="Terminados" value={stats.terminados} color={GREEN} />
              </Grid>
            </Grid>

            {/* Search y filtros */}
            <Paper sx={{
              p: 2, borderRadius: 2, mb: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}>
              <TextField 
                fullWidth 
                size="small" 
                placeholder="Buscar por ticket, cliente, paciente..."
                value={search} 
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch("")}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1 }}>
                <FilterListIcon sx={{ color: theme.palette.text.secondary, fontSize: "1.1rem" }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: theme.palette.text.secondary, flex: 1 }}>
                  Filtros Avanzados
                </Typography>
                {hasActiveFilters && (
                  <Chip 
                    label="Limpiar filtros" 
                    size="small"
                    deleteIcon={<ClearIcon />}
                    onDelete={clearFilters}
                    sx={{ 
                      bgcolor: `${theme.palette.error.main}15`,
                      color: theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  />
                )}
                <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>

              <Collapse in={expanded}>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: "block" }}>
                      Estado
                    </Typography>
                    <ToggleButtonGroup 
                      value={filtroEstado} 
                      onChange={(_, v) => setFiltroEstado(v)}
                      size="small"
                      sx={{ flexWrap: "wrap", gap: 0.5 }}
                    >
                      {Object.keys(ESTADOS).map(e => (
                        <ToggleButton 
                          key={e} 
                          value={e}
                          sx={{ 
                            fontSize: "0.75rem",
                            px: 1.5,
                            textTransform: "none",
                            "&.Mui-selected": {
                              bgcolor: ESTADOS[e].bg,
                              color: ESTADOS[e].color,
                              fontWeight: 700,
                            },
                          }}
                        >
                          {e}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: "block" }}>
                      Prioridad
                    </Typography>
                    <ToggleButtonGroup 
                      value={filtroPrioridad} 
                      onChange={(_, v) => setFiltroPrioridad(v)}
                      size="small"
                      sx={{ flexWrap: "wrap", gap: 0.5 }}
                    >
                      {Object.keys(PRIORIDAD).map(p => (
                        <ToggleButton 
                          key={p} 
                          value={p}
                          sx={{ 
                            fontSize: "0.75rem",
                            px: 1.5,
                            textTransform: "none",
                            "&.Mui-selected": {
                              bgcolor: PRIORIDAD[p].bg,
                              color: PRIORIDAD[p].color,
                              fontWeight: 700,
                            },
                          }}
                        >
                          {p}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete 
                      fullWidth 
                      size="small"
                      options={clientes}
                      getOptionLabel={option => option.name || ""}
                      value={filtroCliente}
                      onChange={(_, v) => setFiltroCliente(v)}
                      renderInput={params => <TextField {...params} label="Filtrar por cliente" />}
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Paper>

            {/* Grid */}
            <Paper sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              height: isMobile ? "calc(100vh - 520px)" : "calc(100vh - 450px)",
              minHeight: 300,
            }}>
              <DataGrid
                rows={rows}
                columns={columns}
                density="compact"
                hideFooterSelectedRowCount
                pageSizeOptions={[25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                localeText={{
                  noRowsLabel: "No se encontraron órdenes",
                  footerRowSelected: (count) => `${count} seleccionada${count !== 1 ? 's' : ''}`,
                }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": { 
                    bgcolor: `${BLUE}0A`,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  },
                  "& .MuiDataGrid-columnHeaderTitle": { 
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  },
                  "& .MuiDataGrid-row:hover": { 
                    bgcolor: `${MINT}18`,
                    cursor: "pointer",
                  },
                  "& .MuiDataGrid-cell": { 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                }}
              />
            </Paper>

          </Box>
        </Box>

        {/* Footer con export - fijo */}
        <Box sx={{
          px: { xs: 2, sm: 3 }, py: 1.5,
          borderTop: `2px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<ContentCopyIcon fontSize="small"/>}
            sx={{ 
              fontSize: "0.7rem",
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              textTransform: "none",
            }}>
            Copiar
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<FileDownloadIcon fontSize="small"/>}
            sx={{ 
              fontSize: "0.7rem",
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              textTransform: "none",
            }}>
            Excel
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<PictureAsPdfIcon fontSize="small"/>}
            sx={{ 
              fontSize: "0.7rem",
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              textTransform: "none",
            }}>
            PDF
          </Button>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: theme.palette.text.secondary }}>
            {rows.length} registro{rows.length !== 1 ? 's' : ''}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="caption" fontWeight={700} color={GREEN}>
            ${totalFiltrado.toLocaleString("es-AR")}
          </Typography>
        </Box>
      </Box>

      {/* ── Mobile FAB ────────────────────────────────────────────────────── */}
      {isMobile && (
        <Fab 
          size="medium" 
          onClick={() => navigate("/laboratorio/ordenes")}
          sx={{
            position: "fixed",
            bottom: 72,
            right: 16,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)`,
            color: "#fff",
            boxShadow: "0 4px 16px rgba(57,123,156,0.4)",
            zIndex: 1000,
          }}>
          <AddIcon />
        </Fab>
      )}

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
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
                "& .MuiBottomNavigationAction-label": { 
                  fontSize: "0.62rem",
                  fontWeight: idx === 0 ? 700 : 400,
                },
              }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}