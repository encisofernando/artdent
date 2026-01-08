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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  Dialog,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

import * as Products from "../../services/productService";
import CrearArticulo from "./CrearArticulo";
import EditarArticulo from "./EditarArticulo";

const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight
    ? Number(theme.mixins.toolbar.minHeight)
    : 64;

export default function ArticulosIndex() {
  const theme = useTheme();
  const appbarH = TOPBAR_HEIGHT(theme);
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  // Sidebar width (layout tipo FacturarPOS)
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Products.listProducts({
        q,
        page: page + 1,
        per_page: rowsPerPage,
      });
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [q, page, rowsPerPage]);

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
        overflow: "hidden", // ✅ SIN scroll del navegador
        transition: "left .18s ease",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 2,
          p: 2,
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
        >
          <Typography variant="h3">Artículos</Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCrear(true)}
          >
            Nuevo
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Buscador */}
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={2}>
          <TextField
            placeholder="Buscar por nombre / código"
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
            sx={{ ".MuiOutlinedInput-root": { height: 44, borderRadius: 2 } }}
          />
        </Stack>

        {/* Tabla (ÚNICO scroll) */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>IVA</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((r) => (
                  <TableRow key={r.idArticulo || r.id} hover>
                    <TableCell>{r.Nombre}</TableCell>
                    <TableCell>{r.Codigo}</TableCell>
                    <TableCell>
                      $ {Number(r.PrecioPublico || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{r.Iva ? `${r.Iva}%` : "–"}</TableCell>
                    <TableCell>{r.Stock ?? 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.Activo ? "Activo" : "Inactivo"}
                        color={r.Activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => {
                            setEditRow(r);
                            setOpenEditar(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={r.Activo ? "Desactivar" : "Activar"}
                      >
                        <IconButton onClick={() => handleToggleActivo(r)}>
                          <PowerSettingsNewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={-1}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelDisplayedRows={() => ""}
            />
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <Dialog open={openCrear} onClose={() => setOpenCrear(false)} fullWidth maxWidth="md">
        <CrearArticulo
          open={openCrear}
          onClose={() => setOpenCrear(false)}
          onArticuloCreado={() => {
            setOpenCrear(false);
            fetchData();
          }}
        />
      </Dialog>

      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="md">
        <EditarArticulo
          open={openEditar}
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
