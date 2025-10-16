import { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardHeader, CardContent, Divider, Stack,
  Button, IconButton, TextField, InputAdornment, Tooltip, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  CircularProgress, Typography, Dialog
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

import * as Products from "../../services/productService";
import CrearArticulo from "./CrearArticulo";
import EditarArticulo from "./EditarArticulo";

export default function ArticulosIndex() {
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleActivo = async (row) => {
    try {
      await Products.toggleProductActive(row.idArticulo || row.id);
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <Box p={2}>
      <Card>
        <CardHeader
          title={<Typography variant="h3">Artículos</Typography>}
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCrear(true)}>
              Nuevo
            </Button>
          }
        />
        <Divider />
        <CardContent>
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
            />
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            <Box sx={{ borderRadius: 2, overflow: "hidden", border: (t) => `1px solid ${t.palette.divider}` }}>
              <Table size="small">
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
                      <TableCell>$ {Number(r.PrecioPublico || 0).toFixed(2)}</TableCell>
                      <TableCell>{r.Iva ? `${r.Iva}%` : "–"}</TableCell>
                      <TableCell>{r.Stock ?? 0}</TableCell>
                      <TableCell>
                        {r.Activo ? (
                          <Chip label="Activo" color="success" size="small" />
                        ) : (
                          <Chip label="Inactivo" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => { setEditRow(r); setOpenEditar(true); }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={r.Activo ? "Desactivar" : "Activar"}>
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
                count={-1} // desconocido: manejamos paginado por fetch
                page={page}
                onPageChange={(e, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                labelDisplayedRows={() => ""}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={openCrear} onClose={() => setOpenCrear(false)} fullWidth maxWidth="md">
        <CrearArticulo
          open={openCrear}
          onClose={() => setOpenCrear(false)}
          onArticuloCreado={() => { setOpenCrear(false); fetchData(); }}
        />
      </Dialog>

      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="md">
        <EditarArticulo
          open={openEditar}
          onClose={() => { setOpenEditar(false); setEditRow(null); }}
          articuloEditando={editRow}
          onArticuloEditado={() => { setOpenEditar(false); setEditRow(null); fetchData(); }}
        />
      </Dialog>
    </Box>
  );
}
