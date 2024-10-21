import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React from 'react'

const Ficheros = ({ openFichaCliente, setOpenFichaCliente, openCC, setOpenCC, cliente }) => {
  return (
    <Box>
      {/* Diálogo para Ficha de Cliente */}
      <Dialog
        open={openFichaCliente}
        onClose={() => setOpenFichaCliente(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ficha del Cliente</DialogTitle>
        <DialogContent dividers>
          {cliente ? (
            <Box>
              <Typography>
                <strong>Nombre:</strong> {`${cliente.Nom1 || ''} ${cliente.Nom2 || ''}`.trim()}
              </Typography>
              <Typography>
                <strong>DNI:</strong> {cliente.NroDoc || "No tiene"}
              </Typography>
              <Typography>
                <strong>CUIT:</strong> {cliente.CUIT || "No tiene"}
              </Typography>
              {/* Agrega más información según tus necesidades */}
            </Box>
          ) : (
            <Typography>No hay cliente seleccionado.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFichaCliente(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Ver CC */}
      <Dialog
        open={openCC}
        onClose={() => setOpenCC(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Cuenta Corriente del Cliente</DialogTitle>
        <DialogContent dividers>
          {cliente ? (
            <Box>
              {/* Información de Cuenta Corriente */}
              <Typography>
                <strong>Saldo Actual:</strong> $1,000.00
              </Typography>
              <Typography>
                <strong>Última Transacción:</strong> 2024-04-25
              </Typography>
              {/* Agrega más información según tus necesidades */}
            </Box>
          ) : (
            <Typography>No hay cliente seleccionado.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCC(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ficheros;
