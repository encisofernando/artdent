// src/pages/Articulos.js
import { Box, Typography, useTheme, Button, Tooltip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getAllArticulos, getArticuloById, deleteArticulo, toggleArticulo } from '../../config/LlamadaDB';
import { useEffect, useState } from "react";
import CrearArticulo from './CrearArticulo';
import EditarArticulo from './EditarArticulo';
import { getIdBaseFromToken } from '../../auth/auth'; // Asegúrate de importar getIdBaseFromToken
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


const Articulos = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState(null);

  const handleToggle = async (id) => {
    try {
        await toggleArticulo(id);
        fetchArticulos();
    } catch (error) {
        console.error("Error al cambiar el estado de la categoría:", error.message);
    }
};

  const columns = [
  
   
    { field: "Nombre", headerName: "Nombre",  minWidth: 280, cellClassName: "name-column--cell" },
    { field: "Stock", headerName: "Stock",  minWidth: 40 },
    { field: "PrecioPublico", headerName: "Precio Venta", minWidth: 280, renderCell: (params) => <Typography color={colors.greenAccent[500]}>${params.row.PrecioPublico}</Typography> },
    { field: "Descripcion", headerName: "Descripcion", flex: 1 },
    {
        field: "acciones", headerName: "Acciones", minWidth: 250,
        renderCell: (params) => (
            <> 
            <Button
                  color="info"
                  sx={{ mr: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
                  startIcon={<VisibilityIcon />}
                />
                 <Button  
                  color="secondary"
                  sx={{ mr: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
                  onClick={() => handleOpenEditar(params.row)} 
                >
                  <EditIcon />
                </Button>
                <Button
                color="error"
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
                onClick={() => handleDelete(params.row.idArticulo)}
              >
                <DeleteIcon/>
              </Button>
                <Tooltip title={params.row.Activo ? "Desactivar" : "Activar"}>
                    <IconButton
                        sx={{ color: colors.primary[100] }}
                        onClick={() => handleToggle(params.row.idArticulo)}
                    >
                        {params.row.Activo ? <FlashOnIcon /> : <FlashOffIcon />}
                    </IconButton>
                </Tooltip>
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
      const idBase = getIdBaseFromToken(); // Obtener el idBase del token
      const articulos = await getAllArticulos(idBase); // Pasar idBase a tu función

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
          checkboxSelection 
        />
      </Box>

      {/* Componente de Alta de Artículo */}
      <CrearArticulo open={openCrear} onClose={handleCloseCrear} onArticuloCreado={handleArticuloCreado} />
      <EditarArticulo open={openEditar} onClose={handleCloseEditar} articuloEditando={articuloEditando} onArticuloEditado={handleArticuloEditado} />
    </Box>
  );
};

export default Articulos;
