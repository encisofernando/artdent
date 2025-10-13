import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';

const Ficheros = ({ openFichaCliente, setOpenFichaCliente, openCC, setOpenCC, cliente }) => {
  return (
    <Box>
      <Dialog open={openFichaCliente} onClose={() => setOpenFichaCliente(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ficha del Cliente</DialogTitle>
        <DialogContent dividers>
          {cliente ? (
            <Box>
              <Typography><strong>Nombre:</strong> {cliente.name || "—"}</Typography>
              <Typography><strong>CUIT:</strong> {cliente.tax_id || "—"}</Typography>
              <Typography><strong>Email:</strong> {cliente.email || "—"}</Typography>
              <Typography><strong>Dirección:</strong> {cliente.address || "—"}</Typography>
            </Box>
          ) : (
            <Typography>No hay cliente seleccionado.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFichaCliente(false)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCC} onClose={() => setOpenCC(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cuenta Corriente del Cliente</DialogTitle>
        <DialogContent dividers>
          {/* Placeholder: conectar a endpoint de CC cuando lo tengas */}
          <Typography>Disponible próximamente</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCC(false)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ficheros;
