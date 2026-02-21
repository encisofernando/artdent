// src/scenes/articulos/index.jsx (o donde tengas ArticulosIndex)
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Divider,
  Stack,
  Button,
  IconButton,
  TextField,
  InputAdornment,
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

import * as Products from "../../services/productService";
import CrearArticulo from "./CrearArticulo";
import EditarArticulo from "./EditarArticulo";

function ProductCardSkeleton({ isList }) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: isList ? { xs: "column", sm: "row" } : "column",
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{
          height: isList ? { xs: 180, sm: 140 } : { xs: 180, sm: 200 },
          width: isList ? { xs: "100%", sm: 220 } : "100%",
          flexShrink: 0,
        }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Skeleton variant="text" height={26} width="35%" />
        <Skeleton variant="text" height={28} />
        <Skeleton variant="text" height={22} width="70%" />
        <Skeleton variant="text" height={34} width="45%" />
      </CardContent>
    </Card>
  );
}

function ProductCard({ product, viewMode, onEdit, onToggleActive }) {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const isList = viewMode === "list";
  const [anchorEl, setAnchorEl] = useState(null);

  const imageUrl = product.ImagenUrl || product.image_url || null;
  const price = Number(product.PrecioPublico || product.price || 0);
  const stock = Number(product.Stock || product.stock || 0);
  const isActive = Boolean(product.Activo);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: isList ? { xs: "column", sm: "row" } : "column",
        position: "relative",
        transition: "transform .18s ease, box-shadow .18s ease",
        "&:hover": { transform: smDown ? "none" : "translateY(-3px)", boxShadow: smDown ? 1 : 4 },
        overflow: "hidden",
      }}
    >
      {!isActive && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.62)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            p: 2,
          }}
        >
          <Chip label="INACTIVO" color="error" size="small" />
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<PowerSettingsNewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(product);
            }}
          >
            Activar
          </Button>
        </Box>
      )}

      {/* Media */}
      <CardMedia
        sx={{
          position: "relative",
          bgcolor: "grey.100",
          height: isList ? { xs: 180, sm: "auto" } : { xs: 180, sm: 200 },
          width: isList ? { xs: "100%", sm: 220 } : "100%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.Nombre}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImageIcon sx={{ fontSize: 64, color: "grey.400" }} />
        )}

        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "background.paper" },
            zIndex: 3, // arriba del overlay
          }}
          size="small"
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
      </CardMedia>

      {/* Content */}
      <CardContent
        sx={{
          flex: 1,
          minWidth: 0,
          pb: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          SKU: {product.Codigo || "—"}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.15,
            minHeight: "2.3em",
          }}
        >
          {product.Nombre}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.25, sm: 1 }}
          alignItems={{ sm: "center" }}
          mb={1}
        >
          <Typography variant="h5" color="primary" fontWeight={800} sx={{ lineHeight: 1 }}>
            ${price.toLocaleString("es-AR")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            IVA {product.Iva || 0}%
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={`Stock: ${stock}`}
            size="small"
            color={stock > 0 ? "success" : "error"}
            variant="outlined"
          />
          {isActive && <Chip label="Activo" size="small" color="success" />}
        </Stack>
      </CardContent>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit(product);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar Producto</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onToggleActive(product);
          }}
          sx={{ color: isActive ? "error.main" : "success.main" }}
        >
          <ListItemIcon>
            <PowerSettingsNewIcon fontSize="small" color={isActive ? "error" : "success"} />
          </ListItemIcon>
          <ListItemText>{isActive ? "Desactivar Producto" : "Activar Producto"}</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default function ArticulosIndex() {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "active" | "inactive"

  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // En mobile forzamos grid (evita layout raro y mejora UX)
  useEffect(() => {
    if (smDown) setViewMode("grid");
  }, [smDown]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { q, per_page: 50 };

      if (filterStatus === "active") params.is_active = true;
      if (filterStatus === "inactive") params.is_active = false;

      const data = await Products.listProducts(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [q, filterStatus]);

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

  const gridCols = useMemo(() => {
    // Grid bien escalonado
    return {
      xs: 12,
      sm: 6,
      md: viewMode === "grid" ? 4 : 12,
      lg: viewMode === "grid" ? 3 : 12,
      xl: viewMode === "grid" ? 2.4 : 12, // si tu MUI no acepta decimales, cambiá a 2
    };
  }, [viewMode]);

  const countLabel = `${items.length} producto${items.length !== 1 ? "s" : ""}`;

  return (
    // CLAVE: no usar position: fixed. Que el layout (App) maneje márgenes/Topbar/Sidebar.
    <Box sx={{ p: { xs: 1.25, sm: 2, md: 3 } }}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: { xs: 1.5, sm: 2, md: 3 },
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "auto", md: "calc(100vh - 64px - 48px)" }, // aprox: viewport - topbar - padding
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          gap={1.5}
          mb={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant={smDown ? "h5" : "h4"}
              fontWeight={800}
              sx={{ lineHeight: 1.1 }}
            >
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
            size={smDown ? "medium" : "large"}
            fullWidth={smDown}
            sx={{ whiteSpace: "nowrap" }}
          >
            Nuevo Producto
          </Button>
        </Stack>

        {/* Controles */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={1.5}
          mb={2}
          alignItems={{ md: "center" }}
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
              flex: 1,
              ".MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "background.default",
              },
            }}
          />

          <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="space-between">
            <ToggleButtonGroup
              value={filterStatus}
              exclusive
              onChange={(e, newStatus) => {
                if (newStatus !== null) setFilterStatus(newStatus);
              }}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  px: { xs: 1.25, sm: 1.5 },
                  textTransform: "none",
                  fontWeight: 700,
                },
              }}
            >
              <ToggleButton value="all">Todos</ToggleButton>
              <ToggleButton value="active">Activos</ToggleButton>
              <ToggleButton value="inactive">Inactivos</ToggleButton>
            </ToggleButtonGroup>

            {/* En mobile ocultamos selector de vista para evitar apretado */}
            {!smDown && (
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => {
                  if (newMode !== null) setViewMode(newMode);
                }}
                size="small"
              >
                <ToggleButton value="grid" aria-label="Vista grilla">
                  <GridViewIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="Vista lista">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Chip: en xs lo pasamos abajo para no romper layout */}
            <Chip
              label={countLabel}
              color="primary"
              variant="outlined"
              sx={{
                alignSelf: "center",
                mt: { xs: 1, md: 0 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: "center",
                fontWeight: 800,
              }}
            />
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Contenido */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            pr: 0.5,
            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 4 },
          }}
        >
          {loading ? (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {Array.from({ length: smDown ? 4 : 8 }).map((_, i) => (
                <Grid item {...gridCols} key={i}>
                  <ProductCardSkeleton isList={viewMode === "list"} />
                </Grid>
              ))}
            </Grid>
          ) : items.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: { xs: 6, md: 8 },
                textAlign: "center",
                px: 2,
              }}
            >
              <ImageIcon sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {q ? "No se encontraron productos" : "No hay productos"}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2.5}>
                {q ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primer producto"}
              </Typography>
              {!q && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCrear(true)}>
                  Crear Producto
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {items.map((product) => (
                <Grid item {...gridCols} key={product.idArticulo || product.id}>
                  <ProductCard
                    product={product}
                    viewMode={smDown ? "grid" : viewMode}
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
        fullScreen={mdDown}
        PaperProps={{ sx: { borderRadius: mdDown ? 0 : 2 } }}
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
        fullScreen={mdDown}
        PaperProps={{ sx: { borderRadius: mdDown ? 0 : 2 } }}
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