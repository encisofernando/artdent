import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Divider,
  Stack,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  Typography,
  Dialog,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

import * as Products from "../../services/productService";
import CrearArticulo from "./CrearArticulo";
import EditarArticulo from "./EditarArticulo";

const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight
    ? Number(theme.mixins.toolbar.minHeight)
    : 64;

function ProductCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={24} />
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={32} width="40%" />
      </CardContent>
    </Card>
  );
}

function ProductCard({ product, onEdit, onToggleActive }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const imageUrl = product.ImagenUrl || product.image_url || null;
  const price = Number(product.PrecioPublico || product.price || 0);
  const stock = Number(product.Stock || product.stock || 0);
  const isActive = product.Activo;

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {!isActive && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          <Chip label="INACTIVO" color="error" size="small" />
        </Box>
      )}

      <CardMedia
        sx={{
          height: 200,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.Nombre}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
        )}
        
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' },
          }}
          size="small"
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
      </CardMedia>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 0.5 }}
        >
          SKU: {product.Codigo || '—'}
        </Typography>
        
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3em',
          }}
        >
          {product.Nombre}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Typography variant="h5" color="primary" fontWeight={700}>
            ${price.toLocaleString('es-AR')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            IVA {product.Iva || 0}%
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
          <Chip 
            label={`Stock: ${stock}`} 
            size="small" 
            color={stock > 0 ? "success" : "error"}
            variant="outlined"
          />
          {isActive && (
            <Chip label="Activo" size="small" color="success" />
          )}
        </Stack>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); onEdit(product); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar Producto</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { handleMenuClose(); onToggleActive(product); }}
          sx={{ 
            color: isActive ? 'error.main' : 'success.main',
          }}
        >
          <ListItemIcon>
            <PowerSettingsNewIcon 
              fontSize="small" 
              color={isActive ? 'error' : 'success'}
            />
          </ListItemIcon>
          <ListItemText>
            {isActive ? 'Desactivar Producto' : 'Activar Producto'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default function ArticulosIndex() {
  const theme = useTheme();
  const appbarH = TOPBAR_HEIGHT(theme);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  const [sidebarW, setSidebarW] = useState(0);
  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox =
      el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) return;

    const update = () => setSidebarW(sideBox.offsetWidth || 0);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(sideBox);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Products.listProducts({
        q,
        per_page: 50,
      });
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActivo = async (row) => {
    try {
      await Products.toggleProductActive(row.idArticulo || row.id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: mdDown ? 0 : sidebarW,
        right: 0,
        bottom: 0,
        p: 2,
        overflow: "hidden",
        transition: "left .18s ease",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 2,
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          gap={2}
          mb={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Productos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tu catálogo de productos
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCrear(true)}
            size="large"
          >
            Nuevo Producto
          </Button>
        </Stack>

        {/* Buscador y controles */}
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          gap={2} 
          mb={3}
          alignItems="center"
        >
          <TextField
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              maxWidth: { sm: 500 },
              '.MuiOutlinedInput-root': { 
                borderRadius: 3,
                bgcolor: 'background.default'
              } 
            }}
          />

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) setViewMode(newMode);
            }}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <Chip 
            label={`${items.length} producto${items.length !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Grid/List de productos */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.300',
              borderRadius: 4,
            },
          }}
        >
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <ProductCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : items.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                textAlign: 'center',
              }}
            >
              <ImageIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {q ? 'No se encontraron productos' : 'No hay productos'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {q 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza creando tu primer producto'
                }
              </Typography>
              {!q && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCrear(true)}
                >
                  Crear Producto
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {items.map((product) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={viewMode === "grid" ? 4 : 12} 
                  lg={viewMode === "grid" ? 3 : 12} 
                  key={product.idArticulo || product.id}
                >
                  <ProductCard
                    product={product}
                    onEdit={(p) => {
                      setEditRow(p);
                      setOpenEditar(true);
                    }}
                    onToggleActive={handleToggleActivo}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Dialogs */}
      <Dialog 
        open={openCrear} 
        onClose={() => setOpenCrear(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <CrearArticulo
          onClose={() => setOpenCrear(false)}
          onArticuloCreado={() => {
            setOpenCrear(false);
            fetchData();
          }}
        />
      </Dialog>

      <Dialog 
        open={openEditar} 
        onClose={() => setOpenEditar(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <EditarArticulo
          onClose={() => {
            setOpenEditar(false);
            setEditRow(null);
          }}
          articuloEditando={editRow}
          onArticuloEditado={() => {
            setOpenEditar(false);
            setEditRow(null);
            fetchData();
          }}
        />
      </Dialog>
    </Box>
  );
}
