import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import React, { useState } from 'react';
import SearchIcon from "@mui/icons-material/Search";

const BuscarCliente = ({ open, setOpen, clientes, onClienteSeleccionado }) => {
    const [buscarClienteTermino, setBuscarClienteTermino] = useState("");

    // Filtrar clientes según el término de búsqueda
    const clientesFiltrados = clientes.filter((cliente) =>
        (cliente.NroDoc && cliente.NroDoc.includes(buscarClienteTermino)) ||
        (cliente.CUIT && cliente.CUIT.includes(buscarClienteTermino)) ||
        (cliente.Nom1 && cliente.Nom1.toLowerCase().includes(buscarClienteTermino.toLowerCase())) ||
        (cliente.Nom2 && cliente.Nom2.toLowerCase().includes(buscarClienteTermino.toLowerCase()))
    );

    return (
        <Box>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Buscar Cliente</DialogTitle>
                <DialogContent dividers>
                    <Box mb={2}>
                        <TextField
                            size="small"
                            fullWidth
                            variant="outlined"
                            label="Buscar por DNI, CUIT o Nombre"
                            value={buscarClienteTermino}
                            onChange={(e) => setBuscarClienteTermino(e.target.value)}
                            InputProps={{
                                endAdornment: <SearchIcon />,
                            }}
                        />
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>DNI</TableCell>
                                    <TableCell>CUIT</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell align="center">Seleccionar</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clientesFiltrados.length > 0 ? (
                                    clientesFiltrados.map((cliente) => (
                                        <TableRow key={cliente.idCliente}>
                                            <TableCell>{cliente.NroDoc ? cliente.NroDoc : "No tiene"}</TableCell>
                                            <TableCell>{cliente.CUIT ? cliente.CUIT : "No tiene"}</TableCell>
                                            <TableCell>
                                                {cliente.Nom1 || cliente.Nom2 ? 
                                                    `${cliente.Nom1 || ''} ${cliente.Nom2 || ''}`.trim() || "" :
                                                    ""
                                                }
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => {
                                                        // Llama a la función con el cliente seleccionado
                                                        onClienteSeleccionado(cliente);
                                                        setOpen(false);
                                                        setBuscarClienteTermino("");
                                                    }}
                                                >
                                                    Seleccionar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No se encontraron clientes.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpen(false);
                            setBuscarClienteTermino("");
                        }}
                        color="secondary"
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default BuscarCliente;
