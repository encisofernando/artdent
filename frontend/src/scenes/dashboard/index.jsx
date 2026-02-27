// src/scenes/dashboard/index.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Box, Button, IconButton, Typography, useTheme,
  Card, CardContent, Grid, Stack, Avatar, Chip,
  LinearProgress, Dialog, DialogContent, Snackbar,
  Alert, CircularProgress, Tooltip, Divider,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { tokens } from "../../theme";

import DownloadOutlinedIcon    from "@mui/icons-material/DownloadOutlined";
import PointOfSaleIcon         from "@mui/icons-material/PointOfSale";
import PersonAddIcon           from "@mui/icons-material/PersonAdd";
import TrafficIcon             from "@mui/icons-material/Traffic";
import AttachMoneyIcon         from "@mui/icons-material/AttachMoney";
import TrendingUpIcon          from "@mui/icons-material/TrendingUp";
import TrendingDownIcon        from "@mui/icons-material/TrendingDown";
import FullscreenIcon          from "@mui/icons-material/Fullscreen";
import CloseIcon               from "@mui/icons-material/Close";
import RefreshIcon             from "@mui/icons-material/Refresh";
import ShowChartIcon           from "@mui/icons-material/ShowChart";

import LineChart       from "../../components/LineChart";
import GeographyChart  from "../../components/GeographyChart";
import BarChart        from "../../components/BarChart";
import PieChart        from "../../components/PieChart";
import * as DashboardService from "../../services/dashboardService";

/* ─── Brand palette shortcuts ─── */
const B = {
  blue:    "#397B9C",
  green:   "#5AAD9C",
  mint:    "#ACD6CE",
  teal:    "#49949C",
  blueSoft:"#7CA5C3",
};

/* ─── Period tabs ─── */
const PERIODS = [
  { value: "today",  label: "Hoy"    },
  { value: "week",   label: "Semana" },
  { value: "month",  label: "Mes"    },
  { value: "year",   label: "Año"    },
  { value: "custom", label: "Custom" },
];

/* ══════════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════════ */
const ACCENT_COLORS = [B.blue, B.green, B.teal, B.blueSoft];

const StatCard = ({ title, value, subtitle, icon: Icon, trend, progress, accentColor = B.blue, loading = false }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cardBg   = isDark ? "#172A36" : "#fff";
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const labelCol  = isDark ? "rgba(230,238,245,0.5)"  : "rgba(26,32,44,0.5)";
  const valueCol  = isDark ? "#E6EEF5" : "#1A202C";
  const subCol    = isDark ? "rgba(230,238,245,0.65)" : "rgba(26,32,44,0.6)";

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        bgcolor: cardBg,
        border: `1px solid ${borderCol}`,
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        transition: "box-shadow .2s, transform .2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isDark
            ? `0 8px 32px rgba(0,0,0,.35)`
            : `0 8px 28px rgba(0,0,0,.09)`,
        },
        // Thin colored top border as accent
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.5)})`,
          borderRadius: "14px 14px 0 0",
        },
      }}
    >
      <CardContent sx={{ p: 2.75 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={120}>
            <CircularProgress size={32} sx={{ color: accentColor }} />
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* Icon + label row */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography sx={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: labelCol, mb: 1,
                }}>
                  {title}
                </Typography>
                <Typography sx={{
                  fontSize: 28, fontWeight: 800, color: valueCol,
                  lineHeight: 1.1, letterSpacing: "-0.02em",
                }}>
                  {value}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: subCol, mt: 0.5 }}>
                  {subtitle}
                </Typography>
              </Box>

              <Box sx={{
                width: 44, height: 44,
                borderRadius: "12px",
                bgcolor: alpha(accentColor, isDark ? 0.18 : 0.1),
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon sx={{ fontSize: 22, color: accentColor }} />
              </Box>
            </Stack>

            {/* Progress bar */}
            {progress !== undefined && (
              <LinearProgress
                variant="determinate"
                value={progress * 100}
                sx={{
                  height: 4, borderRadius: 4,
                  bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                  "& .MuiLinearProgress-bar": { bgcolor: accentColor, borderRadius: 4 },
                }}
              />
            )}

            {/* Trend */}
            {trend !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {trend > 0
                  ? <TrendingUpIcon   sx={{ fontSize: 15, color: B.green }} />
                  : <TrendingDownIcon sx={{ fontSize: 15, color: "#E63946" }} />
                }
                <Typography sx={{
                  fontSize: 11.5, fontWeight: 700,
                  color: trend > 0 ? B.green : "#E63946",
                }}>
                  {trend > 0 ? "+" : ""}{trend}% vs anterior
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

/* ══════════════════════════════════════════════
   TRANSACTION ROW
   ══════════════════════════════════════════════ */
const TransactionRow = ({ transaction, isDark }) => {
  const borderCol = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";

  // Formatear fecha compacta: "01/09/2025 00:00" → "01/09/25"
  const fmtDate = (d) => {
    if (!d) return "";
    const parts = d.split(" ")[0].split("/");
    if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    return d.split(" ")[0];
  };

  // Formatear monto: $246586.00 → $246.5K
  const fmtAmt = (c) => {
    const n = parseFloat(c) || 0;
    if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n/1e3).toFixed(1)}K`;
    return `$${n.toLocaleString("es-AR")}`;
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        py: 0.85,
        px: 1,
        borderBottom: `1px solid ${borderCol}`,
        borderRadius: "6px",
        transition: "background-color .13s",
        "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.025)" },
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Avatar compacto */}
      <Avatar sx={{
        width: 28, height: 28, flexShrink: 0,
        background: `linear-gradient(135deg, ${B.blue}, ${B.green})`,
        color: "#fff", fontSize: 11, fontWeight: 800,
        fontFamily: "Montserrat, sans-serif",
      }}>
        {transaction.user.charAt(0).toUpperCase()}
      </Avatar>

      {/* ID + user — se trunca si es largo */}
      <Box flex={1} minWidth={0}>
        <Typography noWrap sx={{
          fontSize: 12, fontWeight: 700, color: textCol,
          lineHeight: 1.25, letterSpacing: "-0.01em",
        }}>
          {transaction.txId}
        </Typography>
        <Typography noWrap sx={{ fontSize: 10.5, color: mutedCol, lineHeight: 1.2 }}>
          {transaction.user}
        </Typography>
      </Box>

      {/* Monto + fecha — compactos */}
      <Stack alignItems="flex-end" flexShrink={0} spacing={0}>
        <Typography sx={{
          fontSize: 12.5, fontWeight: 700,
          color: B.green, fontFamily: "Montserrat, sans-serif",
          lineHeight: 1.25,
        }}>
          {fmtAmt(transaction.cost)}
        </Typography>
        <Typography sx={{ fontSize: 10, color: mutedCol, whiteSpace: "nowrap", lineHeight: 1.2 }}>
          {fmtDate(transaction.date)}
        </Typography>
      </Stack>
    </Stack>
  );
};

/* ══════════════════════════════════════════════
   FULLSCREEN MODAL
   ══════════════════════════════════════════════ */
const FullscreenModal = ({ open, onClose, title, children }) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullScreen
    PaperProps={{ sx: { bgcolor: "background.default" } }}
  >
    <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: 20, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} sx={{ borderRadius: "8px" }}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Box flex={1}>{children}</Box>
    </DialogContent>
  </Dialog>
);

/* ══════════════════════════════════════════════
   CHART CARD wrapper
   ══════════════════════════════════════════════ */
const ChartCard = ({ title, subtitle, onFullscreen, onDownload, headerRight, children, isDark, height = "100%" }) => {
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.5)" : "rgba(26,32,44,0.5)";

  return (
    <Card
      elevation={0}
      sx={{
        height,
        display: "flex",
        flexDirection: "column",
        bgcolor: isDark ? "#172A36" : "#fff",
        border: `1px solid ${borderCol}`,
        borderRadius: "14px",
        overflow: "hidden",   // ← necesario para que el scroll interno funcione
      }}
    >
      {/* CardContent no usa padding bottom para no desperdiciar espacio */}
      <Box sx={{ p: 2.75, pb: 2, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2} flexShrink={0}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: textCol, lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: 12, color: mutedCol, mt: 0.4 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={0.5} alignItems="center">
            {headerRight}
            {onFullscreen && (
              <Tooltip title="Pantalla completa" arrow>
                <IconButton
                  size="small" onClick={onFullscreen}
                  sx={{
                    width: 30, height: 30, borderRadius: "7px",
                    color: mutedCol,
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: textCol },
                  }}
                >
                  <FullscreenIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
            {onDownload && (
              <Tooltip title="Descargar" arrow>
                <IconButton
                  size="small" onClick={onDownload}
                  sx={{
                    width: 30, height: 30, borderRadius: "7px",
                    bgcolor: alpha(B.green, 0.14),
                    color: B.green,
                    "&:hover": { bgcolor: alpha(B.green, 0.22) },
                  }}
                >
                  <DownloadOutlinedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Content — flex:1 + minHeight:0 permite que el scroll funcione */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {children}
        </Box>
      </Box>
    </Card>
  );
};

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════ */
const Dashboard = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [period, setPeriod]           = useState("month");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [stats, setStats]             = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [snackbar, setSnackbar]       = useState({ open: false, message: "", severity: "success" });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        period === "custom" && customDates.start && customDates.end
          ? { period, start_date: customDates.start, end_date: customDates.end }
          : { period };

      const [statsRes, txRes, revRes, salesRes] = await Promise.all([
        DashboardService.getStats(params),
        DashboardService.getRecentTransactions(10),
        DashboardService.getChartData("revenue", params),
        DashboardService.getChartData("sales", params),
      ]);

      setStats(statsRes);
      setTransactions(txRes);
      setRevenueData(revRes);
      setSalesData(salesRes);
      setSnackbar({ open: true, message: "Dashboard actualizado", severity: "success" });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setSnackbar({ open: true, message: "Error al cargar datos", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [period, customDates]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  useEffect(() => {
    const id = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(id);
  }, [fetchDashboardData]);

  const handleExportPDF = async () => {
    try {
      const params = period === "custom" && customDates.start && customDates.end
        ? { period, start_date: customDates.start, end_date: customDates.end }
        : { period };
      await DashboardService.exportPDF(params);
      setSnackbar({ open: true, message: "PDF descargado", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Error al exportar PDF", severity: "error" });
    }
  };

  const fmt  = (n) => { if (!n) return "0"; if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`; return n.toLocaleString("es-AR"); };
  const fmtC = (n) => `$${fmt(n || 0)}`;

  // Color tokens for UI elements
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const cardBg    = isDark ? "#172A36" : "#fff";

  /* ── Period pie donut values ── */
  const rev   = stats?.current?.revenue || 0;
  const tax   = stats?.current?.tax || 0;
  const total = rev + tax || 1;
  const pct   = Math.round((rev / total) * 100);
  const deg   = (rev / total) * 360;

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 } }}>

      {/* ══ HEADER ══ */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3.5}
      >
        <Box>
          <Typography sx={{
            fontSize: 22, fontWeight: 800, color: textCol,
            letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif",
            lineHeight: 1.2,
          }}>
            Panel de Control
          </Typography>
          <Typography sx={{ fontSize: 13, color: mutedCol, mt: 0.4 }}>
            Análisis en tiempo real · ArtDent Laboratorio
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {/* Period selector */}
          <Stack
            direction="row"
            sx={{
              borderRadius: "10px",
              border: `1px solid ${borderCol}`,
              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              p: 0.4,
              gap: 0.25,
            }}
          >
            {PERIODS.map(({ value, label }) => (
              <Box
                key={value}
                onClick={() => setPeriod(value)}
                sx={{
                  px: 1.4, py: 0.6,
                  borderRadius: "7px",
                  fontSize: 12.5,
                  fontWeight: period === value ? 700 : 500,
                  fontFamily: "Montserrat, sans-serif",
                  cursor: "pointer",
                  userSelect: "none",
                  bgcolor: period === value
                    ? `linear-gradient(90deg, ${B.blue}, ${B.teal})`
                    : "transparent",
                  background: period === value
                    ? `linear-gradient(90deg, ${B.blue}, ${B.teal})`
                    : "transparent",
                  color: period === value ? "#fff" : mutedCol,
                  transition: "all .15s",
                  "&:hover": {
                    color: period === value ? "#fff" : textCol,
                    bgcolor: period === value ? undefined : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                {label}
              </Box>
            ))}
          </Stack>

          {/* Custom date range */}
          {period === "custom" && (
            <Stack direction="row" spacing={0.75}>
              {["start", "end"].map((k) => (
                <TextField
                  key={k}
                  type="date"
                  size="small"
                  label={k === "start" ? "Desde" : "Hasta"}
                  value={customDates[k]}
                  onChange={(e) => setCustomDates((p) => ({ ...p, [k]: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: 145,
                    "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: 12.5 },
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Refresh */}
          {/* ── FIX: cuando disabled=true, el button no emite eventos y MUI
                 Tooltip no puede funcionar. Envolver en <span> resuelve el warning
                 porque el span SÍ emite los eventos hover que necesita el Tooltip. ── */}
          <Tooltip title={loading ? "Actualizando…" : "Actualizar"} arrow>
            <span>
              <IconButton
                onClick={fetchDashboardData}
                disabled={loading}
                sx={{
                  width: 36, height: 36, borderRadius: "9px",
                  border: `1px solid ${borderCol}`,
                  color: mutedCol,
                  "&:hover": { color: textCol, bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" },
                  "&.Mui-disabled": { opacity: 0.4 },
                }}
              >
                {loading
                  ? <CircularProgress size={16} sx={{ color: "inherit" }} />
                  : <RefreshIcon sx={{ fontSize: 18 }} />
                }
              </IconButton>
            </span>
          </Tooltip>

          {/* Export PDF */}
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            onClick={handleExportPDF}
            sx={{
              background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
              color: "#fff",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700, fontSize: 12.5,
              textTransform: "none",
              px: 1.75, py: 0.85,
              borderRadius: "9px",
              boxShadow: `0 4px 14px ${alpha(B.blue, 0.35)}`,
              "&:hover": {
                background: `linear-gradient(90deg, ${B.teal}, ${B.green})`,
                boxShadow: `0 4px 18px ${alpha(B.green, 0.4)}`,
              },
            }}
          >
            Exportar PDF
          </Button>
        </Stack>
      </Stack>

      {/* ══ STAT CARDS ══ */}
      <Grid container spacing={2.5} mb={3}>
        {[
          {
            title: "Total Ventas",
            value: fmt(stats?.current?.total_sales),
            subtitle: `${fmt(stats?.current?.total_sales || 0)} operaciones`,
            icon: PointOfSaleIcon,
            trend: stats?.trends?.sales,
            progress: 0.75,
            accentColor: B.blue,
          },
          {
            title: "Ingresos",
            value: fmtC(stats?.current?.revenue),
            subtitle: "Total del período",
            icon: AttachMoneyIcon,
            trend: stats?.trends?.revenue,
            progress: 0.65,
            accentColor: B.green,
          },
          {
            title: "Nuevos Clientes",
            value: fmt(stats?.current?.new_customers),
            subtitle: "Este período",
            icon: PersonAddIcon,
            trend: stats?.trends?.customers,
            progress: 0.45,
            accentColor: B.teal,
          },
          {
            title: "Ticket Promedio",
            value: fmtC(stats?.current?.avg_ticket),
            subtitle: "Por operación",
            icon: TrafficIcon,
            trend: stats?.trends?.avg_ticket,
            progress: 0.55,
            accentColor: B.blueSoft,
          },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ══ MAIN ROW: Line chart + Transactions ══ */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            isDark={isDark}
            height={520}
            title="Ingresos Generados"
            subtitle={`Período: ${PERIODS.find((p) => p.value === period)?.label}`}
            onFullscreen={() => setFullscreenChart("revenue")}
            onDownload={() => {}}
            headerRight={
              !loading && stats?.trends?.revenue !== undefined ? (
                <Chip
                  size="small"
                  icon={stats.trends.revenue > 0
                    ? <TrendingUpIcon sx={{ fontSize: "14px !important", color: `${B.green} !important` }} />
                    : <TrendingDownIcon sx={{ fontSize: "14px !important", color: "#E63946 !important" }} />
                  }
                  label={`${stats.trends.revenue > 0 ? "+" : ""}${stats.trends.revenue}%`}
                  sx={{
                    height: 24, fontSize: 11.5, fontWeight: 700,
                    bgcolor: stats.trends.revenue > 0 ? alpha(B.green, 0.12) : alpha("#E63946", 0.1),
                    color: stats.trends.revenue > 0 ? B.green : "#E63946",
                    border: `1px solid ${stats.trends.revenue > 0 ? alpha(B.green, 0.25) : alpha("#E63946", 0.25)}`,
                  }}
                />
              ) : null
            }
          >
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress sx={{ color: B.blue }} />
              </Box>
            ) : (
              <>
                <Typography sx={{
                  fontSize: 26, fontWeight: 800, color: B.green,
                  letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif",
                  mb: 1.5,
                }}>
                  {fmtC(stats?.current?.revenue)}
                </Typography>
                <Box height={380}>
                  <LineChart isDashboard data={revenueData} />
                </Box>
              </>
            )}
          </ChartCard>
        </Grid>

        {/* Transactions */}
        <Grid item xs={12} lg={4}>
          <ChartCard
            isDark={isDark}
            height={520}
            title="Transacciones Recientes"
            headerRight={
              <Chip
                label={transactions.length}
                size="small"
                sx={{
                  height: 22, fontSize: 11.5, fontWeight: 700,
                  bgcolor: alpha(B.blue, isDark ? 0.2 : 0.1),
                  color: B.blue,
                  border: `1px solid ${alpha(B.blue, 0.25)}`,
                }}
              />
            }
          >
            {/* height: 100% funciona porque ChartCard tiene flex:1 + minHeight:0 en el wrapper */}
            <Box sx={{
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              pr: 0.25,
              "&::-webkit-scrollbar": { width: 3 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-track": { background: "transparent" },
            }}>
              {loading ? (
                <Box display="flex" justifyContent="center" pt={6}>
                  <CircularProgress size={28} sx={{ color: B.blue }} />
                </Box>
              ) : transactions.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography sx={{ fontSize: 13, color: mutedCol }}>
                    Sin transacciones en este período
                  </Typography>
                </Box>
              ) : (
                transactions.map((tx, i) => (
                  <TransactionRow key={`${tx.txId}-${i}`} transaction={tx} isDark={isDark} />
                ))
              )}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ══ BOTTOM ROW ══ */}
      <Grid container spacing={2.5}>
        {/* Resumen donut */}
        <Grid item xs={12} md={4}>
          <ChartCard isDark={isDark} title="Resumen del Período">
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={280}>
                <CircularProgress sx={{ color: B.green }} />
              </Box>
            ) : (
              <Stack alignItems="center" spacing={2} pt={1}>
                {/* Donut */}
                <Box sx={{
                  position: "relative",
                  width: 148, height: 148,
                  borderRadius: "50%",
                  background: `conic-gradient(${B.green} 0deg ${deg}deg, ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"} ${deg}deg 360deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 0 6px ${isDark ? "#172A36" : "#fff"}`,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 18,
                    borderRadius: "50%",
                    bgcolor: isDark ? "#172A36" : "#fff",
                    zIndex: 1,
                  },
                }}>
                  <Stack alignItems="center" sx={{ position: "relative", zIndex: 2 }}>
                    <Typography sx={{
                      fontSize: 24, fontWeight: 800, color: B.green,
                      lineHeight: 1.1, letterSpacing: "-0.02em",
                      fontFamily: "Montserrat, sans-serif",
                    }}>
                      {pct}%
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: mutedCol, fontWeight: 600 }}>
                      completado
                    </Typography>
                  </Stack>
                </Box>

                <Stack alignItems="center" spacing={0.25}>
                  <Typography sx={{
                    fontSize: 20, fontWeight: 800, color: B.green,
                    letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif",
                  }}>
                    {fmtC(stats?.current?.revenue)}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: mutedCol }}>
                    Ingresos generados
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: mutedCol, mt: 0.5 }}>
                    {fmt(stats?.current?.items_sold || 0)} ítems vendidos
                  </Typography>
                </Stack>

                {/* Legend */}
                <Stack direction="row" spacing={2} mt={1}>
                  {[
                    { label: "Ingresos", color: B.green },
                    { label: "Impuestos", color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" },
                  ].map(({ label, color }) => (
                    <Stack key={label} direction="row" alignItems="center" spacing={0.75}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
                      <Typography sx={{ fontSize: 11.5, color: mutedCol }}>{label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}
          </ChartCard>
        </Grid>

        {/* Top Productos */}
        <Grid item xs={12} md={4}>
          <ChartCard
            isDark={isDark}
            title="Top Productos"
            onFullscreen={() => setFullscreenChart("sales")}
          >
            <Box height={280} mt={1}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress sx={{ color: B.teal }} />
                </Box>
              ) : (
                <BarChart isDashboard data={salesData} />
              )}
            </Box>
          </ChartCard>
        </Grid>

        {/* Por Categoría */}
        <Grid item xs={12} md={4}>
          <ChartCard
            isDark={isDark}
            title="Por Categoría"
            onFullscreen={() => setFullscreenChart("categories")}
          >
            <Box height={280} mt={1}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress sx={{ color: B.blueSoft }} />
                </Box>
              ) : (
                <PieChart />
              )}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ══ FULLSCREEN MODALS ══ */}
      {[
        { key: "revenue",    title: "Ingresos Generados",           content: <Box height="calc(100vh - 120px)"><LineChart isDashboard={false} data={revenueData} /></Box> },
        { key: "sales",      title: "Top Productos",                content: <Box height="calc(100vh - 120px)"><BarChart isDashboard={false} data={salesData} /></Box> },
        { key: "categories", title: "Distribución por Categorías",  content: <Box height="calc(100vh - 120px)"><PieChart /></Box> },
      ].map(({ key, title, content }) => (
        <FullscreenModal
          key={key}
          open={fullscreenChart === key}
          onClose={() => setFullscreenChart(null)}
          title={title}
        >
          {content}
        </FullscreenModal>
      ))}

      {/* ══ SNACKBAR ══ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: "10px",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;