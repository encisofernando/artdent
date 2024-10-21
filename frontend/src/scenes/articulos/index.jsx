// src/pages/Articulos.js
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getAllArticulos, getArticuloById, deleteArticulo } from '../../config/LlamadaDB';
import { useEffect, useState } from "react";
import CrearArticulo from './CrearArticulo';
import EditarArticulo from './EditarArticulo';

const Articulos = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState(null);

  const columns = [
    {
        field: "Imagen",
        headerName: "Imagen",
        flex: 1,
        renderCell: (params) => (
            <img 
                src={params.value} 
                alt={params.row.Nombre} // O cualquier otro texto alternativo
                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
            />
        ),
    },
    { field: "CodigoBarra", headerName: "Código de Barra", flex: 1 },
    { field: "Nombre", headerName: "Nombre", flex: 1, cellClassName: "name-column--cell" },
    { field: "Stock", headerName: "Stock", flex: 1 },
    { field: "Costo", headerName: "Precio Costo", flex: 1, renderCell: (params) => <Typography color={colors.greenAccent[500]}>${params.row.Costo}</Typography> },
    { field: "PrecioPublico", headerName: "Precio Venta", flex: 1, renderCell: (params) => <Typography color={colors.greenAccent[500]}>${params.row.PrecioPublico}</Typography> },
    { field: "Iva", headerName: "IVA (%)", flex: 1 },
    {
        field: "acciones", headerName: "Acciones", flex: 1,
        renderCell: (params) => (
            <>
                <Button variant="contained" color="secondary" onClick={() => handleOpenEditar(params.row)} sx={{ mr: 1 }}>
                    Modificar
                </Button>
                <Button variant="contained" color="error" onClick={() => handleDelete(params.row.idArticulo)}>
                    Eliminar
                </Button>
            </>
        ),
    },
];


  const handleOpenCrear = () => setOpenCrear(true);
  const handleCloseCrear = () => setOpenCrear(false);

  const handleOpenEditar = async (articulo) => {
    try {
      const articuloCompleto = await getArticuloById(articulo.idArticulo);
      setArticuloEditando(articuloCompleto);
      setOpenEditar(true);
    } catch (error) {
      console.error('Error al obtener los datos del artículo:', error);
      alert('Hubo un error al cargar los datos del artículo');
    }
  };

  const handleCloseEditar = () => {
    setArticuloEditando(null);
    setOpenEditar(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
      try {
        await deleteArticulo(id);
        setRows((prevRows) => prevRows.filter(row => row.idArticulo !== id));
        alert('Artículo eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar artículo:', error);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const fetchArticulos = async () => {
    try {
      const articulos = await getAllArticulos();
      const rowsWithIds = articulos.map(articulo => ({
        ...articulo,
        id: articulo.idArticulo
      })).filter(articulo => articulo.id !== null);

      setRows(rowsWithIds);
    } catch (error) {
      console.error('Error al obtener artículos:', error);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  const handleArticuloCreado = () => {
    fetchArticulos();
    handleCloseCrear();
  };

  const handleArticuloEditado = () => {
    fetchArticulos();
    handleCloseEditar();
  };

  return (
    <Box m="20px">
      <Header title="ARTÍCULOS" subtitle="Lista de Artículos" />
      
      {/* Botón de Alta de Artículo */}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpenCrear} 
        sx={{ 
          position: 'absolute', 
          top: 100, 
          right: 20 
        }}
      >
        Alta de Artículo
      </Button>

      {/* Tabla de Artículos con estilos */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Componente de Alta de Artículo */}
      <CrearArticulo open={openCrear} onClose={handleCloseCrear} onArticuloCreado={handleArticuloCreado} />
      <EditarArticulo open={openEditar} onClose={handleCloseEditar} articuloEditando={articuloEditando} onArticuloEditado={handleArticuloEditado} />
    </Box>
  );
};

export default Articulos;
