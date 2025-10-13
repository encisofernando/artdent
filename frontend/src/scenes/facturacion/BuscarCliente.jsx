import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import React, { useState, useMemo } from 'react';
import SearchIcon from "@mui/icons-material/Search";

const BuscarCliente = ({ open, setOpen, clientes, onClienteSeleccionado }) => {
  const [buscarClienteTermino, setBuscarClienteTermino] = useState("");

  const clientesFiltrados = useMemo(() => {
    const term = (buscarClienteTermino || "").toLowerCase();
    return (clientes || []).filter((c) => {
      return (
        (c.tax_id && c.tax_id.includes(term)) ||
        (c.code && String(c.code).toLowerCase().includes(term)) ||
        (c.name && c.name.toLowerCase().includes(term))
      );
    });
  }, [clientes, buscarClienteTermino]);

  return (
    <Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Buscar Cliente</DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label="Buscar por CUIT, Código o Nombre"
              value={buscarClienteTermino}
              onChange={(e) => setBuscarClienteTermino(e.target.value)}
              InputProps={{ endAdornment: <SearchIcon /> }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>CUIT</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell align="center">Seleccionar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.code || "—"}</TableCell>
                      <TableCell>{c.tax_id || "—"}</TableCell>
                      <TableCell>{c.name || "—"}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => { onClienteSeleccionado(c); setOpen(false); setBuscarClienteTermino(""); }}
                        >
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No se encontraron clientes.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setBuscarClienteTermino(""); }} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuscarCliente;
