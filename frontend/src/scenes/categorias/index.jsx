import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Stack, Typography, Button, TextField, InputAdornment,
  Divider, Grid, Card, CardContent, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
  Chip, Skeleton, ToggleButtonGroup, ToggleButton, useTheme, useMediaQuery,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import { useSidebarContext } from "../../contexts/SidebarContext";
import * as Categories from "../../services/categoryService";
import CrearCategoria from "./CrearCategoria";
import EditarCategoria from "./EditarCategoria";

const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" height={28} width="70%" />
        <Skeleton variant="text" height={20} width="40%" />
        <Skeleton variant="rounded" height={28} width="30%" />
      </CardContent>
    </Card>
  );
}

function CategoryCard({ row, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const parentName = row?.parent?.name || "—";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all .18s",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" alignItems="start" justifyContent="space-between" gap={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {row.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Padre: {parentName}
            </Typography>
          </Box>

          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip size="small" label={`ID: ${row.id}`} variant="outlined" />
          {row.parent_id ? (
            <Chip size="small" color="primary" label="Subcategoría" />
          ) : (
            <Chip size="small" color="success" label="Categoría raíz" />
          )}
        </Stack>

        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onEdit(row);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onDelete(row);
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}

export default function CategoriasIndex() {
  const theme = useTheme();
  const appbarH = TOPBAR_HEIGHT(theme);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

// Obtener ancho del sidebar desde el contexto
const { sidebarWidth } = useSidebarContext();
  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
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
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [confirmDel, setConfirmDel] = useState(false);
  const [delRow, setDelRow] = useState(null);
  const [delLoading, setDelLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Categories.listCategories({ q });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const countLabel = useMemo(
    () => `${items.length} categoría${items.length !== 1 ? "s" : ""}`,
    [items.length]
  );

  const handleAskDelete = (row) => {
    setDelRow(row);
    setConfirmDel(true);
  };

  const handleDelete = async () => {
    if (!delRow?.id) return;
    setDelLoading(true);
    try {
      await Categories.deleteCategory(delRow.id);
      setConfirmDel(false);
      setDelRow(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setDelLoading(false);
    }
  };

  return (
<Box
  sx={{
    position: "fixed",
    top: appbarH,
    left: mdDown ? 0 : sidebarWidth,  // ← Usar sidebarWidth del contexto
    right: 0,
    bottom: 0,
    p: 2,
    overflow: "hidden",
    transition: "left 0.3s ease",  // ← Sincronizar con transición del sidebar
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
              Categorías
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra categorías y subcategorías (company scope)
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCrear(true)}
            size="large"
          >
            Nueva Categoría
          </Button>
        </Stack>

        {/* Buscador y controles */}
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={3} alignItems="center">
          <TextField
            placeholder="Buscar por nombre..."
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
              maxWidth: { sm: 400 },
              ".MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "background.default" },
            }}
          />

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <Chip label={countLabel} color="primary" variant="outlined" />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Listado */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <CardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : items.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {q ? "No se encontraron categorías" : "No hay categorías"}
              </Typography>
              {!q && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCrear(true)}>
                  Crear Categoría
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {items.map((row) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={viewMode === "grid" ? 4 : 12}
                  lg={viewMode === "grid" ? 3 : 12}
                  key={row.id}
                >
                  <CategoryCard
                    row={row}
                    onEdit={(r) => {
                      setEditRow(r);
                      setOpenEditar(true);
                    }}
                    onDelete={handleAskDelete}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Modales */}
        <CrearCategoria
          open={openCrear}
          onClose={() => setOpenCrear(false)}
          onCreated={fetchData}
        />

        <EditarCategoria
          open={openEditar}
          onClose={() => setOpenEditar(false)}
          row={editRow}
          onUpdated={fetchData}
        />

        {/* Confirm delete */}
        <Dialog open={confirmDel} onClose={delLoading ? undefined : () => setConfirmDel(false)}>
          <DialogTitle>Eliminar categoría</DialogTitle>
          <DialogContent dividers>
            <Typography>
              ¿Eliminar <b>{delRow?.name}</b>? (Se hará <b>soft delete</b>).
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDel(false)} disabled={delLoading}>
              Cancelar
            </Button>
            <Button color="error" variant="contained" onClick={handleDelete} disabled={delLoading}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
