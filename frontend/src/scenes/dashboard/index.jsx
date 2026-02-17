import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Typography, 
  useTheme,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  TextField,
  MenuItem,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { tokens } from "../../theme";
import {
  DownloadOutlined as DownloadIcon,
  Email as EmailIcon,
  PointOfSale as SalesIcon,
  PersonAdd as PersonAddIcon,
  Traffic as TrafficIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";

// ✅ IMPORTAR SERVICIO REAL
import * as DashboardService from "../../services/dashboardService";

// ========================================
// STATCARD COMPONENT - DISEÑO PROFESIONAL
// ========================================
// Reemplazar desde línea ~52 hasta ~204 en index.jsx

const StatCard = ({ title, value, subtitle, icon: Icon, trend, progress, loading = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card
      sx={{
        height: '100%',
        background: isDark 
          ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
          : colors.surface,
        borderRadius: 3,
        border: isDark ? 'none' : `2px solid ${colors.outline}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? '0 12px 40px rgba(0,0,0,0.3)'
            : '0 8px 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="140px">
            <CircularProgress size={40} sx={{ color: isDark ? '#fff' : colors.primary[500] }} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Header con ícono */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isDark ? 'rgba(255,255,255,0.7)' : colors.grey[400],
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    mb: 1,
                    fontSize: 11,
                  }}
                >
                  {title}
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: isDark ? '#fff' : colors.grey[100],
                    fontWeight: 800,
                    mb: 0.5,
                    lineHeight: 1.2,
                  }}
                >
                  {value}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isDark ? 'rgba(255,255,255,0.85)' : colors.grey[300],
                    fontSize: 13,
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
              
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: isDark 
                    ? 'rgba(255,255,255,0.15)'
                    : colors.greenAccent[500],
                  color: '#fff',
                  boxShadow: isDark 
                    ? 'none'
                    : '0 4px 12px rgba(79,178,134,0.25)',
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </Avatar>
            </Stack>

            {/* Progress bar */}
            {progress !== undefined && (
              <Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isDark 
                      ? 'rgba(255,255,255,0.1)'
                      : colors.grey[700],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: isDark ? '#fff' : colors.greenAccent[500],
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            )}
            
            {/* Trend indicator */}
            {trend !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {trend > 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 18, color: colors.greenAccent[500] }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 18, color: colors.redAccent[500] }} />
                )}
                <Typography
                  variant="caption"
                  sx={{ 
                    color: trend > 0 ? colors.greenAccent[500] : colors.redAccent[500],
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend}% vs anterior
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

// ========================================
// TRANSACTIONCARD COMPONENT - DISEÑO PROFESIONAL
// ========================================
// Reemplazar desde línea ~206 hasta ~280 en index.jsx

const TransactionCard = ({ transaction }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2.5,
        bgcolor: isDark ? colors.primary[400] : colors.surface,
        border: `1px solid ${colors.outline}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isDark ? colors.primary[500] : colors.grey[900],
          transform: 'translateX(4px)',
          borderColor: isDark ? colors.primary[300] : colors.grey[700],
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        {/* Avatar + Info */}
        <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: colors.greenAccent[500],
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {transaction.user.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box flex={1} minWidth={0}>
            <Typography 
              variant="body2" 
              fontWeight={700}
              noWrap
              sx={{ 
                color: isDark ? '#fff' : colors.grey[100],
                fontSize: 13,
              }}
            >
              {transaction.txId}
            </Typography>
            <Typography 
              variant="caption" 
              noWrap
              sx={{ 
                color: isDark ? colors.grey[300] : colors.grey[400],
                fontSize: 12,
              }}
            >
              {transaction.user}
            </Typography>
          </Box>
        </Stack>

        {/* Amount + Date */}
        <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
          <Chip
            label={`$${transaction.cost}`}
            size="small"
            sx={{
              bgcolor: colors.greenAccent[500],
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              height: 24,
              minWidth: 80,
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: 10,
              color: isDark ? colors.grey[400] : colors.grey[400],
              whiteSpace: 'nowrap',
            }}
          >
            {transaction.date}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

// ====== MODAL FULLSCREEN PARA GRÁFICOS ======
const FullscreenChartModal = ({ open, onClose, title, children }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
        },
      }}
    >
      <DialogContent>
        <Stack spacing={2} height="100%">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              {title}
            </Typography>
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Box flex={1}>
            {children}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

// ====== COMPONENTE PRINCIPAL CON DATOS REALES ======
const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Estados
  const [period, setPeriod] = useState('month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = period === 'custom' && customDates.start && customDates.end
        ? { period, start_date: customDates.start, end_date: customDates.end }
        : { period };

      // Cargar en paralelo
      const [statsResponse, transactionsResponse, revenueResponse, salesResponse] = await Promise.all([
        DashboardService.getStats(params),
        DashboardService.getRecentTransactions(10),
        DashboardService.getChartData('revenue', period),
        DashboardService.getChartData('sales', period),
      ]);

      setStats(statsResponse);
      setTransactions(transactionsResponse);
      setRevenueData(revenueResponse);
      setSalesData(salesResponse);

      setSnackbar({
        open: true,
        message: 'Dashboard actualizado',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar datos del dashboard',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [period, customDates]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Exportar PDF
  const handleExportPDF = async () => {
    try {
      const params = period === 'custom' && customDates.start && customDates.end
        ? { period, start_date: customDates.start, end_date: customDates.end }
        : { period };

      await DashboardService.exportPDF(params);
      setSnackbar({
        open: true,
        message: 'PDF descargado exitosamente',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setSnackbar({
        open: true,
        message: 'Error al exportar PDF',
        severity: 'error',
      });
    }
  };

  // Formatear números
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('es-AR');
  };

  const formatCurrency = (num) => {
    if (!num) return '$0';
    return `$${formatNumber(num)}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER CON FILTROS */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h3" fontWeight={700} color={colors.grey[100]} gutterBottom>
            Panel de Control
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análisis en tiempo real de tu negocio
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          {/* Selector de Período */}
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(e, val) => val && setPeriod(val)}
            size="small"
          >
            <ToggleButton value="today">Hoy</ToggleButton>
            <ToggleButton value="week">Semana</ToggleButton>
            <ToggleButton value="month">Mes</ToggleButton>
            <ToggleButton value="year">Año</ToggleButton>
            <ToggleButton value="custom">Personalizado</ToggleButton>
          </ToggleButtonGroup>

          {/* Filtros de fecha personalizada */}
          {period === 'custom' && (
            <Stack direction="row" spacing={1}>
              <TextField
                type="date"
                size="small"
                label="Desde"
                value={customDates.start}
                onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
              />
              <TextField
                type="date"
                size="small"
                label="Hasta"
                value={customDates.end}
                onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
              />
            </Stack>
          )}

          <IconButton
            onClick={fetchDashboardData}
            disabled={loading}
            sx={{ bgcolor: 'action.hover' }}
          >
            <RefreshIcon />
          </IconButton>

          <Button
            variant="outlined"
            startIcon={<ChartIcon />}
            sx={{ borderRadius: 2 }}
          >
            Analytics
          </Button>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{
              borderRadius: 2,
              bgcolor: colors.greenAccent[500],
              '&:hover': {
                bgcolor: colors.greenAccent[600],
              },
            }}
          >
            Exportar PDF
          </Button>
        </Stack>
      </Stack>

      {/* ESTADÍSTICAS PRINCIPALES */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Ventas"
            value={formatNumber(stats?.current?.total_sales || 0)}
            subtitle={`${formatNumber(stats?.current?.total_sales || 0)} operaciones`}
            icon={SalesIcon}
            trend={stats?.trends?.sales}
            progress={0.75}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos"
            value={formatCurrency(stats?.current?.revenue || 0)}
            subtitle="Total del período"
            icon={MoneyIcon}
            trend={stats?.trends?.revenue}
            progress={0.65}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nuevos Clientes"
            value={formatNumber(stats?.current?.new_customers || 0)}
            subtitle="Este período"
            icon={PersonAddIcon}
            trend={stats?.trends?.customers}
            progress={0.45}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(stats?.current?.avg_ticket || 0)}
            subtitle="Por operación"
            icon={TrafficIcon}
            trend={stats?.trends?.avg_ticket}
            progress={0.55}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* GRÁFICOS PRINCIPALES */}
      <Grid container spacing={3} mb={4}>
        {/* Ingresos Generados - Gráfico más grande */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              height: '550px', // Aumentado de 100% para dar más espacio
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
                mb={3}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Ingresos Generados
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h3" fontWeight={700} color={colors.greenAccent[500]}>
                      {formatCurrency(stats?.current?.revenue || 0)}
                    </Typography>
                    {stats?.trends?.revenue !== undefined && (
                      <Chip 
                        label={`${stats.trends.revenue > 0 ? '+' : ''}${stats.trends.revenue}%`}
                        size="small" 
                        color={stats.trends.revenue > 0 ? "success" : "error"}
                        icon={stats.trends.revenue > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      />
                    )}
                  </Stack>
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={() => setFullscreenChart('revenue')}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: colors.greenAccent[500],
                      color: '#fff',
                      '&:hover': {
                        bgcolor: colors.greenAccent[600],
                      },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Box height="400px" mt={1}>
                <LineChart isDashboard={true} data={revenueData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transacciones Recientes */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              height: '550px', // Misma altura que el gráfico
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700}>
                  Transacciones Recientes
                </Typography>
                <Chip 
                  label={transactions.length}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Box 
                sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  maxHeight: '420px', // Altura fija para el scroll
                  pr: 1, // Padding para separar del scrollbar
                  '&::-webkit-scrollbar': { 
                    width: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    borderRadius: 4,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : transactions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No hay transacciones en este período
                  </Typography>
                ) : (
                  transactions.map((transaction, i) => (
                    <TransactionCard key={`${transaction.txId}-${i}`} transaction={transaction} />
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILA INFERIOR */}
      <Grid container spacing={3}>
        {/* Campaña */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Resumen del Período
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  py: 4,
                }}
              >
                {loading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Box
                      sx={{
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        background: `conic-gradient(
                          ${colors.greenAccent[500]} 0deg ${(stats?.current?.revenue / (stats?.current?.revenue + stats?.current?.tax || 1)) * 360}deg,
                          ${theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[700]} ${(stats?.current?.revenue / (stats?.current?.revenue + stats?.current?.tax || 1)) * 360}deg 360deg
                        )`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          bgcolor: theme.palette.background.paper,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h4" fontWeight={700} color={colors.greenAccent[500]}>
                          {Math.round((stats?.current?.revenue / (stats?.current?.revenue + stats?.current?.tax || 1)) * 100)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completado
                        </Typography>
                      </Box>
                    </Box>

                    <Typography 
                      variant="h5" 
                      fontWeight={700}
                      color={colors.greenAccent[500]}
                      gutterBottom
                    >
                      {formatCurrency(stats?.current?.revenue || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Ingresos generados
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center" mt={1}>
                      {formatNumber(stats?.current?.items_sold || 0)} items vendidos
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ventas por Categoría */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight={700}>
                  Top Productos
                </Typography>
                <IconButton
                  onClick={() => setFullscreenChart('sales')}
                  size="small"
                  sx={{ bgcolor: 'action.hover' }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Stack>
              
              <Box height="280px" mt={2}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <BarChart isDashboard={true} data={salesData} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Categorías */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight={700}>
                  Por Categoría
                </Typography>
                <IconButton
                  onClick={() => setFullscreenChart('categories')}
                  size="small"
                  sx={{ bgcolor: 'action.hover' }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Stack>
              
              <Box height="280px" mt={2}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <PieChart />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MODALES FULLSCREEN */}
      <FullscreenChartModal
        open={fullscreenChart === 'revenue'}
        onClose={() => setFullscreenChart(null)}
        title="Ingresos Generados - Vista Completa"
      >
        <Box height="calc(100vh - 120px)" maxHeight="800px">
          <LineChart isDashboard={false} data={revenueData} />
        </Box>
      </FullscreenChartModal>

      <FullscreenChartModal
        open={fullscreenChart === 'sales'}
        onClose={() => setFullscreenChart(null)}
        title="Top Productos - Vista Completa"
      >
        <Box height="calc(100vh - 120px)" maxHeight="800px">
          <BarChart isDashboard={false} data={salesData} />
        </Box>
      </FullscreenChartModal>

      <FullscreenChartModal
        open={fullscreenChart === 'categories'}
        onClose={() => setFullscreenChart(null)}
        title="Distribución por Categorías - Vista Completa"
      >
        <Box height="calc(100vh - 120px)" maxHeight="800px">
          <PieChart />
        </Box>
      </FullscreenChartModal>

      {/* SNACKBAR DE NOTIFICACIONES */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;