import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Avatar } from '@mui/material';
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const defaultImage = '/mnt/data/ficha.jpg'; // Cambia esta ruta por la imagen que desees usar

const Ficheros = ({ openFichaEmpleado, setOpenFichaEmpleado, empleado }) => {
  const printRef = useRef();

  const handleExportPdf = () => {
    const doc = new jsPDF();

    // Título del PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Ficha Personal", 105, 20, { align: "center" });

    // Datos del empleado en tabla
    doc.autoTable({
      startY: 30,
      margin: { left: 20 },
      body: [
        ["Nombre", empleado?.Nombre || "No tiene"],
        ["Apellido", empleado?.Apellido || "No tiene"],
        ["DNI", empleado?.NroDoc || "No tiene"],
        ["CUIT", empleado?.CUIT || "No tiene"],
        ["Fecha de Nacimiento", empleado?.FechaNac || "No tiene"],
        ["Profesión", empleado?.Profesion || "No tiene"],
        ["Provincia", empleado?.Provincia || "No tiene"],
        ["Localidad", empleado?.Localidad || "No tiene"],
        ["Código Postal", empleado?.CodPostal || "No tiene"],
        ["Dirección", empleado?.Direccion || "No tiene"],
        ["Email", empleado?.Email1 || "No tiene"],
        ["Celular", empleado?.Tel1 || "No tiene"],
        ["Rol", empleado?.idRol || "No tiene"],
        ["Fecha de Inicio", empleado?.FechaIncAct || "No tiene"],
        ["En Actividad", empleado?.Activo ? "Sí" : "No"],
        ["Fecha de Baja", empleado?.FechaBaja || "No tiene"],
        ["Condición IVA", empleado?.CondIVA || "No tiene"],
        ["Comentarios", empleado?.Comentarios || "No tiene"]
      ],
      styles: { fontSize: 11 }
    });

    doc.save(`${empleado?.Nombre || 'Empleado'}_Ficha.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Dialog
        open={openFichaEmpleado}
        onClose={() => setOpenFichaEmpleado(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ backgroundColor: '#1a1a1a', color: '#ffffff', textAlign: 'center', padding: '16px 0', fontSize: '1.5rem', boxShadow: '0px 0px 15px #ff9800' }}>
          <u>Ficha Personal</u>
        </DialogTitle>

        <DialogContent dividers sx={{ backgroundColor: '#212121', color: '#ffffff', boxShadow: '0px 0px 10px white' }} ref={printRef}>
          {empleado ? (
            <>
              {/* Imagen y datos generales */}
              <Box sx={{ padding: '16px', display: 'flex', alignItems: 'flex-start', backgroundColor: '#2c2c2c', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Avatar 
                  alt={empleado.Nombre} 
                  src={empleado.Imagen || defaultImage} 
                  sx={{ width: 100, height: 100, marginRight: 4, boxShadow: '0px 0px 10px white' }}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, flexGrow: 1 }}>
                  <Typography variant="body1"><strong>Nombre:</strong> {empleado.Nombre || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>Apellido:</strong> {empleado.Apellido || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>DNI:</strong> {empleado.NroDoc || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>CUIT:</strong> {empleado.CUIT || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>Fecha de Nacimiento:</strong> {empleado.FechaNac || "No tiene"}</Typography>
                  <Typography variant="body1"><strong>Profesión:</strong> {empleado.Profesion || "No tiene"}</Typography>
                </Box>
              </Box>

              {/* Sección Dirección */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Dirección
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Typography variant="body1"><strong>Provincia:</strong> {empleado.Provincia || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Localidad:</strong> {empleado.Localidad || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Código Postal:</strong> {empleado.CodPostal || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Dirección:</strong> {empleado.Direccion || "No tiene"}</Typography>
              </Box>

              {/* Sección Contacto */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Datos de Contacto
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Typography variant="body1"><strong>Email:</strong> {empleado.Email1 || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Celular:</strong> {empleado.Tel1 || "No tiene"}</Typography>
              </Box>

              {/* Sección Laboral */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Datos Laborales
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', mb: 2 }}>
                <Typography variant="body1"><strong>Rol:</strong> {empleado.Rol || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Fecha de Inicio:</strong> {empleado.FechaIncAct || "No tiene"}</Typography>
                <Typography variant="body1"><strong>En Actividad:</strong> {empleado.Activo ? "Sí" : "No"}</Typography>
                <Typography variant="body1"><strong>Fecha de Baja:</strong> {empleado.FechaBaja || "No tiene"}</Typography>
                <Typography variant="body1"><strong>Condición IVA:</strong> {empleado.CondIVA || "No tiene"}</Typography>
              </Box>

              {/* Sección Comentarios */}
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', marginTop: 2, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                Comentarios
              </Typography>
              <Box sx={{ backgroundColor: '#2c2c2c', padding: '16px', boxShadow: '0px 0px 15px gray', borderRadius: '4px', textAlign: 'center' }}>
                <Typography variant="body1">{empleado.Comentarios || "No tiene"}</Typography>
              </Box>
            </>
          ) : (
            <Typography>No hay empleado seleccionado.</Typography>
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
            onClick={() => setOpenFichaEmpleado(false)} 
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
