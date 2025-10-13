import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Ficha = ({ openFichaCliente, setOpenFichaCliente, cliente }) => {
  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Ficha de Cliente', 105, 20, { align: 'center' });

    const c = cliente || {};
    doc.autoTable({
      startY: 30,
      margin: { left: 20 },
      body: [
        ['Código', c.code || '—'],
        ['Nombre', c.name || '—'],
        ['CUIT/CUIL', c.tax_id || '—'],
        ['Condición IVA', c.tax_condition || '—'],
        ['Email', c.email || '—'],
        ['Teléfono', c.phone || '—'],
        ['Dirección', c.address || '—'],
        ['Ciudad', c.city || '—'],
        ['Provincia', c.state || '—'],
        ['CP', c.zip || '—'],
        ['Límite CC', (c.credit_limit != null) ? String(c.credit_limit) : '0.00'],
        ['Activo', c.is_active ? 'Sí' : 'No'],
      ],
      styles: { fontSize: 11 },
    });

    doc.save(`${(c.name || 'cliente').replace(/\s+/g, '_')}_Ficha.pdf`);
  };

  return (
    <Box>
      <Dialog open={openFichaCliente} onClose={() => setOpenFichaCliente(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: '#1a1a1a', color: '#ffffff', textAlign: 'center', padding: '16px 0', fontSize: '1.5rem' }}>
          <u>Ficha de Cliente</u>
        </DialogTitle>

        <DialogContent dividers sx={{ backgroundColor: '#212121', color: '#ffffff' }}>
          {cliente ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Typography><strong>Código:</strong> {cliente.code || '—'}</Typography>
              <Typography><strong>Nombre:</strong> {cliente.name || '—'}</Typography>
              <Typography><strong>CUIT/CUIL:</strong> {cliente.tax_id || '—'}</Typography>
              <Typography><strong>Cond. IVA:</strong> {cliente.tax_condition || '—'}</Typography>
              <Typography><strong>Email:</strong> {cliente.email || '—'}</Typography>
              <Typography><strong>Teléfono:</strong> {cliente.phone || '—'}</Typography>
              <Typography><strong>Dirección:</strong> {cliente.address || '—'}</Typography>
              <Typography><strong>Ciudad:</strong> {cliente.city || '—'}</Typography>
              <Typography><strong>Provincia:</strong> {cliente.state || '—'}</Typography>
              <Typography><strong>CP:</strong> {cliente.zip || '—'}</Typography>
              <Typography><strong>Límite CC:</strong> {(cliente.credit_limit != null) ? String(cliente.credit_limit) : '0.00'}</Typography>
              <Typography><strong>Activo:</strong> {cliente.is_active ? 'Sí' : 'No'}</Typography>
            </Box>
          ) : (
            <Typography>No hay cliente seleccionado.</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ backgroundColor: '#1a1a1a' }}>
          <Button onClick={handleExportPdf} color="primary" variant="contained">Exportar PDF</Button>
          <Button onClick={() => setOpenFichaCliente(false)} color="secondary" variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ficha;
