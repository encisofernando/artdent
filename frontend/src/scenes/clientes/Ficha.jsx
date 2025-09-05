import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Avatar } from '@mui/material';
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const defaultImage = '/mnt/data/ficha.jpg'; // Cambia esta ruta por la imagen que desees usar

const Ficheros = ({ openFichaCliente, setOpenFichaCliente, cliente }) => {
  const printRef = useRef();

  const handleExportPdf = () => {
    const doc = new jsPDF();

    // Título del PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Ficha Personal", 105, 20, { align: "center" });

    // Datos del cliente en tabla
    doc.autoTable({
      startY: 30,
      margin: { left: 20 },
      body: [
        ["Nombre", cliente?.Nombre || "No tiene"],
        ["Apellido", cliente?.Apellido || "No tiene"],
        ["DNI", cliente?.NroDoc || "No tiene"],
        ["CUIT", cliente?.CUIT || "No tiene"],
        ["Fecha de Nacimiento", cliente?.FechaNac || "No tiene"],
        ["Profesión", cliente?.Profesion || "No tiene"],
        ["Provincia", cliente?.Provincia || "No tiene"],
        ["Localidad", cliente?.Localidad || "No tiene"],
        ["Código Postal", cliente?.CodPostal || "No tiene"],
        ["Dirección", cliente?.Direccion || "No tiene"],
        ["Email", cliente?.Email1 || "No tiene"],
        ["Celular", cliente?.Tel1 || "No tiene"],
        ["Fecha de Inicio", cliente?.FechaIncAct || "No tiene"],
        ["En Actividad", cliente?.Activo ? "Sí" : "No"],
        ["Condición IVA", cliente?.CondIVA || "No tiene"],
        ["Comentarios", cliente?.Comentarios || "No tiene"]
      ],
      styles: { fontSize: 11 }
    });

    doc.save(`${cliente?.Nombre || 'cliente'}_Ficha.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Dialog
        open={openFichaCliente}
        onClose={() => setOpenFichaCliente(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ backgroundColor: '#1a1a1a', color: '#ffffff', textAlign: 'center', padding: '16px 0', fontSize: '1.5rem', boxShadow: '0px 0px 15px #ff9800' }}>
          <u>Ficha Personal</u>
        </DialogTitle>

        <DialogContent dividers sx={{ backgroundColor: '#212121', color: '#ffffff', boxShadow: '0px 0px 10px white' }} ref={printRef}>
          {cliente ? (
            <>
              {/* Imagen y datos generales */}
              <Box sx={{ padding: '16px', display: 'flex', alignItems: 'flex-start', backgroundColor: '#2c2c2c', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Avatar 
                  alt={cliente.Nombre} 
                  src={cliente.Imagen || defaultImage} 
                  sx={{ width: 100, height: 100, marginRight: 4, boxShadow: '0px 0px 10px white' }}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, flexGrow: 1 }}>
                  <Typography variant="body1"><strong>Nombre:</strong> {cliente.Nom1 || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>Apellido:</strong> {cliente.Nom2 || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>DNI:</strong> {cliente.NroDoc || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>CUIT:</strong> {cliente.CUIT || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>Fecha de Nacimiento:</strong> {cliente.FechaNac || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>Profesión:</strong> {cliente.Profesion || "No tiene"}</Typography>
                </Box>
              </Box>

              {/* Sección Dirección */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Dirección
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Typography variant="body1"><strong>Provincia:</strong> {cliente.Provincia || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Localidad:</strong> {cliente.Localidad || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Código Postal:</strong> {cliente.CodPostal || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Dirección:</strong> {cliente.Direccion || "No tiene"}</Typography>
              </Box>

              {/* Sección Contacto */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Datos de Contacto
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Typography variant="body1"><strong>Email:</strong> {cliente.Email1 || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Celular:</strong> {cliente.Tel1 || "No tiene"}</Typography>
              </Box>

              {/* Sección Laboral */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Datos Laborales
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Typography variant="body1"><strong>Fecha de Inicio:</strong> {cliente.FechaInicioAct || "No tiene"}</Typography>
                <Typography variant="body1"><strong>En Actividad:</strong> {cliente.Activo ? "Sí" : "No"}</Typography>
                <Typography variant="body1"><strong>Condición IVA:</strong> {cliente.CondIVA || "No tiene"}</Typography>
              </Box>

              {/* Sección Comentarios */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Comentarios
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', textAlign: 'center' }}>
                <Typography variant="body1">{cliente.Comentarios || "No tiene"}</Typography>
              </Box>
            </>
          ) : (
            <Typography>No hay cliente seleccionado.</Typography>
          )}
        </DialogContent>

        {/* Botones de acciones */}
        <DialogActions sx={{ backgroundColor: '#1a1a1a', boxShadow: '0px 0px 15px white' }}>
          <Button 
            onClick={handleExportPdf} 
            color="primary" 
            variant="contained"
            sx={{ backgroundColor: '#fff', color: '#2c2c2c', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            Exportar PDF
          </Button>
          <Button 
            onClick={handlePrint} 
            color="secondary" 
            variant="contained"
            sx={{ backgroundColor: '#fff', color: '#2c2c2c', '&:hover': { backgroundColor: '#c62828' } }}
          >
            Imprimir
          </Button>
          <Button 
            onClick={() => setOpenFichaCliente(false)} 
            color="secondary" 
            variant="contained"
            sx={{ backgroundColor: '#fff', color: '#2c2c2c', '&:hover': { backgroundColor: '#005c3d' } }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ficheros;
